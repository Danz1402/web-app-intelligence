# EvidenceStatus

Quality of a discovered fact. Defined in `packages/shared/src/evidence-status.ts`.

| Status | Meaning |
|--------|---------|
| OBSERVED | Seen during discovery; outcome not proven |
| VERIFIED | Confirmed by successful replay/outcome |
| INFERRED | Derived/interpreted; not direct proof |
| STALE | Previously valid; newer evidence conflicts or aged out |
| FAILED | Verification/action attempt failed |

Never treat INFERRED like VERIFIED.