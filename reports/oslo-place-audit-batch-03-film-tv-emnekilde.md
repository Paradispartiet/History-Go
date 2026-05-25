# Oslo place-audit batch 03 — canonical emnekilde for TV_og_Film (status: ikke avklart)

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

## Problem observert i PR #646
Ved direkte lesing av PR-head fremstår `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json` som tom (`content: ""`).

Det betyr at canonical emne-definisjonskilde for TV/Film **ikke kan dokumenteres som avklart i denne PR-en**, før selve emnefilen er faktisk lesbar med innhold i repoet.

## Konklusjon nå
- `emner_film_tv_canonical_v4_5.json` må behandles som tom/ufullstendig på PR-head.
- TV/Film canonical emnekilde er derfor **ikke avklart** i merge-klar forstand.
- `em_film_tv_kino_fellesrom` og `em_film_tv_location_filmsted` finnes i støtte-/styringslag (fagkart/superset/mapping/metoder/pensum), men kan ikke regnes som fullverdige emnedefinisjoner i repoet før canonical emnefil er lesbar med innhold.

## Konsekvens for places
- `em_film_tv_*` skal **ikke** brukes i place-koblinger ennå.
- Ingen place-filer ble endret i denne PR-en.

## Endrede filer i denne rettingen
- `reports/oslo-place-audit-batch-03-film-tv-emnekilde.md` (oppdatert)

## Hva må gjøres i batch 04
1. Fylle `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json` med faktiske emnedefinisjoner i repoet, eller avklare og peke til korrekt canonical emnefil dersom navnet/stien er feil.
2. Verifisere at canonical emnefil er lesbar fra PR-head (ikke tom streng).
3. Først etter dette: vurdere reintroduksjon av `em_film_tv_kino_fellesrom` og `em_film_tv_location_filmsted` i place-batcher.
