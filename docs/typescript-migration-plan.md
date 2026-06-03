# TypeScript-migreringsplan for History Go

Denne planen beskriver hvordan History Go kan migreres fra TypeScript-sjekket JavaScript til ekte TypeScript-filer uten å endre runtime-logikk, appflyt, filplasseringer eller HTML/script-oppsett i første omgang.

## Nåværende status

- Repoet kjører i dag JavaScript med TypeScript-kontroll via `allowJs: true` og `checkJs: true` i `tsconfig.json`.
- `npm run typecheck` kjører `tsc -p tsconfig.json` med `noEmit: true`, altså ren statisk sjekk uten byggede filer.
- Per denne planen gir `npm run typecheck` 0 TypeScript-diagnostics.
- `tsconfig.json` inkluderer `js/**/*.js`, `scripts/**/*.js`, rot-`*.js`, `schemas/**/*.ts` og `schemas/**/*.d.ts`.
- `tools/**/*.mjs` er ikke en del av dagens TypeScript-sjekk, selv om flere npm-scripts peker dit.
- Det finnes TypeScript-devdependency, men ingen bundler, ingen `build`-script, ingen `dist`-produksjon og ingen emit/transpile-steg i `package.json`.
- Browser-appen lastes hovedsakelig med klassiske `<script src="...js">`-tagger fra HTML, ikke via native ESM-importer eller en bundler.

## Kan appen kjøre `.ts` direkte?

Nei. Nettlesere kjører ikke TypeScript-filer direkte. Siden dagens HTML peker på `.js`-filer med vanlige script-tags, må appen enten:

1. beholde browser-loadede filer som `.js` inntil et bygg/transpile-steg finnes, eller
2. innføre en build-pipeline som transpilerer `.ts` til `.js` og sørger for at HTML fortsatt laster de genererte `.js`-filene.

Fordi denne migreringen ikke skal endre runtime, imports, script-tags, HTML, CSS eller data, bør første PR-er kun forberede TypeScript-konvertering i ikke-browser-loadede filer eller dokumentere/innføre bygg separat før browser-runtime flyttes.

## Nåværende script- og modulstruktur

### Package scripts

`package.json` har scripts for typecheck, datahelse, stedindeks, i18n-/leksikon-/story-sjekker og import. Script-oppsettet er Node-drevet og peker primært til `tools/*.mjs`, med enkelte filer i `scripts/`.

Det mangler foreløpig:

- `npm run build`
- bundler-konfigurasjon
- TypeScript emit til `dist/`, `build/` eller tilsvarende
- HTML-integrasjon mot generert JavaScript

### Browser-runtime

Følgende HTML-sider laster mange lokale `.js`-filer direkte:

- `index.html` laster hovedappen, core/state/UI, audits, stories og deler av Civication.
- `Civication.html` laster Civication-runtime, systemer, UI og boot direkte.
- `profile.html` laster profilopplevelse, kunnskap, datahub og Civication-komponenter.
- `knowledge.html` og `emner.html` laster kunnskaps-/emne-filer direkte.

Dette betyr at en ren rename fra `.js` til `.ts` av slike filer vil bryte runtime med mindre HTML endres eller filene transpileres tilbake til samme `.js`-sti.

### Modulformat

Appfilene i `js/` ser ut til å være globale/browser-script-filer med JSDoc-typer og `window`-eksponeringer, ikke ESM-moduler. Type-only JSDoc-importer finnes, for eksempel `import("../schemas/place")`, men dette er TypeScript/JSDoc-typing og ikke runtime-importer.

Node-scripts i `scripts/` og `tools/` bruker en blanding av `.js` og `.mjs`. `tools/*.mjs` har ESM-importer, men er ikke inkludert i dagens `tsconfig.json`.

## Filgrupper og anbefalt migreringsrekkefølge

### 1. Rene utility/core-filer

Eksempler:

- `js/core/placeIdAliases.js`
- `js/core/categories.js`
- `js/core/knowledgeLearningState.js`
- `js/core/learningEvents.js`
- `js/time-resolver.js`
- `js/DomainRegistry.js`
- `js/hgKnowledgeEngine.js`

Vurdering:

- Dette er ofte de tryggeste kandidatene fordi de typisk har færre DOM-avhengigheter enn UI-laget.
- Flere er likevel direkte lastet fra HTML, spesielt `index.html` og `profile.html`.
- De bør derfor ikke renames til `.ts` før det finnes en transpileringsavtale som produserer samme `.js`-runtime-output.

### 2. Data loaders

Eksempler:

- `js/dataHub.js`
- `js/emnerLoader.js`
- `js/fagkartLoader.js`
- `js/events/events_loader.js`
- `js/brands/brands_loader.js`
- `js/leksikon/leksikon_loader.js`
- `js/stories/stories_loader.js`

Vurdering:

- Data loaders har ofte tydelige input/output-former og egner seg godt for sterkere typer etter at shared data-typer er etablert.
- De kan ha fetch/cache-feilhåndtering og global eksponering som må bevares nøyaktig.
- Flere lastes direkte fra HTML og må derfor enten forbli `.js` eller kompileres til samme `.js`-sti.

### 3. UI/DOM-filer

Eksempler:

- `js/ui/dom.js`
- `js/ui/events.js`
- `js/ui/interactions.js`
- `js/ui/lists.js`
- `js/ui/left-panel.js`
- `js/ui/place-card.js`
- `js/ui/toast.js`
- `js/map.js`
- `js/app.js`
- `js/routes.js`

Vurdering:

- Dette er høyere risiko fordi de har DOM-querying, browser-events, global rekkefølgeavhengighet og ofte implisitte HTML-kontrakter.
- De bør migreres etter core og data loaders.
- Før konvertering bør man ha tydelige typer for DOM-elementer, nullable lookups og `window`-globals.

### 4. Civication-filer

Eksempler:

- Core: `js/Civication/core/civicationState.js`, `js/Civication/core/civicationJobs.js`, `js/Civication/core/civicationCalendar.js`, `js/Civication/core/civicationTaskEngine.js`, `js/Civication/core/civicationEconomyEngine.js`, `js/Civication/core/civicationEventEngine.js`
- Utility/bridge: `js/Civication/utils/storyResolver.js`, `js/Civication/utils/conflictLoader.js`, `js/Civication/mailPlanBridge.js`, `js/Civication/roleStoryletBridge.js`
- Systems: `js/Civication/systems/*.js` og `js/Civication/systems/day/*.js`
- UI: `js/Civication/ui/*.js`
- Boot: `js/Civication/CivicationBoot.js`

Vurdering:

- Civication har mange filer og mye rekkefølgeavhengig script-loading i `Civication.html`, `index.html` og `profile.html`.
- Core- og utility-filer er tryggere enn UI og boot, men de er fortsatt browser-loadede.
- Civication bør migreres i egne små batches fordi domenet er stort og globalt koblet.

### 5. Boot/runtime/globals

Eksempler:

- `js/config.js`
- `js/boot.js`
- `js/app.js`
- `js/routes.js`
- `js/Civication/CivicationBoot.js`
- `js/console/init.js`
- `js/console/legacyExtensions.js`

Vurdering:

- Dette er de minst trygge kandidatene for tidlig rename.
- De etablerer eller forbruker globals, appstart, scriptrekkefølge, init-sekvenser og sideeffekter.
- De bør migreres sent, etter at build/transpile, global type-deklarering og røyk-/typecheck er stabile.

### 6. Scripts/audits

Eksempler:

- `scripts/generate-civication-mails.js`
- `scripts/i18n-audit-places.js`
- `scripts/i18n-place-manifest-loader.js`
- `scripts/i18n-quality-places.js`
- `scripts/i18n-stamp-places.js`
- `scripts/i18n-worklist-places.js`
- `scripts/validate-civication-*.js`
- `scripts/verify-civication-assets.js`
- `js/audits/*.audit.js`

Vurdering:

- `scripts/**/*.js` er allerede inkludert i `tsconfig.json`, men kjøres av Node, ikke browser.
- Node-scripts er ofte tryggere å konvertere først fordi de ikke brytes av HTML script-tags.
- Audit-filer under `js/audits/` er derimot browser-loadede i `index.html` og bør behandles som browser-runtime inntil build finnes.

## Filer som bør forbli `.js` inntil videre

Alle filer som lastes direkte med `<script src="...js">` fra HTML bør forbli `.js` inntil et build/transpile-steg er på plass eller HTML-strategien er endret i en separat runtime-PR.

Dette gjelder særlig:

- hovedruntime i `index.html`, inkludert `js/config.js`, core/state/UI, stories, Civication-utdrag, `js/boot.js`, `js/app.js` og `js/routes.js`
- alle Civication-filer lastet i `Civication.html`
- profil- og kunnskapsfiler lastet i `profile.html`, `knowledge.html` og `emner.html`
- `js/audits/*.audit.js` når de lastes fra browser

## Første konkrete filgruppe som bør konverteres

Anbefalt første faktiske konverteringsbatch er Node-only `scripts/**/*.js`, ikke browser-loadede `js/**/*.js`.

Start med en liten gruppe validerings-/audit-scripts som:

- allerede er inkludert i `tsconfig.json`
- ikke lastes fra HTML
- har avgrenset ansvar
- kan kjøres individuelt med Node etter rename/transpile-strategi

Kandidater:

1. `scripts/validate-civication-mails.js`
2. `scripts/validate-civication-daily-task-gates.js`
3. `scripts/validate-civication-finance-mails.js`
4. `scripts/validate-civication-finance-rolemodels.js`
5. `scripts/validate-civication-avdelingsleder-mails.js`
6. `scripts/verify-civication-assets.js`

Disse bør bare konverteres når Node-kjøring av `.ts` er avklart, for eksempel via TypeScript emit til `.js` eller en egen Node-runner-strategi. Hvis man ikke ønsker runtime-runner-endringer for scripts ennå, bør første batch i stedet være rene typeforberedelser: shared `.d.ts`/`.ts`-typer i `schemas/` og JSDoc-opprydding uten rename.

## Hva som må være på plass før første `.js` → `.ts`-konvertering

Minimum før første faktiske rename:

1. **Transpile-/run-strategi:** Avklar om `.ts` skal kompileres til `.js` med `tsc`, kjøres via en Node-runner for scripts, eller bygges med bundler for browser.
2. **Output-kontrakt:** For browserfiler må generert `.js` ende på samme stier som HTML forventer, eller HTML-endringen må tas i en separat planlagt PR.
3. **Oppdatert `tsconfig`:** Inkluder relevante `.ts`-filer uten å miste `allowJs/checkJs` for resten av migreringen.
4. **Global typeflate:** Lag eller utvid deklarasjoner for `window`-globals som deles mellom klassiske browser-scripts.
5. **Valideringskommandoer:** `npm run typecheck` og `git diff --check` må fortsatt være grønne. For scripts bør relevante Node-kommandoer kjøres per filgruppe.
6. **Ingen runtime-endring i rename-PR:** Første migrerings-PR bør kun endre filendelse/typing/build-konfig, ikke appflyt eller logikk.
7. **Rollback-plan:** Hver batch må være liten nok til å kunne revertes uten å påvirke andre migreringsbatcher.

## Risikoer ved å konvertere browser-loadede filer

- **Direkte 404/runtime-brudd:** HTML peker på `.js`; rename til `.ts` uten generert `.js` gjør at browseren ikke finner filen.
- **Scriptrekkefølge:** Klassiske script-tags deler global scope og er rekkefølgeavhengige. Modulering eller bundling kan endre timing og scope.
- **Globals:** Mange filer forventer at variabler/funksjoner finnes på `window` eller global scope uten import/export.
- **Sideeffekter ved load:** Flere filer initialiserer state, event listeners eller UI ved lasting. Transpile/bundle må bevare sideeffektrekkefølge.
- **DOM-kontrakter:** UI-filer kan være avhengige av elementer i spesifikke HTML-sider. Strengere typer kan avdekke nullable DOM som krever varsom håndtering.
- **Cache/querystrings:** Enkelte HTML script-tags bruker cache-busting querystrings. Output-strategien må bevare forventet filnavn og cache-atferd.
- **Civication-koblinger:** Civication lastes på flere sider og har mange interne system/UI-avhengigheter; små endringer kan få stor effekt.

## Anbefalt migreringsrekkefølge

1. **Plan og typegrunnlag:** Behold alle `.js`; legg til/rydd shared schema- og global-typer der det trengs.
2. **Node-only scripts:** Konverter små `scripts/**/*.js`-valideringer når runner/transpile for Node er bestemt.
3. **Ikke-DOM core/data:** Konverter rene utility-/core-/loader-filer, men bare med generert `.js` output eller etter build-PR.
4. **Civication core:** Konverter Civication core/utility i små batches før systems/UI.
5. **Data loaders:** Konverter loaders med tydelige datatyper og fetch-resultater.
6. **UI/DOM:** Konverter DOM-tunge UI-filer med eksplisitte elementtyper og side-spesifikke smoke checks.
7. **Civication systems/UI:** Konverter Civication systems/day og UI i små, domenespesifikke PR-er.
8. **Boot/runtime/globals:** Konverter `boot`, `app`, `routes`, config og Civication boot sist.
9. **Rydding:** Når alle relevante filer er TS, vurder å stramme `strict`, fjerne `allowJs` gradvis og eventuelt bytte til ESM/bundler som egen større arkitekturendring.

## Forslag til små migrerings-PR-er

1. **PR 1: Migreringsplan**
   - Legg til denne planen.
   - Ingen runtime-endringer.

2. **PR 2: TypeScript build-/runner-beslutning**
   - Legg til minimal konfig for `.ts`-input uten å flytte appen.
   - Avklar om Node-only scripts skal bruke emit eller runner.
   - Behold eksisterende browser-runtime uendret.

3. **PR 3: Shared globals og schema-typer**
   - Legg til/utvid globale deklarasjoner for `window`-API-er som brukes mellom script-tags.
   - Ingen `.js` → `.ts` rename ennå hvis runtime ikke er klar.

4. **PR 4: Første Node-only script-batch**
   - Konverter 3-6 små `scripts/validate-civication-*.js`-filer.
   - Kjør typecheck og relevante Node-valideringer.

5. **PR 5: Flere Node-only scripts**
   - Konverter gjenværende avgrensede `scripts/*.js`-filer.
   - Hold `tools/*.mjs` separat fordi de ikke er i dagens `tsconfig.json` og allerede bruker ESM.

6. **PR 6: Første browser-safe core batch etter build**
   - Konverter en liten gruppe ikke-DOM core-filer, for eksempel `js/core/placeIdAliases.js`, `js/core/categories.js` og `js/time-resolver.js`.
   - Sørg for at generert `.js` bevarer samme stier for HTML.

7. **PR 7: Data loader batch**
   - Konverter utvalgte loaders med tydelige datatyper, for eksempel `js/events/events_loader.js`, `js/brands/brands_loader.js` og `js/emnerLoader.js`.
   - Verifiser fetch-kontrakter og global eksponering.

8. **PR 8: Første Civication core batch**
   - Konverter et lite sett Civication core/utility-filer, for eksempel `js/Civication/core/civicationCalendar.js`, `js/Civication/core/civicationTaskEngine.js` og `js/Civication/utils/storyResolver.js`.
   - Ikke konverter Civication boot eller UI i samme PR.
