# Oslo place-audit batch 04 — første minimale canonical emnepakke for TV/Film

**Dato:** 2026-05-26

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

## Endrede filer
- `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json`
- `reports/oslo-place-audit-batch-04-film-tv-emner.md`

## Status på canonical emnefil
`data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json` er nå lesbar, gyldig JSON og ikke tom. Filen inneholder en første minimal emnepakke med to fullverdige TV/Film-emner.

## Opprettede emner
1. `em_film_tv_kino_fellesrom`
2. `em_film_tv_location_filmsted`

Begge emner har `subject_id: "film_tv"`.

## Hvorfor akkurat disse to emnene
- De er allerede tydelig forankret i TV/Film-støttelagene (fagkart/superset/mapping/metoder) som sentrale innganger for Oslo-relevante filmsteder.
- De dekker to grunnleggende, praktiske koblingslogikker for kommende place-batcher:
  - **visningsrom-logikk** (kino som kollektivt rom)
  - **location-logikk** (virkelige steder brukt i skjermfortellinger)
- De er små nok til en kontrollert oppstart uten å masseprodusere hele emneregisteret i samme PR.

## Steder emnene senere kan kobles til
- For `em_film_tv_kino_fellesrom`:
  - `saga_kino`
  - `klingenberg_kino`
  - `gimle_kino`
  - `vika_kino`
  - `colosseum_kino`
  - `cinemateket_oslo`

- For `em_film_tv_location_filmsted`:
  - `hartvig_nissens_skole_skam`
  - senere dokumenterte Oslo-filmsteder
  - konkrete locations i film/TV
  - byrom dokumentert brukt i skjermfortellinger

## Avgrensninger i batch 04
- Ingen place-filer er endret.
- Ingen reintroduksjon av `em_film_tv_*` i `places_oslo_film.json` i denne batchen.
- Ingen endringer i UI, CSS, HTML, JS eller manifest.

## Hva som bør gjøres i batch 05
1. Reintrodusere `em_film_tv_kino_fellesrom` og `em_film_tv_location_filmsted` selektivt i `places_oslo_film.json` med dokumenterbare film/TV-kilder per sted.
2. Verifisere at nye place-koblinger følger source-first-reglene og krever konkret verk/scene/location-anker.
3. Utvide canonical emnefilen trinnvis med neste lille pakke TV/Film-emner (ikke full masseimport), med samme kvalitetssikring per emne.
4. Kjøre ny place-audit etter reintroduksjon for å sikre korrekt emnebruk og unngå overgeneriske koblinger.
