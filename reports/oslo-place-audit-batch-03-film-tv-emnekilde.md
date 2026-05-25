# Oslo place-audit batch 03 — canonical emnekilde for TV_og_Film

**Dato:** 2026-05-25

## Undersøkte filer
- `data/fag/TV_og_Film/supersetQUIZMAL_film_tv.json`
- `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json`
- `data/fag/TV_og_Film/fagkart_film_tv_canonical_v4_5.json`
- `data/fag/TV_og_Film/film_tvpensum_canonical_v4_5.json`
- `data/fag/TV_og_Film/emnemapping_film_tv_canonical_v4_5.json`
- `data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json`
- `data/places/film/oslo/places_oslo_film.json`
- `reports/oslo-place-audit-batch-02-film-emner.md`

## Konklusjon om canonical emne-definisjonskilde
Canonical emne-definisjonskilde for `film_tv` er:
- `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json`

Filen er **ikke tom**, har gyldig JSON-format, og inneholder fullverdige emnedefinisjoner.

## Status for `emner_film_tv_canonical_v4_5.json`
- Vurdering: **gyldig og fullverdig** (ikke tom / ikke ufullstendig).
- Innhold: 120 emner totalt.
- Unikhet: 120 unike `emne_id` (ingen duplikater).
- `em_film_tv_kino_fellesrom`: finnes som full emnedefinisjon (`subject_id: film_tv`).
- `em_film_tv_location_filmsted`: finnes som full emnedefinisjon (`subject_id: film_tv`).

## Funn av `em_film_tv_*` i andre TV/Film-filer
`em_film_tv_kino_fellesrom` og `em_film_tv_location_filmsted` forekommer også i flere støttefiler:
- `supersetQUIZMAL_film_tv.json` (anbefalte/retningsgivende lister og profiler)
- `fagkart_film_tv_canonical_v4_5.json` (fagkart/hook-struktur)
- `film_tvpensum_canonical_v4_5.json` (pensum/kurateringsnivå)
- `emnemapping_film_tv_canonical_v4_5.json` (mapping mellom emne og fagkart)
- `methods_film_tv_canonical_v4_5.json` (metode-affiniteter)

Vurdering av disse forekomstene:
- Disse filene fungerer som styrings-, mapping-, metode- eller anbefalingslag.
- De er **ikke** den primære, fullverdige emne-definisjonskilden.
- Full emne-definisjon ligger i `emner_film_tv_canonical_v4_5.json`.

## Place-filer
- `data/places/film/oslo/places_oslo_film.json` ble kun kontrollert.
- Ingen endringer gjort.
- Ingen `em_film_tv_*` ble koblet tilbake i denne batchen.

## Endrede filer i batch 03
- `reports/oslo-place-audit-batch-03-film-tv-emnekilde.md` (ny)

## Emner opprettet i batch 03
- Ingen nye emner opprettet.
- Årsak: de to aktuelle emnene finnes allerede som fullverdige canonical emner i emnefilen.

## Hva bør gjøres i batch 04
1. Reintroduser `em_film_tv_kino_fellesrom` og `em_film_tv_location_filmsted` på relevante Oslo-filmsteder i en egen place-batch.
2. Hold `emner_film_tv_canonical_v4_5.json` som eneste canonical emne-definisjonskilde for `film_tv`.
3. Bruk `emnemapping`, `fagkart`, `methods`, `pensum` og `superset` som støtte-/styringslag, ikke som erstatning for emnedefinisjoner.
4. Kjør place-health etter re-kobling for å verifisere at referansene peker til eksisterende canonical `emne_id`.
