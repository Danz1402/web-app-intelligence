# Product UI vision — what the mockups demand

Source images: `docs/mockups/`. Product name in the mockups: **applinsights**.

This doc exists so Step 1 decisions preserve the data these screens need. It is **not** a build order and **not** a spec. The mockups are directional: they show the intended shape and priorities of the product, and some individual panels are aspirational or actively misleading (see "Parts not to build as drawn"). The sequential order stays `docs/STEP1_CHECKLIST.md`; architecture authority stays `docs/MASTER_CONTEXT.md`.

Read this when a decision touches the discovery contract, schema, what we persist, or dashboard shape.

---

## Screen inventory

| Mockup | Surface | Step it belongs to |
|---|---|---|
| `overview.png` | Application overview: discoveries, workflows, tests, monitoring, app map preview, activity feed, assistant box | Step 3+ (aggregate of everything) |
| `live discovery session.png` | Live Discovery: counters, embedded browser view, discovery stream, element inspector, live graph, discovered states, screenshot strip | **Step 1** (the engine's own face) |
| `application map.png` | Page / Behavior / API / Permission map tabs, node detail with prerequisites, entry points, leads-to, observed actions, evidence counts | Step 2 |
| `knowledge graph.png` | Capabilities, relationships, node detail with preconditions/effects, AI insights | Step 2 |
| `workflow details.png` | Workflow steps with per-step screenshot + success rate, roles, prerequisites, related workflows, generate tests | Step 2–4 |
| `discovery lab coverage.png` | Coverage score, coverage by route section, coverage over time, discovered vs known, element types, issues, crawl details | **Step 1** (Phase 13 grows into this) |
| `ai assistant.png` | Grounded Q&A with confidence, "how it works" step strip, runnable Playwright snippet, evidence panel | Step 3 |
| `tests.png` | Suites, per-test status, failure detail with expected/actual screenshots and DOM diff | Step 4 |
| `monitoring.png` | Per-workflow availability heatmap, checks, locations, failure insight | Step 5 |
| `changes.png` | Run #48 vs #47 diff: added / changed / removed, before & after screenshots, impact | Step 5 |
| `automation builder.png` | Node-graph builder whose palette is **discovered actions** | Step 6 |

The mockups are internally consistent with `MASTER_CONTEXT`: every detail panel shows **evidence, provenance, and status**. That is the strongest signal that the architecture is right. Two panels appear on nearly every screen and drive the requirements below: an **evidence count strip** (screenshots / network calls / states / console logs / notes) and a **confidence + verified/last-seen badge**.

---

## What the screens require that the frozen contract does not yet have

Confirmed against `packages/shared/src/entities.ts` and `provenance.ts`.

| # | Requirement | Seen in | Contract today | Verdict |
|---|---|---|---|---|
| 1 | **Numeric confidence** (98%, 99%) alongside status | live discovery, app map, graph, changes, assistant | `EvidenceStatus` enum only | **Do not copy as drawn.** See "Parts not to build as drawn" #1. Persist corroboration *counts*; the enum stays the truth. |
| 2 | **Occurrence count** ("Times seen 14", "Executions 1,248", "Success rate 98.7%") | live discovery, workflow details | `firstSeenAt` / `lastSeenAt` only | Missing counter. Either `timesSeen` on provenance or aggregate rows per run. This is the honest version of #1. |
| 3 | **Element HTML snippet** ("Element preview", DOM diff) | live discovery, tests, changes | `Element` has no html | Missing. Add a redacted `outerHtml` excerpt (bounded length). |
| 4 | **Element runtime flags** ("State: Visible", "Enabled: Yes", "Stability: High") | live discovery | not on `Element` | Missing. `visible`, `enabled`, and a stability signal (locator agreement across sightings). |
| 5 | **Network timing + bodies** ("200 OK (242ms)", full response JSON) | live discovery, assistant, monitoring | `method`, `url`, `statusCode` | Missing `durationMs` and redacted request/response bodies. Assistant and Tests cannot exist without them. |
| 6 | **Per-state and per-step screenshots** | live discovery strip, workflow steps, tests expected/actual, changes before/after | CLI takes one screenshot per session | Gap in the explore loop, not the contract. `ArtifactKind` already allows `screenshot` / `dom_snapshot`. |
| 7 | **DOM snapshot artifacts** | changes evidence, tests DOM diff | `ArtifactKind.dom_snapshot` exists but nothing writes it | Wire it when cheap; diffing later is impossible without it. |
| 8 | **Discovery event stream** (timestamped: navigated / clicked / state change / API call) | live discovery centre column | explore loop returns a summary only | Missing. An append-only event log is cheap now and also improves Gate 11 reporting. |
| 9 | **Coverage snapshot per run** ("Coverage over time", "+8% vs last crawl") | coverage, overview | `coverage.ts` computes on the fly | Missing persistence. Trends cannot be backfilled — every run not stored is a permanently missing point. |
| 10 | **Coverage grouped by route section** (`/app/customers` 83%) | coverage | page templates exist | Reachable; keep template linkage on states. |
| 11 | **Crawl stats** (duration, requests made, avg response time) | coverage right rail | session has start/end only | Small addition to the session record. |
| 12 | **Politeness / robots.txt** ("Respected robots.txt", "Rate limits respected") | coverage discovery health | not in Step 1 at all | Real omission. Belongs in 14.8. Also an ethics/legal concern once we crawl anything we do not own. |
| 13 | **Crawl issue classes** (4XX, broken links, timeouts, redirect chains > 5, duplicate content) | coverage top issues | errors + network exist; no classification | Classify at report time; redirect chains need transition data we should not discard. |
| 14 | **Roles that can execute** per action/element | app map, graph, workflow details | role lives on the session | Derivable via session → role profile. Keep `roleProfileId` populated on every session or this whole column dies. |
| 15 | **Cross-run identity** (added / changed / removed, "vs last crawl") | changes, coverage, monitoring | per-session rows, random ids | The join key must be stable: page template + element fingerprint + behavior key. `behaviorKey` is currently computed in memory and thrown away — persist it. |
| 16 | **Prerequisites / preconditions / effects** as first-class text | app map, graph, workflow details | not modelled | Correctly **Step 2 (INFERRED)**. Step 1's job is to preserve the raw material: failed attempts, blocked actions, ordering, role that succeeded. |
| 17 | **Product-level users and teams** (Jane Cooper / Admin, Team, Schedules, Integrations) | every screen chrome | nothing | Not Step 1. Important: this is **our** app's auth, a different concept from `RoleProfile` (the target app's roles). Never merge the two. |

---

## Parts not to build as drawn

The mockups are a direction, not a contract. These panels should be cut, demoted, or reworded — they promise things the system cannot honestly know.

**1. Confidence percentages (98%, 99%, "Answer confidence High (98%)").** A percentage claims a calibrated probability. Nothing in the pipeline calibrates anything, so the number would be a formula dressed up as a measurement — and users over-trust exactly that. `EvidenceStatus` plus corroboration counts is more honest and more useful: *"OBSERVED · seen 14 times · verified 12 min ago"* tells you why to trust it. Keep the counts (row 2), drop the percent. If a confidence signal is ever needed, make it coarse (High / Medium / Low) with the inputs visible.

**2. Absolute coverage scores ("Coverage score 86%, Goal 90%", "Coverage 91%").** Coverage needs a denominator, and for a real application the denominator is unknowable — you cannot count what you never discovered. What `coverage.ts` computes is *queue* coverage: explored ÷ (explored + pending + blocked + failed). That is a legitimate and useful number. It is **not** "we understand 86% of your app," and it must never be labelled as if it were. Honest denominators exist in exactly two cases: the Discovery Lab (known ground truth) and a prior run ("vs last crawl"), which the coverage mockup already does correctly with "Known 1,102 / New 146".

**3. Monitoring by geography and SLA ("Uptime by location", 7 global locations, SLA tab).** Distributed synthetic monitoring is a commodity infrastructure product and unrelated to the insight here. What is differentiated is that the *checks are derived from discovered workflows*. Keep that; drop the global runner fleet.

**4. "Executions 1,248 · Success rate 98.7%" on a write workflow.** That means creating 1,248 customers in someone's application. It collides head-on with the safety principle. These numbers are honest for read-only workflows or a sandbox/test tenant, and dishonest for anything mutating production. Any monitoring design has to answer "against which environment" before it shows a success rate.

**5. The live embedded browser view.** Streaming the browser needs a CDP screencast pipeline and a socket per session. The screenshot strip beside it delivers most of the value for a fraction of the cost. Start with the strip.

**6. A clean 25-node application map.** Real applications produce hundreds of nodes and the layout in the mockup will become a hairball. Any graph view needs grouping and filtering as the default state, not as options — templates collapsed, one node per route pattern, expand on demand.

**7. Vanity counters ("Discoveries 142 +12%").** Ambiguous denominator — sessions? facts? Either define it or drop it.

**8. The automation builder** is a separate product (Zapier/n8n scope). It is only interesting because its palette comes from discovery. Fine as a north star; not a Step 1–5 commitment.

What clearly earns its place, by contrast: the evidence strips, "Observed effects" on an element, the element inspector with selector candidates and stability, the run-to-run Changes screen, per-step workflow screenshots, the permission map, the discovery stream, and grounding every assistant answer in artifacts.

---

## Decisions taken from this review

**1. Corroboration counts, not confidence percentages.** Nearly every panel wants a trust signal. Provide it as `EvidenceStatus` + counts + last-verified time (row 2), and skip the percent (see above). This is cheap to persist and impossible to reconstruct later.

**2. "Coverage over time" makes coverage a stored fact.** Computing coverage on demand is fine for Gate 11 and useless for trends. One `coverage_snapshots` row per finished session is the cheapest way to make the whole `overview.png` top strip possible later. Label it as queue coverage, per the caveat above.

**3. Naming collision — resolved.** `discovery lab coverage.png` uses "Discovery Lab" as a *product surface*, but `MASTER_CONTEXT` §45 uses "Discovery Lab" for the synthetic benchmark app with known ground truth. They are different things.

- The benchmark fixture keeps the name **Discovery Lab** (`apps/discovery-lab/`), per §45.
- The product surface is named **Coverage** — which is what the mockup's own left nav says. The breadcrumb wording in that image should be read as "Coverage".

**4. Live Discovery is a Step 1 surface, not a Step 3 one.** It is the engine watching itself: stream, element inspector, state list, screenshots. Everything it shows is OBSERVED data. It is the natural successor to the Phase 13 debug dashboard, and it is the screen that justifies items 3, 4, 5, 6, and 8 above.

**5. Nothing here changes the current work order.** L1 is still links + `pushState`. The mockups change *what we retain while doing it*, not the sequence.

---

## Cheap now vs expensive later

Retaining data is cheap while the writer is being built. Reconstructing it means re-crawling every application.

**Worth doing before Step 2** (contract `v0.1` + explore-loop writes):

- occurrence counting / corroboration counts (rows 1–2)
- element `outerHtml` excerpt, `visible`, `enabled` (3, 4)
- network `durationMs` + redacted bodies (5)
- per-state screenshots from the explore loop (6)
- discovery event log (8)
- coverage snapshot per session (9)
- persist `behaviorKey` on elements (15)
- `roleProfileId` on every session (14)

**Deliberately later:** prerequisites/effects inference (16), product auth and teams (17), monitoring schedules, test generation, automation builder, assistant.

---

## Standing rule

When a Step 1 decision could make one of these screens impossible or require a re-crawl, say so at the time and name the screen. Do **not** start building Step 2–6 surfaces because a mockup exists.
