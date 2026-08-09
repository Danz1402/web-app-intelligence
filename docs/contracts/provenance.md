# Provenance rules (contract v0)

## Rule

Every important discovered fact must link to a `DiscoverySession` and carry timestamps.

## How

- Prefer `provenance: Provenance` on discovery entities (`packages/shared`).
- `Provenance` includes `discoverySessionId`, `evidenceStatus`, `firstSeenAt`, `lastSeenAt`.

## Entity classification

| Entity | Session link | Timestamps |
|--------|--------------|------------|
| Application | n/a (registry) | `createdAt` |
| Environment | n/a (registry) | (none required in v0) |
| DiscoverySession | is the session | `startedAt`, `endedAt?` |
| PageTemplate … CandidateWorkflow (with `provenance`) | `provenance.discoverySessionId` | `firstSeenAt`, `lastSeenAt` |
| Artifact | `discoverySessionId` | `createdAt` |
| VerificationResult | `discoverySessionId` | `checkedAt` |

## Note

`State` may also store `discoverySessionId` at the top level for query convenience; it must still match `provenance.discoverySessionId` when both are set.