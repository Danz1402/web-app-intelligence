import { EvidenceStatus, Ids, type DiscoverySessionId, type Form, type Field, type StateId } from "@wai/shared";
import type { DetectedForm } from "./form-types.js";

export function toObservedForms(input: {
  detected: DetectedForm[];
  stateId: StateId;
  discoverySessionId: DiscoverySessionId;
}): { forms: Form[]; fields: Field[] } {
  const now = new Date().toISOString();
  const forms: Form[] = [];
  const fields: Field[] = [];

  for (const df of input.detected) {
    const form: Form = {
      id: Ids.form(),
      stateId: input.stateId,
      name: df.name,
      provenance: {
        discoverySessionId: input.discoverySessionId,
        evidenceStatus: EvidenceStatus.OBSERVED,
        firstSeenAt: now,
        lastSeenAt: now,
      },
    };
    forms.push(form);

    for (const f of df.fields) {
      fields.push({
        id: Ids.field(),
        formId: form.id,
        name: f.name,
        label: f.label,
        fieldType: f.fieldType,
        required: f.required,
        provenance: {
          discoverySessionId: input.discoverySessionId,
          evidenceStatus: EvidenceStatus.OBSERVED,
          firstSeenAt: now,
          lastSeenAt: now,
        },
      });
    }
  }

  return { forms, fields };
}