import { EvidenceStatus, Ids, type DiscoverySessionId, type ValidationRule } from "@wai/shared";
import type { DetectedField } from "./form-types.js";

export type FieldValidationInput = {
  field: DetectedField;
  /** Contract field id once mapped; optional for pure detect tests */
  fieldId?: ReturnType<typeof Ids.field>;
  formId?: ReturnType<typeof Ids.form>;
};

export function validationRulesFromField(
  input: FieldValidationInput,
  discoverySessionId: DiscoverySessionId,
  observedAt = new Date().toISOString(),
): ValidationRule[] {
  const { field } = input;
  const rules: ValidationRule[] = [];
  const base = {
    fieldId: input.fieldId,
    formId: input.formId,
    provenance: {
      discoverySessionId,
      evidenceStatus: EvidenceStatus.OBSERVED,
      firstSeenAt: observedAt,
      lastSeenAt: observedAt,
    },
  };

  if (field.required) {
    rules.push({
      id: Ids.validationRule(),
      ...base,
      ruleType: "required",
      message: undefined,
    });
  }
  if (field.pattern) {
    rules.push({
      id: Ids.validationRule(),
      ...base,
      ruleType: "pattern",
      message: field.pattern,
    });
  }
  if (field.minLength != null) {
    rules.push({
      id: Ids.validationRule(),
      ...base,
      ruleType: "minLength",
      message: String(field.minLength),
    });
  }
  if (field.maxLength != null) {
    rules.push({
      id: Ids.validationRule(),
      ...base,
      ruleType: "maxLength",
      message: String(field.maxLength),
    });
  }
  if (field.min != null) {
    rules.push({
      id: Ids.validationRule(),
      ...base,
      ruleType: "min",
      message: field.min,
    });
  }
  if (field.max != null) {
    rules.push({
      id: Ids.validationRule(),
      ...base,
      ruleType: "max",
      message: field.max,
    });
  }
  const t = (field.fieldType ?? "").toLowerCase();
  if (t === "email" || t === "url" || t === "number") {
    rules.push({
      id: Ids.validationRule(),
      ...base,
      ruleType: `type:${t}`,
      message: undefined,
    });
  }

  return rules;
}

export function validationRulesFromFields(
  fields: FieldValidationInput[],
  discoverySessionId: DiscoverySessionId,
): ValidationRule[] {
  return fields.flatMap((f) => validationRulesFromField(f, discoverySessionId));
}