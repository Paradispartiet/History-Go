# Oslo place-audit batch 01

- Dato: 2026-05-25

## Endrede filer
- `data/places/film/oslo/places_oslo_film.json`
- `data/places/vitenskap/oslo/places_vitenskap.json`
- `reports/oslo-place-audit-batch-01.md`

## Nye steder lagt til per fil

### data/places/film/oslo/places_oslo_film.json
- saga_kino
- klingenberg_kino
- gimle_kino
- vika_kino
- hartvig_nissens_skole_skam

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
- filmens_hus finnes allerede funksjonelt gjennom `cinemateket_oslo` / Filmens Hus-miljøet i `data/places/popkultur/oslo/places_oslo_populaerkultur.json`
- nrk_marienlyst finnes allerede som `nrk_huset_marienlyst` i `data/places/media/oslo/places_oslo_media.json`

## Usikkerheter
- Holmlia og Bøler bør eventuelt komme i batch 02 med konkrete produksjonsreferanser/kilder før de legges inn som egne filmsteder.

## Forslag til batch 02
- kinoer/visningssteder som kan mangle i Oslo (etter dedup mot aktive filer)
- flere forsknings- og helseinstitusjoner i Oslo med tydelige emne-koblinger
- gjennomgang av emne_ids-harmonisering for nye filmsteder mot eksisterende popkultur-emner

## Emne-ID note
- Film-emner (`emne_ids`) for nye Oslo-filmsteder er midlertidig fjernet i batch 01 fordi gyldige, verifiserte emne-ID-er for film/TV/kino/sted-i-fiksjon ikke var harmonisert i eksisterende emne-/fagdata. Dette må harmoniseres/opprettes i egen senere batch.
