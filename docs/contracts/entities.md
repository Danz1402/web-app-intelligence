# Core entities (v0)

Types live in `packages/shared/src/entities.ts`.  
Provenance rules: [provenance.md](./provenance.md).

## Registry / session

| Entity | Role |
|--------|------|
| Application | App under discovery |
| Environment | e.g. staging / production |
| DiscoverySession | One crawl/run |

## Discovery facts

| Entity | Role |
|--------|------|
| PageTemplate | Generalized route/page pattern |
| PageInstance | Concrete URL/page occurrence |
| State | Structured UI state snapshot |
| Element | Meaningful interactive (or key) UI element |
| Action | Interaction attempted/recorded |
| Transition | from state + action → to state |
| Form / Field / ValidationRule | Form model |
| NetworkRequest | Observed HTTP call |
| ApiEndpoint | Normalized endpoint |
| DiscoveryError | Runtime/discovery error (`Error` concept) |
| Artifact | Screenshot, trace, etc. |
| RoleProfile | Role used for discovery |
| CandidateWorkflow | Inferred workflow candidate |
| VerificationResult | Replay/verification outcome |

## Design notes

- Primary state representation is structured (`State.snapshot`), not raw HTML
- `locatorCandidates` on Element are intentionally loose in v0 (`Record<string, unknown>[]`)
- Fields will grow in later phases; keep names stable