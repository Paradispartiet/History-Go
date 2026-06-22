# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

History GO is a location-based knowledge game where the city (Oslo) is the game board. Users check in at real-world places (GPS or QR), take short quizzes, and collect badges, diplomas and cards while a personal "knowledge diary" tracks progression (Amatør → Student → Doktor → Professor).

It is a **framework-free browser app**. Historically it had no bundler and no build step — HTML loaded classic `<script src="...js">` tags directly, and TypeScript was only a static type-checker over JavaScript (`allowJs` + `checkJs`). The project has now **decided to adopt esbuild as a bundler** so browser files can become real TypeScript (`.ts`) ESM modules. This migration is a **strangler**: files are converted one at a time from classic global-scope `.js` to `.ts` ESM modules bundled by esbuild (`npm run build:web`), while not-yet-migrated files keep loading as classic `<script>` tags. The Node-only tracks (`scripts/`, `tools/`) are already fully TypeScript. See `docs/typescript-migration-plan.md`.

**Interop contract (non-negotiable during migration):** any migrated module that previously exposed a global (`window.X`) MUST still publish that same global as a load-time side effect, so classic (non-migrated) consumers keep working unchanged. esbuild builds these as `iife` bundles. Migrated entrypoints are listed in `build/build-web.mjs` and output to `dist/web/` (gitignored); the owning HTML page loads `dist/web/<name>.js` and therefore now requires `npm run build:web` before serving.

Most documentation is in Norwegian, and most code identifiers, data, and content are Norwegian. Match that language when editing docs and content.

## Repository layout

Multiple distinct apps live in this single repo, each its own HTML entry point with its own boot assumptions — **do not merge them**:

- `index.html` + `js/app.js` — the main History GO app (map, nearby panel, place cards, quiz flow, miniProfile).
- `profile.html` + `js/profile.js` — canonical full profile page.
- `Civication.html` + `js/Civication/**` — a separate career/economy/identity simulation game ("Civication"). Large subsystem, kept out of the index app and out of the TypeScript migration.
- `AHA/index.html` + `js/aha*.js` + `AHA/*.js` — "AHA" insight/echo layer; imports evidence exported by History GO. Has its own Node backend (`render.yaml`, `AHA/package.json`).
- Other pages: `knowledge.html`, `emner.html`, `notater.html`, `merker/merker.html`.
- Per-domain knowledge pages live under `knowledge/` (e.g. `knowledge/knowledge_historie.html`); root files like `knowledge_by.html` are thin redirect shells into that folder.

Key directories: `js/` (~234 browser JS files, layered — see architecture below), `data/` (manifest-driven JSON content, the source of truth), `tools/` and `scripts/` (Node-only CLI utilities, mostly `.mjs`/`.mts`), `tests/` (plain Node assert test files), `css/` (locked CSS list), `schemas/` (shared TypeScript `.ts`/`.d.ts` type and global declarations used by the typecheck), `reports/` (generated audit output, not runtime), `README/` and `docs/` (extensive normative documentation).

## Documentation is normative — read before editing

This project treats its docs as the contract. The golden rule from `README/TEAM_WORKFLOW.md` is: **"IKKE GJET, SLÅ OPP"** (don't guess, look it up). Before changing structure or behavior, consult:

- `README/SYSTEM_REGISTRY.md` — **where** things live, who owns what, allowed globals, hard rules. Binding.
- `README/SYSTEM_MAP.md` — **what happens** when the user does X; the module chain. Normative.
- `README/README_DEV.md` — operational dev notes, debugging, validation.
- `docs/APP_STRUCTURE_INDEX.md` — index app shell / boot / router model.

If a structural change doesn't fit the registry/map, update those docs **first**. Update docs only when a contract changes (a localStorage key, an event, a public API, an entry point, or a module's responsibility).

## Architecture (the big picture)

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

Layers (`README/SYSTEM_MAP.md` is the full map):

- **State** (`js/state/`) — persistence to localStorage, open/test mode. No DOM.
- **Core** (`js/core/`) — constants, categories, geo/distance, viewport/layers/bottom-sheet. No DOM, no side effects.
- **Data/Knowledge/Insight** — `js/dataHub.js` is the data hub (manifest-driven loading, caching, enrichment); `js/knowledge.js`, `js/trivia.js`, `js/hgInsights.js`, `js/DomainRegistry.js`, etc.
- **Geo/Map** — `js/map.js` (`HGMap`, MapLibre), `js/routes.js`, `js/navRoutes.js`.
- **Game/Progression** — `js/quizzes.js` (`QuizEngine`), `js/hg_unlocks.js`, `js/quiz-audit.js`.
- **UI** (`js/ui/`) — DOM and interaction only.
- **Observations** (`js/observations.js`), **Stories** (`js/stories/`), **Civication** (`js/Civication/`).
- **Boot** — `js/boot.js` / `js/boot-fast.js`. **App shell** — `js/app.js`, `js/router/AppRouter.js`, `js/views/MapView.js`.

### Non-negotiable rules (from SYSTEM_REGISTRY)

1. Core files must never touch the DOM.
2. UI files must never fetch data (go through DataHub).
3. No `DOMContentLoaded` outside `js/app.js`. All system start goes through `boot()`.
4. No duplicate function names across files.
5. `safeRun()` is the only allowed init wrapper; a failing UI module must not stop boot.
6. **No normalization / no guessing.** Domain id = filename suffix. If an id doesn't match → **FAIL FAST** (log + stop), never fall back to another category. Conflicts (e.g. `popkultur` vs `populaerkultur`) are resolved only by an explicit alias in `js/DomainRegistry.js`.

Canonical domains: `by, historie, kunst, litteratur, musikk, naeringsliv, natur, politikk, popkultur, psykologi, sport, subkultur, vitenskap`.

Allowed globals (do not introduce others without a decision): `window.PLACES, PEOPLE, BADGES, RELATIONS, MAP, HGMap, HGPos, OPEN_MODE, API`.

### Index app boot model

`index.html` uses a split boot. `bootCritical()` does only what's needed for a usable map fast (core/runtime, open/test mode, map init, light places index, `window.PLACES`, initial shell). `bootBackground()` loads everything else defensively (people, relations, Wonderkammer, tags, nature, Lesespor, stories, events, brands, badges) — one failing background module must not break the shell. Index routes are `#/map`, `#/place/:id`, `#/quiz/:id` via `AppRouter`; use `window.HGAppRouter?.toMap/toPlace/toQuiz` rather than building hash strings manually. `#/profile` intentionally navigates to `profile.html`.

## Data: source of truth vs. generated

`data/` JSON is the source of truth, loaded via manifests (e.g. `data/places/manifest.json`, `data/people/manifest.json`, `data/quiz/manifest.json`, `data/fag/fag_manifest.json`). Active file versions are switched by editing the manifest, **not** by renaming large content files.

**`data/places/places_index.json` is generated build output — never edit it by hand.** When changing places (coordinates, radius, name, images, light card fields):

1. Edit the correct source file under `data/places/...`
2. `npm run places:index:build`
3. `npm run places:index:check`
4. Only merge if the sync check is green. If the index is out of sync, regenerate it — never hand-patch.

`structure_*.json` is fully removed from runtime (deprecated/historical). Quizzes load only if present in `data/quiz/manifest.json`; if you change place/person ids, run the quiz audit afterward.

## Commands

Requires Node (repo uses v22). `devDependencies` are TypeScript, `@types/node`, and **esbuild** (the browser bundler adopted for the TS migration). Browser pages that have not yet been migrated still load classic `<script>` tags and need no build; pages that load a migrated module from `dist/web/` require `npm run build:web` first.

Browser bundle build:

```bash
npm run typecheck:web      # tsc over migrated js/**/*.ts (DOM lib, noEmit)
npm run build:web          # esbuild -> dist/web/*.js (iife bundles)
npm run build:web:watch    # rebuild on change during dev
```

### Running locally

Serve over a local web server (not `file://`) so the service worker and fetch work, then open `index.html` (main app), `profile.html`, `Civication.html`, or `AHA/index.html`.

For the MapTiler "Naturtro" map, set `window.HG_MAPTILER_KEY` in `js/config.js` (copy from `js/config.example.js`). The committed `js/config.js` is a safe no-key default; if the key is missing the app keeps the default map and logs a `console.warn`. Never commit a private key.

### Type checking

```bash
npm run typecheck          # tsc over js/, scripts/, root *.js (checkJs, noEmit)
npm run typecheck:scripts  # Node-only converted scripts
npm run typecheck:tools    # Node-only converted tools
npm run build:tools        # emit converted tools to dist/tools (needed by *:check scripts)
```

### Data / content validation (run before merging content changes)

```bash
npm run tools:check        # aggregate: typecheck+build tools, places index sync, place coordinate
                           # audit+quality gate, emne ids, duplicate JSON keys, leksikon ids,
                           # place aliases, stories integrity, place health
npm run places:index:check # places_index.json is in sync with source
npm run places:coords:check # place coordinate audit + quality gate
npm run i18n:places:check  # places i18n audit, quality and worklist (Node-only scripts)
npm run health             # data health report
npm run health:places      # place health report
```

In-browser validation (run in the console before merge, per `README_DEV.md` / `TEAM_WORKFLOW.md`):

```js
DomainHealthReport.run({ toast: true });
QuizAudit.run();
```

Minimum manual smoke test: start a quiz → answer correctly → knowledge/trivia saved → `updateProfile` fires.

### Tests

Tests are plain Node scripts using `node:assert` (no test framework). Run one directly:

```bash
node tests/aha-music-bridge.test.js
```

Run grouped suites via npm (see `package.json` `scripts` for the full list):

```bash
npm run test:civication        # large Civication suite (dozens of tests)
npm run test:civication-map
npm run test:aha-music
npm run test:historical-routes
```

There are also many `audit:*` scripts (e.g. `audit:aha-music`, `audit:job-learning-profiles`, `audit:civication-map`) used to validate Civication and integration data.

## Conventions

- **TypeScript migration is gradual and deliberate.** Node-only `scripts/` and `tools/` are fully `.ts`/`.mts`. Browser files (`js/**`) are being converted one at a time from classic global `.js` to `.ts` ESM modules bundled by esbuild — each migrated file is added to `build/build-web.mjs`, must keep publishing its `window.X` global (interop contract), and its owning HTML page is repointed to `dist/web/<name>.js`. Don't convert a browser file without registering it in `build/build-web.mjs` and verifying the bundle still publishes the expected global. Civication (`js/Civication/**`, loaded by `Civication.html`/`index.html`/`profile.html`) is explicitly **excluded** and stays `checkJs`/JSDoc-typed JavaScript. See `docs/typescript-migration-plan.md`.
- **CSS file list is LOCKED.** Don't add a CSS file without updating the list and the per-entrypoint load order in `README/SYSTEM_REGISTRY.md` §7.
- Don't bypass `QuizEngine` / `HGInsights` / the knowledge hooks — they are the only path binding quiz flow to rewards.
- Test mode is fully isolated: it must never write unlocks, progression, or rewards.
- Edit only the file that owns a responsibility; don't hop between modules or introduce cross-file duplicate functions.

## Git / CI

`.gitignore` covers `node_modules/` and `dist/` (generated TS output — never commit it). GitHub Actions under `.github/workflows/` cover the TypeScript baseline (`typecheck-baseline.yml`) and place-image/nature-candidate generation pipelines.
