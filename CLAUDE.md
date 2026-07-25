# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

History GO is a location-based knowledge game where the city (Oslo) is the game board. Users check in at real-world places (GPS or QR), take short quizzes, and collect badges, diplomas and cards while a personal "knowledge diary" tracks progression (Amatør → Student → Doktor → Professor).

The current main client is a **framework-free browser app in gradual TypeScript migration**. Historically it had no bundler and no build step — HTML loaded classic `<script src="...js">` tags directly, and TypeScript was only a static type-checker over JavaScript (`allowJs` + `checkJs`). The project now uses **esbuild as a strangler bundler** so browser files can become real TypeScript (`.ts`) modules one at a time while not-yet-migrated files keep loading as classic scripts. The Node-only tracks (`scripts/`, `tools/`) are TypeScript. See `docs/typescript-migration-plan.md`.

**Canonical target architecture:** read `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md` before making technology, backend, API, database or language decisions. The target split is:

- client/browser/app logic → **TypeScript**;
- production backend/server/API → **Python + FastAPI**;
- mutable production state → **PostgreSQL**;
- Supabase → managed PostgreSQL/Auth/Storage and explicitly bounded platform services;
- canonical editorial game content → existing **JSON + manifest** pipelines;
- Node repo tooling → **TypeScript**.

Do not interpret the TypeScript migration as a decision to build the production backend in Node/TypeScript. `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md` has higher priority than older implementation-specific backend or migration notes when they conflict on target technology.

**Interop contract (non-negotiable during the current browser migration):** any migrated module that previously exposed a global (`window.X`) MUST still publish that same global as a load-time side effect, so classic (non-migrated) consumers keep working unchanged. esbuild builds these as `iife` bundles. Migrated entrypoints are listed in `build/build-web.mjs` and output to `dist/web/`; the owning HTML page loads `dist/web/<name>.js`.

**`dist/web/` is committed** (unlike the rest of `dist/`, which stays gitignored) so the app works when the repo is served as-is — no build step required before serving. After editing any migrated `js/**/*.ts`, run `npm run build:web` and commit the rebuilt bundles. `npm run build:web:check` rebuilds and fails if `dist/web` is out of sync with source.

Most documentation is in Norwegian, and most code identifiers, data, and content are Norwegian. Match that language when editing docs and content.

## Repository layout

Multiple distinct apps live in this single repo, each its own HTML entry point with its own boot assumptions — **do not merge them casually**:

- `index.html` + `js/app.js` — the main History GO app (map, nearby panel, place cards, quiz flow, miniProfile).
- `profile.html` + `js/profile.js` — canonical full profile page.
- `Civication.html` + `js/Civication/**` — a separate career/economy/identity simulation game ("Civication"). It is currently kept out of the active browser TypeScript strangler scope; this is a migration-scope decision, not a permanent exemption from the target client architecture.
- `AHA/index.html` + `js/aha*.js` + `AHA/*.js` — "AHA" insight/echo layer; imports evidence exported by History GO and has its own current runtime/deployment history. Do not fold it into the shared production backend without a separate documented integration decision.
- Other pages: `knowledge.html`, `emner.html`, `notater.html`, `merker/merker.html`.
- Per-domain knowledge pages live under `knowledge/` (e.g. `knowledge/knowledge_historie.html`); root files like `knowledge_by.html` are thin redirect shells into that folder.

Key directories: `js/` (browser/client code), `data/` (manifest-driven JSON content, the source of truth for editorial content), `tools/` and `scripts/` (Node-only CLI utilities), `tests/`, `css/`, `schemas/`, `reports/`, `README/`, and `docs/`.

The target backend will live in a dedicated `backend/` code surface when implementation begins. Do not create parallel ad-hoc backend logic in browser or Node tooling just because that code already exists in the repo.

## Documentation is normative — read before editing

This project treats its docs as the contract. The golden rule from `README/TEAM_WORKFLOW.md` is: **"IKKE GJET, SLÅ OPP"** (don't guess, look it up).

Read in this order when relevant:

1. `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md` — **target technology, language, client/server/data ownership and migration direction. Binding for new architecture.**
2. `README/SYSTEM_REGISTRY.md` — **where the current runtime lives and who owns what. Binding for existing implementation.**
3. `README/SYSTEM_MAP.md` — **what happens when the user does X; current module chain. Normative for runtime flow.**
4. `docs/TYPESCRIPT_FIRST_POLICY.md` — client/Node TypeScript policy and TypeScript CI model.
5. `README/README_DEV.md` — operational dev notes, debugging, validation.
6. `docs/APP_STRUCTURE_INDEX.md` — index app shell / boot / router model.

If a structural change doesn't fit the registry/map, update those docs. If the target client/server/database ownership changes, update the canonical technical architecture first. Update docs when a contract changes (a storage key, event, public API, entry point, module responsibility, server boundary, auth model or data source of truth).

## Architecture (the current runtime big picture)

History GO is layered with strict ownership. The defining principle: **UI never owns truth; progression is always interpreted from evidence, never written directly.**

The core data/learning flow on a correct quiz answer:

```
QuizEngine → HGInsights → knowledge/trivia universes → updateProfile event → AHA export
```

The interpretation chain for knowledge/progression:

```
Merker (top-level domains) → Fagkart (structure) → Emner (curriculum) →
Evidens (hg_learning_log_v1, append-only) → Courses (HGCourses, computes level/diploma) → UI (display only)
```

Layers (`README/SYSTEM_MAP.md` is the full current map):

- **State** (`js/state/`) — persistence to localStorage, open/test mode. No DOM.
- **Core** (`js/core/`) — constants, categories, geo/distance, viewport/layers/bottom-sheet. No DOM, no side effects.
- **Data/Knowledge/Insight** — `js/dataHub.js` is the data hub (manifest-driven loading, caching, enrichment); `js/knowledge.js`, `js/trivia.js`, `js/hgInsights.js`, `js/DomainRegistry.js`, etc.
- **Geo/Map** — `js/map.js` (`HGMap`, MapLibre), `js/routes.js`, `js/navRoutes.js`.
- **Game/Progression** — `js/quizzes.js` (`QuizEngine`), `js/hg_unlocks.js`, `js/quiz-audit.js`.
- **UI** (`js/ui/`) — DOM and interaction only.
- **Observations** (`js/observations.js`), **Stories** (`js/stories/`), **Civication** (`js/Civication/`).
- **Boot** — `js/boot.js` / `js/boot-fast.js`. **App shell** — `js/app.js`, `js/router/AppRouter.js`, `js/views/MapView.js`.

### Target client/server boundary

As the production backend is introduced:

```text
TypeScript UI/client
  ↓
central typed API/service client
  ↓
Python/FastAPI
  ↓
Python domain/service layer
  ↓
repository/database boundary
  ↓
PostgreSQL
```

The client may keep local/offline state, but security-critical and multi-user production writes become server-authoritative. Supabase may provide Auth/PostgreSQL/Storage, but sensitive business rules do not belong in scattered UI-to-database calls.

### Non-negotiable current runtime rules (from SYSTEM_REGISTRY)

1. Core files must never touch the DOM.
2. UI files must never fetch content data directly (go through DataHub).
3. No `DOMContentLoaded` outside `js/app.js`. All system start goes through `boot()`.
4. No duplicate function names across files.
5. `safeRun()` is the only allowed init wrapper; a failing UI module must not stop boot.
6. **No normalization / no guessing.** Domain id = filename suffix. If an id doesn't match → **FAIL FAST** (log + stop), never fall back to another category. Conflicts (e.g. `popkultur` vs `populaerkultur`) are resolved only by an explicit alias in `js/DomainRegistry.js`.

Canonical domains: `by, historie, kunst, litteratur, musikk, naeringsliv, natur, politikk, psykologi, sport, subkultur, vitenskap`.

Allowed legacy globals (do not introduce others without a decision): `window.PLACES, PEOPLE, BADGES, RELATIONS, MAP, HGMap, HGPos, OPEN_MODE, API`.

The target direction is fewer globals and more explicit TypeScript module boundaries. The allowed-global list is a compatibility contract, not permission to expand global architecture.

### Index app boot model

`index.html` uses a split boot. `bootCritical()` does only what's needed for a usable map fast (core/runtime, open/test mode, map init, light places index, `window.PLACES`, initial shell). `bootBackground()` loads everything else defensively (people, relations, Wonderkammer, tags, nature, Lesespor, stories, events, brands, badges) — one failing background module must not break the shell. Index routes are `#/map`, `#/place/:id`, `#/quiz/:id` via `AppRouter`; use `window.HGAppRouter?.toMap/toPlace/toQuiz` rather than building hash strings manually. `#/profile` intentionally navigates to `profile.html`.

## Data: source of truth vs. generated

`data/` JSON is the source of truth for canonical editorial content, loaded via manifests (e.g. `data/places/manifest.json`, `data/people/manifest.json`, `data/quiz/manifest.json`, `data/fag/fag_manifest.json`). Active file versions are switched by editing the manifest, **not** by renaming large content files.

Introducing PostgreSQL does **not** automatically move these datasets into the database. PostgreSQL is the target source of truth for mutable production/user/server state. Editorial game content remains JSON + manifests unless a separate product decision says otherwise.

**`data/places/places_index.json` is generated build output — never edit it by hand.** When changing places (coordinates, radius, name, images, light card fields):

1. Edit the correct source file under `data/places/...`
2. `npm run places:index:build`
3. `npm run places:index:check`
4. Only merge if the sync check is green. If the index is out of sync, regenerate it — never hand-patch.

`structure_*.json` is fully removed from runtime (deprecated/historical). Quizzes load only if present in `data/quiz/manifest.json`; if you change place/person ids, run the quiz audit afterward.

## Commands

Requires Node (repo uses v22 for current client/tooling). `devDependencies` include TypeScript, `@types/node`, esbuild, jsdom, Playwright and other tooling. `dist/web/` bundles are committed, so serving the current repo works without a build step; rebuild and commit them after editing migrated `js/**/*.ts`.

Browser bundle build:

```bash
npm run typecheck:web      # tsc over migrated browser TypeScript
npm run build:web          # esbuild -> dist/web/*.js (iife bundles, committed)
npm run build:web:check    # rebuild + fail if committed dist/web is out of sync
npm run build:web:watch    # rebuild on change during dev
npm run smoke:web          # headless smoke test for supported pages/bundles
```

`smoke:web` is an automated migration safety check. It does not replace real browser/layout testing, especially for MapLibre/canvas flows.

### Running locally

Serve over a local web server (not `file://`) so the service worker and fetch work, then open `index.html` (main app), `profile.html`, `Civication.html`, or `AHA/index.html`.

For the MapTiler "Naturtro" map, set `window.HG_MAPTILER_KEY` in `js/config.js` (copy from `js/config.example.js`). The committed `js/config.js` is a safe no-key default; if the key is missing the app keeps the default map and logs a warning. Never commit a private key.

### Type checking

```bash
npm run typecheck          # legacy/root JS baseline (checkJs, noEmit)
npm run typecheck:web      # migrated browser TypeScript
npm run typecheck:scripts  # Node scripts
npm run typecheck:tools    # Node tools
npm run build:tools        # emit tools used by validation commands
```

The TypeScript guard distinguishes new regressions from unrelated existing legacy diagnostics. See `docs/TYPESCRIPT_FIRST_POLICY.md`.

When `backend/` is implemented, Python lint/typecheck/tests must be separate required CI gates; do not fold Python validation into the TypeScript guard.

### Data / content validation

Run the targeted validation for the data surface changed. Common commands include:

```bash
npm run tools:check
npm run places:index:check
npm run places:coords:check
npm run i18n:places:check
npm run health
npm run health:places
```

In-browser validation when relevant:

```js
DomainHealthReport.run({ toast: true });
QuizAudit.run();
```

Minimum manual smoke test for quiz/progression changes: start a quiz → answer correctly → knowledge/trivia saved → `updateProfile` fires.

### Tests

Current client/tool tests are primarily Node scripts and grouped npm commands. Run the relevant targeted suite from `package.json`.

Examples:

```bash
npm run test:civication
npm run test:civication-map
npm run test:aha-music
npm run test:historical-routes
```

The target Python backend uses `pytest` plus Python lint/typecheck and contract tests when that code surface is created.

## Conventions

- **Target language ownership is fixed by `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`.** Client → TypeScript. Production backend/API → Python/FastAPI. Node repo tooling → TypeScript. Editorial data → JSON/manifests.
- **Browser TypeScript migration is gradual and deliberate.** Migrated files use the current esbuild strangler and preserve required `window.X` interop until consumers are migrated.
- **Civication is currently excluded from the active browser migration batches.** Do not bulk-convert it accidentally. New long-term client architecture still follows the canonical TypeScript direction; changing Civication's migration scope requires a deliberate plan.
- **Do not create ad-hoc Node backend services** for new production domains just because Node tooling already exists.
- **Do not move canonical JSON content into PostgreSQL** without a documented product/data decision.
- **CSS file list is LOCKED.** Don't add a CSS file without updating the list and per-entrypoint load order in `README/SYSTEM_REGISTRY.md` §7.
- Don't bypass `QuizEngine` / `HGInsights` / knowledge hooks.
- Test mode must never write real unlocks, progression or rewards.
- Edit only the layer that owns a responsibility; do not introduce parallel truths.

## Git / CI

- `.gitignore` ignores generated output generally, with the intentional exception that `dist/web/` bundles are committed for the current browser migration/deployment model.
- `.github/workflows/typescript-guard.yml` enforces modern TypeScript/build gates and regression-only legacy diagnostics.
- Future `backend/` Python code must have its own required lint/typecheck/test CI gates.
- Data and domain workflows under `.github/workflows/` continue to enforce their relevant contracts.