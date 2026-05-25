# Oslo place-audit batch 02 — film-emner

**Dato:** 2026-05-25

## Endrede filer
- `data/places/film/oslo/places_oslo_film.json`
- `reports/oslo-place-audit-batch-02-film-emner.md`

## Emne-ID-er funnet eller opprettet
Ingen nye emner ble opprettet i batch 02. Alle koblinger bruker eksisterende, gyldige emner fra canonical fagdata:

- `em_pop_kino_populaer_offentlighet`
- `em_pop_publikum_rytme_vaner`
- `em_film_tv_kino_fellesrom`
- `em_pop_serier_foljetong_ritual`
- `em_pop_sted_kulisse_lokasjon`
- `em_film_tv_location_filmsted`

## Filmsteder koblet til emne-ID-er
- `saga_kino`
  - `em_pop_kino_populaer_offentlighet`
  - `em_pop_publikum_rytme_vaner`
  - `em_film_tv_kino_fellesrom`
- `klingenberg_kino`
  - `em_pop_kino_populaer_offentlighet`
  - `em_pop_publikum_rytme_vaner`
  - `em_film_tv_kino_fellesrom`
- `gimle_kino`
  - `em_pop_kino_populaer_offentlighet`
  - `em_pop_publikum_rytme_vaner`
  - `em_film_tv_kino_fellesrom`
- `vika_kino`
  - `em_pop_kino_populaer_offentlighet`
  - `em_pop_publikum_rytme_vaner`
  - `em_film_tv_kino_fellesrom`
- `hartvig_nissens_skole_skam`
  - `em_pop_serier_foljetong_ritual`
  - `em_pop_sted_kulisse_lokasjon`
  - `em_film_tv_location_filmsted`

## Emner vurdert, men ikke brukt
- `em_pop_film_tv_format` (for bredt når stedene allerede kan få mer presise kino-/serie-/lokasjons-emner)
- `em_film_tv_filmhistorisk_formidling` (passer bedre til institusjonell filmarv/kuratering enn disse fem stedene samlet)
- `em_film_tv_tv_offentlighet` (for generell ift. konkret SKAM-lokasjon)

## Gjenstående hull for batch 03
- Verifisere om flere film-/TV-steder i Oslo trenger samme «kino + publikum + sted» triade for konsistent tagging.
- Vurdere om det trengs en tydelig retningslinje for når `em_film_tv_location_filmsted` skal kombineres med popkultur-emner i mixed kategori-filer.
