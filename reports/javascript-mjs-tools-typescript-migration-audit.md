# Read-only audit: gjenværende JavaScript/MJS tools og scripts

Dato: 2026-06-11

## Formål og avgrensning

Dette er en read-only migreringskartlegging av alle gjenværende `.js`- og `.mjs`-filer direkte eller rekursivt under `tools/` og `scripts/`. Audit-PR-en konverterer ingen filer og endrer ikke data, runtime, TypeScript-konfigurasjon, HTML/CSS, Civication eller sport-/place-manifest.

Kartleggingen fant **36 filer**: **20 under `tools/`** og **16 under `scripts/`**. Alle de 16 gjenværende scriptfilene er Civication-relaterte og holdes utenfor det ordinære TypeScript-sporet. Ingen separat, ikke-Civication browser-runtime ble funnet under de to kartlagte mappene.

Begrepet **read-only** betyr her at verktøyet ikke muterer kildedata. Et auditverktøy kan derfor være read-only selv om det skriver avledede filer under `reports/`.

## Konklusjon

**Anbefalt neste migreringskandidat: `tools/validate_lesespor.mjs`.**

Den er en Node-only validator, muterer ingen data, skriver ingen rapportfiler, er ikke Civication- eller browser-runtime-relatert og leser ikke `data/places/manifest.json`. Den skanner riktignok Oslo-place-filer for å validere `place_id`, men er ikke koblet til sport-/manifestrekkefølgen som nå er ustabil.

Deretter anbefales `tools/audit-people-split-vs-legacy.mjs`. Den er også uavhengig av place-manifestet og muterer ikke data, men skriver to avledede auditrapporter og har derfor litt større migreringsflate.

## Trygge neste kandidater

| Prioritet | Fil | Hva den gjør | Leser data | Skriver data/reports | Read-only | Place manifest | Trygg nå |
|---|---|---|---|---|---|---|---|
| **Høy (1)** | `tools/validate_lesespor.mjs` | Validerer Lesespor-manifest, badge-kategorier, Oslo-filer og refererte Oslo-place-ID-er. | Ja: `data/lesespor/**`, `data/badges/index.json`, Oslo-filer under `data/places/**`. | Nei. | Ja. | Nei; skanner filer direkte. | **Ja. Beste neste kandidat.** |
| **Høy (2)** | `tools/audit-people-split-vs-legacy.mjs` | Sammenligner legacy `data/people.json` med split people-filer, people-manifest og relasjoner. | Ja: people- og relations-data. | Kun `reports/people-split-vs-legacy.{json,md}`. | Ja, med rapport-output. | Nei. | **Ja.** Bevar rapport-output byte-/semantisk ekvivalent. |

### Merknad om people-audits

De øvrige people-auditene er logisk read-only, men er ikke trygge neste kandidater akkurat nå fordi de bygger aktiv place-ID-mengde fra `data/places/manifest.json`. Flere importerer dessuten den allerede migrerte `tools/lib/placeRefAuditUtils.mts` via forventet bygget `.mjs`-sti, så en senere migrering må verifisere kilde-/dist-importen uten å committe `dist/`.

## Vent til manifest/sport-data er stabilt

| Prioritet | Fil | Hva den gjør | Leser data | Skriver data/reports | Read-only | Place manifest | Hvorfor vente |
|---|---|---|---|---|---|---|---|
| Vent | `tools/audit-litteratur-legacy-cleanup.mjs` | Auditerer legacy litteratur-personer, schema og ugyldige place-referanser. | Ja: people, places og place-index. | Kun `reports/litteratur-legacy-cleanup-audit.{json,md}`. | Ja, med rapport-output. | **Ja.** | Resultatet avhenger av aktiv place-mengde; vent på manifeststabilitet. |
| Vent | `tools/audit-people-invalid-place-refs.mjs` | Finner ugyldige place-referanser i people-data og foreslår kandidater. | Ja: people- og place-manifestdata. | Kun `reports/people-invalid-place-refs.{json,md}`. | Ja, med rapport-output. | **Ja.** | Direkte manifestavhengig. |
| Vent | `tools/audit-people-of-places-status.mjs` | Kartlegger people-fordeling, place-dekning, duplikater og blockers. | Ja: people-manifest, place-manifest og place-index. | Kun `reports/people-of-places-status.{json,md}`. | Ja, med rapport-output. | **Ja.** | Direkte manifestavhengig. |
| Vent | `tools/audit-people-place-coverage.mjs` | Måler people-dekning per place og prioriterer mangler. | Ja: place-/people-manifest og place-worklist. | Kun `reports/people-place-coverage.{json,md}`. | Ja, med rapport-output. | **Ja.** | Direkte manifestavhengig og resultatfølsom for pågående place-arbeid. |
| Vent | `tools/audit-place-data.mjs` | Bred place-referanseaudit på tvers av people, quiz, routes, natur, leksikon, badges, Civication-kart m.m. | Ja: mange datadomener. | Kun `reports/place-data-audit.md` og `reports/place-data-worklist.json`. | Ja, med rapport-output. | **Ja.** | Stor og bred manifestkobling; kan påvirkes av både place- og tilgrensende arbeid. |
| Vent | `tools/check-place-emne-links.mjs` | Kontrollerer place-emne-ID-er mot fagmanifest/fagkart; kan avgrenses med CLI-filer. | Ja: place-manifest og fag-data. | Nei; konsoll/exitkode. | Ja. | **Ja.** | God validator senere, men aktiv filflate kommer fra place-manifestet. |
| Vent | `tools/validate_nature_maps.mjs` | Validerer at nature maps peker til lastede places og flora/fauna-ID-er. | Ja: place-, flora- og fauna-manifest samt nature maps. | Nei; konsoll/exitkode. | Ja. | **Ja.** | Place-manifestet bestemmer gyldig place-ID-mengde. |

## Coordinate quality gate – vent

Disse filene skal ikke migreres før manifestarbeidet er stabilt. De er koordinatrelaterte, og flere inkluderer sportfiler gjennom det aktive place-manifestet.

| Prioritet | Fil | Hva den gjør | Leser data | Skriver data/reports | Read-only | Place manifest | Hvorfor vente |
|---|---|---|---|---|---|---|---|
| Vent | `tools/audit-place-coordinates.mjs` | Auditerer koordinatdekning og kvalitetsstatus, inkludert sportkategorier. | Ja: aktive place-filer. | Kun `reports/place-coordinate-audit.{json,md}`. | Ja, med rapport-output. | **Ja.** | Coordinate- og sport-/manifestfølsom. |
| Vent | `tools/audit-place-quality-gate.mjs` | Tynn wrapper som importerer coordinate quality gate. | Indirekte. | Indirekte quality-gate-rapport. | Ja mht. data. | Indirekte **ja**. | Skal følge quality gate samlet, ikke migreres isolert. |
| Vent | `tools/place-coordinate-quality-gate.mjs` | Validerer koordinater/anchors og skriver quality-gate-rapport. | Ja: aktive place-filer. | Kun `reports/place-coordinate-quality-gate.md`. | Ja, med rapport-output. | **Ja.** | Eksplisitt utsatt coordinate quality gate. |
| Vent | `tools/fetch-place-coordinate-sources.mjs` | Slår opp koordinatkilder over nett og lager cache/kandidatrapporter. | Ja: place-manifest og place-data. | `reports/place-coordinate-source-cache.json`, kandidat-JSON og Markdown. | Ja mht. kildedata, men nettverks-/rapportgenerator. | **Ja.** | Coordinate-, manifest- og nettverksavhengig. |
| Vent | `tools/test-place-anchor-distance.mjs` | Kjører avstand/unlock-smoketester mot steder med og uten anchors. | Ja: aktive place-filer. | Nei. | Ja. | **Ja.** | Coordinate-/anchor-semantikk og manifestutvalg er under arbeid. |

## Civication – holdes utenfor

Alle gjenværende `.js`/`.mjs` under `scripts/` er Civication-relaterte. De skal ikke tas inn som neste ordinære TypeScript-kandidater.

| Prioritet | Fil | Klassifisering og sideeffekt | Place manifest | Merknad |
|---|---|---|---|---|
| Vent | `scripts/audit-civication-building-types.mjs` | Read-only validator av Civication building type-mapping; konsoll/exitkode. | Nei. | Civication-kontrakt. |
| Vent | `scripts/audit-civication-city-map-entries.mjs` | Read-only audit/in-memory-generator for Civication city-map entries. | Nei; leser eksplisitt Oslo-placefil. | Civication map-kontrakt. |
| Vent | `scripts/audit-civication-historygo-map.mjs` | Audit som speiler Civication browser-layer og skriver JSON/Markdown-rapporter. | Nei. | Civication og browser-runtime-koblet. |
| Vent | `scripts/audit-civication-historygo-place-mapping.mjs` | Read-only validering av History Go → Civication place-mapping. | Nei; leser eksplisitt Oslo-placefil. | Civication map-kontrakt. |
| Vent | `scripts/auditJobKnowledgeRequirements.js` | Read-only validering av Civication job knowledge requirements mot quizdata. | Nei. | Civication jobbkontrakt. |
| Vent | `scripts/auditJobLearningProfiles.js` | Read-only validering av learning profiles mot Civication roles. | Nei. | Civication jobbkontrakt. |
| Vent | `scripts/civication-badge-role-audit.mjs` | Civication badge/role-audit som skriver rapportfiler. | Nei. | Civication-kontrakt og rapport-output. |
| Vent | `scripts/generate-civication-mails.js` | **Muterende generator** som skriver Civication work-model-data. | Nei. | Må ikke migreres nå. |
| Vent | `scripts/validate-civication-avdelingsleder-mails.js` | Read-only Civication mail-validator. | Nei. | Civication-kontrakt. |
| Vent | `scripts/validate-civication-daily-task-gates.js` | Validerer Civication runtime-JS og scriptrekkefølge i `Civication.html`. | Nei. | Civication og direkte browser-runtime-koblet. |
| Vent | `scripts/validate-civication-finance-mails.js` | Read-only Civication finance-mail-validator. | Nei. | Civication-kontrakt. |
| Vent | `scripts/validate-civication-finance-rolemodels.js` | Read-only validering av finance role models, planer og mail families. | Nei. | Civication-kontrakt. |
| Vent | `scripts/validate-civication-mails.js` | Read-only Civication mail-validator. | Nei. | Civication-kontrakt. |
| Vent | `scripts/verify-civication-assets.js` | Leser `Civication.html` og verifiserer assetreferanser. | Nei. | Civication og direkte browser-runtime-koblet. |
| Vent | `scripts/verify-civication-boot-smoke.js` | Kjører Civication boot-smoke i VM med simulerte browser-globals. | Nei. | Civication og browser-runtime-koblet. |
| Vent | `scripts/verify-civication-json.js` | Read-only JSON-/manifestverifikasjon for Civication-data. | Nei. | Civication-kontrakt. |

## Browser-runtime – senere fase

Det finnes ingen selvstendig ikke-Civication browser-runtime-fil blant de 36 kartlagte filene under `tools/` og `scripts/`. Browser-koblede scriptverktøy er alle Civication-relaterte og skal derfor holdes utenfor av to grunner:

- `scripts/validate-civication-daily-task-gates.js` leser runtimefiler under `js/Civication/**` og kontrollerer scriptrekkefølge i `Civication.html`.
- `scripts/verify-civication-assets.js` leser `Civication.html`.
- `scripts/verify-civication-boot-smoke.js` evaluerer Civication bootkode med simulerte `window`/`document`-objekter.
- `scripts/audit-civication-historygo-map.mjs` speiler logikk fra Civication browser-layer og bør følge runtimekontrakten.

Disse bør vurderes først i en senere, eksplisitt browser-/Civication-fase med egen runtimevalidering, ikke i Node-only tools-sporet.

## Må ikke migreres ennå

Følgende er muterende eller genererende tools og bør ikke velges som tidlige migreringskandidater selv når manifestarbeidet er ferdig. De trenger egne ekvivalens-, dry-run- og outputkontroller.

| Prioritet | Fil | Hva den gjør | Leser data | Skriver data/reports | Read-only | Place manifest | Hvorfor ikke nå |
|---|---|---|---|---|---|---|---|
| Vent | `tools/apply-verified-coordinate-candidates.mjs` | Bruker godkjente koordinatkandidater på place-filer; `--dry-run` finnes. | Ja: kandidatrapport og mål-placefiler. | **Muterer place-data** uten `--dry-run`. | Nei. | Ikke direkte; målfilene kommer fra rapporten. | Coordinate-mutator. |
| Vent | `tools/apply_place_image_candidates.mjs` | Laster ned godkjente bilder og oppdaterer place-kildefiler. | Ja: image-candidate-data og place-filer. | **Skriver bilder og muterer place-data**. | Nei. | Ikke direkte. | Nettverks- og datamutator. |
| Vent | `tools/buildTags.js` | Legacy tag-generator; skriver JSON til stdout for omdirigering til `data/tags.json`. | Ja: legacy places/people og overlays. | Generert data via stdout/redirect. | Nei som arbeidsflyt. | Nei. | Generator på legacy datakilder; avklar fortsatt bruk først. |
| Vent | `tools/build_nature_place_candidates.mjs` | Henter Artskart-data og bygger nature-place-kandidatfil. | Ja: place-/naturmanifest og API-data. | Skriver `data/natur/nature_place_map_candidates.json`. | Nei. | **Ja.** | Nettverksgenerator; inkluderer sport i kategorifilteret. |
| Vent | `tools/build_nature_place_candidates_v2.mjs` | Nyere Artskart-kandidatgenerator. | Ja: place-/naturmanifest og API-data. | Skriver `data/natur/nature_place_map_candidates.json`. | Nei. | **Ja.** | Nettverksgenerator; inkluderer sport i kategorifilteret. |
| Vent | `tools/build_place_image_candidates.mjs` | Henter og rangerer place-image-kandidater. | Ja: place-manifest/place-data og eksterne API-er. | Skriver `data/places/place_image_candidates.json`. | Nei. | **Ja.** | Nettverks-/datagenerator og manifestavhengig. |
| Vent | `scripts/generate-civication-mails.js` | Genererer og overskriver Civication work-model-data. | Innebygget generatorinput. | **Muterer `data/Civication/workModels/naeringsliv_work_model.json`.** | Nei. | Nei. | Både Civication og muterende generator. |

## Anbefalt rekkefølge etter denne auditten

1. Migrer `tools/validate_lesespor.mjs` i en isolert PR med uendret valideringssemantikk og uten data-/reportendringer.
2. Migrer `tools/audit-people-split-vs-legacy.mjs` med eksplisitt før/etter-sammenligning av begge rapportfilene.
3. Vent til sport-/place-manifestet er stabilt, og vurder deretter de read-only manifestvalidatorene før rapportgeneratorene.
4. Ta coordinate-familien samlet etter at quality gate og manifestarbeidet er stabilt.
5. Hold Civication, browser-runtime og muterende generatorer utenfor denne migreringsrekken.

## Guardrails bekreftet for denne PR-en

- No TypeScript migration in this PR.
- No data changes.
- No runtime changes.
- No Civication runtime changes.
- Ingen sportfiler eller `data/places/manifest.json` er endret.
- Ingen TypeScript-konfigurasjon, HTML/CSS, browser-runtime eller coordinate quality gate er endret.
- Ingen `dist/`-output eller genererte tool-rapporter er lagt til; kun denne nye auditdokumentasjonen.
