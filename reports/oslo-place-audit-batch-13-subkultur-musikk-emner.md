# Oslo place audit — Batch 13 (subkultur + musikk emner)

**Dato:** 2026-05-26

## Kommandoer kjørt
1. `npm run places:emner:check` (før endringer)
2. `rg -n "em_sub_grunnbegreper|em_sub_musikkscener|em_sub_stil_kropp_symboler|em_mus_musikk_som_sosial_energi|em_mus_lydlandskap_byen|em_musikk_musikk_som_sosial_energi|em_musikk_lydlandskap_byen" ...`
3. `npm run places:emner:check` (etter endringer)
4. `npm run places:index:check`
5. `npm run health:places`

## Filer undersøkt
- `reports/oslo-place-audit-batch-12-current-missing-emne-ids.md`
- `reports/place-emne-missing-audit-batch-12.json`
- `tools/check_place_emne_ids.mjs`
- `data/places/subkultur/europe/portugal/lisbon/places_lisbon_subkultur.json`
- `data/fag/subkultur/emner_subkulturhgbn.json`
- `data/fag/subkultur/emner_subkultur_canonical_v4_5.json`
- `data/fag/musikk/emner_musikk_canonical_v4_5.json`
- `data/fag/musikk/emnergvb_musikk.json`
- `data/fag/fagkart.json`

## Missing emner før batchen (relevant scope)
Fra batch-12-rapport + baseline-kjøring:
- `em_sub_grunnbegreper` — 5 forekomster
- `em_sub_musikkscener` — 4 forekomster
- `em_sub_stil_kropp_symboler` — 1 forekomst
- `em_mus_musikk_som_sosial_energi` — 3 forekomster
- `em_mus_lydlandskap_byen` — 1 forekomst

## Verifisering av fullverdige emner
### Subkultur (`em_sub_*`)
Følgende finnes som fullverdige emneobjekter i `data/fag/subkultur/emner_subkulturhgbn.json`:
- `em_sub_grunnbegreper`
- `em_sub_musikkscener`
- `em_sub_stil_kropp_symboler`

Alle tre har full definisjon (title, description, keywords, dimensions, core_concepts, key_terms, blindspots, status).

### Musikk (`em_mus_*`)
- `em_mus_musikk_som_sosial_energi`: **ikke funnet** som fullverdig emneobjekt i musikk-canonical eller musikk-kildedata.
- `em_mus_lydlandskap_byen`: **ikke funnet** som fullverdig emneobjekt i musikk-canonical eller musikk-kildedata.
- I `data/fag/fagkart.json` finnes begreps-IDer `musikk_som_sosial_energi` og `lydlandskap_byen`, men dette er ikke canonical `emne_id`-objekter.

## Hvilke ble gjort canonical
I denne batchen ble følgende subkultur-emner gjort synlige i canonical fil:
- `em_sub_grunnbegreper`
- `em_sub_musikkscener`
- `em_sub_stil_kropp_symboler`

Endret fil:
- `data/fag/subkultur/emner_subkultur_canonical_v4_5.json`

## Utsatt og hvorfor
- `em_mus_musikk_som_sosial_energi` — utsatt, ingen fullverdig canonical-klar emnepost funnet i musikkdata.
- `em_mus_lydlandskap_byen` — utsatt, ingen fullverdig canonical-klar emnepost funnet i musikkdata.

## Prefixvurdering: `em_mus_*`
Vurdering: **prefixdrift sannsynlig**.
- Musikksubjektet bruker i canonical `em_musikk_*`-prefix.
- De manglende IDene i places bruker `em_mus_*` og matcher ikke eksisterende canonical navngiving.
- Ingen fullverdige `em_musikk_*`-objekter med tilsvarende semantikk ble funnet i denne batchen.

Konsekvens:
- Ingen place-migrering i Batch 13 (i tråd med scope).
- Anbefal separat mapping/migrering i senere batch når canonical musikk-emner for disse begrepene er avklart.

## Før/etter: `npm run places:emner:check`
- **Før:** 65 missing emne_ids
- **Etter:** 55 missing emne_ids
- **Netto:** -10 missing (tilsvarer 5+4+1 subkultur-forekomster)

## Resultat: `npm run places:index:check`
- Bestått: `places_index.json is in sync with source place files.`

## Resultat: `npm run health:places`
- Kjøring fullført uten errors.
- Oppsummert:
  - `Errors: 0`
  - `Unknown emne_ids: 55`
  - `Wrong-prefix emne_ids: 307`
  - `Warnings: 1380`

## Anbefalt Batch 14
1. Ta musikk-familien eksplisitt:
   - avklar canonical emner for «musikk som sosial energi» og «byen som lydlandskap» i `em_musikk_*`-struktur.
2. Deretter planlegg kontrollert place-migrering fra `em_mus_*` til riktige `em_musikk_*` id-er (egen batch).
3. Alternativt prioritér neste lav-risiko cluster i samme Lisbon-løp med høy forekomst og eksisterende fullverdige emneobjekter.
