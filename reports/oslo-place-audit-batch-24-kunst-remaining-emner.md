# Oslo place-audit batch 24 — kunst remaining emner

**Dato:** 2026-05-31

## Mål

Verifisere og rydde den siste gjenværende `em_kunst_*`-mangelen etter Batch 23: `em_kunst_materialitet_teknikk_handverk` i Lisboa-kunst, uten å endre place-data, manifest, indeks, UI eller andre fagfamilier.

## Kommandoer kjørt

- `npm run places:emner:check` før endring
- `rg -n "em_kunst_materialitet_teknikk_handverk|materialitet|teknikk|håndverk|handverk|azulejo|flis|glasur|pigment|ornament" data/fag/kunst reports data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json`
- `find data/fag/kunst -type f -iname '*emner*canonical*.json' -print | sort`
- `python -m json.tool data/fag/kunst/emner_kunst_canonical_v4_5.json >/dev/null`
- `npm run places:emner:check` etter endring
- `npm run places:index:check`
- `npm run health:places`
- `git diff --name-only`
- `git status --short`

## Filer undersøkt

- `reports/oslo-place-audit-batch-12-current-missing-emne-ids.md`
- `reports/oslo-place-audit-batch-23-politikk-remaining-emner.md`
- `tools/check_place_emne_ids.mjs`
- `data/fag/kunst/SET_MAL_README_kunst.md`
- `data/fag/kunst/emnemapping_kunst_canonical_v4_5.json`
- `data/fag/kunst/emner_kunst_canonical_v4_5.json`
- `data/fag/kunst/fagkart_kunst_canonical_v4_5.json`
- `data/fag/kunst/kunstpensum_canonical_v4_5.json`
- `data/fag/kunst/methods_kunst_canonical_v4_5.json`
- `data/fag/kunst/quiz_generator_rules_kunst_v5_1_source_priority_patch.json`
- `data/fag/kunst/supersetQUIZMAL_kunst.json`
- `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json` kun som kontekst

## Før-status

`npm run places:emner:check` rapporterte fortsatt `em_kunst_materialitet_teknikk_handverk` som missing før batchen.

- Missing emne_ids: **8**
- `em_kunst_materialitet_teknikk_handverk`: **1 forekomst**
- Place-fil: `data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json`
- Place-id: `lisbon_museu_nacional_do_azulejo`
- Duplicate emne_ids within same place: **0**
- Duplicate place ids across active files: **0**
- Duplicate canonical emne_ids across canonical files: **0**

## Funn og vurdering

Søk i `data/fag/kunst/**`, rapporter og Lisboa-kunst place-filen viste at `em_kunst_materialitet_teknikk_handverk` ikke fantes som fullverdig emneobjekt i kunst-fagdata fra før. ID-en fantes som missing i rapportene og som emne_id på `lisbon_museu_nacional_do_azulejo`.

Place-konteksten gjør emnet faglig avgrenset og nødvendig: Museu Nacional do Azulejo handler eksplisitt om azulejo som glaserte keramikkfliser, materialitet, teknikk, flisens størrelse, glasur, motivvalg og kunst-/bruksteknologi. Dette er smalere enn det eksisterende brede `em_kunst_teknologi_og_materialitet`, fordi det nye emnet krever konkret materiale-, teknikk-, håndverks- eller verkstedanker.

## Endring gjort

Opprettet `em_kunst_materialitet_teknikk_handverk` som fullverdig canonical kunst-emne i `data/fag/kunst/emner_kunst_canonical_v4_5.json` med eksisterende kunst-emnestruktur og `emne_id`-felt.

Avgrensningen er materialitet, teknikk, håndverk, verkstedpraksis, keramikk/fliser/azulejo, pigment, glasur, overflate, ornament og materiell kultur. Emnet er ikke gjort til generell kunsthistorie, arkitekturhistorie, design eller byhistorie; `scope_guard`, `generator_use_note`, `generator_constraints` og `anti_patterns` krever konkret material- eller teknikkanker.

## Utsatt / ikke gjort

- Ingen `em_naering_*` ble rørt; næringslivsvariantene står igjen til samlet batch.
- Ingen place-data ble migrert eller endret.
- Ingen alias-schema eller alias-mini-schema ble innført.
- Ingen manifest-, indeks-, UI-, CSS-, HTML- eller JS-endringer ble gjort.

## Etter-status

### `npm run places:emner:check`

Kommandoen returnerer fortsatt exit code 1 fordi syv `em_naering_*`-forekomster fortsatt er missing, men Batch 24-målet er oppnådd:

- Missing emne_ids: **7**
- Gjenværende `em_kunst_*`: **0**
- Canonical emne ids loaded: **995**
- Duplicate emne_ids within same place: **0**
- Duplicate place ids across active files: **0**
- Duplicate canonical emne_ids across canonical files: **0**

Gjenværende missing etter Batch 24:

- `em_naering_logistikk_handel_flyt` — 2 forekomster
- `em_naering_lager_terminal_infrastruktur` — 1 forekomst
- `em_naering_havn_sjofart` — 1 forekomst
- `em_naering_telekom_infrastruktur` — 1 forekomst
- `em_naering_modernisering_teknologi` — 1 forekomst
- `em_naering_transport_infrastruktur` — 1 forekomst

### `npm run places:index:check`

OK: `places_index.json is in sync with source place files.`

### `npm run health:places`

OK for error-gate:

- Files checked: 40
- Places checked: 470
- Hidden places: 0
- Stub places: 0
- Canonical emne files checked: 16
- emne_ids checked: 1051
- Canonical emne_ids: 1044
- Unknown emne_ids: 7
- Wrong-prefix emne_ids: 302
- Errors: 0
- Warnings: 1326

## Endringskontroll

Intended patchen består kun av:

- `data/fag/kunst/emner_kunst_canonical_v4_5.json`
- `reports/oslo-place-audit-batch-24-kunst-remaining-emner.md`

Bekreftelser:

- Ingen `data/places/**`-filer ble endret.
- `data/places/places_index.json` ble ikke endret.
- Manifest ble ikke endret.
- Ingen alias-schema ble innført.
- Ingen `em_naering_*` ble endret.

## Anbefalt Batch 25

Batch 25 bør ta de gjenværende seks unike `em_naering_*`-ID-ene samlet, fordi de henger sammen tematisk rundt havn, logistikk, lager/terminal, telekom, modernisering/teknologi og transportinfrastruktur i `data/places/naeringsliv/oslo/places_naeringsliv.json`.
