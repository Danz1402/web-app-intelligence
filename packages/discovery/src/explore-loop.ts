import type { BrowserSession, LocatorCandidate } from "@wai/browser";
import type { StateId, ApplicationId } from "@wai/shared";
import { Ids } from "@wai/shared";
import { captureSnapshot } from "./capture-snapshot.js";
import {
  canEnqueueAtDepth,
  canRecordState,
  canStartAction,
  createCrawlBudget,
  defaultCrawlLimits,
  isUrlAllowed,
  recordActionStarted,
  recordStateSeen,
  type CrawlLimits,
  type CrawlBudget,
} from "./crawl-limits.js";
import { detectMeaningfulElements } from "./detect-elements.js";
import { detectTransitionAfterAction, type DetectedTransition } from "./detect-transition.js";
import { ExplorationQueue } from "./exploration-queue.js";
import { createIntendedAction } from "./record-action.js";
import { resolveActionOutcome } from "./resolve-action-outcome.js";
import { restoreState } from "./restore-state.js";
import { buildStateSignature, StateSignature } from "./state-signature.js";
import { toObservedElements } from "./to-elements.js";
import { toObservedState } from "./attach-provenance.js";

import { correlateNetworkDuringAction } from "./correlate-network.js";
import type { CorrelatedNetworkRequest } from "./correlate-network.js";

import type { Db } from "@wai/storage";
import { persistCorrelatedNetwork } from "./persist-network.js";

import { resolveStateIdentity, type KnownStateSignature } from "./dedupe-states.js";

import { selectElementsToExplore } from "./exploration-guardrails.js";
import { generalizeBehavior } from "./generalize-behavior.js";

import { decideExploreAction } from "./safety-engine.js";

import type { State } from "@wai/shared";
import { insertAction, insertTransition, updateAction, insertElements } from "@wai/storage";
import { persistExploredState } from "./persist-explored-state.js";
import type { PageTemplate } from "@wai/shared";

export type ExploreLoopInput = {
  session: BrowserSession;
  startUrl: string;
  /** Fake session id for provenance in-memory */
  discoverySessionId?: ReturnType<typeof Ids.discoverySession>;
  limits?: Partial<CrawlLimits>;
  db: Db;
  applicationId: ApplicationId;
};

export type ExploreLoopSummary = {
  actionsAttempted: number;
  statesSeen: number;
  completed: number;
  failed: number;
  skipped: number;
  stopReason: string;
  networkEffects: number;
  correlatedNetworkRequests: CorrelatedNetworkRequest[];
};

type KnownState = {
  id: StateId;
  url: string;
  signatureHash: string;
  signature: StateSignature;
};

type RegisterResult = { state: KnownState; isNew: boolean };

/**
 * Autonomous exploration from the current page (already opened).
 * Caller should session.start() + session.open(startUrl) first.
 */
export async function runExplorationLoop(
  input: ExploreLoopInput,
): Promise<ExploreLoopSummary> {
  const limits = defaultCrawlLimits({
    maxDepth: 2,
    maxActions: 10,
    maxStates: 15,
    maxRuntimeMs: 120_000,
    allowedDomains: [new URL(input.startUrl).hostname],
    ...input.limits,
  });
  const budget = createCrawlBudget();
  const queue = new ExplorationQueue();
  const discoverySessionId =
    input.discoverySessionId ?? Ids.discoverySession();
  const exploredFingerprints = new Set<string>();
  const exploredBehaviorKeys = new Set<string>();
  const statesById = new Map<string, KnownState>();
  const knownTemplates: PageTemplate[] = [];

  let completed = 0;
  let failed = 0;
  let skipped = 0;

  // Seed initial state
  const seed = await captureAndRegisterState({
    session: input.session,
    discoverySessionId,
    budget,
    limits,
    statesById,
    depth: 0,
    db: input.db,
    applicationId: input.applicationId,
knownTemplates,
  });
  if (!seed) {
    return {
      actionsAttempted: 0,
      statesSeen: budget.statesSeen,
      completed: 0,
      failed: 0,
      skipped: 0,
      stopReason: "initial state blocked by limits",
      networkEffects: 0,
      correlatedNetworkRequests: [],
    };
  }

  await enqueuePageElements({
    session: input.session,
    stateId: seed.state.id,
    discoverySessionId,
    queue,
    depth: 0,
    limits,
    exploredFingerprints: new Set(),
    exploredBehaviorKeys,
    db: input.db,
  });

  let stopReason = "queue empty";
  let networkEffects = 0;
  const allNetwork: CorrelatedNetworkRequest[] = [];

  while (true) {
    const canAct = canStartAction(budget, limits);
    if (!canAct.ok) {
      stopReason = canAct.reason;
      break;
    }

    const task = queue.dequeue();
    if (!task) {
      stopReason = "queue empty";
      break;
    }

    const source = statesById.get(task.sourceStateId);
    if (!source) {
      queue.updateStatus(task.id, "SKIPPED");
      skipped += 1;
      continue;
    }

    const locatorName = task.locatorCandidates.find((c) => c.name)?.name;
    const safety = decideExploreAction({
      actionType: task.actionType,
      name: locatorName,
      behaviorKey:
        typeof task.payload?.behaviorKey === "string"
          ? task.payload.behaviorKey
          : undefined,
    });
    if (!safety.allowed) {
      queue.updateStatus(task.id, "BLOCKED");
      skipped += 1;
      continue;
    }

    recordActionStarted(budget);

    const restored = await restoreState(input.session, {
      url: source.url,
      signatureHash: source.signatureHash,
    });
    if (!restored.ok) {
      queue.updateStatus(task.id, "FAILED");
      failed += 1;
      continue;
    }

    const action = createIntendedAction({
      stateId: task.sourceStateId,
      discoverySessionId,
      type: task.actionType,
      elementId: task.elementId,
      payload: { explorationTaskId: task.id },
    });

    await insertAction(input.db, action);

    let detected: DetectedTransition | undefined;
    let error: unknown;
    let correlated: CorrelatedNetworkRequest[] = [];
    try {
      correlated = await correlateNetworkDuringAction({
        session: input.session,
        stateId: task.sourceStateId,
        actionId: action.id,
        action: async () => {
          detected = await detectTransitionAfterAction(
            input.session.getPage(),
            async () => {
              await runTaskAction(input.session, task);
            },
          );
        },
      });
      allNetwork.push(...correlated);
      networkEffects += correlated.length;

      if (correlated.length > 0) {
        await persistCorrelatedNetwork({
          db: input.db,
          correlated: correlated.map((c) => ({ ...c, actionId: undefined })),
          discoverySessionId,
          applicationId: input.applicationId,
        });
      }
    } catch (err) {
      error = err;
    }

    let toStateId: StateId | undefined;
    if (!error && detected?.diff.changed) {
      const afterUrl = input.session.getPage().url();
      const urlOk = isUrlAllowed(afterUrl, limits);
      if (!urlOk.ok) {
        queue.updateStatus(task.id, "BLOCKED");
        skipped += 1;
        await restoreState(input.session, { url: source.url });
        continue;
      }

      const nextDepth = task.depth + 1;
      if (canEnqueueAtDepth(nextDepth, limits).ok) {
        const afterState = await captureAndRegisterState({
          session: input.session,
          discoverySessionId,
          budget,
          limits,
          statesById,
          depth: nextDepth,
          db: input.db,
          applicationId: input.applicationId,
knownTemplates,
        });
        if (afterState) {
          toStateId = afterState.state.id;
          if (afterState.isNew) {
            await enqueuePageElements({
              session: input.session,
              stateId: afterState.state.id,
              discoverySessionId,
              queue,
              depth: nextDepth,
              limits,
              exploredFingerprints,
              exploredBehaviorKeys,
              db: input.db,
            });
          }
        }
      }
    }

    const outcome = resolveActionOutcome({
      action,
      discoverySessionId,
      fromStateId: task.sourceStateId,
      error,
      detected,
      toStateId,
    });

    await updateAction(input.db, outcome.action);
    if (outcome.kind === "noop" || outcome.kind === "transitioned") {
      await insertTransition(input.db, outcome.transition);
    }

    if (outcome.kind === "failed") {
      queue.updateStatus(task.id, "FAILED");
      failed += 1;
    } else {
      queue.updateStatus(task.id, "COMPLETE");
      completed += 1;
      const fp = task.payload?.fingerprint;
      if (typeof fp === "string") exploredFingerprints.add(fp);
      const behaviorKey = task.payload?.behaviorKey;
      if (typeof behaviorKey === "string") exploredBehaviorKeys.add(behaviorKey);
    }
  }

  return {
    actionsAttempted: budget.actionsStarted,
    statesSeen: budget.statesSeen,
    completed,
    failed,
    skipped,
    stopReason,
    networkEffects,
    correlatedNetworkRequests: allNetwork,
  };
}

async function runTaskAction(
  session: BrowserSession,
  task: { actionType: string; locatorCandidates: LocatorCandidate[]; payload?: Record<string, unknown> },
): Promise<void> {
  const candidates = task.locatorCandidates as LocatorCandidate[];
  if (task.actionType === "type") {
    const value = String(task.payload?.value ?? "test");
    await session.type(candidates, value);
    return;
  }
  if (task.actionType === "select") {
    const value = String(task.payload?.value ?? "");
    await session.select(candidates, value);
    return;
  }
  await session.click(candidates);
}

async function captureAndRegisterState(args: {
  session: BrowserSession;
  discoverySessionId: ReturnType<typeof Ids.discoverySession>;
  budget: CrawlBudget;
  limits: CrawlLimits;
  statesById: Map<string, KnownState>;
  depth: number;
  db: Db;
  applicationId: ApplicationId;
knownTemplates: PageTemplate[];
}): Promise<RegisterResult | undefined> {
  const stateOk = canRecordState(args.budget, args.limits);
  if (!stateOk.ok) return undefined;

  const snapshot = await captureSnapshot(args.session.getPage());
  const urlOk = isUrlAllowed(snapshot.url, args.limits);
  if (!urlOk.ok) return undefined;

  const state = toObservedState({
    snapshot,
    discoverySessionId: args.discoverySessionId,
  });
  const signatureHash = buildStateSignature(snapshot).signatureHash;
  // dedupe by signature
  const signature = buildStateSignature(snapshot);
  const knownList: KnownStateSignature[] = [...args.statesById.values()].map((s) => ({
    id: s.id,
    signature: s.signature, // add signature to KnownState type
  }));



  const identity = resolveStateIdentity(knownList, signature);
  if (identity.kind !== "new") {
    return { state: args.statesById.get(identity.existing.id)!, isNew: false };
  }
  recordStateSeen(args.budget);
  await persistExploredState({
    db: args.db,
    session: args.session,
    state,
    discoverySessionId: args.discoverySessionId,
    applicationId: args.applicationId,
  knownTemplates: args.knownTemplates,
  });

  const known: KnownState = {
    id: state.id,
    url: state.url,
    signatureHash,
    signature,
  };
  args.statesById.set(state.id, known);
  return { state: known, isNew: true };
}

async function enqueuePageElements(args: {
  session: BrowserSession;
  stateId: StateId;
  discoverySessionId: ReturnType<typeof Ids.discoverySession>;
  queue: ExplorationQueue;
  depth: number;
  limits: CrawlLimits;
  exploredFingerprints: Set<string>;
  exploredBehaviorKeys: Set<string>;
  db: Db;
}): Promise<void> {
  const detected = await detectMeaningfulElements(args.session.getPage());
  const guarded = selectElementsToExplore({
    detected,
    exploredBehaviorKeys: args.exploredBehaviorKeys,
  });
  const elements = toObservedElements({
    detected: guarded.detected,
    stateId: args.stateId,
    discoverySessionId: args.discoverySessionId,
  });
  await insertElements(args.db, elements);
  const behaviorKeyByElementId = new Map<string, string>();
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const detectedEl = guarded.detected[i];
    if (!el || !detectedEl) continue;
    behaviorKeyByElementId.set(el.id, generalizeBehavior(detectedEl).key);
  }
  args.queue.enqueueFromElements({
    sourceStateId: args.stateId,
    elements,
    depth: args.depth,
    limits: args.limits,
    exploredFingerprints: args.exploredFingerprints,
    behaviorKeyByElementId,
  });
}