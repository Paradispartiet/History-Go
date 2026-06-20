# TypeScript migration status etter PR #1365

## 1. Nåværende status

Denne preflighten ble kjørt etter PR #1365 for å bekrefte at TypeScript-guard fortsatt er grønn etter siste innholds-/dataendring, og for å kartlegge gjenværende migreringskandidater uten å berøre runtime, koordinatkandidat-pipeline, data eller package-scripts.

| Kontroll | Status | Kommando / kilde |
| --- | --- | --- |
| Root `typecheck` | Grønn | `npm run typecheck` |
| Scripts typecheck | Grønn | `npm run typecheck:scripts` |
| Scripts build | Grønn | `npm run build:scripts` |
| Tools typecheck | Grønn | `npm run typecheck:tools` |
| Tools build | Grønn | `npm run build:tools` |
| CI-guard finnes | Ja | `.github/workflows/typescript-guard.yml` kjører root typecheck, scripts typecheck/build og tools typecheck/build |
| Baseline diagnostics | 0 | `reports/typecheck-baseline-report.md` viser `Total diagnostic lines found: 0` |

`git diff --check` er også grønn etter rapportendringen. Root-baselinen er fortsatt grønn, så `reports/typecheck-baseline-report.md` ble ikke regenerert.

## 2. Hva er migrert til TypeScript allerede

### Tools-sporet

Tools-sporet har egen typecheck/build via `tsconfig.tools.json` og `tsconfig.tools.build.json`, og npm-scripts kjører migrerte tools fra `dist/tools` etter build. Følgende toppnivå-tools er allerede TypeScript-kilder:

- `tools/audit-aha-music.mts`
- `tools/audit-historical-routes.mts`
- `tools/audit-place-coordinates.mts`
- `tools/audit-place-quality-gate.mts`
- `tools/audit-visual-design-codes.mts`
- `tools/buildTags.mts`
- `tools/build_places_index.mts`
- `tools/check-audit-refactor-equivalence.mts`
- `tools/check_duplicate_json_keys.mts`
- `tools/check_leksikon_duplicate_ids.mts`
- `tools/check_place_emne_ids.mts`
- `tools/check_place_id_aliases.mts`
- `tools/check_places_index_sync.mts`
- `tools/check_stories_integrity.mts`
- `tools/dataHealthReport.mts`
- `tools/importPlaces.mts`
- `tools/place-coordinate-quality-gate.mts`
- `tools/placeHealthReport.mts`
- `tools/placeSchemaPolicy.mts`
- `tools/test-place-anchor-distance.mts`
- `tools/typecheck-baseline-report.mts`
- `tools/validate_lesespor.mts`

### Scripts-sporet

Scripts-sporet har egen typecheck/build via `tsconfig.scripts.json` og `tsconfig.scripts.build.json`, og migrerte scripts kjøres fra `dist/scripts` der package-scripts peker dit. Følgende toppnivå-scripts er allerede TypeScript-kilder:

- `scripts/audit-wonderkammer-data.mts`
- `scripts/auditJobKnowledgeRequirements.ts`
- `scripts/auditJobLearningProfiles.ts`

### i18n-scripts

Places-i18n-løypen er migrert og bygges som Node-only scripts:

- `scripts/i18n-audit-places.ts`
- `scripts/i18n-place-manifest-loader.ts`
- `scripts/i18n-quality-places.ts`
- `scripts/i18n-stamp-places.ts`
- `scripts/i18n-worklist-places.ts`

### Audit-scripts

Følgende audit-/kontrollscripts er migrert i Node-only tools- og scripts-løypene:

- `tools/audit-aha-music.mts`
- `tools/audit-historical-routes.mts`
- `tools/audit-place-coordinates.mts`
- `tools/audit-place-quality-gate.mts`
- `tools/audit-visual-design-codes.mts`
- `scripts/audit-wonderkammer-data.mts`
- `scripts/auditJobKnowledgeRequirements.ts`
- `scripts/auditJobLearningProfiles.ts`

### Koordinat-audit/gate

Koordinat-audit/gate-sporet er allerede migrert til TypeScript og kjøres via build-output:

- `tools/audit-place-coordinates.mts`
- `tools/place-coordinate-quality-gate.mts`

Dette er separat fra koordinatkandidat-generatoren, som eksplisitt ikke røres nå.

### Civication audit-scripts som nå er Node-only TypeScript

Følgende Civication-relaterte audit-scripts ligger nå som Node-only TypeScript i scripts-builden:

- `scripts/audit-civication-historygo-map.mts`
- `scripts/audit-civication-historygo-place-mapping.mts`
- `scripts/audit-civication-building-types.mts`
- `scripts/audit-civication-city-map-entries.mts`
- `scripts/civication-badge-role-audit.mts`

Dette endrer ikke Civication browser-runtime; runtime-filer under `js/Civication/**` er fortsatt JavaScript.

## 3. Gjenværende Node-only `.js`/`.mjs` i `tools/` og `scripts/`

Kartleggingen under gjelder bare toppnivåfilene `tools/*.js`, `tools/*.mjs`, `scripts/*.js` og `scripts/*.mjs`. `Brukes av package script?` betyr direkte referanse i `package.json`.

| Fil | Brukes av package script? | Node-only? | Browser globals? | Nettverk? | Skriver filer? | Trygg å migrere nå? | Anbefaling |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `tools/apply-verified-coordinate-candidates.mjs` | Nei | Ja | Nei | Nei | Ja | Nei | Koordinat-nær fil. Utsett til koordinatkandidat-/koordinatflyten er stabilisert og eier eksplisitt ber om den. |
| `tools/apply_place_image_candidates.mjs` | Nei | Ja | Nei | Ja | Ja | Delvis | Node-only, men både nettverk og filskriving gjør den bedre egnet for en senere isolert image-candidate PR med egne fixtures/tørrkjøring. |
| `tools/audit-litteratur-legacy-cleanup.mjs` | Nei | Ja | Nei | Nei | Ja | Ja | God kandidat for Node-only restbatch hvis ønsket; avklar først om skrive-output er rapport eller cleanup-output. |
| `tools/audit-people-invalid-place-refs.mjs` | Nei | Ja | Nei | Nei | Ja | Ja | God Node-only audit-kandidat; deler utils-mønster med migrerte place-ref audits. |
| `tools/audit-people-of-places-status.mjs` | Nei | Ja | Nei | Nei | Ja | Ja | God Node-only audit-kandidat; bør migreres sammen med people/place audit-gruppen. |
| `tools/audit-people-place-coverage.mjs` | Nei | Ja | Nei | Nei | Ja | Ja | God Node-only audit-kandidat; bør migreres sammen med people/place audit-gruppen. |
| `tools/audit-place-data.mjs` | Nei | Ja | Nei | Nei | Ja | Ja | God Node-only audit-kandidat, men valider at output ikke er ment som generert data før commit. |
| `tools/build_nature_place_candidates.mjs` | Nei | Ja | Nei | Ja | Ja | Nei | Candidate-builder med nettverk/filskriving. Utsett til egen nature-candidate batch, ikke bland med status/preflight. |
| `tools/build_nature_place_candidates_v2.mjs` | Nei | Ja | Nei | Ja | Ja | Nei | Samme som over; bør ikke migreres før candidate-flow og forventet output er eksplisitt avklart. |
| `tools/build_place_image_candidates.mjs` | Nei | Ja | Nei | Ja | Ja | Delvis | Node-only, men nettverk/filskriving og candidate-output tilsier egen PR med fixtures/tørrkjøring. |
| `tools/check-place-emne-links.mjs` | Nei | Ja | Nei | Nei | Nei | Ja | Beste lille restkandidat: ren Node-only read/check uten nettverk og uten filskriving. |
| `tools/fetch-place-coordinate-sources.mjs` | Nei | Ja | Nei | Ja | Ja | Nei | Koordinat-kilde/candidate-nær og nettverksbasert. Utsett sammen med koordinatkandidat-pipelinen. |
| `tools/generate-place-coordinate-candidates.mjs` | Ja: `places:coords:candidates`, `places:coords:candidates:by-oslo`, `places:coords:candidates:all` | Ja | Nei | Ja | Ja | Nei | Eksplisitt utsatt. Ikke rør nå. |
| `tools/validate_nature_maps.mjs` | Nei | Ja | Nei | Nei | Nei | Ja | Trygg Node-only check-kandidat; kan eventuelt tas i samme liten restbatch som `check-place-emne-links.mjs`. |
| `scripts/generate-civication-mails.js` | Nei | Ja | Nei | Nei | Ja | Nei | Civication-generering med filskriving. Utsett mens Civication-featurearbeid/runtime fortsatt er aktivt. |
| `scripts/validate-civication-avdelingsleder-mails.js` | Nei | Ja | Nei | Nei | Nei | Delvis | Node-only, men Civication-spesifikk. Kan migreres senere i en ren Civication audit/JSDoc/type-safety PR. |
| `scripts/validate-civication-daily-task-gates.js` | Nei | Ja | Nei | Nei | Nei | Delvis | Node-only, men Civication-spesifikk. Ikke bland med generell restbatch. |
| `scripts/validate-civication-finance-mails.js` | Nei | Ja | Nei | Nei | Nei | Delvis | Node-only, men Civication-spesifikk. Egen Civication audit-batch anbefales. |
| `scripts/validate-civication-finance-rolemodels.js` | Nei | Ja | Nei | Nei | Nei | Delvis | Node-only, men Civication-spesifikk. Egen Civication audit-batch anbefales. |
| `scripts/validate-civication-mails.js` | Nei | Ja | Nei | Nei | Ja | Nei | Civication-spesifikk og skriver filer/rapporter. Utsett til Civication audit-batch med klar output-policy. |
| `scripts/verify-civication-assets.js` | Nei | Ja | Nei | Nei | Nei | Delvis | Node-only, men Civication-spesifikk. Kan tas i Civication type-safety/audit-pass, ikke i generell tools-restbatch. |
| `scripts/verify-civication-boot-smoke.js` | Nei | Ja, men browser-smoke-orientert | Ja | Nei | Nei | Nei | Berører browser/Civication smoke-kontrakt indirekte. Ikke migrer før browser-build-/smoke-strategi er tydelig. |
| `scripts/verify-civication-json.js` | Nei | Ja | Nei | Nei | Nei | Delvis | Node-only, men Civication-spesifikk. Egnet for senere Civication audit-batch. |

## 4. Eksplisitt utsatt

`tools/generate-place-coordinate-candidates.mjs` er eksplisitt utsatt. Årsak: den er under utbedring / fungerer ikke helt / skal ikke røres nå. Den er direkte bundet til følgende package-scripts og koordinatkandidat-pipeline:

- `places:coords:candidates`
- `places:coords:candidates:by-oslo`
- `places:coords:candidates:all`

Denne preflighten endrer derfor ikke generatoren, koordinatkandidat-pipelinen, koordinatkilde-cache, koordinatdata eller package-scripts.

## 5. Browser-runtime status

`js/**` er fortsatt JavaScript som dekkes av root `tsconfig.json` med `allowJs: true` og `checkJs: true`. Det finnes fortsatt ingen browser-bundler, ingen generell browser-build og ingen HTML-integrasjon som laster transpilerte TypeScript-outputfiler for app-runtime.

Store browser-runtime-filer bør derfor ikke konverteres til `.ts` nå, spesielt ikke:

- `js/app.js`
- `js/boot.js`
- `js/map.js`
- store Civication UI-/runtime-filer under `js/Civication/**`

Anbefalingen er å beholde browser-runtime som JavaScript med JSDoc/checkJs inntil det finnes en tydelig browser-build-strategi som bevarer scriptrekkefølge, globals, HTML-kontrakter og output-stier.

## 6. Anbefalt neste konkrete PR

Anbefalt neste PR: **Node-only restbatch**.

Den tryggeste neste batchen bør være liten og avgrenset til ikke-Civication, ikke-koordinatkandidat, Node-only kontrollfiler uten nettverk og uten filskriving, for eksempel:

1. `tools/check-place-emne-links.mjs`
2. `tools/validate_nature_maps.mjs`

Eventuelt kan en separat senere audit-batch ta people/place-auditfilene som skriver rapporter, men den bør ha klar output-policy og egen validering. Ikke bland dette med koordinatkandidat-generatoren, browser-runtime eller Civication-runtime.
