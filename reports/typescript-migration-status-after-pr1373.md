# TypeScript migration status etter PR #1373

## 1. Nåværende TypeScript-status etter PR #1373

Denne preflighten ble kjørt etter PR #1373 for å bekrefte at TypeScript-guard fortsatt er grønn etter siste innholds-PR, og for å oppdatere restlisten etter Node-only batchen i PR #1372. Dette er en status-/preflight-PR: ingen migreringer, runtime-endringer, dataendringer, package-scripts, tsconfig-endringer eller kandidatpipeline-endringer er gjort.

Oppdatert validering i denne PR-en: 2026-06-20 UTC.

| Kontroll | Status | Kommando / kilde |
| --- | --- | --- |
| Root `typecheck` | Grønn | `npm run typecheck` |
| Scripts typecheck | Grønn | `npm run typecheck:scripts` |
| Scripts build | Grønn | `npm run build:scripts` |
| Tools typecheck | Grønn | `npm run typecheck:tools` |
| Tools build | Grønn | `npm run build:tools` |
| CI-guard finnes | Ja | `.github/workflows/typescript-guard.yml` kjører root typecheck, scripts typecheck/build og tools typecheck/build |
| Baseline diagnostics | 0 | `reports/typecheck-baseline-report.md` viser `Total diagnostic lines found: 0` |

`git diff --check` er grønn etter rapportendringen. Root-baselinen er fortsatt grønn, så `reports/typecheck-baseline-report.md` ble ikke regenerert.

## 2. Bekreftelse på PR #1372-migreringen

PR #1372-migreringen av stabile Node-only audit/check-verktøy bygger fortsatt grønt etter PR #1373. Både scripts- og tools-løypene typechecker og bygger uten TypeScript-diagnostikk.

Dette betyr at de migrerte Node-only kildene fortsatt er dekket av de eksisterende guardene:

- `tsconfig.scripts.json` / `tsconfig.scripts.build.json`
- `tsconfig.tools.json` / `tsconfig.tools.build.json`
- `.github/workflows/typescript-guard.yml`

## 3. Oppdatert liste over migrerte tools/scripts

### Migrerte `tools`-kilder

Følgende toppnivåfiler i `tools/` er TypeScript-kilder nå:

- `tools/audit-aha-music.mts`
- `tools/audit-historical-routes.mts`
- `tools/audit-litteratur-legacy-cleanup.mts`
- `tools/audit-people-invalid-place-refs.mts`
- `tools/audit-people-of-places-status.mts`
- `tools/audit-people-place-coverage.mts`
- `tools/audit-place-coordinates.mts`
- `tools/audit-place-data.mts`
- `tools/audit-place-quality-gate.mts`
- `tools/audit-visual-design-codes.mts`
- `tools/buildTags.mts`
- `tools/build_places_index.mts`
- `tools/check-audit-refactor-equivalence.mts`
- `tools/check-place-emne-links.mts`
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
- `tools/validate_nature_maps.mts`

### Migrerte `scripts`-kilder

Følgende toppnivåfiler i `scripts/` er TypeScript-kilder nå:

- `scripts/audit-civication-building-types.mts`
- `scripts/audit-civication-city-map-entries.mts`
- `scripts/audit-civication-historygo-map.mts`
- `scripts/audit-civication-historygo-place-mapping.mts`
- `scripts/audit-wonderkammer-data.mts`
- `scripts/auditJobKnowledgeRequirements.ts`
- `scripts/auditJobLearningProfiles.ts`
- `scripts/civication-badge-role-audit.mts`
- `scripts/i18n-audit-places.ts`
- `scripts/i18n-place-manifest-loader.ts`
- `scripts/i18n-quality-places.ts`
- `scripts/i18n-stamp-places.ts`
- `scripts/i18n-worklist-places.ts`

## 4. Oppdatert restliste: gjenværende `tools/*.mjs`, `tools/*.js`, `scripts/*.mjs`, `scripts/*.js`

Kartleggingen under gjelder bare toppnivåfilene `tools/*.js`, `tools/*.mjs`, `scripts/*.js` og `scripts/*.mjs`. `Brukes av package script?` betyr direkte referanse i `package.json`.

| Fil | Brukes av package script? | Node-only? | Browser globals? | Nettverk? | Skriver filer? | Anbefaling |
| --- | --- | --- | --- | --- | --- | --- |
| `tools/apply-verified-coordinate-candidates.mjs` | Nei | Ja | Nei | Nei | Ja | Utsett. Koordinat-/candidate-nær fil med filskriving; bør ikke blandes inn i preflight eller generell restbatch. |
| `tools/apply_place_image_candidates.mjs` | Nei | Ja | Nei | Ja | Ja | Utsett til isolert image-candidate batch med tydelig nettverks-/filskrivingspolicy. |
| `tools/build_nature_place_candidates.mjs` | Nei | Ja | Nei | Ja | Ja | Utsett til egen nature-candidate batch. Candidate-builder med nettverk og filskriving. |
| `tools/build_nature_place_candidates_v2.mjs` | Nei | Ja | Nei | Ja | Ja | Utsett til samme nature-candidate retning som v1, med fixtures/tørrkjøring avklart. |
| `tools/build_place_image_candidates.mjs` | Nei | Ja | Nei | Ja | Ja | Utsett til image-candidate batch. Node-only, men nettverk og outputfiler gjør den uegnet for status-PR. |
| `tools/fetch-place-coordinate-sources.mjs` | Nei | Ja | Nei | Ja | Ja | Utsett med koordinatkilde-/koordinatkandidatflyten. |
| `tools/generate-place-coordinate-candidates.mjs` | Ja: `places:coords:candidates`, `places:coords:candidates:by-oslo`, `places:coords:candidates:all` | Ja | Nei | Ja | Ja | Eksplisitt utsatt. Ikke rør uten egen koordinatkandidat-ordre. |
| `scripts/generate-civication-mails.js` | Nei | Ja | Nei | Nei | Ja | Utsett. Civication-generator med filskriving bør tas separat. |
| `scripts/validate-civication-avdelingsleder-mails.js` | Nei | Ja | Nei | Nei | Nei | Mulig senere i Civication Node-only validator batch. |
| `scripts/validate-civication-daily-task-gates.js` | Nei | Ja | Nei | Nei | Nei | Mulig senere i Civication Node-only validator batch. |
| `scripts/validate-civication-finance-mails.js` | Nei | Ja | Nei | Nei | Nei | Mulig senere i Civication Node-only validator batch. |
| `scripts/validate-civication-finance-rolemodels.js` | Nei | Ja | Nei | Nei | Nei | Mulig senere i Civication Node-only validator batch. |
| `scripts/validate-civication-mails.js` | Nei | Ja | Nei | Nei | Nei | Mulig senere i Civication Node-only validator batch; avklar først om rapport-/outputpolicy trengs. |
| `scripts/verify-civication-assets.js` | Nei | Ja | Nei | Nei | Nei | Mulig senere i Civication Node-only validator batch. |
| `scripts/verify-civication-boot-smoke.js` | Nei | Delvis | Ja | Nei | Nei | Utsett til browser-build-strategi-audit. Den kjører browser-smoke via sidekontekst og bør ikke inngå i ren Node-only batch. |
| `scripts/verify-civication-json.js` | Nei | Ja | Nei | Nei | Nei | Mulig senere i Civication Node-only validator batch. |

Det finnes ingen gjenværende toppnivå `tools/*.js` eller `scripts/*.mjs` i denne kartleggingen.

## 5. Eksplisitt utsatte filer og områder

Følgende ble bevisst ikke rørt i denne preflighten:

- `tools/generate-place-coordinate-candidates.mjs`
- koordinatkandidat-pipeline og koordinatkilde-cache
- candidate-/network-builders:
  - `tools/apply_place_image_candidates.mjs`
  - `tools/build_nature_place_candidates.mjs`
  - `tools/build_nature_place_candidates_v2.mjs`
  - `tools/build_place_image_candidates.mjs`
  - `tools/fetch-place-coordinate-sources.mjs`
- Civication-generatorer og validatorer som bør tas separat:
  - `scripts/generate-civication-mails.js`
  - `scripts/validate-civication-avdelingsleder-mails.js`
  - `scripts/validate-civication-daily-task-gates.js`
  - `scripts/validate-civication-finance-mails.js`
  - `scripts/validate-civication-finance-rolemodels.js`
  - `scripts/validate-civication-mails.js`
  - `scripts/verify-civication-assets.js`
  - `scripts/verify-civication-json.js`
- browser-runtime og Civication-runtime under `js/**`
- HTML, CSS, datafiler og dependencies

## 6. Anbefalt neste større TypeScript-retning

Anbefalt neste større PR: **Civication Node-only validator batch**.

Begrunnelse:

1. Den oppdaterte restlisten viser at mange gjenværende scripts er Node-only Civication-valideringer uten nettverk og uten browser-globals.
2. En samlet validator-batch kan holdes unna Civication browser-runtime under `js/Civication/**`.
3. Den kan valideres med eksisterende TypeScript guard, og eventuelt relevante Civication-valideringskommandoer, uten å berøre HTML, CSS, data eller kandidatpipeline.

Alternative større retninger som fortsatt er relevante, men bør tas etter egen plan:

- **Image/nature candidate-tool batch**: bør isolere nettverk, filskriving, fixtures og eventuell tørrkjøring før migrering.
- **Browser-build-strategi-audit**: bør avklare om og hvordan browser-runtime senere kan migreres uten å bryte scriptrekkefølge, globals, HTML-kontrakter eller output-stier.
