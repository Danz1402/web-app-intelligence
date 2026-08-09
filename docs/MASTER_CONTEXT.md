# MASTER PROJECT CONTEXT — WEB APPLICATION INTELLIGENCE PLATFORM

## 1. Project Vision

I am building a platform that can autonomously discover, map, understand, monitor, test, document, explain, and eventually automate arbitrary web applications.

This is NOT simply:

* a web scraper,
* a crawler,
* a chatbot,
* a Playwright test generator,
* or an AI browser agent.

The core product is a **behavioral model / digital twin of a web application**.

The system should inspect and interact with a web application through a real browser, determine what pages/components/actions/forms/APIs/workflows/states exist, understand how they relate, preserve evidence of what it observed, and construct a machine-readable model of how the application behaves.

Everything else in the platform should eventually build on this behavioral model.

The long-term concept is:

Website / Web Application
→ Discovery Engine
→ Behavioral Evidence
→ Knowledge Graph
→ Multiple Products

Products/features built on top include:

* natural-language application assistant,
* application search,
* workflow automation,
* automatic Playwright test generation,
* regression testing,
* website/application health monitoring,
* broken workflow detection,
* UI change detection,
* API change detection,
* automatic documentation,
* automatic user manuals,
* interactive walkthroughs,
* employee onboarding,
* role/permission analysis,
* application capability discovery,
* UX analysis,
* accessibility analysis,
* dead-feature detection,
* dependency analysis,
* impact analysis,
* automatic bug reports,
* application version history/time machine,
* cross-application workflows,
* eventually autonomous agents that operate applications using known verified workflows.

The user should eventually be able to say things like:

"How do I create a customer?"

"Why can't I delete this invoice?"

"What can managers do that employees can't?"

"Is checkout currently working?"

"Which workflows changed after yesterday's deployment?"

"Generate Playwright tests for the customer area."

"Create a customer called John Smith."

"Download all unpaid invoices from July."

The system should answer or execute these requests using stored application knowledge rather than asking an LLM to rediscover the website every time.

---

## 2. Primary Architectural Principle

The most important architectural principle is:

**Discover once, structure the result, reuse the knowledge many times.**

Do NOT make an LLM the core browser-control or application-understanding engine.

Use deterministic software wherever possible.

Preferred hierarchy:

1. deterministic code
2. cache
3. database/graph queries
4. semantic/vector search
5. lightweight/local AI if needed
6. cloud LLM only when genuinely necessary

The expensive LLM should be an escalation mechanism, not something called for every page, element, click, crawl action, or user question.

The platform should become cheaper as it learns more.

---

## 3. Overall Architecture

Long-term architecture:

WEB APPLICATION
→ DISCOVERY ENGINE
→ DISCOVERY / EVIDENCE STORE
→ KNOWLEDGE GRAPH
→ QUERY / REASONING LAYER
→ PRODUCTS

Products consuming the graph:

* Assistant
* Automation
* Test Generation
* Monitoring
* Documentation
* Change Detection
* Analytics
* Training
* Application Search

All products should consume the SAME source of truth.

Do not independently rediscover the website for each feature.

---

## 4. STEP 1 — DISCOVERY ENGINE

This is the first major development milestone and the foundation of the entire platform.

The Discovery Engine must answer:

* What pages exist?
* What page templates exist?
* What UI states exist?
* What meaningful elements exist?
* Which elements are interactive?
* What happens when an element is interacted with?
* What forms exist?
* What fields exist?
* What validation rules exist?
* What dropdown/options exist?
* What modals/dialogs exist?
* What tabs/menus exist?
* What tables/lists exist?
* What APIs/network requests are triggered?
* What errors occur?
* What changes in the DOM?
* What changes in the URL?
* What browser state changes?
* What actions are available to different roles?
* What workflows can be inferred?
* Can those workflows be replayed?
* How much of the known application behavior has been explored?

The Discovery Engine should behave more like an autonomous QA/application explorer than a traditional link crawler.

---

## 5. Initial Technology Direction

Preferred stack:

* TypeScript
* Node.js
* Playwright
* PostgreSQL
* React/Next.js for the internal dashboard
* Docker

Initially use Chromium only.

Do NOT introduce multiple browser engines unless needed later.

Do NOT introduce Neo4j during Step 1 unless there is a compelling technical need.

PostgreSQL should initially store discovery observations and relationships.

Use JSONB selectively for irregular browser observations.

Keep architecture modular without prematurely turning every module into a separately deployed microservice.

---

## 6. Suggested Repository Structure

A possible structure:

```
apps/
  api/
  dashboard/

packages/
  browser/
  discovery/
  observers/
  storage/
  shared/

workers/
  explorer/

database/
  migrations/

artifacts/
  screenshots/
  traces/
```

Within discovery:

```
discovery/
  page-scanner/
  element-detector/
  state-detector/
  action-engine/
  crawler/
  network-observer/
  form-analyzer/
  deduplicator/
  workflow-detector/
  replay/
  coverage/
  safety/
```

This can evolve when implementation requirements justify it.

---

## 7. Discovery Contract

Step 1 must produce structured facts that Step 2 can consume without recrawling the application.

Core entities should include:

Application
Environment
DiscoverySession
PageTemplate
PageInstance
State
Element
Action
Transition
Form
Field
ValidationRule
NetworkRequest
ApiEndpoint
Error
Artifact
RoleProfile
CandidateWorkflow
VerificationResult

Each important entity should have a stable ID.

Every discovered fact should be attributable to a DiscoverySession.

---

## 8. Evidence and Provenance

This is mandatory.

The platform must NEVER create important application knowledge without being able to determine where that knowledge came from.

For example, if we eventually say:

Manager → CAN_DELETE → Customer

we should be able to trace that knowledge back to evidence such as:

* discovery session,
* environment,
* role,
* source state,
* page,
* element,
* action,
* resulting state,
* network request,
* screenshot,
* Playwright trace,
* timestamp.

Knowledge must be explainable.

---

## 9. Evidence Status

Distinguish different qualities of information.

Suggested statuses:

OBSERVED
VERIFIED
INFERRED
STALE
FAILED

Examples:

OBSERVED:
A "Download Invoice" button exists.

VERIFIED:
Clicking it successfully produced a download.

INFERRED:
This is probably the application's invoice-download capability.

STALE:
The workflow was previously valid but failed during a newer discovery session.

FAILED:
The system attempted to verify the behavior and it failed.

Never treat inferred information exactly like verified information.

---

## 10. Temporal Information

Important discoveries should contain information such as:

firstSeenAt
lastSeenAt
discoverySessionId
environment
applicationVersion/buildId when available

The platform should eventually understand:

NEW
UNCHANGED
CHANGED
REMOVED
STALE

This enables monitoring and application history.

---

## 11. Browser Abstraction

Do not allow every subsystem to directly depend heavily on raw Playwright APIs.

Create a browser abstraction such as BrowserSession.

Conceptually:

```
browser.open(url)
browser.click(element)
browser.type(element, value)
browser.select(element, value)
browser.hover(element)
browser.scroll(...)
browser.goBack()
browser.snapshot()
browser.close()
```

The Discovery Engine uses the browser abstraction.

The browser abstraction uses Playwright.

This gives us future flexibility.

---

## 12. Page / State Snapshot

Before and after meaningful interactions, capture application state.

A state snapshot may include:

* URL
* pathname
* query parameters
* page title
* meaningful DOM representation
* visible interactive elements
* ARIA/accessibility representation
* dialogs/modals
* forms
* important visible text
* screenshot
* network activity
* browser errors
* relevant storage metadata
* state fingerprint/hash

Do NOT make complete raw DOM HTML the primary application representation.

Raw DOM may be retained as supporting evidence if useful.

---

## 13. Element Discovery

Prioritize meaningful and interactive elements.

Examples:

BUTTON
LINK
INPUT
TEXTAREA
SELECT
CHECKBOX
RADIO
TAB
MENU_ITEM
DIALOG
FORM
TABLE
TABLE_ROW
DATE_PICKER
TOGGLE
FILE_UPLOAD
PAGINATION
ACCORDION

Detect using:

* semantic HTML,
* ARIA roles,
* accessible names,
* labels,
* test IDs,
* IDs,
* event/interaction heuristics,
* visibility/enabled state.

Do not treat every DIV or SPAN as a meaningful application element.

---

## 14. Element Locator Strategy

Never rely on one brittle selector.

Generate ranked locator candidates.

Prefer:

1. role + accessible name
2. data-testid / explicit test identifier
3. stable IDs
4. labels
5. stable attributes
6. meaningful CSS
7. XPath or DOM structure only as fallback

Example concept:

```
locatorCandidates:
[
  {
    strategy: "role",
    role: "button",
    name: "Create Customer",
    confidence: 0.99
  },
  {
    strategy: "testId",
    value: "create-customer",
    confidence: 0.98
  }
]
```

These locators will eventually be reused for Playwright test generation and automation.

---

## 15. Element Identity / Fingerprinting

The system must determine whether an element seen during two different observations represents the same logical element.

Fingerprint candidates may include:

* role,
* accessible name,
* test ID,
* tag,
* labels,
* DOM ancestry/context,
* nearby text,
* component structure,
* page template,
* route pattern.

Do NOT use absolute position alone.

---

## 16. State Transitions

A fundamental representation is:

STATE A
* ACTION
→ STATE B

Example:

CustomerList
* CLICK(Create Customer)
→ CreateCustomerDialog

Record:

* source state,
* action,
* target state,
* DOM differences,
* URL differences,
* newly visible elements,
* removed elements,
* network activity,
* errors,
* screenshots/evidence.

Transition categories may include:

NAVIGATION
DIALOG_OPEN
DIALOG_CLOSE
CONTENT_CHANGE
FORM_SUBMIT
DATA_MUTATION
TAB_CHANGE
EXPANSION
FILTER_CHANGE
NEW_WINDOW
DOWNLOAD
NO_OBSERVED_EFFECT

---

## 17. State Detection

After an action, compare multiple signals.

Do not assume URL change is required.

Signals:

* URL
* history
* DOM structure
* meaningful visible elements
* ARIA structure
* modal/dialog state
* text changes
* network activity
* storage changes
* browser errors
* visual differences where useful

Modern SPAs frequently change application state without page reloads.

---

## 18. State Restoration

Exploration requires being able to return to known states.

Possible restoration methods:

* close modal,
* browser back,
* known URL,
* reload,
* restore browser/storage state,
* replay path from a known root state.

This should be a first-class feature.

The explorer cannot reliably branch through the application if it cannot restore state.

---

## 19. Exploration Queue

Create an autonomous exploration queue.

Example task:

```
{
  actionId,
  sourceState,
  priority,
  depth,
  risk,
  attempts,
  status
}
```

Statuses may include:

PENDING
RUNNING
COMPLETE
FAILED
BLOCKED
SKIPPED

Crawler lifecycle:

Open application
→ snapshot
→ discover elements
→ generate possible actions
→ enqueue
→ choose action
→ restore source state
→ execute action
→ observe result
→ capture new state
→ record transition
→ discover new actions
→ repeat

---

## 20. Crawl Limits

Prevent runaway exploration.

Support limits such as:

maxDepth
maxStates
maxActions
maxRuntime
maxInstancesPerTemplate
allowedDomains
blockedURLs
blockedActions

Never assume a website has a finite easily enumerable interaction space.

---

## 21. Exploration Priority

Eventually prioritize actions based on potential information gain.

Illustrative scoring:

unexplored element: high priority
new page template: very high priority
new API relationship: high priority
known repeated component: low priority
already explored behavior: very low priority
destructive action: blocked/extremely low
unknown high-risk action: blocked

Long-term concept:

Choose the next interaction that is expected to teach the system the most.

---

## 22. Network/API Observation

Observe browser network activity:

* fetch,
* XHR,
* navigation requests,
* GraphQL,
* WebSocket metadata later,
* failed requests,
* response status.

Store:

method
normalized endpoint
status
resource type
timing
initiating action
safe headers
safe request-body structure
safe response metadata

Most importantly:

Associate network effects with the UI action that caused them.

Example:

CLICK Save Customer
→ POST /api/customers
→ GET /api/customers/{id}

---

## 23. API Normalization

Generalize:

/api/customers/123
/api/customers/456

into:

/api/customers/{id}

Handle obvious:

numeric IDs
UUIDs
dynamic route parameters
query parameters

Do not create thousands of fake unique API endpoints.

---

## 24. Forms

Forms should be treated as first-class objects.

Detect logical forms even if the application does not use an HTML `<form>` element.

Possible signals:

* shared container,
* common dialog,
* labels,
* related inputs,
* submit button,
* semantic grouping.

Fields should store:

* label,
* type,
* required,
* placeholder,
* default value structure,
* options,
* known constraints,
* related validation rules.

---

## 25. Form Exploration

Use controlled synthetic test data.

Examples:

string
number
email
date
boolean
enum

Use obvious test values.

Do not require an LLM to create trivial synthetic data.

Never randomly populate sensitive or dangerous fields.

---

## 26. Validation Discovery

Safely test common validation behavior such as:

* missing required values,
* malformed email,
* known min/max length,
* known numeric boundaries,
* valid baseline input.

Observe:

* inline errors,
* disabled submit button,
* HTML constraints,
* API validation responses,
* toasts,
* state changes.

Store discovered validation rules.

These rules later generate automated tests.

---

## 27. Dynamic UI Support

Account for modern React/Next/Vue/Angular-style applications.

Monitor:

* DOM mutations,
* dynamically mounted dialogs,
* client-side routing,
* tabs,
* lazy components,
* menu state,
* dynamic lists.

Use MutationObserver or equivalent instrumentation where appropriate.

Support SPA URL/history changes.

---

## 28. Future Edge Cases

Architecture should eventually allow:

* iframes,
* Shadow DOM,
* WebSockets,
* canvas-heavy interfaces,
* file uploads,
* downloads,
* infinite scrolling,
* complex editors.

Do not block the MVP trying to perfectly solve all of these.

---

## 29. Deduplication and State Explosion

This is one of the hardest problems in the platform.

Never treat every URL/entity instance as unique behavior.

Example:

/customers/101
/customers/102
/customers/103

should likely become:

PageTemplate:
CUSTOMER_DETAIL

RouteTemplate:
/customers/{customerId}

with several observed instances.

---

## 30. Page Template Detection

Compare pages using structural information:

* normalized route,
* DOM shape,
* ARIA roles,
* element fingerprints,
* heading patterns,
* forms,
* available actions.

Repeated instances should map to a page template.

---

## 31. Component Generalization

Do not explore every row in a 50,000-row table.

Recognize repeated structures.

Example:

CustomerRow\<T\>

with possible actions:

VIEW(customerId)
EDIT(customerId)
DELETE(customerId)

Explore representative examples rather than every instance.

---

## 32. Behavioral Generalization

Learn general actions.

Instead of storing:

Edit Customer 100
Edit Customer 101
Edit Customer 102

learn:

EDIT_CUSTOMER(customerId)

This is important for keeping the application's behavioral model compact and reusable.

---

## 33. Authentication

Support authenticated application discovery.

Initial approach:

* allow user/manual login,
* save browser authenticated state securely,
* reuse it for discovery.

Later support:

* programmatic login,
* multiple accounts,
* multiple roles,
* SSO scenarios where feasible.

Authentication data is sensitive and must never be committed to Git.

---

## 34. Role-Based Discovery

Allow a business to define different RoleProfiles:

Admin
Manager
Employee
etc.

Run discovery under separate profiles.

Later Step 2 can derive permission differences.

Example:

Employee:
View Customer
Edit Customer

Manager:
View Customer
Edit Customer
Delete Customer

Admin:
View Customer
Edit Customer
Delete Customer
Change Permissions

---

## 35. Safety Engine

Safety is mandatory.

Actions should receive risk classifications such as:

READ_ONLY
LOW_RISK
MUTATING
EXTERNAL_SIDE_EFFECT
DESTRUCTIVE
FINANCIAL
UNKNOWN

Examples:

Open page → READ_ONLY

Filter → READ_ONLY

Create test customer → MUTATING

Send email → EXTERNAL_SIDE_EFFECT

Delete account → DESTRUCTIVE

Submit payment → FINANCIAL

Production exploration should default to conservative behavior.

Sandbox/staging environments may permit more aggressive exploration.

Never automatically execute dangerous actions simply because an element is clickable.

---

## 36. Data Redaction and Privacy

The crawler may observe sensitive data.

Introduce a redaction/sensitivity layer.

Examples:

passwords
tokens
API keys
session cookies
credit-card information
government IDs
secret values

Do not persist sensitive values when they are not required.

Prefer storing schema/structure rather than secret values.

Example:

password = [REDACTED]

---

## 37. Console / Runtime Errors

Capture:

* console.error,
* JavaScript exceptions,
* unhandled promise rejections,
* failed resources,
* request failures.

Associate errors with:

state,
page,
action,
discovery session.

This later powers application health monitoring and bug reports.

---

## 38. Workflow Discovery

Once the engine has sufficient transitions, identify candidate workflows.

Example:

Customer List
→ click Create
→ Create Customer Form
→ fill form
→ Submit
→ Customer Detail

Candidate workflow:
CREATE_CUSTOMER

Workflows should contain:

* starting state,
* ending state,
* ordered actions,
* required fields,
* expected transitions,
* expected network effects,
* confidence,
* evidence.

Workflow naming can initially use deterministic evidence such as headings, button names, API names, and resulting states.

Use AI only where semantics are genuinely ambiguous.

---

## 39. Workflow Replay

A discovered workflow is more valuable if it can be replayed.

Replay process:

restore start state
→ execute stored actions
→ fill controlled inputs
→ verify intermediate expectations
→ verify target state/outcome

Store:

verification status
verifiedAt
verification count
last failure
evidence

This is fundamental to trust.

---

## 40. Evidence Bundles

Important workflows should be able to retain evidence such as:

* screenshots,
* DOM/ARIA snapshots,
* Playwright traces,
* network activity,
* actions,
* resulting states,
* errors.

A user should eventually be able to ask:

"How do you know?"

and inspect the evidence.

---

## 41. Discovery Sessions

Every crawl should be versioned.

Example:

Application:
Acme CRM

Environment:
staging

Discovery Session:
disc_2026_08_09_001

Role:
Manager

Browser:
Chromium

Application Build:
v4.17.2 if detectable

This lets us compare scans over time.

---

## 42. Change Detection Foundation

Step 1 does not need the final monitoring product, but its data must allow:

Session A
vs
Session B

to detect things like:

* page added,
* page removed,
* element added,
* element removed,
* workflow changed,
* API changed,
* validation changed,
* role accessibility changed,
* workflow verification now failing.

Monitoring later becomes largely a diff of discovery knowledge plus targeted replay.

---

## 43. Coverage

Avoid pretending we can know that an arbitrary application is 100% explored.

Track defensible sub-metrics:

* discovered page templates,
* explored actions,
* unexplored actions,
* blocked actions,
* failed actions,
* forms discovered,
* validations explored,
* workflow candidates,
* workflows verified,
* role coverage.

Eventually create an estimated Behavioral Coverage metric.

---

## 44. Internal Discovery Dashboard

Build an internal dashboard for inspecting the crawler.

Show:

* application,
* discovery sessions,
* pages/templates,
* states,
* elements,
* transitions,
* forms,
* API activity,
* errors,
* workflows,
* verified workflows,
* unexplored actions,
* blocked actions,
* screenshots,
* evidence.

Allow opening a state and inspecting:

* screenshot,
* URL,
* elements,
* outgoing transitions,
* incoming transitions,
* associated API activity,
* errors.

This dashboard is primarily a development/debugging tool initially.

---

## 45. Synthetic Benchmark Application

Build a controlled test web application called something like:

Discovery Lab.

It should intentionally contain examples of:

* normal links,
* SPA navigation,
* modals,
* tabs,
* accordions,
* forms,
* validation,
* tables,
* pagination,
* filters,
* dropdown dependencies,
* dynamic rendering,
* nested dialogs,
* repeated routes,
* repeated rows,
* downloads,
* uploads,
* role-based UI,
* API failures,
* client-side errors,
* infinite scrolling later,
* iframes later.

Because we control the application, we know its ground truth.

Example:

Known:
32 meaningful states
71 actions
14 forms
19 validation rules
12 APIs
8 workflows

We can compare Discovery Engine output against known truth.

This should become our regression benchmark.

---

## 46. Step 1 Sequential Development Roadmap

Build Step 1 approximately in this order.

PHASE 0:
Discovery contract/schema.

PHASE 1:
Repository, TypeScript, Node, PostgreSQL, Docker foundation.

PHASE 2:
BrowserSession abstraction and basic Playwright control.

PHASE 3:
Page/state snapshot engine.

PHASE 4:
Interactive element discovery and locator generation.

PHASE 5:
State comparison and transition engine.

PHASE 6:
Autonomous exploration queue and state restoration.

PHASE 7:
Network/API observation and action correlation.

PHASE 8:
Forms, fields, options, and validation discovery.

PHASE 9:
Deduplication, route templates, page templates, repeated component detection, behavioral generalization.

PHASE 10:
Authentication, role profiles, safety policy, secret handling.

PHASE 11:
Candidate workflow discovery.

PHASE 12:
Workflow replay and verification.

PHASE 13:
Coverage system and discovery dashboard.

PHASE 14:
Hardening against increasingly complex applications.

---

## 47. Step 1 Milestone Gates

Do not move forward because a date has arrived.

Use capability gates.

Gate 1:
Can reliably open and snapshot applications.

Gate 2:
Can correctly identify meaningful interactive elements.

Gate 3:
Can perform safe actions and detect resulting state changes.

Gate 4:
Can autonomously explore multiple paths.

Gate 5:
Can correlate interactions with network/API effects.

Gate 6:
Can understand common forms and validations.

Gate 7:
Can generalize repeated pages/components and avoid state explosion.

Gate 8:
Can safely explore authenticated applications and different roles.

Gate 9:
Can assemble useful workflow candidates.

Gate 10:
Can replay/verify discovered workflows.

Gate 11:
Can clearly report what was explored, failed, blocked, and unknown.

Only then consider Step 1 MVP ready for Step 2.

---

## 48. Approximate Step 1 Timeline

Assume roughly one full-time developer.

Week 1:
Foundation + browser controller.

Week 2:
Page/state snapshots.

Week 3:
Element discovery.

Week 4:
Locator strategy + interaction engine.

Week 5:
State transition engine.

Week 6:
Autonomous crawl queue.

Week 7:
Network/API mapping.

Week 8:
Forms and validation.

Week 9:
Route/page generalization.

Week 10:
Component/behavior generalization.

Week 11:
Authentication, roles, safety.

Week 12:
Workflow discovery.

Week 13:
Replay and verification.

Week 14:
Coverage/dashboard.

Weeks 15–16:
Integration testing and bug fixing.

Approximately 16 weeks:
Strong Step 1 MVP.

Weeks 17–24 may include:

* harder SPA edge cases,
* iframes,
* uploads/downloads,
* infinite scrolling,
* improved dynamic components,
* parallel exploration,
* crawl recovery,
* performance,
* security hardening,
* large-application testing.

---

## 49. What NOT to Build During Early Step 1

Do NOT prematurely build:

* full natural-language assistant,
* full autonomous AI agent,
* Neo4j migration,
* multiple browser engines,
* complex LLM reasoning infrastructure,
* cross-application automation,
* perfect Shadow DOM support,
* CAPTCHA bypass,
* automatic penetration testing,
* AI-generated documentation,
* huge distributed crawler architecture,
* mobile app.

The initial objective is:

ACCURATELY DISCOVER APPLICATION BEHAVIOR.

---

## 50. STEP 2 — KNOWLEDGE GRAPH

Once Step 1 reaches its milestone gates, Step 2 transforms observations into machine-readable application knowledge.

Step 1 says:

"We observed these things."

Step 2 says:

"This is what these things mean and how they relate."

The Knowledge Graph should contain concepts such as:

Application
Page
Page Template
State
Component
Element
Action
Workflow
Capability
Business Entity
Form
Field
Validation
API
Role
Permission
Error
Feature

Relationships may include:

PAGE CONTAINS ELEMENT

ELEMENT SUPPORTS ACTION

ACTION TRANSITIONS_TO STATE

ACTION CALLS API

FORM CONTAINS FIELD

FIELD HAS_VALIDATION RULE

ROLE CAN_EXECUTE ACTION

WORKFLOW USES ACTION

WORKFLOW CALLS API

WORKFLOW CREATES ENTITY

CAPABILITY OPERATES_ON ENTITY

---

## 51. Step 2 Semantic Layer

Step 1 may observe:

/customers/123

button: "Delete"

DELETE /api/customers/123

Step 2 should recognize concepts such as:

Business Entity:
CUSTOMER

Capability:
DELETE_CUSTOMER

API:
DELETE /api/customers/{id}

Relationship:
DELETE_CUSTOMER OPERATES_ON CUSTOMER

A major objective is converting technical observations into business/application concepts.

---

## 52. Business Entities

Examples:

CUSTOMER
ORDER
INVOICE
PRODUCT
EMPLOYEE
REPORT
PROJECT

Step 2 should connect relevant:

pages
forms
APIs
workflows
actions
permissions

to these entities.

This turns the system from a website map into a model of the business domain implemented by the software.

---

## 53. Capabilities

Identify what the application can do.

Example:

Customer capabilities:

create_customer
view_customer
edit_customer
delete_customer
search_customers
filter_customers
export_customers

Invoice capabilities:

create_invoice
view_invoice
download_invoice
email_invoice
void_invoice
refund_invoice

Capabilities will become central to search, assistant behavior, test generation, and automation.

---

## 54. Knowledge Levels

Preserve multiple levels of abstraction.

Level 0:
Raw observation.

Level 1:
Technical relationship.

Level 2:
Behavior.

Level 3:
Capability.

Level 4:
Business meaning.

Level 5:
Workflow/business process.

Do not throw away the lower-level evidence when creating higher-level semantics.

---

## 55. Confidence and Evidence in the Graph

Every inferred semantic relationship should carry:

confidence
evidence references
evidence status
timestamps/version information

Example:

Manager
CAN_DELETE
Customer

confidence: 1.0
status: VERIFIED

Evidence points back to the Discovery Engine.

---

## 56. Step 2 Internal Stages

Step 2 should approximately include:

2.1 Graph construction
Convert discovery records into graph-compatible nodes and edges.

2.2 Normalization
Merge equivalent application concepts and repeated instances.

2.3 Semantic enrichment
Identify business entities, capabilities, workflow meaning, aliases.

2.4 Verification/confidence
Attach evidence and confidence.

2.5 Query layer
Expose useful graph APIs.

---

## 57. Knowledge Query API

Eventually support APIs conceptually similar to:

findCapability("download invoice")

getWorkflow("create customer")

getRolePermissions("manager")

getDependencies("/api/orders")

getAffectedWorkflows(elementId)

getEvidence(relationshipId)

findPath(currentState, desiredState)

findCapabilitiesForEntity("Customer")

findWorkflowsUsingApi("/api/customers")

These query APIs become the foundation for later platform features.

---

## 58. Semantic Search

Add embeddings/vector search over meaningful graph concepts.

This allows language variations such as:

"get my receipt"

to locate:

download_invoice
invoice_history
payment_receipt

Then use graph traversal to determine the actual behavior.

Semantic search should augment graph queries, not replace them.

---

## 59. AI Usage Philosophy

Most user requests should ideally NOT require a paid LLM.

Possible resolution ladder:

1. exact cache,
2. semantic cache,
3. deterministic graph query,
4. vector/semantic retrieval,
5. deterministic workflow composition,
6. small/local model,
7. cloud LLM only for difficult reasoning.

Never pass the entire application graph to an LLM.

Retrieve only relevant subgraphs.

---

## 60. STEP 3 — APPLICATION SEARCH / DOCUMENTATION / INITIAL ASSISTANT

Once the Knowledge Graph exists, provide useful products with relatively low risk.

Examples:

"Where are invoices?"

"How do I create a customer?"

"What does this button do?"

"What role is needed to approve an invoice?"

Generate answers from stored graph data.

Also generate:

* user manuals,
* workflow documentation,
* feature catalogs,
* application search.

Documentation should link back to verified evidence.

---

## 61. STEP 4 — PLAYWRIGHT TEST GENERATION

Use discovered verified workflows to generate automated tests.

Discovery already provides:

* starting state,
* locators,
* actions,
* fields,
* validations,
* APIs,
* expected state transitions,
* outcomes.

Generate Playwright tests for:

* happy paths,
* validation failures,
* common edge cases,
* permissions,
* workflows.

Example:

Create Customer workflow

can produce:

valid creation
missing required name
invalid email
permission test
API failure behavior

Tests should reference graph/workflow IDs so failures can update application health.

---

## 62. STEP 5 — MONITORING / CHANGE DETECTION

Continuously rediscover or replay selected application behaviors.

Monitoring should detect more than HTTP uptime.

Examples:

* page inaccessible,
* button missing,
* workflow broken,
* API failing,
* validation changed,
* permissions changed,
* UI flow changed,
* JavaScript errors introduced.

Concept:

Traditional monitoring:
"Does /checkout return 200?"

Our monitoring:
"Can a user successfully complete checkout?"

Discovery session diffs provide:

* new capabilities,
* removed capabilities,
* changed workflows,
* changed APIs,
* changed UI,
* changed permissions.

---

## 63. STEP 6 — AUTOMATION / DIGITAL ASSISTANT

Once workflows are reliable and verified, allow users to execute application capabilities.

Instead of:

"How do I create a customer?"

allow:

"Create a customer named John."

The system retrieves:

CREATE_CUSTOMER

and executes the stored verified workflow.

The agent should rely on graph knowledge and known workflows rather than blindly inspecting screenshots every time.

---

## 64. Workflow Composition

Eventually workflows should have typed inputs/outputs.

Example:

CREATE_CUSTOMER

inputs:
name
email

output:
customerId

CREATE_ORDER

requires:
customerId

Therefore:

CREATE_CUSTOMER
→ customerId
→ CREATE_ORDER

This allows multi-step natural-language automation without requiring random browser exploration.

---

## 65. Action Risk During Automation

Execution policies should differ by risk.

Examples:

Navigate:
automatic.

Search:
automatic.

Read:
automatic.

Fill harmless field:
usually automatic.

Create record:
may require policy/confirmation.

Send message:
confirmation.

Delete data:
strict confirmation.

Change permissions:
strict confirmation.

Financial transaction:
strict confirmation.

Automation must be auditable.

---

## 66. Future Cross-Application Intelligence

Eventually multiple applications can be mapped into one business knowledge layer.

Example:

CRM
Accounting
Support

User asks:

"Show customers with unpaid invoices and open critical support tickets."

The platform can connect concepts across applications.

Long-term evolution:

Website Intelligence
→ Application Intelligence
→ Business System Intelligence.

---

## 67. Product Philosophy

The long-term user experience should shift from:

Human must learn software
→ Human navigates software
→ Human performs workflow

to:

Human states desired outcome
→ Platform understands the software
→ Platform explains or performs the workflow

The user should increasingly think in terms of **business intent**, not where buttons are located.

---

## 68. Commercial Differentiator

The defensible part of this product is NOT simple scraping.

The value is:

* behavioral discovery,
* application modeling,
* evidence,
* verification,
* workflow replay,
* change detection,
* low-AI execution,
* safety,
* application understanding.

The strongest product proposition is roughly:

"Create and continuously maintain a machine-readable behavioral model of your web applications so humans and AI systems can understand, test, monitor, document, and safely operate them."

---

## 69. Core Engineering Principles

When making architectural decisions, prioritize:

1. Reliability over flashy AI.
2. Evidence over guesses.
3. Deterministic behavior over LLM calls.
4. Stable abstractions over DOM-specific hacks.
5. Reusability over feature-specific crawling.
6. Safe exploration over maximum exploration.
7. Generalized behavioral patterns over millions of raw observations.
8. Versioned discovery over overwriting historical truth.
9. Verified workflows over inferred workflows.
10. Clear module boundaries.
11. Testability.
12. Observability.
13. Backward-compatible discovery schemas where practical.

---

## 70. Cursor's Role

When helping me develop this project:

* Always keep this entire architecture and long-term roadmap in mind.
* Do not optimize one small task in a way that harms later Knowledge Graph, testing, monitoring, or automation requirements.
* Prefer incremental implementation.
* Avoid unnecessary abstraction unless it serves a known future need.
* Explain important architectural tradeoffs before introducing major dependencies.
* Keep modules testable.
* Use strong TypeScript typing.
* Add tests for important behavior.
* Keep discovery entities versionable.
* Preserve evidence/provenance.
* Never silently discard information that later phases may need.
* Never introduce an LLM call where deterministic logic can reasonably solve the problem.
* Never execute destructive browser actions without going through the safety policy.
* Treat authentication state and discovered secrets as sensitive.
* Do not prematurely implement future roadmap stages unless specifically requested.

When I ask for implementation help, determine which roadmap phase we are currently working on and keep the implementation scoped to that phase while preserving the architecture necessary for future phases.

If I request something that conflicts with these architectural principles, point out the conflict and explain the consequences before changing the design.

---

## 71. Current Development Position

We are currently beginning:

STEP 1 — DISCOVERY ENGINE.

We have not yet started Step 2.

The immediate order of work is:

1. finalize Discovery Contract,
2. establish repository/project structure,
3. establish PostgreSQL schema,
4. implement BrowserSession abstraction,
5. implement first DiscoverySession,
6. open a URL,
7. capture first Page/State snapshot,
8. store that snapshot,
9. progressively implement the rest of the Step 1 roadmap.

Do not jump ahead to the Knowledge Graph, assistant, generated tests, or automation until their prerequisites are sufficiently mature.

The first meaningful target is:

Given a URL, start a DiscoverySession in Chromium, open the application, capture and persist an evidence-backed structured representation of its initial state.

From there, development proceeds sequentially through the Discovery Engine roadmap.
