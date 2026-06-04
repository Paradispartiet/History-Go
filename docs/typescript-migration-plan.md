# TypeScript-migreringsplan for History Go

Denne planen beskriver hvordan History Go kan migreres fra TypeScript-sjekket JavaScript til ekte TypeScript-filer uten å endre runtime-logikk, appflyt, filplasseringer eller HTML/script-oppsett i første omgang.

## Nåværende status

- **Prosjektbeslutning:** Civication holdes utenfor TypeScript-migrering inntil videre. Det skal fortsatt jobbes aktivt videre med Civication-funksjoner i JavaScript, og Civication kan fortsatt være `checkJs`-/JSDoc-typekontrollert JavaScript under dagens TypeScript-sjekk.
- Repoet kjører i dag JavaScript med TypeScript-kontroll via `allowJs: true` og `checkJs: true` i `tsconfig.json`.
- `npm run typecheck` kjører `tsc -p tsconfig.json` med `noEmit: true`, altså ren statisk sjekk uten byggede filer.
- `npm run typecheck:scripts` kjører `tsc -p tsconfig.scripts.json` for en avgrenset Node-only script-flate. Denne sjekken er separat fra browser-runtime og Civication.
- `npm run build:scripts` kjører `tsc -p tsconfig.scripts.build.json` og bygger de konverterte ikke-Civication i18n-place-scriptfilene til `dist/scripts`.
- `tsconfig.json` inkluderer `js/**/*.js`, `scripts/**/*.js`, rot-`*.js`, `schemas/**/*.ts` og `schemas/**/*.d.ts`.
- `tsconfig.scripts.json` inkluderer foreløpig ikke-Civication `scripts/i18n-*.js`, `scripts/audit-wonderkammer-data.mjs` og fremtidige `scripts/**/*.ts`/`.mts`/`.cts`, men ekskluderer `js/**`, `js/Civication/**` og `scripts/*civication*.*`/`scripts/**/*civication*.*`.
- `tools/**/*.mjs` er ikke en del av dagens TypeScript-sjekk, selv om flere npm-scripts peker dit.
- Det finnes TypeScript-devdependency og et smalt `build:scripts`-script for Node-only scripts, men fortsatt ingen bundler eller browser-runtime-emit i `package.json`.
- Browser-appen lastes hovedsakelig med klassiske `<script src="...js">`-tagger fra HTML, ikke via native ESM-importer eller en bundler.

## Kan appen kjøre `.ts` direkte?

Nei. Nettlesere kjører ikke TypeScript-filer direkte. Siden dagens HTML peker på `.js`-filer med vanlige script-tags, må appen enten:

1. beholde browser-loadede filer som `.js` inntil et bygg/transpile-steg finnes, eller
2. innføre en build-pipeline som transpilerer `.ts` til `.js` og sørger for at HTML fortsatt laster de genererte `.js`-filene.

Fordi denne migreringen ikke skal endre runtime, imports, script-tags, HTML, CSS eller data, bør første PR-er kun forberede TypeScript-konvertering i ikke-browser-loadede filer eller dokumentere/innføre bygg separat før browser-runtime flyttes.

## Nåværende script- og modulstruktur

### Package scripts

`package.json` har scripts for typecheck, datahelse, stedindeks, i18n-/leksikon-/story-sjekker og import. Script-oppsettet er Node-drevet og peker primært til `tools/*.mjs`, med enkelte filer i `scripts/`.

Det finnes nå for den fullførte places-i18n scripts-løypen:

- `npm run typecheck:scripts` for separat TypeScript-sjekk av Node-only scripts
- `npm run build:scripts` for å emitte de konverterte ikke-Civication i18n-place-scriptfilene til `dist/scripts`
- `npm run i18n:places:audit` for npm-kjøring av audit-scriptet fra bygget `dist/scripts`-output
- `npm run i18n:places:quality` for npm-kjøring av quality-scriptet fra bygget `dist/scripts`-output
- `npm run i18n:places:worklist` for npm-kjøring av worklist-scriptet fra bygget `dist/scripts`-output
- `npm run i18n:places:check` for samlet typecheck, build, audit, quality og worklist for places-i18n-sporet

Det mangler fortsatt:

- `npm run build` for hele appen
- bundler-konfigurasjon
- TypeScript emit til `dist/`, `build/` eller tilsvarende for browser-runtime
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

Node-scripts i `scripts/` og `tools/` bruker nå en blanding av `.ts`, `.js` og `.mjs`. `tools/*.mjs` har ESM-importer, men er ikke inkludert i dagens `tsconfig.json`.

## Shared schema-/typegrunnlag for i18n/place-scripts

Det finnes nå et lite shared TypeScript-only grunnlag for places-i18n-former i `schemas/i18n.ts`. Filen beskriver eksisterende dataformer for oversettelsesfiler og genererte worklist-rapporter, inkludert `JsonObject`, `PlaceSourcePayload`, `PlaceTranslationEntry`, `PlaceTranslationMap`, `I18nWorklistItem` og `I18nWorklistReport`.

Dette er kun typegrunnlag: filen inneholder ingen runtime-logikk, ingen imports inn i browser-runtime og ingen Civication-kobling. Dagens i18n-scripts bruker `import type` fra `schemas/i18n.ts` for shared schema-typing, slik at typeinformasjonen fjernes ved emit og ikke blir en Node-runtime-import. `schemas/i18n.ts` skal derfor ikke importeres som runtime-modul i scripts; imports mot denne filen skal være type-only, og `// @ts-ignore` skal ikke gjeninnføres for å skjule type-only import-problemer.

## Filgrupper og anbefalt migreringsrekkefølge

### 1. Node-only scripts

Eksempler:

- `scripts/i18n-audit-places.ts`
- `scripts/i18n-place-manifest-loader.ts`
- `scripts/i18n-quality-places.ts`
- `scripts/i18n-stamp-places.ts`
- `scripts/i18n-worklist-places.ts`

Vurdering:

- Første migreringsområde er Node-only scripts som ikke lastes fra HTML og ikke er Civication-funksjonskode.
- Places-i18n-scriptgruppen er første fullførte ikke-Civication TypeScript scripts-løype og kjøres av Node via bygget `dist/scripts`-output, ikke av browser.
- Videre Node-only scripts bør konverteres etter samme avklarte mønster: TypeScript-kilde i `scripts/`, typecheck med `tsconfig.scripts.json`, emit til `dist/scripts` og npm-kjøring av bygget `.js`.


## Valgt strategi for Node-only scripts

Scripts-migreringen har nå to separate steg, og begge er avgrenset fra browser-runtime og Civication:

- **Typecheck:** `npm run typecheck:scripts` bruker `tsconfig.scripts.json` med `noEmit: true` for en separat Node-only script-flate.
- **Build:** `npm run build:scripts` bruker `tsconfig.scripts.build.json` for å emitte kun den konverterte ikke-Civication TypeScript-scriptflaten til `dist/`.
- **Shared schema-typing:** Build-konfigen inkluderer både de konkrete `scripts/*.ts`-entrypointene for places-i18n og `schemas/i18n.ts`, fordi i18n-scripts henter shared schema-typer derfra med `import type`.
- **`rootDir: "."`:** Siden builden har TypeScript-kilder i både `scripts/` og `schemas/`, må felles kilde-rot være repo-roten (`.`). Hvis `rootDir` bare var `scripts`, ville `schemas/i18n.ts` ligge utenfor buildens root når typefilen inngår i programmet.
- **`outDir: "dist"`:** Output går fortsatt til `dist/`, og kombinasjonen av `rootDir: "."` og `outDir: "dist"` bevarer undermappestrukturen slik at script-entrypointene fortsatt havner som `dist/scripts/*.js`.
- **Samlet places-sjekk:** `npm run i18n:places:check` kjører `typecheck:scripts`, `build:scripts`, `i18n:places:audit`, `i18n:places:quality` og `i18n:places:worklist` i én kommando for places-i18n-scriptsporet.
- **Bygde filer:** Build-konfigen produserer script-output som npm-kommandoene kjører fra `dist/scripts`, inkludert `dist/scripts/i18n-audit-places.js`, `dist/scripts/i18n-quality-places.js`, `dist/scripts/i18n-stamp-places.js`, `dist/scripts/i18n-worklist-places.js` og `dist/scripts/i18n-place-manifest-loader.js`.
- **Npm-entrypoints:** Places-kommandoene kjører fortsatt `node dist/scripts/i18n-audit-places.js`, `node dist/scripts/i18n-quality-places.js` og `node dist/scripts/i18n-worklist-places.js --out reports/i18n-places-worklist.json` etter scripts-builden.
- **Ingen runtime-import av schema:** `schemas/i18n.ts` skal ikke importeres som runtime-modul i scripts. Bruk `import type` for schema-typene, slik at importen ikke finnes i emitert JavaScript; ikke gjeninnfør `// @ts-ignore` for type-only imports.
- **Ingen app-påvirkning:** Build-konfigen inkluderer ikke `js/**`, inkluderer ikke `js/Civication/**`, endrer ikke HTML/script-tags og produserer ikke browser-runtime-output.
- **Node-kompatibilitet:** Scripts-builden beholder Node-kompatibel `module`/`moduleResolution` (`NodeNext`) og CommonJS-formen som de konverterte scriptfilene bruker med `require`/`module.exports`.
- **Civication holdes utenfor:** Civication-relaterte scripts er fortsatt eksplisitt ekskludert med `scripts/*civication*.*`/`scripts/**/*civication*.*`, og Civication-migrering er fortsatt deferred.
- **Generert output:** `dist/` er generert TypeScript-build-output og skal ikke committes. `reports/i18n-places-worklist.json` er generert worklist-output fra `npm run i18n:places:worklist` og skal ikke committes med mindre prosjektet senere bestemmer noe annet.

Places-i18n scripts-løypen er fullført for første ikke-Civication TypeScript scripts-batch: konvertering til `.ts`, separat scripts-typecheck, scripts-build og npm-kjøring via places-kommandoene er på plass.

Neste TypeScript-spor bør være ett av disse to, ikke browser-runtime og ikke Civication ennå:

1. flere små ikke-Civication Node-only scripts etter samme typecheck/build/npm-mønster, eller
2. videre shared schema-/typegrunnlag i `schemas/` som kan brukes av både scripts og senere runtime-migrering.

Neste script-PR-er bør fortsatt:

1. konvertere kun små ikke-Civication script-grupper,
2. kjøre `npm run typecheck:scripts`, `npm run build:scripts` og relevante npm-kjøringer for den aktuelle scriptgruppen,
3. ikke endre browser-loadede filer, HTML, CSS, data eller Civication.

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

- `scripts/i18n-audit-places.ts`
- `scripts/i18n-place-manifest-loader.ts`
- `scripts/i18n-quality-places.ts`
- `scripts/i18n-stamp-places.ts`
- `scripts/i18n-worklist-places.ts`
- `js/audits/*.audit.js`
- Civication-relaterte scripts, for eksempel `scripts/validate-civication-*.js`, holdes deferred sammen med øvrig Civication-migrering.

Vurdering:

- Den første ikke-Civication places-i18n-scriptgruppen er nå konvertert til `.ts`, typecheckes og bygges separat, og kjøres via npm fra generert `dist/scripts`-output.
- Flere Node-scripts er fortsatt tryggere å konvertere før browser-runtime fordi de ikke brytes av HTML script-tags.
- Neste ikke-Civication TypeScript-spor inkluderer nå Node-only `tools/`, med en separat og smal tools-konfig slik at denne løypen ikke blandes inn i i18n places-scripts-løypen.
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

## Første konkrete filgruppe som er konvertert

Den første ikke-Civication Node-only script-batchen er nå konvertert til TypeScript og kan både typecheckes og bygges uten å koble inn browser-runtime:

1. `scripts/i18n-audit-places.ts`
2. `scripts/i18n-quality-places.ts`
3. `scripts/i18n-stamp-places.ts`
4. `scripts/i18n-worklist-places.ts`
5. `scripts/i18n-place-manifest-loader.ts`

Disse filene typecheckes med `npm run typecheck:scripts` og bygges med `npm run build:scripts` til `dist/scripts`. De kan kjøres via npm med `npm run i18n:places:audit`, `npm run i18n:places:quality` og `npm run i18n:places:worklist`, og hele løypen kan valideres samlet med `npm run i18n:places:check`. Worklist-scriptet skriver `reports/i18n-places-worklist.json`. Både `dist/` og `reports/i18n-places-worklist.json` er generert output og skal ikke committes, med mindre prosjektet senere bestemmer en annen policy for worklist-rapporten. Civication-relaterte scripts bør fortsatt ikke brukes som neste migreringsbatch nå.

## Første Node-only `tools/`-kandidat

Det neste ikke-Civication TypeScript-sporet er Node-only `tools/`. Første kandidat i denne løypen er `tools/check_place_emne_ids.mts`, konvertert fra `tools/check_place_emne_ids.mjs`. Toolen validerer place-data mot canonical emne-data og er ikke Civication-relatert, ikke browser-loadet og ikke del av i18n places-scripts-løypen.

Tools-løypen bruker egen smal konfig: `npm run typecheck:tools` kjører `tsconfig.tools.json`, og `npm run build:tools` kjører `tsconfig.tools.build.json`. Build-output går til `dist/tools`; fordi kildefilen er `.mts`, emitter TypeScript NodeNext en Node-kompatibel `.mjs`-fil. `npm run places:emner:check` bygger tools-output og kjører `node dist/tools/check_place_emne_ids.mjs`. `dist/` er fortsatt generert output og skal ikke committes. Civication er fortsatt deferred.

## Hva som må være på plass før første `.js` → `.ts`-konvertering

Minimum før første faktiske rename:

1. **Transpile-/run-strategi:** For Node-only i18n-place-scripts finnes nå `npm run build:scripts` med `tsc`-emit til `dist/scripts`; for Node-only tools finnes `npm run build:tools` med `tsc`-emit til `dist/tools`. Browser-runtime trenger fortsatt en separat strategi før browser-loadede filer konverteres.
2. **Output-kontrakt:** For browserfiler må generert `.js` ende på samme stier som HTML forventer, eller HTML-endringen må tas i en separat planlagt PR.
3. **Oppdatert `tsconfig`:** Inkluder relevante `.ts`-filer uten å miste `allowJs/checkJs` for resten av migreringen.
4. **Global typeflate:** Lag eller utvid deklarasjoner for `window`-globals som deles mellom klassiske browser-scripts.
5. **Valideringskommandoer:** `npm run typecheck`, `npm run typecheck:scripts`, `npm run build:scripts`, `npm run typecheck:tools`, `npm run build:tools` og `git diff --check` må fortsatt kjøres etter relevante endringer. For scripts og tools bør relevante Node-kommandoer kjøres per filgruppe.
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

1. **Node-only `tools/` eller `schemas/`:** Etter fullført places-i18n scripts-løype er neste TypeScript-spor små ikke-Civication Node-only tools med egen `typecheck:tools`/`build:tools`-konfig, eller shared schema-/typegrunnlag i `schemas/`.
2. **Plan og typegrunnlag:** Behold alle browser-loadede `.js`; legg til/rydd shared schema- og global-typer der det trengs.
3. **Node-only scripts og tools:** Bruk `tsconfig.scripts.json`/`tsconfig.scripts.build.json` for konverterte ikke-Civication scripts, og `tsconfig.tools.json`/`tsconfig.tools.build.json` for konverterte ikke-Civication tools. Hold Civication-relaterte scripts og tools deferred.
4. **Ikke-Civication core/utilities:** Konverter rene utility-/core-filer først senere, og bare med generert `.js` output eller etter separat build-/runtime-PR.
5. **Data loaders:** Konverter loaders med tydelige datatyper og fetch-resultater etter at browser-runtime-strategi finnes.
6. **UI/DOM:** Konverter DOM-tunge UI-filer med eksplisitte elementtyper og side-spesifikke smoke checks etter at build/transpile og runtime-kontrakter er stabile.
7. **Boot/runtime/globals:** Konverter `boot`, `app`, `routes`, config og øvrig runtime/global oppstart sent, etter at build/transpile, global type-deklarering og røyk-/typecheck er stabile. Browser-runtime er fortsatt ikke migrert.
8. **Civication (deferred):** Civication holdes utenfor TypeScript-migrering inntil videre. Når beslutningen endres, planlegg egne små Civication-batcher; browser-loadede Civication-filer skal fortsatt ikke renames, flyttes eller build-kobles uten separat runtime-/build-beslutning.
9. **Rydding:** Når alle relevante filer er TS, vurder å stramme `strict`, fjerne `allowJs` gradvis og eventuelt bytte til ESM/bundler som egen større arkitekturendring.

## Forslag til små migrerings-PR-er

1. **PR 1: Migreringsplan**
   - Legg til denne planen.
   - Ingen runtime-endringer.

2. **PR 2: TypeScript scripts-typecheck**
   - Legg til `tsconfig.scripts.json` for avgrenset Node-only script-typecheck.
   - Legg til `npm run typecheck:scripts`.
   - Ikke legg til app-emit, bundler eller browser-runtime-endringer.

3. **PR 3: TypeScript build-strategi for første script-batch**
   - Legg til `tsconfig.scripts.build.json` og `npm run build:scripts` for konverterte ikke-Civication i18n-place-scripts.
   - Emit output til `dist/scripts`.
   - Behold eksisterende browser-runtime uendret.

4. **PR 4: Status etter fullført places-i18n scripts-løype**
   - Dokumenter at `scripts/i18n-audit-places.ts`, `scripts/i18n-quality-places.ts`, `scripts/i18n-stamp-places.ts`, `scripts/i18n-worklist-places.ts` og `scripts/i18n-place-manifest-loader.ts` er første fullførte ikke-Civication TypeScript scripts-batch.
   - Dokumenter at `typecheck:scripts`, `build:scripts`, `i18n:places:audit`, `i18n:places:quality`, `i18n:places:worklist` og `i18n:places:check` finnes og dekker typecheck, build og npm-kjøring.
   - Dokumenter at `dist/` og `reports/i18n-places-worklist.json` er generert output som ikke skal committes etter dagens policy.
   - Ingen runtime-endringer, ingen Civication-migrering og ingen browser-runtime-endringer.

5. **PR 5: Shared schema-/typegrunnlag eller flere Node-only scripts**
   - Velg enten `schemas/`-typegrunnlag eller flere små ikke-Civication Node-only scripts som neste TypeScript-spor.
   - Ikke start med browser-runtime eller Civication ennå.

6. **PR 6: Flere Node-only scripts**
   - Konverter neste små ikke-Civication `scripts/*.js`-filer etter samme typecheck/build-mønster.
   - Kjør typecheck, scripts-build og relevante Node-valideringer.

7. **PR 7: Første Node-only tools-løype**
   - Konverter én avgrenset ikke-Civication `tools/*.mjs`-fil, med `tools/check_place_emne_ids.mts` som første kandidat.
   - Bruk egen `tsconfig.tools.json`/`tsconfig.tools.build.json`, bygg til `dist/tools`, og kjør relevant npm-kommando fra generert output.
   - Ikke bland tools-løypen inn i i18n places-scripts-løypen.

8. **PR 8: Første browser-safe core batch etter build**
   - Konverter en liten gruppe ikke-DOM core-filer, for eksempel `js/core/placeIdAliases.js`, `js/core/categories.js` og `js/time-resolver.js`.
   - Sørg for at generert `.js` bevarer samme stier for HTML.

9. **PR 9: Data loader batch**
   - Konverter utvalgte loaders med tydelige datatyper, for eksempel `js/events/events_loader.js`, `js/brands/brands_loader.js` og `js/emnerLoader.js`.
   - Verifiser fetch-kontrakter og global eksponering.

10. **PR 10: Civication-beslutning før eventuell migrering**
   - Ikke konverter Civication i denne fasen. Dokumenter først en ny beslutning dersom Civication ikke lenger skal holdes deferred.
   - Ved eventuell senere migrering må browser-loadede Civication-filer fortsatt ikke renames, flyttes eller build-kobles uten separat runtime-/build-beslutning.
