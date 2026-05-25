# Oslo place-audit batch 01

- Dato: 2026-05-25

## Endrede filer
- `data/places/film/oslo/places_oslo_film.json`
- `data/places/vitenskap/oslo/places_vitenskap.json`
- `reports/oslo-place-audit-batch-01.md`

## Nye steder lagt til per fil

### data/places/film/oslo/places_oslo_film.json
- filmens_hus
- saga_kino
- klingenberg_kino
- gimle_kino
- vika_kino
- nrk_marienlyst_film_tv
- hartvig_nissens_skole_skam
- holmlia_film_tv
- boler_film_tv

### data/places/vitenskap/oslo/places_vitenskap.json
- universitetet_i_oslo_blindern
- naturhistorisk_museum
- botanisk_hage
- teknisk_museum
- forskningsparken
- rikshospitalet
- radiumhospitalet
- meteorologisk_institutt
- oslo_met_pilestredet
- arkitektur_og_designhogskolen
- bi_nydalen

## Allerede finnes / mulig senere layer
- colosseum_kino (finnes i `data/places/popkultur/oslo/places_oslo_populaerkultur.json`)
- observatoriet (finnes i `data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json`)

## Usikkerheter
- `nrk_marienlyst_film_tv` er lagt inn som film/TV-vinkel i filmfila fordi mediefila allerede har et bredt NRK-sted; kan senere kobles tydeligere med layer/relasjoner i stedet for duplisering.
- `holmlia_film_tv` og `boler_film_tv` er formulert som skjermrepresentasjonssteder i første batch og kan få mer presise produksjonsreferanser i senere batch med kildegrunnlag.

## Forslag til batch 02
- kinoer/visningssteder som kan mangle i Oslo (etter dedup mot aktive filer)
- flere forsknings- og helseinstitusjoner i Oslo med tydelige emne-koblinger
- gjennomgang av emne_ids-harmonisering for nye filmsteder mot eksisterende popkultur-emner
