import assert from "node:assert/strict";
import test from "node:test";
import { EvidenceStatus, Ids } from "@wai/shared";
import { toObservedTransition } from "./to-transition.js";

test("toObservedTransition links from → action → to", () => {
  const fromStateId = Ids.state();
  const toStateId = Ids.state();
  const actionId = Ids.action();
  const sessionId = Ids.discoverySession();

  const t = toObservedTransition({
    fromStateId,
    actionId,
    toStateId,
    discoverySessionId: sessionId,
    category: "NAVIGATION",
  });

  assert.equal(t.fromStateId, fromStateId);
  assert.equal(t.actionId, actionId);
  assert.equal(t.toStateId, toStateId);
  assert.equal(t.provenance.evidenceStatus, EvidenceStatus.OBSERVED);
});

test("no-op transition may omit toStateId", () => {
  const t = toObservedTransition({
    fromStateId: Ids.state(),
    actionId: Ids.action(),
    discoverySessionId: Ids.discoverySession(),
    category: "NO_OBSERVED_EFFECT",
  });
  assert.equal(t.toStateId, undefined);
});