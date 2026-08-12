import assert from "node:assert/strict";
import test from "node:test";
import { EvidenceStatus, Ids } from "@wai/shared";
import { createIntendedAction } from "./record-action.js";
import { resolveActionOutcome } from "./resolve-action-outcome.js";
import { detectTransitionFromSnapshots } from "./detect-transition.js";
import type { PageSnapshot } from "./snapshot-types.js";

function snap(partial: Partial<PageSnapshot> = {}): PageSnapshot {
  return {
    url: "https://example.com/",
    pathname: "/",
    search: "",
    hash: "",
    title: "Example",
    viewport: { width: 800, height: 600 },
    visibleTextSample: ["Hi"],
    dialogs: [],
    capturedAt: "2026-08-11T12:00:00.000Z",
    ...partial,
  };
}

test("error → failed action", () => {
  const sessionId = Ids.discoverySession();
  const fromStateId = Ids.state();
  const action = createIntendedAction({
    stateId: fromStateId,
    discoverySessionId: sessionId,
    type: "click",
  });
  const outcome = resolveActionOutcome({
    action,
    discoverySessionId: sessionId,
    fromStateId,
    error: new Error("timeout"),
  });
  assert.equal(outcome.kind, "failed");
  assert.equal(outcome.action.provenance.evidenceStatus, EvidenceStatus.FAILED);
});

test("identical snapshots → noop transition", () => {
  const sessionId = Ids.discoverySession();
  const fromStateId = Ids.state();
  const action = createIntendedAction({
    stateId: fromStateId,
    discoverySessionId: sessionId,
    type: "click",
  });
  const s = snap();
  const detected = detectTransitionFromSnapshots(s, { ...s });
  const outcome = resolveActionOutcome({
    action,
    discoverySessionId: sessionId,
    fromStateId,
    detected,
  });
  assert.equal(outcome.kind, "noop");
  assert.equal(outcome.transition.toStateId, undefined);
  assert.equal(outcome.action.provenance.evidenceStatus, EvidenceStatus.OBSERVED);
});

test("url change → transitioned when toStateId provided", () => {
  const sessionId = Ids.discoverySession();
  const fromStateId = Ids.state();
  const toStateId = Ids.state();
  const action = createIntendedAction({
    stateId: fromStateId,
    discoverySessionId: sessionId,
    type: "click",
  });
  const detected = detectTransitionFromSnapshots(
    snap(),
    snap({ url: "https://example.com/x", pathname: "/x", title: "X" }),
  );
  const outcome = resolveActionOutcome({
    action,
    discoverySessionId: sessionId,
    fromStateId,
    detected,
    toStateId,
  });
  assert.equal(outcome.kind, "transitioned");
  assert.equal(outcome.transition.toStateId, toStateId);
  assert.equal(outcome.category, "NAVIGATION");
});