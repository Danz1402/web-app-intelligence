import type { Page } from "playwright";
import { captureSnapshot } from "./capture-snapshot.js";
import {
  compareStateSignatures,
  type StateDiff,
} from "./compare-states.js";
import { buildStateSignature, type StateSignature } from "./state-signature.js";
import type { PageSnapshot } from "./snapshot-types.js";

export type TransitionCategory =
  | "NAVIGATION"
  | "DIALOG_OPEN"
  | "DIALOG_CLOSE"
  | "CONTENT_CHANGE"
  | "NO_OBSERVED_EFFECT";

export type DetectedTransition = {
  category: TransitionCategory;
  before: StateSignature;
  after: StateSignature;
  diff: StateDiff;
  beforeSnapshot: PageSnapshot;
  afterSnapshot: PageSnapshot;
};

export function classifyTransition(diff: StateDiff, before: StateSignature, after: StateSignature): TransitionCategory {
  if (!diff.changed) return "NO_OBSERVED_EFFECT";

  if (diff.urlChanged) return "NAVIGATION";

  const beforeHadDialog = before.dialogFingerprint.length > 0;
  const afterHadDialog = after.dialogFingerprint.length > 0;
  if (!beforeHadDialog && afterHadDialog) return "DIALOG_OPEN";
  if (beforeHadDialog && !afterHadDialog) return "DIALOG_CLOSE";

  if (diff.titleChanged || diff.textChanged || diff.dialogsChanged) {
    return "CONTENT_CHANGE";
  }

  return "CONTENT_CHANGE";
}

export function detectTransitionFromSnapshots(
  beforeSnapshot: PageSnapshot,
  afterSnapshot: PageSnapshot,
): DetectedTransition {
  const before = buildStateSignature(beforeSnapshot);
  const after = buildStateSignature(afterSnapshot);
  const diff = compareStateSignatures(before, after);
  const category = classifyTransition(diff, before, after);

  return {
    category,
    before,
    after,
    diff,
    beforeSnapshot,
    afterSnapshot,
  };
}

/**
 * Capture → run action → capture → detect transition.
 */
export async function detectTransitionAfterAction(
  page: Page,
  action: () => Promise<void>,
): Promise<DetectedTransition> {
  const beforeSnapshot = await captureSnapshot(page);
  await action();
  // brief settle for SPA updates; v0 simple wait

  await page.waitForLoadState("domcontentloaded").catch(() => undefined);
    await new Promise((r) => setTimeout(r, 250));
  const afterSnapshot = await captureSnapshot(page);
  return detectTransitionFromSnapshots(beforeSnapshot, afterSnapshot);
}