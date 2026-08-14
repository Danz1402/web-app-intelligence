import type { BrowserSession, LocatorCandidate } from "@wai/browser";
import type { StateId, ApplicationId } from "@wai/shared";
import { Ids } from "@wai/shared";
import { captureSnapshot } from "./capture-snapshot.js";
import {
  canEnqueueAtDepth,
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
import { buildStateSignature } from "./state-signature.js";
import { toObservedElements } from "./to-elements.js";
import { toObservedState } from "./attach-provenance.js";

import { correlateNetworkDuringAction } from "./correlate-network.js";
import type { CorrelatedNetworkRequest } from "./correlate-network.js";

import type { Db } from "@wai/storage";
import { persistCorrelatedNetwork } from "./persist-network.js";


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
};

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
  const statesById = new Map<string, KnownState>();

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

  const seedElements = toObservedElements({
    detected: await detectMeaningfulElements(input.session.getPage()),
    stateId: seed.id,
    discoverySessionId,
  });
  for (const el of seedElements) {
    if (el.fingerprint) exploredFingerprints.add(el.fingerprint);
  }
  // For scoring: pass empty explored set on first enqueue so they get tried;
  // mark fingerprints explored after COMPLETE.
  queue.enqueueFromElements({
    sourceStateId: seed.id,
    elements: seedElements,
    depth: 0,
    limits,
    exploredFingerprints: new Set(),
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

    recordActionStarted(budget);

    const restored = await restoreState(input.session, { url: source.url });
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
        });
        if (afterState) {
          toStateId = afterState.id;
          const newElements = toObservedElements({
            detected: await detectMeaningfulElements(input.session.getPage()),
            stateId: afterState.id,
            discoverySessionId,
          });
          queue.enqueueFromElements({
            sourceStateId: afterState.id,
            elements: newElements,
            depth: nextDepth,
            limits,
            exploredFingerprints,
          });
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

    if (outcome.kind === "failed") {
      queue.updateStatus(task.id, "FAILED");
      failed += 1;
    } else {
      queue.updateStatus(task.id, "COMPLETE");
      completed += 1;
      const fp = task.payload?.fingerprint;
      if (typeof fp === "string") exploredFingerprints.add(fp);
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
}): Promise<KnownState | undefined> {
  const can = canStartAction(args.budget, args.limits); // runtime already checked
  void can;
  const { canRecordState } = await import("./crawl-limits.js");
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
  for (const existing of args.statesById.values()) {
    if (existing.signatureHash === signatureHash) {
      return existing;
    }
  }

  recordStateSeen(args.budget);
  const known: KnownState = {
    id: state.id,
    url: state.url,
    signatureHash,
  };
  args.statesById.set(state.id, known);
  return known;
}