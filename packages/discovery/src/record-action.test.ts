import assert from "node:assert/strict";
import test from "node:test";
import { EvidenceStatus, Ids } from "@wai/shared";
import {
  createIntendedAction,
  markActionFailed,
} from "./record-action.js";

test("createIntendedAction is OBSERVED", () => {
  const stateId = Ids.state();
  const sessionId = Ids.discoverySession();
  const action = createIntendedAction({
    stateId,
    discoverySessionId: sessionId,
    type: "click",
    elementId: Ids.element(),
    payload: { note: "test" },
  });

  assert.equal(action.stateId, stateId);
  assert.equal(action.type, "click");
  assert.equal(action.provenance.evidenceStatus, EvidenceStatus.OBSERVED);
  assert.equal(action.provenance.discoverySessionId, sessionId);
});

test("markActionFailed sets FAILED and keeps id", () => {
  const action = createIntendedAction({
    stateId: Ids.state(),
    discoverySessionId: Ids.discoverySession(),
    type: "click",
  });
  const failed = markActionFailed(action, "locator not unique");

  assert.equal(failed.id, action.id);
  assert.equal(failed.provenance.evidenceStatus, EvidenceStatus.FAILED);
  assert.equal(failed.payload?.errorMessage, "locator not unique");
});