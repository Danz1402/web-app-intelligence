import assert from "node:assert/strict";
import test from "node:test";
import { isBlockedField, planSafeFormFill, syntheticValueFor } from "./safe-form-values.js";
import type { DetectedField } from "./form-types.js";

test("blocks password and skips it in plan", () => {
  const password: DetectedField = {
    name: "password",
    fieldType: "password",
    tag: "input",
  };
  assert.equal(isBlockedField(password), true);
  assert.equal(syntheticValueFor(password), undefined);

  const plan = planSafeFormFill([
    { name: "email", fieldType: "email", tag: "input" },
    password,
    {
      name: "country",
      tag: "select",
      fieldType: "select",
      options: [
        { value: "", label: "--" },
        { value: "us", label: "US" },
      ],
    },
  ]);

  assert.equal(plan[0].value, "test@example.com");
  assert.equal(plan[1].skipped, true);
  assert.equal(plan[2].value, "us");
});