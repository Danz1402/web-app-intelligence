# Record IDs

Defined in `packages/shared/src/ids.ts`.

## Rules

- Record IDs are UUID strings (`crypto.randomUUID` / RFC 4122)
- Each entity type has a branded TypeScript ID (e.g. `StateId`, `ElementId`)
- Do not reuse a record ID across entity types
- Create via `Ids.*` factories; narrow DB strings with `asId`

## Not the same as fingerprints

Logical identity (“same button across crawls”) uses fingerprints later (Phase 4 / master context §15). Those are **not** record IDs.