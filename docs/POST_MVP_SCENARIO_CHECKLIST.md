# Post-MVP scenario checklist

Use this **after** Discovery Lab L1–L11 and Phase 14. Do **not** execute it during L1 or as a reason to skip the sequential lab.

This is a **coverage audit**, not a build list. The Discovery Lab stays a controlled benchmark with known counts (`docs/MASTER_CONTEXT.md` §45). Architecture should eventually *allow* many of these behaviors; it must not block Step 1 trying to perfectly solve all of them.

---

## When

1. Lab slices L1–L11 exist and L11 scores discovery against ground truth.
2. Phase 14 hardening that you chose to do is done (or explicitly skipped).
3. Step 1 exit: MVP strong enough for Step 2.

Then walk this file. Then Step 2 (knowledge graph), not a second rewrite of the lab.

---

## What going through it entails

For each row, mark **Status** and keep **Bucket** unless you have a reason to change it.

| Status | Meaning |
|--------|---------|
| Covered | Lab route exists, ground truth matches, engine finds it |
| Known miss | Lab can show it; engine does not; leave until you choose to harden |
| Step 2+ | Observation is enough; *meaning* (entities, multi-user, stale knowledge) waits |
| Out of scope | Not doing it unless a real target needs it |

Then produce a **shortlist** (a handful of rows), not a plan to implement the whole table.

Typical audit output:

1. Rows already covered by L1–L11 / Phase 14 (confirm, don’t rebuild).
2. A few extra lab routes worth adding (one behavior family per route).
3. Rows that stay known misses.
4. Rows that belong to Step 2+.

Update `apps/discovery-lab/ground-truth.json` whenever you add a route. One new behavior at a time.

---

## Buckets (guidance, not gates)

| Bucket | Meaning |
|--------|---------|
| **L1–L11** | Expected in the sequential lab. Don’t wait for this audit. |
| **P14** | Phase 14 hardening if the lab or a real app shows a miss. |
| **Audit** | After MVP: optional extra lab route / engine work; still *observation*. |
| **S2+** | Knowledge graph / products. Engine may observe clicks and APIs; do not encode business meaning in Step 1. |
| **Defer** | Master context: allow later; do not block MVP (Shadow DOM, canvas, nested iframes, mobile, cross-app, etc.). |

---

## Scenario catalog

Mark **Status** when you audit. Leave it blank until then.

| Status | Bucket | Scenario family | Features to build in the lab (when you get here) | What discovery should eventually account for |
|--------|--------|-----------------|--------------------------------------------------|-----------------------------------------------|
| | L1–L11 | Basic navigation | Normal links, buttons to pages, back, breadcrumbs, home | Page/state transitions and loops |
| | L1–L11 | SPA navigation | `pushState`, client-side routes, no reload | Navigation without a full reload |
| | L1–L11 | Same-URL states | Tabs, accordions, drawers, menus, filters | URL alone cannot identify state |
| | L1–L11 | Modals | Simple, nested, confirmation, modal opening a modal | Dialog hierarchy and transitions |
| | Audit | Native browser dialogs | `alert`, `confirm`, `prompt` | Browser dialogs vs DOM dialogs |
| | L1–L11 | Forms | Text, number, email, password, textarea, date, time, checkbox, radio, select | Logical form structure |
| | L1–L11 | Conditional forms | Country reveals province; checkbox reveals fields | Field-to-field dependencies |
| | L1–L11 | Multi-step forms | Wizard Next/Back, progress, branches | Sequence across states |
| | L1–L11 | Validation | Required, regex, min/max, cross-field, server errors | Rules and failure paths |
| | Audit | Autosave | Edit field → delayed API save, no submit | Background mutation |
| | L1–L11 | Tables | Sort, filter, pagination, row actions, expandable rows | Repeated components, parameterized actions |
| | P14 | Virtualized tables | Only visible rows in the DOM | Scroll changes available instances |
| | L1–L11 | Infinite scroll | More items on scroll | Content expansion without a control |
| | L1–L11 | Entity pages | `/customer/1`, `/customer/2`, `/customer/3` | Template generalization |
| | L1–L11 | Entity variants | Ordinary vs VIP with extra actions | Similarity without dropping rare behavior |
| | Audit | State-dependent actions | Draft: Edit/Submit; Submitted: Cancel; Approved: Refund | Actions depend on entity state |
| | L1–L11 | Role-based UI | Employee, manager, admin see different actions | Capabilities by role |
| | S2+ | Feature flags | Feature only when flag on | Behavior depends on configuration |
| | S2+ | Subscription tiers | Free/Pro/Enterprise capabilities | Entitlement-dependent functionality |
| | Audit | Cross-page workflow | Create customer → order → invoice → payment | Long workflow composition (candidates in Step 1; meaning in Step 2) |
| | S2+ | Prerequisite workflow | Cannot invoice until order approved | Action sequencing/dependencies |
| | S2+ | Cross-entity dependency | Verified email before checkout | Dependency between entities |
| | Defer | Drag and drop | Kanban cards between columns | Source, destination, valid drops, resulting state |
| | Defer | Sortable drag list | Reorder by dragging | Positional state |
| | Defer | Drag to invalid target | Card rejected from a column | Negative transition |
| | Defer | Canvas-like interaction | Drawing/diagram area | Fallback for non-standard DOM |
| | Audit | Hover-only actions | Menu only on hover | Hover creates discoverable state |
| | Audit | Right-click / context menu | Exclusive actions in context menu | Non-click activation |
| | Audit | Double click | Single click selects, double click opens | Gesture-specific behavior |
| | Audit | Keyboard shortcuts | Ctrl+N creates; Delete removes | Capability without a visible control |
| | Audit | Keyboard navigation | Tab/arrow menus | Accessibility paths |
| | Defer | Long press | Simulated mobile | Gesture variants; not Step 1 |
| | L1–L11 | File upload | One/multiple files, type/size limits | Upload workflow/validation |
| | L1–L11 | File download | Direct and generated download | Distinguish download outcomes |
| | Audit | Clipboard | Copy value with UI confirmation | Non-navigation side effect |
| | Defer | New tabs/windows | `target=_blank`; OAuth-style popup | Other browser contexts |
| | L1–L11 | iframes | Embedded payment/profile/editor | Nested document context |
| | Defer | Nested iframes | iframe inside iframe | Traversal depth |
| | Defer | Shadow DOM | Custom web component controls | Non-standard DOM boundary |
| | Audit | Portals | Modal rendered outside parent | Logical ownership ≠ DOM ancestry |
| | P14 | Lazy rendering | Appears after intersection/scroll | Async discovery |
| | Audit | Delayed state | Result after ~3s | Settling/stability |
| | Audit | Optimistic UI | UI updates now; API fails and rolls back | Temporary vs final state |
| | Audit | Loading states | Skeleton → loaded; spinner → error | Transient vs meaningful states |
| | Audit | Debounced search | API 500ms after typing | Action/network correlation |
| | Audit | Autocomplete | Type → suggestions → select | Intermediate state chain |
| | L1–L11 | Search variants | No results, one, many | Data-dependent states |
| | L1–L11 | Pagination variants | Numbered, next/prev, cursor | Repeated content navigation |
| | L1–L11 | Dynamic IDs | IDs change every reload | Locator stability / fingerprints |
| | Audit | Changing labels | “Create Customer” → “New Customer” | Identity despite text change |
| | Audit | Duplicate labels | Three “Save” in separate panels | Contextual element identity |
| | Audit | Icons without text | Icon button with ARIA label | A11y-based identity |
| | Audit | Poor accessibility | Icon button, no ARIA | Fallback identity |
| | L1–L11 | Identical components | Many cards each with Edit/Delete | Parameterized component behavior |
| | L1–L11 | Rare instance capability | One customer has “Resolve Dispute” | Variant detection |
| | L1–L11 | Hidden feature | Button only after Advanced | Recursive discovery |
| | L1–L11 | Progressive disclosure | Nested menus | Deep local branching |
| | L1–L11 | Circular navigation | A → B → C → A | Loop detection |
| | L1–L11 | Diamond graph | A → B → D and A → C → D | Same state, multiple paths |
| | P14 | Multiple routes, same state | `/profile`, `/me`, `/account` equivalent | Behavioral equality despite URL |
| | L1–L11 | Same route, different state | `/dashboard` varies by role/data | State identity beyond URL |
| | Audit | Redirects | A → redirect → B | Redirect understanding |
| | L1–L11 | 404/403/500 pages | Deliberate error routes | Error states |
| | L1–L11 | Frontend exception | Button causes JS error | Console/runtime evidence |
| | L1–L11 | API error | UI loaded, request 500 | Degraded behavior |
| | L1–L11 | Partial failure | Three widgets load, fourth fails | Component-level health |
| | Defer | Offline mode | Simulated network failure | Behavior without network |
| | Audit | Retry | Retry succeeds on second attempt | Conditional transitions |
| | Defer | WebSockets | Live notifications/chat | External async state |
| | Defer | Server-sent events | Live progress feed | State not caused by the user |
| | Audit | Polling | Dashboard refreshes itself | Background mutations |
| | Audit | Notification toast | Action → toast disappears | Transient feedback |
| | Audit | Persistent banner | Account state → warning banner | Contextual state |
| | Audit | Undo | Delete → toast → Undo restores | Reversible workflows |
| | S2+ | Soft delete | Archive vs true delete | Semantic difference |
| | L1–L11 | Bulk actions | Multi-select → bulk archive/export | Selection-dependent capabilities |
| | Audit | Selection state | Toolbar depends on selected count | State from user selection |
| | S2+ | Nested resources | Customer → orders → invoice → customer | Cycles across entities |
| | Defer | Cross-app simulation | Lab A opens Lab B | Multi-app (explicitly later) |
| | Audit | Third-party embed | Fake payment/shipping | External system boundary |
| | Audit | Authentication | Login/logout, bad credentials, expiry | Session lifecycle |
| | Audit | MFA simulation | Login → OTP | Multi-stage auth |
| | Audit | Session expiration | Idle/forced expiry mid-workflow | Interrupted workflows |
| | Audit | Deep linking | Auth then return to target URL | Intent across auth |
| | Audit | Unsaved changes guard | Leave → confirmation | Navigation interception |
| | L1–L11 | Dirty state | Save disabled until a field changes | Action availability |
| | S2+ | Permissions change mid-session | Admin revokes a privilege | Facts can become STALE |
| | S2+ | Localization | EN/FR/ZH labels, same features | Semantics ≠ literal text |
| | Audit | Responsive layouts | Desktop sidebar vs mobile hamburger | Same capability, different UI |
| | Audit | Theme changes | Light/dark restyles classes | Avoid style-based identity |
| | S2+ | A/B variants | Layout A and B, same capability | Behavioral equivalence |
| | S2+ | Time-dependent feature | Action only before a deadline | Temporal conditions |
| | Audit | Date/time workflow | Booking slots differ by date | Parameterized state |
| | S2+ | Geography simulation | Country changes capabilities | Environment/context |
| | S2+ | Feature unlock sequence | Onboarding before a dashboard feature | Historical prerequisites |
| | Audit | First-run experience | Tutorial once | History-dependent UI |
| | Audit | Dismissed UI | Banner gone after dismiss | Persistence across sessions |
| | Audit | LocalStorage state | Preference changes future UI | Storage-driven behavior |
| | Audit | Cookie-driven state | Experiment/personalization cookie | Session-context behavior |
| | S2+ | Multi-user relationship | A submits; B approves | Workflow spans identities |
| | S2+ | Approval chain | Employee → manager → director | Multi-role sequencing |
| | S2+ | Concurrent edit | Record changes while user edits | Conflict behavior |
| | S2+ | Conflict resolution | “Record changed” on save | Alternate workflow |
| | Audit | Idempotent action | Click twice → same final state | Duplicate action semantics |
| | Audit | Non-idempotent action | Click twice increments twice | Repeated action matters |
| | Audit | Rate limiting | Eventually 429 | Frequency-dependent behavior |
| | Audit | Wizard branch convergence | Different choices → same end | Branch merging |
| | Audit | Dead-end branch | Cannot proceed | Blocked-state recognition |
| | Audit | Optional sequence | A→C or A→B→C | Multiple valid paths |
| | Audit | Strict sequence | B disabled until A done | Order knowledge |
| | L1–L11 | Repeatable sequence | Add Item N times | Parameterized repeated action |
| | L1–L11 | Nested repeaters | Invoice line items | Dynamic form structure |
| | L1–L11 | Calculated values | Qty × price → total | Derived state |
| | L1–L11 | Cross-field rules | End date after start date | Validation dependency |
| | L1–L11 | Search → action → return | Filter, open, back keeps filter | Navigation + preserved state |
| | Audit | Scroll restoration | Back restores scroll | Non-obvious restore |
| | Audit | Route query state | `/orders?status=open&page=2` | Query params as state |
| | Audit | Hash state | `#settings/security` | Fragment navigation |
| | L1–L11 | URL-independent filters | Filters only in memory | Hidden state |
| | Audit | Background job | Submit → processing → done later | Long-running workflow |
| | Audit | Job polling | Status until done | Lifecycle states |
| | Audit | Cancel background job | Cancel only while running | Temporal capability |
| | L1–L11 | Download after job | Completed job unlocks Download | Prerequisite capability |
| | S2+ | Nested ownership | Button in card controls another panel | Logical vs visual parent |
| | L1–L11 | Cross-component interaction | Sidebar selection changes main pane | Components affecting each other |
| | L1–L11 | Master-detail UI | Row select updates detail, no URL change | Multi-region state |
| | Audit | Multi-pane application | Independent panel states | Composite state |
| | Audit | Global command palette | Cmd+K actions not on the page | Hidden global capabilities |
| | Audit | Search-driven command | Palette navigates or acts | Intent-like UI |
| | Audit | Notification action | Notification opens a record | Cross-component relation |
| | S2+ | Workflow rollback | Failure undoes earlier steps | Transactional behavior |
| | S2+ | Partial commit | Step 1 persists if step 2 fails | Failure semantics |
| | Audit | Save draft vs publish | Same data, different transitions | Distinct capabilities |
| | S2+ | Version history | Edit → prior versions → restore | Temporal entity behavior |
| | L1–L11 | Nested permissions | Edit customer, not billing | Component-level auth |
| | L1–L11 | Masked data | Employee partial, admin full | Role affects data exposure |
| | Audit | Confirmation phrase | Type the record name to destroy | Complex safety interaction |
| | S2+ | Dependency deletion | Cannot delete with children | Business-rule error |
| | S2+ | Cascade behavior | Delete parent archives children | Side-effect mapping |
| | Audit | Generated child | Create order also creates audit row | Hidden side effect (API/UI) |
| | Audit | Multi-API action | One click → several API calls | Action → multiple network effects |
| | Audit | API with no UI change | Button starts a backend job only | Meaningful effect, no visible state |
| | L1–L11 | UI change with no API | Client-side sort/filter | Purely local behavior |
| | L1–L11 | Download via blob | Client-generated file | No obvious endpoint |
| | Defer | Streaming response | Progressive text | Incremental state |
| | Defer | Rich text editor | Toolbar, selection-dependent actions | Complex component state |
| | Defer | Code editor | Monaco-like | Custom keyboard/component |
| | Audit | Tree view | Nested expand/reorder | Hierarchical interaction |
| | Defer | Graph editor | Drag edges between nodes | Relationship gestures |
| | Defer | Calendar | Drag/resize events | Spatial + temporal |
| | Defer | Kanban | Drag across statuses, forbidden moves | State machine + drag/drop |
| | Audit | Shopping cart | Options → cart → coupon → checkout | Long transactional workflow |
| | Audit | Inventory | Stock changes available buttons | Data-driven capabilities |
| | S2+ | Booking | Availability by date/party/resource | Combinatorial dynamic state |
| | Audit | Messaging | Compose, draft, send, reply, attach | Multi-step + side effects |
| | Audit | Social-style | Like/unlike, follow/unfollow | Reversible toggles |
| | L1–L11 | Notification preferences | Hierarchical toggles | Complex configuration |
| | Audit | Settings with autosave | Each toggle persists | Micro-transitions |
| | L1–L11 | Import/export | CSV → map → preview → commit | Complex wizard |
| | P14 | Dynamic schema | Upload decides next fields | Runtime-generated UI |
| | S2+ | Plugin-style modules | Install adds navigation | Capability set changes |

---

## Rules while auditing

- Do not dump many families onto `/`. Add a named route per family.
- A lab page may exist to **document a miss** without you closing it in the engine.
- “Discovery must learn” in the last column is a north star. Step 1 learns **observations** (states, elements, actions, network, evidence). Step 2 learns **what they mean**.
- Prefer generalization over state explosion (repeated rows are one template, not N states).

Related: `docs/STEP1_CHECKLIST.md` (L1–L11, Phase 14), `docs/MASTER_CONTEXT.md` §28, §45, §49.
