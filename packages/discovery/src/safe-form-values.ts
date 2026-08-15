import type { DetectedField } from "./form-types.js";

/** Fields we refuse to auto-fill in Step 1. */
const BLOCKED =
  /pass(word)?|pwd|secret|token|ssn|social|credit|card|cvv|cvc|iban|routing|account.?number|pin/i;

export type PlannedFieldValue = {
  field: DetectedField;
  /** undefined = skip (blocked or no safe value) */
  value?: string;
  skipped: boolean;
  skipReason?: string;
};

export function isBlockedField(field: DetectedField): boolean {
  const hay = [field.name, field.label, field.fieldType, field.placeholder]
    .filter(Boolean)
    .join(" ");
  if (field.fieldType === "password") return true;
  return BLOCKED.test(hay);
}
/** Deterministic synthetic value for one field (§25). */

export function syntheticValueFor(field: DetectedField): string | undefined {
  if (isBlockedField(field)) return undefined;

  const t = (field.fieldType ?? field.tag).toLowerCase();

  if (t === "checkbox" || t === "boolean") return "true";
  if (t === "email") return "test@example.com";
  if (t === "number" || t === "range") return "1";
  if (t === "tel") return "5550100";
  if (t === "url") return "https://example.com";
  if (t === "date") return "2020-01-15";
  if (t === "datetime-local") return "2020-01-15T12:00";
  if (t === "time") return "12:00";
  if (t === "color") return "#000000";

  if (t === "select" || t === "select-one" || field.tag === "select") {
    const opt = field.options?.find((o) => o.value !== "" && !o.disabled);
    return opt?.value;
  }

  if (t === "radio") {
    const opt = field.options?.find((o) => o.value !== "" && !o.disabled);
    return opt?.value;
  }

  if (t === "hidden" || t === "file" || t === "submit" || t === "button" || t === "image" || t === "reset") {
    return undefined;
  }

  // text, search, textarea, etc.
  return "test";
}

export function planSafeFormFill(fields: DetectedField[]): PlannedFieldValue[] {
  return fields.map((field) => {
    if (isBlockedField(field)) {
      return { field, skipped: true, skipReason: "sensitive_or_blocked" };
    }
    const value = syntheticValueFor(field);
    if (value === undefined) {
      return { field, skipped: true, skipReason: "no_safe_value" };
    }
    return { field, value, skipped: false };
  });
}