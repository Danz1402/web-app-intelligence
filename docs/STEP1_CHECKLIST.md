# Step 1 — Sequential Implementation Checklist

Work top to bottom. Do not skip gates. Do not start Step 2+ until Gate 11 passes.

**Default:** you implement. Ask the agent for code only when you explicitly want it. Architecture reference: `docs/MASTER_CONTEXT.md`.

---

## Immediate first target

`[ ]` Given a URL: start `DiscoverySession` → Chromium → open app → capture initial state → persist evidence-backed snapshot (+ optional screenshot/trace).

Only after that, continue Phase 4+.

---

## Phase 0 — Discovery Contract

`[x]` 0.1 Define shared enums: `EvidenceStatus` = OBSERVED | VERIFIED | INFERRED | STALE | FAILED  
`[x]` 0.2 Define ID conventions (stable IDs per entity type)  
`[x]` 0.3 Define core types (fields + provenance hooks):  
  Application, Environment, DiscoverySession, PageTemplate, PageInstance, State, Element, Action, Transition, Form, Field, ValidationRule, NetworkRequest, ApiEndpoint, Error, Artifact, RoleProfile, CandidateWorkflow, VerificationResult  
`[x]` 0.4 Require every important fact to link to `DiscoverySession` (+ timestamps)  
`[x]` 0.5 Document contract in `docs/contracts/` and export types from `packages/shared`  
`[x]` 0.6 Freeze v0 of the contract before building browser/DB writers against it  

**Exit:** Contract is the single source of truth for what discovery persists.

---

## Phase 1 — Repository / foundation

`[x]` 1.1 Initialize TypeScript monorepo (apps + packages + workers as planned)  
`[x]` 1.2 Wire package manager workspaces / path aliases  
`[x]` 1.3 Add Node + TypeScript tooling (build, lint, test scripts)  
`[x]` 1.4 Docker Compose: PostgreSQL (+ optional app services later)  
`[x]` 1.5 Env example (no secrets committed): DB URL, artifact paths  
`[x]` 1.6 Create `database/migrations` baseline  
`[x]` 1.7 Create `packages/storage` DB client + migration runner  
`[x]` 1.8 Migrate tables for Phase 0 entities needed for first snapshot (at least Application, Environment, DiscoverySession, State/PageInstance, Artifact)  
`[x]` 1.9 Artifact dirs: `artifacts/screenshots`, `artifacts/traces` (gitignored contents)  
`[x]` 1.10 Smoke: migrate up/down; shared package builds  

**Exit:** Repo builds; Postgres schema matches contract subset for Gate 1.

---

## Phase 2 — BrowserSession

`[x]` 2.1 Add Playwright (Chromium only) in `packages/browser`  
`[x]` 2.2 `BrowserSession` lifecycle: launch → context → page → close  
`[x]` 2.3 Navigate to URL; wait for usable load (configurable)  
`[x]` 2.4 Capture screenshot to artifacts  
`[x]` 2.5 Optional: Playwright trace start/stop  
`[x]` 2.6 No multi-browser; keep API small and testable  

**Exit:** Code can open a URL in Chromium and produce artifacts.

---

## Phase 3 — Page / state snapshot + first DiscoverySession

`[x]` 3.1 Implement snapshot capture: URL, title, viewport, DOM-derived structured fields (per master context §12)  
`[x]` 3.2 Attach evidence status + provenance (session, timestamps, artifact refs)  
`[x]` 3.3 Implement `DiscoverySession` create/start/complete/fail in `packages/discovery`  
`[x]` 3.4 Persist session + initial state + artifacts via `packages/storage`  
`[x]` 3.5 CLI or worker entry (`workers/explorer`): `discover <url>`  
`[x]` 3.6 End-to-end: URL → session row → state row → screenshot on disk  

### Gate 1
`[x]` Reliably open and snapshot applications (at least 2–3 simple sites + local fixture later)

---

## Phase 4 — Interactive elements + locators + interaction

`[x]` 4.1 Detect meaningful interactive elements (buttons, links, inputs, etc.)  
`[x]` 4.2 Filter noise (hidden/disabled/decorative where appropriate)  
`[x]` 4.3 Persist `Element` records with provenance  
`[x]` 4.4 Locator strategy (stable preference order per master context §14)  
`[x]` 4.5 Element fingerprint / identity (§15)  
`[x]` 4.6 Safe action engine: click/type/select on allowed elements  
`[x]` 4.7 Record intended `Action` before/after attempt  

### Gate 2
`[x]` Correctly identify meaningful interactive elements on known pages

---

## Phase 5 — State comparison + transitions

`[x]` 5.1 State signature / comparison (URL, key DOM, modals, etc. per §17)  
`[x]` 5.2 Detect transition after action  
`[x]` 5.3 Persist `Transition` (from → action → to) with evidence  
`[x]` 5.4 Handle no-op / failed / partial changes (`FAILED` / `OBSERVED`)  

### Gate 3
`[x]` Perform safe actions and detect resulting state changes

---

## Phase 6 — Exploration queue + restoration

`[x]` 6.1 Exploration queue of candidate actions/states (§19)  
`[x]` 6.2 Priority scoring (§21)  
`[x]` 6.3 Crawl limits: depth, max actions, time, same-origin rules (§20)  
`[x]` 6.4 State restoration strategy (§18) — best-effort return to prior state  
`[x]` 6.5 Autonomous loop: dequeue → act → observe → enqueue → stop on limits  

### Gate 4
`[x]` Autonomously explore multiple paths without manual scripting per click

---

## Phase 7 — Network / API observation

`[x]` 7.1 Capture network requests/responses during actions  
`[x]` 7.2 Correlate requests to triggering action/state  
`[x]` 7.3 Persist `NetworkRequest`; start `ApiEndpoint` normalization (§23)
`[x]` 7.4 Redact sensitive headers/bodies early (even if Phase 10 expands this)

### Gate 5
`[x]` Correlate interactions with network/API effects

---

## Phase 8 — Forms + validation

`[x]` 8.1 Detect forms and fields  
`[x]` 8.2 Options / dropdowns / dependent fields  
`[x]` 8.3 Safe form exploration strategy (§25)  
`[x]` 8.4 Validation discovery (client-side messages, required, patterns) (§26)  
`[x]` 8.5 Persist Form, Field, ValidationRule  

### Gate 6
`[x]` Understand common forms and validations on Discovery Lab / sample apps

---

## Phase 9 — Dedup + generalization

`[x]` 9.1 Deduplicate near-identical states  
`[x]` 9.2 Route / page template detection (§30)  
`[x]` 9.3 Repeated component detection (§31)  
`[x]` 9.4 Behavioral generalization (§32)  
`[x]` 9.5 Guardrails against state explosion (§29)  

### Gate 7
`[x]` Generalize repeated pages/components; exploration stays bounded

---

## Phase 10 — Auth, roles, safety, secrets

`[x]` 10.1 Auth/login support for discovery profiles (§33)  
`[x]` 10.2 Role profiles and role-scoped discovery (§34)  
`[x]` 10.3 Safety engine: block destructive/financial/irreversible actions (§35)  
`[x]` 10.4 Secret handling + data redaction (§36)  
`[x]` 10.5 Console/runtime error capture (§37)  

### Gate 8
`[x]` Safely explore authenticated apps and different roles

---

## Phase 11 — Candidate workflows

`[x]` 11.1 Infer candidate workflows from transitions (§38)  
`[x]` 11.2 Name/structure workflows with evidence links  
`[x]` 11.3 Persist `CandidateWorkflow`  

### Gate 9
`[x]` Assemble useful workflow candidates (not just raw click chains)

---

## Phase 12 — Replay + verification

`[x]` 12.1 Replay workflow steps with stored locators/actions (§39)  
`[x]` 12.2 Verify expected transitions / outcomes  
`[x]` 12.3 Persist `VerificationResult`; upgrade evidence to VERIFIED where earned  
`[x]` 12.4 Evidence bundles for important claims (§40)  

### Gate 10
`[x]` Replay and verify discovered workflows

---

## Phase 13 — Coverage + dashboard

`[x]` 13.1 Coverage metrics: explored / blocked / failed / unknown (§43)  
`[x]` 13.2 Internal discovery dashboard (Next.js) — sessions, states, elements, workflows, errors (§44)  
`[x]` 13.3 Evidence browser (screenshots, traces, provenance links)  

### Gate 11
`[x]` Clearly report what was explored, failed, blocked, and unknown

---

## Phase 14 — Hardening

`[ ]` 14.1 Harder SPA patterns  
`[ ]` 14.2 Iframes (as needed)  
`[ ]` 14.3 Uploads / downloads  
`[ ]` 14.4 Infinite scrolling  
`[ ]` 14.5 Improved dynamic components  
`[ ]` 14.6 Parallel exploration (if justified)  
`[ ]` 14.7 Crawl recovery / resume  
`[ ]` 14.8 Performance + security hardening  
`[ ]` 14.9 Large-application testing  

**Exit:** Step 1 MVP strong enough for Step 2.

---

## Parallel track — Discovery Lab (recommended from Gate 1 onward)

Build a controlled app with known ground truth (master context §45).

`[ ]` L1 Normal links + SPA navigation  
`[ ]` L2 Modals, tabs, accordions  
`[ ]` L3 Forms + validation  
`[ ]` L4 Tables, pagination, filters  
`[ ]` L5 Dropdown dependencies + dynamic rendering  
`[ ]` L6 Nested dialogs + repeated routes/rows  
`[ ]` L7 Downloads / uploads  
`[ ]` L8 Role-based UI  
`[ ]` L9 API failures + client errors  
`[ ]` L10 Later: infinite scroll, iframes  
`[ ]` L11 Maintain ground-truth counts; score discovery output against them  

---

## Explicitly defer (do not build in early Step 1)

- Full NL assistant / autonomous AI agent  
- Neo4j  
- Multi-browser engines  
- Complex LLM reasoning infra  
- Cross-app automation  
- Perfect Shadow DOM / CAPTCHA bypass / pentest  
- AI-generated documentation product  
- Huge distributed crawler / mobile apps  

---

## After Step 1 (reminder only)

1. **Step 2** — Knowledge graph from discovery records  
2. **Step 3** — Search / docs / initial assistant  
3. **Step 4** — Playwright test generation  
4. **Step 5** — Monitoring / change detection  
5. **Step 6** — Automation / digital assistant  

---

## Suggested cadence

| Weeks | Focus |
|------|--------|
| 1 | Phase 0–2 |
| 2 | Phase 3 → Gate 1 |
| 3–4 | Phase 4 → Gate 2 |
| 5 | Phase 5 → Gate 3 |
| 6 | Phase 6 → Gate 4 |
| 7 | Phase 7 → Gate 5 |
| 8 | Phase 8 → Gate 6 |
| 9–10 | Phase 9 → Gate 7 |
| 11 | Phase 10 → Gate 8 |
| 12 | Phase 11 → Gate 9 |
| 13 | Phase 12 → Gate 10 |
| 14 | Phase 13 → Gate 11 |
| 15–16 | Integration / bugfix |
| 17–24 | Phase 14 hardening |

---

## How to use this with Cursor

- Mark items `[x]` as you finish them.  
- Prompt with phase + item, e.g. `Phase 0.3: review my Element type for provenance gaps` (advice) or `Phase 2.2: implement BrowserSession` (only when you want code).  
- Agent should not implement application code unless you explicitly ask.
