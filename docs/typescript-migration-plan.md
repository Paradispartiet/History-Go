# TypeScript-migreringsplan for History Go

Denne planen beskriver hvordan History Go kan migreres fra TypeScript-sjekket JavaScript til ekte TypeScript-filer uten å endre runtime-logikk, appflyt, filplasseringer eller HTML/script-oppsett i første omgang.

## Nåværende status

- **Prosjektbeslutning:** Civication holdes utenfor TypeScript-migrering inntil videre. Det skal fortsatt jobbes aktivt videre med Civication-funksjoner i JavaScript, og Civication kan fortsatt være `checkJs`-/JSDoc-typekontrollert JavaScript under dagens TypeScript-sjekk.
- Repoet kjører i dag JavaScript med TypeScript-kontroll via `allowJs: true` og `checkJs: true` i `tsconfig.json`.
- `npm run typecheck` kjører `tsc -p tsconfig.json` med `noEmit: true`, altså ren statisk sjekk uten byggede filer.
- `npm run typecheck:scripts` kjører `tsc -p tsconfig.scripts.json` for en avgrenset Node-only script-flate. Denne sjekken er separat fra browser-runtime og Civication.
- `tsconfig.json` inkluderer `js/**/*.js`, `scripts/**/*.js`, rot-`*.js`, `schemas/**/*.ts` og `schemas/**/*.d.ts`.
- `tsconfig.scripts.json` inkluderer foreløpig ikke-Civication `scripts/i18n-*.js`, `scripts/audit-wonderkammer-data.mjs` og fremtidige `scripts/**/*.ts`/`.mts`/`.cts`, men ekskluderer `js/**`, `js/Civication/**` og `scripts/*civication*.*`/`scripts/**/*civication*.*`.
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
- TypeScript emit til `dist/`, `build/` eller tilsvarende for app-runtime
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

### 1. Node-only scripts

Eksempler:

- `scripts/i18n-audit-places.js`
- `scripts/i18n-place-manifest-loader.js`
- `scripts/i18n-quality-places.js`
- `scripts/i18n-stamp-places.js`
- `scripts/i18n-worklist-places.js`

Vurdering:

- Første migreringsområde bør være Node-only scripts som ikke lastes fra HTML og ikke er Civication-funksjonskode.
- `scripts/**/*.js` er allerede inkludert i `tsconfig.json`, men kjøres av Node, ikke browser.
- De bør bare konverteres når Node-kjøring av `.ts` er avklart, for eksempel via TypeScript emit til `.js` eller en egen Node-runner-strategi.


## Valgt strategi for Node-only scripts

Denne PR-en legger til en egen scripts-konfig, `tsconfig.scripts.json`, og et separat npm-script, `npm run typecheck:scripts`. Strategien er bevisst smal:

- **Egen konfig i stedet for app-emit:** `tsconfig.scripts.json` er separat fra browser-runtime og bruker Node-kompatibel `module`/`moduleResolution` (`NodeNext`) med kun Node-typer. Den arver ikke DOM-/Bundler-valgene i `tsconfig.json`, fordi scripts skal kunne migreres uten å dra inn browser-runtime.
- **Ren typecheck nå:** Konfigen har `noEmit: true`. Det legges ikke til `build:scripts` ennå, fordi dagens `.js`-scripts bruker `__dirname`/relative repo-stier, og et outDir-basert emit-steg må innføres sammen med første faktiske `.ts`-konvertering og verifisert run-kommando.
- **Gradvis migrering:** `allowJs: true` og `checkJs: true` beholdes, slik at eksisterende `.js`/`.mjs`-scripts kan sjekkes mens nye eller konverterte `scripts/**/*.ts`, `scripts/**/*.mts` og `scripts/**/*.cts` kan legges til senere.
- **Ingen app-påvirkning:** Konfigen inkluderer ikke `js/**`, inkluderer ikke `js/Civication/**`, endrer ikke HTML/script-tags og produserer ingen filer som kan lastes av browseren.
- **Civication holdes utenfor:** Civication-relaterte scripts er eksplisitt ekskludert med `scripts/*civication*.*`/`scripts/**/*civication*.*` og skal ikke være første migreringsbatch.

Første faktiske `.js` → `.ts`-batch for scripts bør derfor gjøre dette i en egen PR:

1. konverter kun en liten ikke-Civication script-gruppe, helst i18n-/place-scripts,
2. behold eller oppdater `npm run typecheck:scripts`,
3. avklar run-kontrakt per script: enten kjør kilde-`.js` videre til scriptet er konvertert, eller legg til et trygt `build:scripts`/outDir-oppsett som bevarer repo-root-resolusjon og kjører generert `.js`,
4. kjør den konverterte scriptkommandoen eksplisitt med Node i tillegg til `npm run typecheck:scripts`,
5. ikke endre browser-loadede filer, HTML, CSS, data eller Civication.

### 2. Ikke-Civication utility/core-filer

Eksempler:

- `js/core/placeIdAliases.js`
- `js/core/categories.js`
- `js/core/knowledgeLearningState.js`
- `js/core/learningEvents.js`
- `js/time-resolver.js`
- `js/DomainRegistry.js`
- `js/hgKnowledgeEngine.js`

Vurdering:

- Dette er ofte de tryggeste browser-kandidatene etter Node-only scripts fordi de typisk har færre DOM-avhengigheter enn UI-laget.
- Flere er likevel direkte lastet fra HTML, spesielt `index.html` og `profile.html`.
- De bør derfor ikke renames til `.ts` før det finnes en transpileringsavtale som produserer samme `.js`-runtime-output.
- Civication-filer inngår ikke i denne gruppen og holdes deferred.

### 3. Data loaders

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

### 4. UI/DOM-filer

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

### 5. Boot/runtime/globals

Eksempler:

- `js/config.js`
- `js/boot.js`
- `js/app.js`
- `js/routes.js`
- `js/console/init.js`
- `js/console/legacyExtensions.js`

Vurdering:

- Dette er de minst trygge kandidatene for tidlig rename.
- De etablerer eller forbruker globals, appstart, scriptrekkefølge, init-sekvenser og sideeffekter.
- De bør migreres sent, etter at build/transpile, global type-deklarering og røyk-/typecheck er stabile.

### 6. Browser-audits og øvrige scripts

Eksempler:

- `scripts/i18n-audit-places.js`
- `scripts/i18n-place-manifest-loader.js`
- `scripts/i18n-quality-places.js`
- `scripts/i18n-stamp-places.js`
- `scripts/i18n-worklist-places.js`
- `js/audits/*.audit.js`
- Civication-relaterte scripts, for eksempel `scripts/validate-civication-*.js`, holdes deferred sammen med øvrig Civication-migrering.

Vurdering:

- Ikke-Civication `scripts/**/*.js` er allerede inkludert i `tsconfig.json`, men kjøres av Node, ikke browser.
- Node-scripts er ofte tryggere å konvertere først fordi de ikke brytes av HTML script-tags.
- Civication-relaterte scripts og generatorer bør likevel ikke være første migreringsbatch nå, siden Civication bevisst holdes i JavaScript.
- Audit-filer under `js/audits/` er derimot browser-loadede i `index.html` og bør behandles som browser-runtime inntil build finnes.

### 7. Civication-filer (deferred)

Eksempler:

- Core: `js/Civication/core/civicationState.js`, `js/Civication/core/civicationJobs.js`, `js/Civication/core/civicationCalendar.js`, `js/Civication/core/civicationTaskEngine.js`, `js/Civication/core/civicationEconomyEngine.js`, `js/Civication/core/civicationEventEngine.js`
- Utility/bridge: `js/Civication/utils/storyResolver.js`, `js/Civication/utils/conflictLoader.js`, `js/Civication/mailPlanBridge.js`, `js/Civication/roleStoryletBridge.js`
- Systems: `js/Civication/systems/*.js` og `js/Civication/systems/day/*.js`
- UI: `js/Civication/ui/*.js`
- Boot: `js/Civication/CivicationBoot.js`

Vurdering:

- Civication holdes utenfor TypeScript-migrering inntil videre mens det jobbes aktivt videre med Civication-funksjoner i JavaScript.
- Civication kan fortsatt være `checkJs`-/JSDoc-typekontrollert JavaScript, slik at typefeil kan oppdages uten `.js` → `.ts` rename.
- Browser-loadede Civication-filer skal ikke renames til `.ts`, ikke flyttes og ikke build-kobles nå. Dette gjelder filer lastet fra `Civication.html`, `index.html` og `profile.html`.
- Når prosjektbeslutningen endres, bør Civication migreres i egne små batches fordi domenet er stort og globalt koblet.

## Filer som bør forbli `.js` inntil videre

Alle filer som lastes direkte med `<script src="...js">` fra HTML bør forbli `.js` inntil et build/transpile-steg er på plass eller HTML-strategien er endret i en separat runtime-PR.

Dette gjelder særlig:

- hovedruntime i `index.html`, inkludert `js/config.js`, core/state/UI, stories, Civication-utdrag, `js/boot.js`, `js/app.js` og `js/routes.js`
- alle Civication-filer lastet i `Civication.html`, `index.html` eller `profile.html`; disse skal ikke renames til `.ts`, ikke flyttes og ikke build-kobles nå
- profil- og kunnskapsfiler lastet i `profile.html`, `knowledge.html` og `emner.html`
- `js/audits/*.audit.js` når de lastes fra browser

## Første konkrete filgruppe som bør konverteres

Anbefalt første faktiske konverteringsbatch er Node-only `scripts/**/*.js`, ikke browser-loadede `js/**/*.js`.

Start med en liten gruppe ikke-Civication validerings-/audit-scripts som:

- allerede er inkludert i `tsconfig.json`
- ikke lastes fra HTML
- har avgrenset ansvar
- kan kjøres individuelt med Node etter rename/transpile-strategi

Kandidater:

1. `scripts/i18n-audit-places.js`
2. `scripts/i18n-quality-places.js`
3. `scripts/i18n-stamp-places.js`
4. `scripts/i18n-worklist-places.js`
5. `scripts/i18n-place-manifest-loader.js`
6. `scripts/audit-wonderkammer-data.mjs` (kan typecheckes med scripts-konfigen, men bør holdes som egen ESM-kandidat dersom første batch bare skal være CommonJS/i18n)

Disse bør bare konverteres når Node-kjøring av `.ts` er avklart for den konkrete batchen. Dagens scripts-konfig gir en trygg typecheck-flate, men ingen emit. Dersom første batch trenger kjørbar `.ts`-output, bør den samme PR-en legge til et avgrenset `build:scripts`-oppsett med `outDir` og dokumentere nøyaktig om Node skal kjøre generert `.js` fra `build/scripts` eller en annen trygg output-sti. Civication-relaterte scripts bør ikke brukes som første batch nå. Hvis man ikke ønsker runtime-runner-endringer for scripts ennå, bør første batch i stedet være rene typeforberedelser: shared `.d.ts`/`.ts`-typer i `schemas/` og JSDoc-opprydding uten rename.

## Hva som må være på plass før første `.js` → `.ts`-konvertering

Minimum før første faktiske rename:

1. **Transpile-/run-strategi:** Avklar om `.ts` skal kompileres til `.js` med `tsc`, kjøres via en Node-runner for scripts, eller bygges med bundler for browser.
2. **Output-kontrakt:** For browserfiler må generert `.js` ende på samme stier som HTML forventer, eller HTML-endringen må tas i en separat planlagt PR.
3. **Oppdatert `tsconfig`:** Inkluder relevante `.ts`-filer uten å miste `allowJs/checkJs` for resten av migreringen.
4. **Global typeflate:** Lag eller utvid deklarasjoner for `window`-globals som deles mellom klassiske browser-scripts.
5. **Valideringskommandoer:** `npm run typecheck`, `npm run typecheck:scripts` og `git diff --check` må fortsatt kjøres. For scripts bør relevante Node-kommandoer kjøres per filgruppe.
6. **Ingen runtime-endring i rename-PR:** Første migrerings-PR bør kun endre filendelse/typing/build-konfig, ikke appflyt eller logikk.
7. **Rollback-plan:** Hver batch må være liten nok til å kunne revertes uten å påvirke andre migreringsbatcher.

## Risikoer ved å konvertere browser-loadede filer

- **Direkte 404/runtime-brudd:** HTML peker på `.js`; rename til `.ts` uten generert `.js` gjør at browseren ikke finner filen.
- **Scriptrekkefølge:** Klassiske script-tags deler global scope og er rekkefølgeavhengige. Modulering eller bundling kan endre timing og scope.
- **Globals:** Mange filer forventer at variabler/funksjoner finnes på `window` eller global scope uten import/export.
- **Sideeffekter ved load:** Flere filer initialiserer state, event listeners eller UI ved lasting. Transpile/bundle må bevare sideeffektrekkefølge.
- **DOM-kontrakter:** UI-filer kan være avhengige av elementer i spesifikke HTML-sider. Strengere typer kan avdekke nullable DOM som krever varsom håndtering.
- **Cache/querystrings:** Enkelte HTML script-tags bruker cache-busting querystrings. Output-strategien må bevare forventet filnavn og cache-atferd.
- **Civication-koblinger:** Civication lastes på flere sider og har mange interne system/UI-avhengigheter; derfor holdes browser-loadede Civication-filer utenfor TypeScript-migreringen inntil videre.

## Anbefalt migreringsrekkefølge

1. **Plan og typegrunnlag:** Behold alle `.js`; legg til/rydd shared schema- og global-typer der det trengs.
2. **Node-only scripts:** Bruk `tsconfig.scripts.json` til å typechecke små ikke-Civication `scripts/**/*.js`-valideringer. Konverter først når runner/transpile for den konkrete Node-batchen er bestemt.
3. **Ikke-Civication core/utilities:** Konverter rene utility-/core-filer, men bare med generert `.js` output eller etter build-PR.
4. **Data loaders:** Konverter loaders med tydelige datatyper og fetch-resultater.
5. **UI/DOM:** Konverter DOM-tunge UI-filer med eksplisitte elementtyper og side-spesifikke smoke checks.
6. **Boot/runtime/globals:** Konverter `boot`, `app`, `routes`, config og øvrig runtime/global oppstart sent, etter at build/transpile, global type-deklarering og røyk-/typecheck er stabile.
7. **Civication (deferred):** Civication holdes utenfor TypeScript-migrering inntil videre. Når beslutningen endres, planlegg egne små Civication-batcher; browser-loadede Civication-filer skal fortsatt ikke renames, flyttes eller build-kobles uten separat runtime-/build-beslutning.
8. **Rydding:** Når alle relevante filer er TS, vurder å stramme `strict`, fjerne `allowJs` gradvis og eventuelt bytte til ESM/bundler som egen større arkitekturendring.

## Forslag til små migrerings-PR-er

1. **PR 1: Migreringsplan**
   - Legg til denne planen.
   - Ingen runtime-endringer.

2. **PR 2: TypeScript scripts-typecheck**
   - Legg til `tsconfig.scripts.json` for avgrenset Node-only script-typecheck.
   - Legg til `npm run typecheck:scripts`.
   - Ikke legg til app-emit, bundler eller browser-runtime-endringer.

3. **PR 3: TypeScript build-/runner-beslutning for første script-batch**
   - Avklar om konverterte Node-only scripts skal bruke emit til en trygg output-sti eller en annen Node-runner-strategi.
   - Legg bare til `build:scripts` når output og run-kommando er tydelig dokumentert.
   - Behold eksisterende browser-runtime uendret.

4. **PR 4: Shared globals og schema-typer**
   - Legg til/utvid globale deklarasjoner for `window`-API-er som brukes mellom script-tags.
   - Ingen `.js` → `.ts` rename ennå hvis runtime ikke er klar.

5. **PR 5: Første Node-only script-batch**
   - Konverter 3-6 små ikke-Civication `scripts/*.js`-filer, for eksempel i18n-/place-valideringer.
   - Kjør typecheck og relevante Node-valideringer.

6. **PR 6: Flere Node-only scripts**
   - Konverter gjenværende avgrensede `scripts/*.js`-filer.
   - Hold `tools/*.mjs` separat fordi de ikke er i dagens `tsconfig.json` og allerede bruker ESM.

7. **PR 7: Første browser-safe core batch etter build**
   - Konverter en liten gruppe ikke-DOM core-filer, for eksempel `js/core/placeIdAliases.js`, `js/core/categories.js` og `js/time-resolver.js`.
   - Sørg for at generert `.js` bevarer samme stier for HTML.

8. **PR 8: Data loader batch**
   - Konverter utvalgte loaders med tydelige datatyper, for eksempel `js/events/events_loader.js`, `js/brands/brands_loader.js` og `js/emnerLoader.js`.
   - Verifiser fetch-kontrakter og global eksponering.

9. **PR 9: Civication-beslutning før eventuell migrering**
   - Ikke konverter Civication i denne fasen. Dokumenter først en ny beslutning dersom Civication ikke lenger skal holdes deferred.
   - Ved eventuell senere migrering må browser-loadede Civication-filer fortsatt ikke renames, flyttes eller build-kobles uten separat runtime-/build-beslutning.
