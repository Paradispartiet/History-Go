# Coordinate source fixes (P0)

Generated: 2026-05-02

## Endrede filer

- Ingen place-filer ble endret i denne kjøringen.

## Vurderte steder

### kuba_parken
- Fil: `data/places/natur/oslo/places_oslo_natur_akerselvarute.json`
- Nåværende lat/lon/r: `59.92472, 10.75244, 180`
- Kandidatkilde: `official_site_manual`
- sourceId/sourceUrl: `aroundus:8957874` / `https://aroundus.com/p/8957874-kuba-park`
- Confidence: `high`
- Status: Ikke endret i denne kjøringen fordi place allerede står som verifisert med samme koordinat.

### st_hanshaugen_park
- Fil: `data/places/by/oslo/places_by.json`
- Nåværende lat/lon/r: `59.9271056, 10.7410611, 220`
- Kandidatkilde: `wikidata`
- sourceId/sourceUrl: `wikipedia:St._Hanshaugen_Park` / `https://en.wikipedia.org/wiki/St._Hanshaugen_Park`
- Confidence: `high`
- Status: Ikke endret i denne kjøringen fordi place allerede står som verifisert med samme koordinat.

## Ikke rettet og hvorfor
- Begge P0-steder var allerede satt til den samme verifiserte kandidatkoordinaten som i kandidatgrunnlaget. Ingen ny apply nødvendig.
- Dry-run for `fetch-place-coordinate-sources` med `--ids` ble forsøkt, men scriptet håndterer ikke id-filtrering og kjøringen timeout-et i dette miljøet.
