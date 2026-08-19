# Product mockups

Screen mockups of the finishing product (`applinsights`). This is the visual destination — not crawl evidence. Crawl screenshots belong in `artifacts/screenshots/`.

**Analysis of these screens lives in `docs/PRODUCT_UI_VISION.md`.** Read that first; only open the images when you need pixel detail.

## Current set

| File | Surface | Step |
|---|---|---|
| `overview.png` | Application overview + activity feed | 3+ |
| `live discovery session.png` | Live Discovery: stream, element inspector, live graph | **1** |
| `discovery lab coverage.png` | Coverage score, by-section, over time, crawl health | **1** |
| `application map.png` | Page / Behavior / API / Permission maps | 2 |
| `knowledge graph.png` | Capabilities, relationships, preconditions/effects | 2 |
| `workflow details.png` | Workflow steps, success rates, generate tests | 2–4 |
| `ai assistant.png` | Grounded Q&A with evidence panel | 3 |
| `tests.png` | Suites, failures, DOM diff | 4 |
| `monitoring.png` | Availability per workflow, locations, alerts | 5 |
| `changes.png` | Run-to-run diff, before/after | 5 |
| `automation builder.png` | Node graph built from discovered actions | 6 |

Adding more: name the file after the surface and add a row above.

## How the agent uses these

- Informs what data Step 1 must **retain** so these screens are possible later.
- Does **not** authorize building Step 2–6 surfaces early, and does not override `docs/MASTER_CONTEXT.md` or the active checklist item.
