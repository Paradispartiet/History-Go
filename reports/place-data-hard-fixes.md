# Place Data Hard Fixes

Dato: 2026-04-29

## Hva som ble rettet

- Korrigerte ugyldige place-referanser i:
  - `data/people.json`
  - `data/routes.json`
  - `data/routes_walks.json`
  - `data/Civication/place_contexts.json`
- Avklarte stub/hidden for `akerhus_slott` i `data/places/places_historie.json`:
  - la til obligatoriske felt `r`, `year`, `category`, `desc`
  - fjernet `stub:true` og `hidden:true`
- Opprettet 8 manglende place-id-er som ekte place-objekter:
  - `data/places/places_musikk.json`: `det_norske_teatret`, `blaa`, `rockefeller`, `john_dee`, `sentrum_scene`
  - `data/places/places_politikk.json`: `tinghuset`, `regjeringskvartalet`
  - `data/places/places_by.json`: `schous_plass`
- Regenererte `reports/place-data-audit.md` med oppdatert status.

## Verifisert status etter validering

- Ugyldige place-referanser: **0**
- Stub/hidden-steder: **0**
- Ødelagte asset paths: **uendret nivå (ikke økt)**
- Ingen UI/runtime-endringer gjort (kun datafiler + rapportfiler).

## Hva som ikke ble rettet

- `image`, `cardImage`, `popupDesc` og `quiz_profile` er fortsatt bevisst ikke fylt ut i denne runden der sikre eksisterende data ikke forelå.
- Omfattende innholdsfylling for øvrige steder tas i senere innholdsrunder.
