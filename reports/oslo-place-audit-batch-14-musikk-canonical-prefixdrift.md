# Oslo place audit — Batch 14 (musikk canonical prefixdrift)

**Dato:** 2026-05-26

## Kommandoer kjørt
1. `npm run places:emner:check` (før endringer)
2. `rg -n "em_mus_musikk_som_sosial_energi|em_mus_lydlandskap_byen|em_musikk_musikk_som_sosial_energi|em_musikk_lydlandskap_byen|musikk_som_sosial_energi|lydlandskap_byen" data/fag/musikk data/fag/fagkart.json reports/place-emne-missing-audit-batch-12.json data/places/musikk/oslo/places_musikk.json data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json`
3. `npm run places:emner:check` (etter canonical-emne-endring)
4. `npm run places:index:check`
5. `npm run health:places`

## Filer undersøkt
- `reports/oslo-place-audit-batch-13-subkultur-musikk-emner.md`
- `reports/place-emne-missing-audit-batch-12.json`
- `tools/check_place_emne_ids.mjs`
- `data/fag/musikk/emner_musikk_canonical_v4_5.json`
- `data/fag/musikk/emnergvb_musikk.json`
- `data/fag/musikk/fagkart_musikk_canonical_v4_5.json`
- `data/fag/musikk/musikkpensum_canonical_v4_5.json`
- `data/fag/musikk/supersetQUIZMAL_musikk.json`
- `data/fag/fagkart.json`
- `data/places/musikk/oslo/places_musikk.json` (kun kontekst)
- `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json` (kun kontekst)

## Hva Batch 13 fant
Batch 13 dokumenterte at:
- `em_mus_musikk_som_sosial_energi` og `em_mus_lydlandskap_byen` manglet som fullverdige canonical musikk-emner.
- Begrepene fantes i fagkart som hook/tema, men ikke som canonical emneobjekter.
- Prefixdrift var sannsynlig, fordi musikk-canonical bruker `em_musikk_*`, mens places brukte `em_mus_*`.

## Prefixvurdering (`em_mus_*`)
Vurdering i Batch 14: `em_mus_*` er fortsatt feil prefix i musikk-kontekst.
- Musikksystemet har eksplisitt `emne_prefix_required: em_musikk_` i musikk-fagkartet.
- `em_mus_*` ble derfor ikke gjort canonical og ble ikke lagt inn som alias.

## Fantes tilsvarende `em_musikk_*` fra før?
- `em_musikk_musikk_som_sosial_energi`: fantes **ikke** fra før som fullverdig canonical emneobjekt.
- `em_musikk_lydlandskap_byen`: fantes **ikke** fra før som fullverdig canonical emneobjekt.
- Begrepene var representert i `data/fag/fagkart.json` via `musikk_som_sosial_energi` og `lydlandskap_byen`.

## Hvilke emner ble opprettet/gjort canonical
Følgende fullverdige canonical musikk-emner ble opprettet i:
`data/fag/musikk/emner_musikk_canonical_v4_5.json`

1. `em_musikk_musikk_som_sosial_energi`
2. `em_musikk_lydlandskap_byen`

Begge er lagt inn med full musikk-schema-stil (definition, why_it_matters, keywords, core/sub concepts, methods, related emner, place fit, theory hooks, constraints m.m.), ikke som korte placeholders.

## Bekreftelse: ingen place-filer endret
- Ingen filer under `data/places/**` er endret i denne batchen.
- Ingen manifest-fil er endret.

## Hvorfor `em_mus_*` ikke ble lagt inn som alias/canonical
- Batch-målet var å etablere riktig canonical mål i musikkfamilien før migrering.
- Å gjøre `em_mus_*` canonical/alias ville sementere prefixdrift og bryte navnekonvensjonen `em_musikk_*`.
- Riktig strategi er to-trinns:
  1) etablere canonical `em_musikk_*` (Batch 14)
  2) migrere place-referanser fra `em_mus_*` til `em_musikk_*` (Batch 15)

## Før/etter: `npm run places:emner:check`
- **Før:** 55 missing emne_ids.
- **Etter:** 55 missing emne_ids.
- De to `em_mus_*` er fortsatt missing i places-check (forventet), siden place-data ikke migreres i Batch 14.
- Canonical emne-id-telling økte fra 971 til 973.

## Resultat: `npm run places:index:check`
- Bestått: `places_index.json is in sync with source place files.`

## Resultat: `npm run health:places`
- Kjøring fullført uten errors.
- Oppsummert:
  - `Errors: 0`
  - `Unknown emne_ids: 55`
  - `Wrong-prefix emne_ids: 307`
  - `Warnings: 1380`

## Anbefalt Batch 15
1. Migrer place-referanser kontrollert:
   - `em_mus_musikk_som_sosial_energi` → `em_musikk_musikk_som_sosial_energi`
   - `em_mus_lydlandskap_byen` → `em_musikk_lydlandskap_byen`
2. Begrens migrering til berørte place-filer først (`oslo musikk` + `lisbon subkultur`) for lav risiko.
3. Kjør minst:
   - `npm run places:emner:check`
   - `npm run places:index:check`
   - `npm run health:places`
4. Dokumenter reduksjon i missing/wrong-prefix etter migrering.
