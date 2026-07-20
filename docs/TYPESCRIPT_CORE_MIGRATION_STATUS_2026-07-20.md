# TypeScript core migration status — 2026-07-20

Dette dokumentet er et oppdatert statuspunkt for den aktive TypeScript-first-migreringen. Den eldre, historiske batchloggen i `docs/typescript-migration-plan.md` beholdes som migreringshistorikk, men tellinger og «neste kandidat»-vurderinger der kan være utdaterte.

## Ferdigstilt kart- og posisjonskjerne

Følgende runtimeområder har nå TypeScript som canonical kilde:

- `js/core/categories.ts` — canonical kategoriregister og kategorihelpers.
- `js/core/layerManager.ts` — lag- og modusorkestrering for kart/explore.
- `js/map.ts` — MapLibre-kartmotor, markører, kartstil, coordinate trust og input-handling.
- `js/map-controls-runtime.ts` — kartkontroller og kategoriprikkfilter.
- `js/core/pos.ts` — offentlig posisjonsruntime og `window.HGPos`-komponist.
- `js/core/positionStore.ts` — canonical posisjonsstate og manuell lokasjonsoverstyring.
- `js/core/geolocation.ts` — GPS request/watch-livssyklus.
- `js/core/placeDiscovery.ts` — auto-unlock, dagens besøk og discovery-events.
- `js/ui/locationPicker.ts` — søk, hurtigvalg og lokasjonsvelger-UI.

## Runtime-kompatibilitet

Appen laster fortsatt enkelte historiske `.js`-URL-er. Disse filene er ikke lenger håndskrevne canonical kilder; de genereres av `build/build-web.mjs` fra TypeScript og holdes deterministisk i sync av `build:web:check`.

Dette gjelder blant annet:

- `js/core/categories.js`
- `js/core/layerManager.js`
- `js/map.js`
- `js/core/pos.js`

`dist/web` inneholder de tilsvarende browser-bundlene.

## Offentlige kontrakter som er bevart

Migreringen skal ikke kreve samtidige rewrites av alle legacy-konsumenter. Følgende kontrakter er derfor fortsatt stabile:

- `window.CATEGORY_LIST`, `catColor`, `catClass`, `tagToCat`, `catIdFromDisplay`
- `window.LayerManager`
- `window.HGMap`
- `window.HGCoordinateTrust`
- `window.HGPos`
- `window.getPos`, `window.setPos`, `window.clearPos`

MapLibre lastes fortsatt som pinned CDN-runtime fra `index.html`, men TypeScript har nå en eksplisitt strukturell kontrakt for den delen av API-et History Go faktisk bruker.

## Mergehistorikk for denne kjernen

- PR #2752 — kartkontroller til TypeScript og nytt kategoriprikkfilter.
- PR #2754 — `categories` og `LayerManager` til TypeScript.
- PR #2756 — kartmotoren til TypeScript.
- PR #2757 — posisjonsruntime splittet og migrert til modulær TypeScript.

De obligatoriske TypeScript-gatene var grønne ved merge av disse runtimeendringene. Den separate legacy baseline-reporten er observasjonell og er ikke den autoritative merge-gaten for ny TypeScript-kode.

## Neste prioriterte migreringsområde

Neste høyverdikandidater bør være brukerflyten rundt kartet, i denne rekkefølgen:

1. Nearby/listelogikk og søk (`js/ui/lists.js`, `js/ui/left-panel.js`, `js/ui/search.js`) — migreres i avgrensede moduler, ikke som én stor filflytting.
2. State/persistence/favorites — med eksisterende schema-typer som canonical kontrakter.
3. PlaceCard-kontrolleren — først etter at delansvar er trukket ut i mindre TypeScript-moduler og browser-røyktesting er etablert.
4. `app.js`/boot-loaderlaget — sent i strangler-migreringen, når modulene det orkestrerer allerede er TypeScript.

Ny programlogikk skal fortsatt følge `docs/TYPESCRIPT_FIRST_POLICY.md` og `docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`.
