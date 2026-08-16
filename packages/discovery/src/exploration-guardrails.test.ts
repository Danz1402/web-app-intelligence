import assert from "node:assert/strict";
import test from "node:test";
import type { DetectedElement } from "./element-types.js";
import { generalizeBehavior } from "./generalize-behavior.js";
import { selectElementsToExplore } from "./exploration-guardrails.js";

function link(name: string, href: string): DetectedElement {
  return {
    kind: "link",
    tag: "a",
    role: "link",
    name,
    href,
    disabled: false,
    visible: true,
  };
}

test("drops extra repeated row actions", () => {
  const detected = [
    link("View 1", "https://app.example/customers/1"),
    link("View 2", "https://app.example/customers/2"),
    link("View 3", "https://app.example/customers/3"),
    link("Login", "https://app.example/login"),
  ];
  const out = selectElementsToExplore({ detected, minRepeatCount: 3 });
  assert.equal(out.detected.length, 2);
  assert.equal(out.skippedRepeated, 2);
});

test("skips behaviors already explored", () => {
  const view = link("View 1", "https://app.example/customers/1");
  const login = link("Login", "https://app.example/login");
  const exploredBehaviorKeys = new Set([generalizeBehavior(view).key]);
  const out = selectElementsToExplore({
    detected: [view, login],
    exploredBehaviorKeys,
    minRepeatCount: 3,
  });
  assert.equal(out.detected.length, 1);
  assert.equal(out.detected[0]?.name, "Login");
  assert.equal(out.skippedBehavior, 1);
});