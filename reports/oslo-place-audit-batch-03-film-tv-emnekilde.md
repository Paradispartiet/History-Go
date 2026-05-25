# Oslo place-audit batch 03 — canonical emnekilde for TV_og_Film (rettet)

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

## Filnavn-avklaring (viktig)
- Verifisert canonical emnefil i repoet heter **`emner_film_tv_canonical_v4_5.json`** (uten ekstra `s`).
- Filen `emners_film_tv_canonical_v4_5.json` finnes ikke i repoet.

## Konklusjon om canonical emne-definisjonskilde
Canonical emne-definisjonskilde for `film_tv` er:
- `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json`

## Status for `emner_film_tv_canonical_v4_5.json`
- Vurdering: **gyldig og fullverdig** (ikke tom / ikke ufullstendig).
- Filstørrelse ved verifisering: 1 123 455 bytes.
- Innhold: 120 emner totalt.
- Unikhet: 120 unike `emne_id` (ingen duplikater).
- `em_film_tv_kino_fellesrom`: finnes som full emnedefinisjon (`subject_id: film_tv`).
- `em_film_tv_location_filmsted`: finnes som full emnedefinisjon (`subject_id: film_tv`).

## Funn av `em_film_tv_*` i andre TV/Film-filer
`em_film_tv_kino_fellesrom` og `em_film_tv_location_filmsted` forekommer også i støttefiler:
- `supersetQUIZMAL_film_tv.json`
- `fagkart_film_tv_canonical_v4_5.json`
- `film_tvpensum_canonical_v4_5.json`
- `emnemapping_film_tv_canonical_v4_5.json`
- `methods_film_tv_canonical_v4_5.json`

Vurdering av disse forekomstene:
- Disse filene fungerer som styrings-, mapping-, metode- eller anbefalingslag.
- De er **ikke** primær, fullverdig emne-definisjonskilde.
- Full emne-definisjon ligger i `emner_film_tv_canonical_v4_5.json`.

## Place-filer
- `data/places/film/oslo/places_oslo_film.json` ble kun kontrollert.
- Ingen endringer gjort.
- Ingen `em_film_tv_*` ble koblet tilbake i denne batchen.

## Endrede filer i denne rettingen
- `reports/oslo-place-audit-batch-03-film-tv-emnekilde.md` (oppdatert)

## Emner opprettet i batch 03
- Ingen nye emner opprettet.
- Årsak: de to aktuelle emnene finnes allerede som fullverdige canonical emner i emnefilen.

## Hva bør gjøres i batch 04
1. Reintroduser `em_film_tv_kino_fellesrom` og `em_film_tv_location_filmsted` på relevante Oslo-filmsteder i en egen place-batch.
2. Hold `emner_film_tv_canonical_v4_5.json` som eneste canonical emne-definisjonskilde for `film_tv`.
3. Bruk `emnemapping`, `fagkart`, `methods`, `pensum` og `superset` som støtte-/styringslag, ikke som erstatning for emnedefinisjoner.
4. Kjør place-health etter re-kobling for å verifisere at referansene peker til eksisterende canonical `emne_id`.
