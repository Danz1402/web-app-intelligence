/**
 * Quality of a discovered fact.
 * Never treat INFERRED like VERIFIED.
 */
export const EvidenceStatus = {
    OBSERVED: "OBSERVED",
    VERIFIED: "VERIFIED",
    INFERRED: "INFERRED",
    STALE: "STALE",
    FAILED: "FAILED",
  } as const;
  
  export type EvidenceStatus =
    (typeof EvidenceStatus)[keyof typeof EvidenceStatus];
  
  export const EVIDENCE_STATUSES = Object.values(EvidenceStatus);