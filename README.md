# Web App Intelligence

Platform for discovering, modeling, and reusing the **behavioral model** of web applications — evidence-backed discovery first, products later.

## Docs

- **[Step 1 checklist](docs/STEP1_CHECKLIST.md)** — exact sequential tasks and gates (work top to bottom)
- **[Master context](docs/MASTER_CONTEXT.md)** — full architecture and roadmap
- **[How to prompt](docs/HOW_TO_PROMPT.md)** — Cursor usage without pasting the master context

Day-to-day AI scope lives in `.cursor/rules/` (you implement unless you explicitly ask for code).

## Current focus

**Step 1 — Discovery Engine** — follow `docs/STEP1_CHECKLIST.md`.

Near-term target: given a URL, start a `DiscoverySession` in Chromium, open the app, capture and persist an evidence-backed initial state snapshot.

## Stack

TypeScript · Node.js · Playwright (Chromium) · PostgreSQL · React/Next.js · Docker

## Repo layout (planned)

```
apps/           # api, dashboard
packages/       # browser, discovery, observers, storage, shared
workers/        # explorer
database/       # migrations
artifacts/      # screenshots, traces (local; not committed secrets)
docs/           # architecture and contracts
```

## Working in Cursor

Use focused prompts (phase + concrete task). Do not paste the master context into every chat — it is already in `docs/MASTER_CONTEXT.md` and the always-on project rule.
