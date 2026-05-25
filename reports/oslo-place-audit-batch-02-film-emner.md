# Oslo place-audit batch 02 — film-emner

**Dato:** 2026-05-25

## Endrede filer
- `data/places/film/oslo/places_oslo_film.json`
- `reports/oslo-place-audit-batch-02-film-emner.md`

## Emne-ID-er funnet eller opprettet
Ingen nye emner ble opprettet i batch 02.

Etter ny verifisering mot faktisk emne-definisjonsgrunnlag ble `em_film_tv_kino_fellesrom` og `em_film_tv_location_filmsted` fjernet fra place-koblingene i denne PR-en (Løsning B), slik at filmstedene kun bruker trygt verifiserte `em_pop_*`-emner.

Brukte emner i batch 02:
- `em_pop_kino_populaer_offentlighet`
- `em_pop_publikum_rytme_vaner`
- `em_pop_serier_foljetong_ritual`
- `em_pop_sted_kulisse_lokasjon`

## Filmsteder koblet til emne-ID-er
- `saga_kino`
  - `em_pop_kino_populaer_offentlighet`
  - `em_pop_publikum_rytme_vaner`
- `klingenberg_kino`
  - `em_pop_kino_populaer_offentlighet`
  - `em_pop_publikum_rytme_vaner`
- `gimle_kino`
  - `em_pop_kino_populaer_offentlighet`
  - `em_pop_publikum_rytme_vaner`
- `vika_kino`
  - `em_pop_kino_populaer_offentlighet`
  - `em_pop_publikum_rytme_vaner`
- `hartvig_nissens_skole_skam`
  - `em_pop_serier_foljetong_ritual`
  - `em_pop_sted_kulisse_lokasjon`

## Emner vurdert, men ikke brukt
- `em_film_tv_kino_fellesrom` (fjernet i batch 02 etter verifiseringskrav om emne-definisjonskilde)
- `em_film_tv_location_filmsted` (fjernet i batch 02 etter verifiseringskrav om emne-definisjonskilde)
- `em_pop_film_tv_format` (for bredt når mer presise kino-/serie-/lokasjons-emner finnes)

## Gjenstående hull for batch 03
- Avklare og dokumentere én entydig canonical emne-definisjonskilde for `TV_og_Film` før `em_film_tv_*` kobles på nye steder igjen.
- Eventuelt reintrodusere film/TV-emner på disse stedene i en egen oppfølgings-PR når definisjonskilden er bekreftet.
