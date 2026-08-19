# How to prompt in this repo

Do **not** paste `docs/MASTER_CONTEXT.md` into every chat.

## What loads automatically

- `.cursor/rules/web-app-intelligence.mdc` — architecture scope, ownership (you code by default), Step 1 constraints

## What to @ when needed

| File | When |
|------|------|
| `@docs/STEP1_CHECKLIST.md` | Current phase item / “what’s next” |
| `@docs/POST_MVP_SCENARIO_CHECKLIST.md` | After Lab + Phase 14: scenario coverage audit (not during L1) |
| `@docs/MASTER_CONTEXT.md` | Deep architecture, schema meaning, later steps |
| `@docs/PRODUCT_UI_VISION.md` | What the product mockups require us to retain (contract/schema/persistence decisions) |
| `@docs/mockups/` | The mockup images themselves (pixel detail only) |
| `@docs/contracts/` | Discovery contract details (once you add them) |
| Specific source files | Review or debug your implementation |

## Ownership

You implement. Ask for **advice/review** by default. Ask for **implementation** only with an explicit request, e.g. “implement Phase 2.2 for me”.

## Good focused prompts

- “Phase 0.3: does my `State` type cover provenance correctly?”
- “I finished Gate 1 — what exactly is next on the checklist?”
- “Phase 5: review my state comparison approach before I code.”
- “Implement Phase 2.2 BrowserSession lifecycle” ← only when you want the agent to write code

Include **phase/item or gate**, **concrete deliverable**, and any **constraints** for that task only.
