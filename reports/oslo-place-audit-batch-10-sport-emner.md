# Oslo place-audit batch 10 — sport emner

**Dato:** 2026-05-26

## Formål
Verifisere manglende `em_sport_*` i place-emne-validering mot eksisterende sport-fagdata, og gjøre fullverdige sport-emner synlige i canonical emne-kilde uten å endre place-data.

## Kommandoer kjørt
- `npm run places:emner:check` (før)
- `npm run places:emner:check` (etter)
- `npm run places:index:check`
- `npm run health:places`

## Filer undersøkt
- `tools/check_place_emne_ids.mjs`
- `reports/place-emne-missing-audit-batch-07.json`
- `reports/oslo-place-audit-batch-09-naeringsliv-emner.md`
- `data/fag/sport/emner_ffg.json`
- `data/fag/sport/fagkart_sport_canonical_v4_5.json`
- `data/fag/sport/methods_sport_canonical_v4_5.json`
- `data/fag/sport/supersetQUIZMAL_sport.json`
- `data/fag/sport/quiz_generator_rules_sport_v5_1_source_priority_patch.json`
- `data/fag/sport/emner_sport_canonical_v4_5.json`
- `data/places/sport/oslo/places_sport.json` (kontekst)
- `data/places/sport/oslo/places_oslo_lekeplasser_trening.json` (kontekst)
- `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json` (kontekst)

## Manglende `em_sport_*` før batch 10
Fra `npm run places:emner:check` før endring:
- `em_sport_idrettsgeografi`
- `em_sport_kropp_konkurranse`

Disse forekom i:
- `data/places/sport/oslo/places_oslo_lekeplasser_trening.json`
- `data/places/sport/europe/portugal/lisbon/places_lisbon_sport.json`

## Verifisering mot eksisterende sport-fagdata
Begge manglende emner finnes allerede som fullverdige emneobjekter i:
- `data/fag/sport/emner_ffg.json`

Verifisert som komplette objekter med etablert `emne_id`-schema (ikke alias/mini-schema):
- `em_sport_kropp_konkurranse`
- `em_sport_idrettsgeografi`

## Canonical justering gjennomført
Canonical sport-emnefil fantes allerede og matcher checkerens scan-pattern:
- `data/fag/sport/emner_sport_canonical_v4_5.json` (`emner*_canonical*.json`)

Tiltak:
- La inn de to fullverdige emneobjektene fra `emner_ffg.json` i `emner_sport_canonical_v4_5.json`.
- Ingen alias-felter, ingen korte poster, ingen schema-endring.
- Ingen place-filer endret.

## Utsatt
Ingen `em_sport_*` gjenstår som manglende etter denne batchen.

## Før/etter-resultat
- Før batch 10 (`npm run places:emner:check`):
  - `Missing emne_ids: 110`
- Etter batch 10 (`npm run places:emner:check`):
  - `Missing emne_ids: 76`

Reduksjon: **34** manglende emne_ids (sport-emnene var brukt på mange steder).

## Validering etter endring
- `npm run places:emner:check`:
  - fortsatt non-zero i praksis pga andre fagfamilier, men `em_sport_*`-mangler er borte.
- `npm run places:index:check`:
  - OK (`places_index.json is in sync with source place files.`)
- `npm run health:places`:
  - `Errors: 0`
  - `Unknown emne_ids: 76`
  - `Warnings: 1401`

## Anbefalt Batch 11
Fokuser neste batch på neste største gjenværende canonical-gap utenfor sport, f.eks. litteratur/media/vitenskap eller legacy `em_naering_*`-varianter, med samme strategi:
1. verifiser mot eksisterende fullverdige emner,
2. gjør kun fullverdige emner synlige i canonical,
3. hold place-data urørt,
4. dokumenter rene legacy/place-varianter som utsatt.
