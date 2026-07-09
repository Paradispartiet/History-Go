# Stale place-index coordinate refresh

Dato: 2026-07-09

## Hvorfor kartet fortsatt viste gamle punkter

`DataHub.loadPlacesBase()` laster den lette runtime-indeksen `data/places/places_index.json` først. Source-filene for SALT og Bispelokket var allerede korrigert, men forrige koordinatfix lot genererte index-filer stå igjen med gamle koordinater. Runtime kunne derfor lese stale koordinater fra index før de oppdaterte source-filene ble relevante.

## Stale index-filer

Følgende genererte runtime-/startup-indekser var stale for de aktuelle stedene:

- `data/places/places_index.json`
- `data/places/by/oslo/places_by_index.json`
- `data/places/musikk/oslo/places_musikk_index.json`

## Regenererte filer

Følgende index-filer ble regenerert fra eksisterende source-data, uten manuell håndredigering av koordinatene i index:

- `data/places/places_index.json` via `npm run places:index:build`
- `data/places/by/oslo/places_by_index.json` via split/index-generatoren for Oslo by-places
- `data/places/musikk/oslo/places_musikk_index.json` via split/index-generatoren for Oslo musikk-places

## Source-filer

Source-filene ble ikke endret på nytt i denne oppdateringen. Endringen her er begrenset til genererte runtime-/startup-indexer og denne rapporten.

## Runtime-index matcher source

Etter regenerering matcher runtime-index de korrigerte source-koordinatene:

- `salt`: `59.90705`, `10.74218`
- `bispelokket`: `59.90806`, `10.75528`

Kontroll viste samtidig at de gamle aktive runtime-punktene ikke lenger brukes for disse ID-ene:

- `salt` bruker ikke lenger `59.9078`, `10.7525` i runtime-index.
- `bispelokket` bruker ikke lenger `59.9078`, `10.7538` i runtime-index.

## Verifikasjon

Kjørte kontroller:

- `npm run places:index:build`
- `node scripts/split-oslo-places.mjs`
- `node scripts/split-musikk-oslo-places.mjs`
- Node-basert kontroll av `salt` og `bispelokket` i:
  - `data/places/places_index.json`
  - `data/places/by/oslo/places_by_index.json`
  - `data/places/musikk/oslo/places_musikk_index.json`
- `npm run places:index:check`
