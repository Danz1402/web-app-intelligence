import assert from "node:assert/strict";
import test from "node:test";
import { Ids } from "@wai/shared";
import { toObservedDiscoveryErrors } from "./to-errors.js";

test("toObservedDiscoveryErrors attaches session/state/action", () => {
  const discoverySessionId = Ids.discoverySession();
  const stateId = Ids.state();
  const actionId = Ids.action();
  const out = toObservedDiscoveryErrors({
    observed: [
      {
        kind: "console",
        message: "boom",
        observedAt: new Date().toISOString(),
      },
    ],
    discoverySessionId,
    stateId,
    actionId,
  });
  assert.equal(out.length, 1);
  assert.equal(out[0]?.message, "boom");
  assert.equal(out[0]?.stateId, stateId);
  assert.equal(out[0]?.actionId, actionId);
});