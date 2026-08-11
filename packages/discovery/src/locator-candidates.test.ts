import assert from "node:assert/strict";
import test from "node:test";
import { buildLocatorCandidates } from "./locator-candidates.js";

test("buildLocatorCandidates prefers role+name then testId", () => {
  const candidates = buildLocatorCandidates({
    kind: "button",
    tag: "button",
    role: "button",
    name: "Save",
    testId: "save-btn",
    domId: "save",
    disabled: false,
    visible: true,
  });

  assert.ok(candidates.length >= 3);
  assert.equal(candidates[0]?.strategy, "role");
  assert.equal(candidates[0]?.confidence, 0.99);
  assert.equal(candidates[1]?.strategy, "testId");
  assert.equal(candidates[2]?.strategy, "id");
});