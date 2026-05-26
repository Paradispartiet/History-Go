# Oslo place-audit batch 04 — verifisering av canonical TV/Film-emner (korrigert)

**Dato:** 2026-05-26

## Bakgrunn for korrigering
Forrige versjon av batch 04 overskrev ved en feil `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json` og ga stor deletion i diff. Denne korrigeringen gjenoppretter eksisterende canonical emnefil fra base/main og dokumenterer faktisk status.

## Undersøkte filer
- `data/fag/TV_og_Film/supersetQUIZMAL_film_tv.json`
- `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json`
- `data/fag/TV_og_Film/fagkart_film_tv_canonical_v4_5.json`
- `data/fag/TV_og_Film/film_tvpensum_canonical_v4_5.json`
- `data/fag/TV_og_Film/emnemapping_film_tv_canonical_v4_5.json`
- `data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json`
- `data/fag/popkultur/emner_populaerkultur_canonical_v4_5.json`
- `data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json`
- `reports/oslo-place-audit-batch-03-film-tv-emnekilde.md`

## Faktisk handling i denne korrigeringen
- Gjenopprettet `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json` til eksisterende innhold fra base/main.
- Verifisert at `em_film_tv_kino_fellesrom` og `em_film_tv_location_filmsted` allerede finnes i den eksisterende canonical emnefilen.
- Derfor er det **ikke gjort additiv innsats i emnearrayet** i denne korrigeringen.

## Endrede filer
- `reports/oslo-place-audit-batch-04-film-tv-emner.md`

## Status på canonical emnefil
- `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json` er gyldig JSON og ikke tom.
- Filen inneholder eksisterende full emnemengde (120 emner).
- De to mål-emnene finnes allerede:
  1. `em_film_tv_kino_fellesrom`
  2. `em_film_tv_location_filmsted`

## Konsekvens for videre arbeid
- Ingen datatap i canonical emnefil.
- Ingen masse-sletting i diff.
- Ingen place-filer er endret.
- Ingen endringer i UI, CSS, HTML, JS eller manifest.

## Batch 05 (videre steg)
1. Bruke de allerede eksisterende emnene selektivt i neste place-batch med dokumenterbare kilder per sted.
2. Verifisere source-first og konkret verk/scene/location-ankring ved reintroduksjon.
3. Kjør ny audit etter place-koblingene.
