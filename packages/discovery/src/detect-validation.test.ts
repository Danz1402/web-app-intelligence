import { Ids } from "@wai/shared";
import { validationRulesFromField } from "./detect-validation.js";
import assert from "node:assert/strict";
import test from "node:test";

test("required + pattern + email type become ValidationRules", () => {
    const sessionId = Ids.discoverySession();
    const rules = validationRulesFromField(
      {
        field: {
          name: "email",
          tag: "input",
          fieldType: "email",
          required: true,
          pattern: ".+@.+",
        },
      },
      sessionId,
    );
    assert.ok(rules.some((r) => r.ruleType === "required"));
    assert.ok(rules.some((r) => r.ruleType === "pattern" && r.message === ".+@.+"));
    assert.ok(rules.some((r) => r.ruleType === "type:email"));
  });