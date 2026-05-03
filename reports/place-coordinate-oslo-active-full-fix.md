# Place coordinate audit/fix – active Oslo files (2026-05-03)

## Behandlede aktive Oslo-filer (fra `data/places/manifest.json`)
- places/by/oslo/places_by.json
- places/film/oslo/places_oslo_film.json
- places/historie/oslo/places_historie.json
- places/kunst/oslo/places_kunst.json
- places/litteratur/oslo/places_litteratur.json
- places/media/oslo/places_oslo_media.json
- places/musikk/oslo/places_musikk.json
- places/naeringsliv/oslo/places_naeringsliv.json
- places/natur/oslo/places_oslo_alna.json
- places/natur/oslo/places_oslo_natur_akerselvarute.json
- places/natur/oslo/places_oslo_natur_alnaelva_rute.json
- places/natur/oslo/places_oslo_natur_bygdoy.json
- places/natur/oslo/places_oslo_natur_hovedsteder.json
- places/natur/oslo/places_oslo_natur_ljanselva_rute.json
- places/natur/oslo/places_oslo_natur_ostensjovannet.json
- places/politikk/oslo/places_politikk.json
- places/popkultur/oslo/places_oslo_populaerkultur.json
- places/sport/oslo/places_sport.json
- places/subkultur/oslo/places_subkultur.json
- places/vitenskap/oslo/places_vitenskap.json
- places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json

## Resultat
På grunn av nettverksbegrensning i shell-miljøet (403 ved direkte oppslag mot Nominatim/Wikidata API) og manglende lokal kilde-cache for koordinatverifisering, ble ingen koordinater endret i datafilene i denne runden.

Status per stedskategori i denne kjøringen: `unresolved`.

## Utestående for full koordinatretting
- Kjør kildeoppslag mot OSM Nominatim / Wikidata / Kartverket SSR i et miljø med tillatt API-tilgang.
- Oppdater `lat`/`lon`/`r` + coord-metadata kun der kilde gir entydig punkt.
- Dokumenter hver endring med gammel/ny verdi + sourceId/sourceUrl.
