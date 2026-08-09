# Discovery Contract version

## Current: v0

**Status:** frozen for Phase 1 start  
**Date:** 2026-08-09  
**Code:** `packages/shared`  
**Docs:** `docs/contracts/`

## Freeze rules

Until you intentionally bump this file:

1. Do **not** rename existing exported types or fields.
2. Do **not** remove fields or change their meaning.
3. Do **not** change EvidenceStatus value strings.
4. Do **not** change record ID format (UUID strings + branded types).
5. You **may** add optional fields or new types in later phases.
6. Breaking changes require updating this file to **v0.1** / **v1** and noting why.

## v0 includes

- EvidenceStatus
- Branded record IDs + `Ids` / `asId`
- Provenance rules
- Core entities listed in entities.md

## Built against v0 next

- Phase 1: Postgres migrations / storage
- Phase 2–3: BrowserSession + first DiscoverySession snapshot writers