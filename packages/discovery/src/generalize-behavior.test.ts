import assert from "node:assert/strict";
import test from "node:test";
import type { DetectedElement } from "./element-types.js";
import {
  generalizeBehavior,
  uniqueBehaviors,
} from "./generalize-behavior.js";

function button(name: string, href?: string): DetectedElement {
  return {
    kind: href ? "link" : "button",
    tag: href ? "a" : "button",
    role: href ? "link" : "button",
    name,
    href,
    disabled: false,
    visible: true,
  };
}

test("Edit Customer 101 and 102 share a behavior key with different params", () => {
  const a = generalizeBehavior(
    button("Edit Customer 101", "https://app.example/customers/101/edit"),
  );
  const b = generalizeBehavior(
    button("Edit Customer 102", "https://app.example/customers/102/edit"),
  );
  assert.equal(a.key, b.key);
  assert.equal(a.namePattern, "edit customer {id}");
  assert.equal(a.params.id, "101");
  assert.equal(b.params.id, "102");
  assert.match(a.hrefPattern ?? "", /\/customers\/\{id\}\/edit/);
});

test("uniqueBehaviors collapses instance actions", () => {
  const elements = [
    button("Edit Customer 100", "https://app.example/customers/100/edit"),
    button("Edit Customer 101", "https://app.example/customers/101/edit"),
    button("Edit Customer 102", "https://app.example/customers/102/edit"),
    button("Login", "https://app.example/login"),
  ];
  const behaviors = uniqueBehaviors(elements);
  assert.equal(behaviors.length, 2);
  assert.ok(behaviors.some((b) => b.namePattern === "edit customer {id}"));
  assert.ok(behaviors.some((b) => b.namePattern === "login"));
});