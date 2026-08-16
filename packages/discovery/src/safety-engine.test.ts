import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyActionRisk,
  decideExploreAction,
} from "./safety-engine.js";

test("classifies delete/pay/email/save", () => {
  assert.equal(classifyActionRisk({ name: "Delete account" }), "DESTRUCTIVE");
  assert.equal(classifyActionRisk({ name: "Submit payment" }), "FINANCIAL");
  assert.equal(classifyActionRisk({ name: "Send email" }), "EXTERNAL_SIDE_EFFECT");
  assert.equal(classifyActionRisk({ name: "Save customer" }), "MUTATING");
  assert.equal(classifyActionRisk({ name: "More information", actionType: "click" }), "LOW_RISK");
});

test("blocks destructive and financial from auto-explore", () => {
  const del = decideExploreAction({ name: "Delete" });
  assert.equal(del.allowed, false);
  if (!del.allowed) assert.match(del.reason, /DESTRUCTIVE/);

  const pay = decideExploreAction({ name: "Checkout" });
  assert.equal(pay.allowed, false);

  const save = decideExploreAction({ name: "Save" });
  assert.equal(save.allowed, true);

  const link = decideExploreAction({ name: "A/B Testing", actionType: "click" });
  assert.equal(link.allowed, true);
});