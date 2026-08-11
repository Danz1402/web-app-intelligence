import assert from "node:assert/strict";
import test from "node:test";
import { filterMeaningfulElements } from "./filter-elements.js";
import type { DetectedElement } from "./element-types.js";

function el(partial: Partial<DetectedElement> & Pick<DetectedElement, "kind" | "tag">): DetectedElement {
  return {
    disabled: false,
    visible: true,
    ...partial,
  };
}

test("filterMeaningfulElements drops hidden and disabled", () => {
  const input: DetectedElement[] = [
    el({ kind: "button", tag: "button", name: "Save", visible: true }),
    el({ kind: "button", tag: "button", name: "Ghost", visible: false }),
    el({ kind: "button", tag: "button", name: "Nope", disabled: true }),
    el({ kind: "input", tag: "input", inputType: "hidden", name: "csrf" }),
    el({ kind: "other", tag: "div" }),
  ];

  const out = filterMeaningfulElements(input);
  assert.equal(out.length, 1);
  assert.equal(out[0]?.name, "Save");
});

test("filterMeaningfulElements can include disabled", () => {
  const input = [
    el({ kind: "button", tag: "button", name: "Disabled", disabled: true }),
  ];
  const out = filterMeaningfulElements(input, { includeDisabled: true });
  assert.equal(out.length, 1);
});