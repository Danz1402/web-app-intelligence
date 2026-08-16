import assert from "node:assert/strict";
import test from "node:test";
import type { DetectedElement } from "./element-types.js";
import {
  buildStructuralFingerprint,
  generalizeName,
  groupRepeatedComponents,
  pickExplorationRepresentatives,
} from "./repeated-components.js";

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

test("generalizeName replaces digits", () => {
  assert.equal(generalizeName("Edit Customer 101"), "edit customer {id}");
  assert.equal(generalizeName("Edit Customer 102"), "edit customer {id}");
});

test("same row action with different ids shares structural fingerprint", () => {
  const a = buildStructuralFingerprint(
    link("View 101", "https://app.example/customers/101"),
  );
  const b = buildStructuralFingerprint(
    link("View 102", "https://app.example/customers/102"),
  );
  assert.equal(a, b);
});

test("groupRepeatedComponents keeps one representative when count >= 3", () => {
  const elements = [
    link("View 1", "https://app.example/customers/1"),
    link("View 2", "https://app.example/customers/2"),
    link("View 3", "https://app.example/customers/3"),
    link("Login", "https://app.example/login"),
  ];
  const groups = groupRepeatedComponents(elements, { minCount: 3 });
  assert.equal(groups.length, 1);
  assert.equal(groups[0]?.count, 3);
  assert.equal(groups[0]?.representatives.length, 1);
  assert.equal(groups[0]?.namePattern, "view {id}");
});

test("pickExplorationRepresentatives drops extra row instances", () => {
  const elements = [
    link("View 1", "https://app.example/customers/1"),
    link("View 2", "https://app.example/customers/2"),
    link("View 3", "https://app.example/customers/3"),
    link("Login", "https://app.example/login"),
  ];
  const picked = pickExplorationRepresentatives(elements, { minCount: 3 });
  assert.equal(picked.length, 2); // login + one view
  assert.ok(picked.some((el) => el.name === "Login"));
  assert.equal(picked.filter((el) => el.name?.startsWith("View")).length, 1);
});