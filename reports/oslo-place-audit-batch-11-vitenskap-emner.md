# Oslo place-audit batch 11 — vitenskap emner

**Dato:** 2026-05-26

## Formål
Verifisere manglende `em_vit_*` i place-emne-validering mot eksisterende vitenskap-fagdata, og gjøre kun fullverdige eksisterende vitenskap-emner synlige i canonical emne-kilde.

## Kommandoer kjørt
- `npm run places:emner:check` (før)
- `npm run places:emner:check` (etter)
- `npm run places:index:check`
- `npm run health:places`

## Filer undersøkt
- `tools/check_place_emne_ids.mjs`
- `reports/place-emne-missing-audit-batch-07.json`
- `reports/oslo-place-audit-batch-10-sport-emner.md`
- `data/fag/vitenskap/SET_MAL_README_vitenskap_v4_3.md`
- `data/fag/vitenskap/vitenskappensum_canonical_v4_5.json`
- `data/fag/vitenskap/fagkart_vitenskap_canonical_v4_5.json`
- `data/fag/vitenskap/supersetQUIZMAL_vitenskap.json`
- `data/fag/vitenskap/quiz_generator_rules_vitenskap_v5_1_source_priority_patch.json`
- `data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json`
- `data/fag/emner_vitenskap.json`
- `data/places/vitenskap/oslo/places_vitenskap.json` (kontekst)
- `data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json` (kontekst)

## Manglende `em_vit_*` før batch 11
Fra `npm run places:emner:check` før endring:
- `em_vit_kjemi_laboratorium`
- `em_vit_eksperiment_maling`
- `em_vit_feltarbeid_observasjon`
- `em_vit_miljo_okologi_system`
- `em_vit_kunnskap_formidling_utdanning`
- `em_vit_matematikk_modellering`
- `em_vit_vitenskapshistorie_personer`
- `em_vit_hist_teknologi`
- `em_vit_teknologi_innovasjon`
- `em_vit_medisin_helse`
- `em_vit_sannhet_maling_modeller`
- `em_vit_samfunnsrolle`
- `em_vit_byen_som_kunnskapskart`

## Verifisering mot eksisterende vitenskap-data
Søkt i vitenskap-filer med canonical scan-pattern (`emner*_canonical*.json`) og øvrige vitenskap-kilder.

### Fantes som fullverdige emneobjekter i eksisterende data
I `data/fag/emner_vitenskap.json` ble følgende fullverdige objekter funnet:
- `em_vit_hist_teknologi`
- `em_vit_sannhet_maling_modeller`
- `em_vit_samfunnsrolle`
- `em_vit_byen_som_kunnskapskart`

### Ikke funnet som fullverdige emneobjekter i undersøkte vitenskap-kilder
- `em_vit_kjemi_laboratorium`
- `em_vit_eksperiment_maling`
- `em_vit_feltarbeid_observasjon`
- `em_vit_miljo_okologi_system`
- `em_vit_kunnskap_formidling_utdanning`
- `em_vit_matematikk_modellering`
- `em_vit_vitenskapshistorie_personer`
- `em_vit_teknologi_innovasjon`
- `em_vit_medisin_helse`

## Canonical justering gjennomført
Canonical vitenskap-emnefil eksisterte allerede og matcher checkerens scan-pattern:
- `data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json`

Tiltak:
- Lagt inn kun de 4 fullverdige, eksisterende vitenskap-emnene fra `data/fag/emner_vitenskap.json`.
- Ingen alias-felter, ingen mini-schema, ingen place-endringer.

## Utsatt og hvorfor
Følgende `em_vit_*` er utsatt fordi de ikke ble funnet som fullverdige emneobjekter i undersøkte vitenskap-kilder:
- `em_vit_kjemi_laboratorium`
- `em_vit_eksperiment_maling`
- `em_vit_feltarbeid_observasjon`
- `em_vit_miljo_okologi_system`
- `em_vit_kunnskap_formidling_utdanning`
- `em_vit_matematikk_modellering`
- `em_vit_vitenskapshistorie_personer`
- `em_vit_teknologi_innovasjon`
- `em_vit_medisin_helse`

Begrunnelse: kun place-referanser eller fravær i fullverdig emnedefinisjon i eksisterende undersøkte vitenskap-fagdata.

## Før/etter-resultat
- Før batch 11 (`npm run places:emner:check`):
  - `Missing emne_ids: 69`
- Etter batch 11 (`npm run places:emner:check`):
  - `Missing emne_ids: 58`

Reduksjon: **11** manglende emne_ids totalt.

## Validering etter endring
- `npm run places:emner:check`
  - Fortsatt non-zero pga andre fagfamilier + utsatte `em_vit_*`.
- `npm run places:index:check`
  - OK (`places_index.json is in sync with source place files.`)
- `npm run health:places`
  - `Errors: 0`
  - `Unknown emne_ids: 58`
  - `Warnings: 1383`

## Anbefalt Batch 12
1. Fortsett med neste største gjenværende canonical-gap utenfor vitenskap (f.eks. litteratur/media/musikk/natur/subkultur).
2. For vitenskap: avklar om de 9 utsatte `em_vit_*` har fullverdige definisjoner i annen godkjent kilde eller skal fases ut/erstattes i places i en senere migreringsbatch.
3. Hold samme strategi: kun fullverdige canonical-emner, ingen alias-mini-schema, ingen endring av place-filer i canonical-batcher.
