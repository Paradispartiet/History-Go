# Oslo place-audit batch 05 — reintroduksjon av verifiserte TV/Film-emner i Oslo-filmsteder

**Dato:** 2026-05-26

## Filer undersøkt
- `data/places/film/oslo/places_oslo_film.json`
- `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json`
- `data/fag/popkultur/emner_populaerkultur_canonical_v4_5.json`
- `reports/oslo-place-audit-batch-02-film-emner.md`
- `reports/oslo-place-audit-batch-03-film-tv-emnekilde.md`
- `reports/oslo-place-audit-batch-04-film-tv-emner.md`

## Filer endret
- `data/places/film/oslo/places_oslo_film.json`
- `reports/oslo-place-audit-batch-05-film-tv-place-koblinger.md`

## Bekreftelse på canonical TV/Film-emner
Verifisert at begge emnene finnes i `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json`:
- `em_film_tv_kino_fellesrom`
- `em_film_tv_location_filmsted`

## Nye emne-koblinger lagt til i batch 05
- `saga_kino`
  - lagt til: `em_film_tv_kino_fellesrom`
- `klingenberg_kino`
  - lagt til: `em_film_tv_kino_fellesrom`
- `gimle_kino`
  - lagt til: `em_film_tv_kino_fellesrom`
- `vika_kino`
  - lagt til: `em_film_tv_kino_fellesrom`
- `hartvig_nissens_skole_skam`
  - lagt til: `em_film_tv_location_filmsted`

## Eksisterende emne_ids beholdt
- Kinoene beholdt eksisterende `em_pop_*`:
  - `em_pop_kino_populaer_offentlighet`
  - `em_pop_publikum_rytme_vaner`
- Hartvig Nissens skole beholdt eksisterende `em_pop_*`:
  - `em_pop_serier_foljetong_ritual`
  - `em_pop_sted_kulisse_lokasjon`

## Vurderte steder som ikke ble endret
Ingen andre steder i `data/places/film/oslo/places_oslo_film.json` ble vurdert for endring i denne batchen, siden filen kun inneholder de fem avtalte place-id-ene for oppgaven.

## Validering utført
- JSON-validitet kontrollert for endret place-fil.
- Verifisert at alle `emne_ids` på de fem stedene finnes i gyldige emne-kilder:
  - `em_pop_*` i popkultur canonical
  - `em_film_tv_*` i TV/Film canonical
- Verifisert at ingen place-id-er er duplisert.
- Verifisert at ingen `emne_ids` er duplisert internt per sted.
- Verifisert at diff kun berører:
  - `data/places/film/oslo/places_oslo_film.json`
  - `reports/oslo-place-audit-batch-05-film-tv-place-koblinger.md`

## Forslag til batch 06
1. Kjør utvidet tverrfaglig audit for tilsvarende TV/Film-reintroduksjon i andre by-/film-place-filer (om aktuelt), med samme source-first-prinsipp.
2. Legg inn automatisert valideringssteg i CI for:
   - emne-id finnes i canonical-kilder
   - ingen duplikate emne_ids per sted
   - ingen duplikate place-id-er i place-filer.
3. Dokumenter tydelig regelsett for når `em_film_tv_location_filmsted` skal brukes (konkret verk-/lokasjonsankring) vs. når generelle kino-emner er tilstrekkelig.
