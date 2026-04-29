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
- Regenererte `reports/place-data-audit.md` med oppdatert status.

## Hva som ikke ble rettet

Følgende place-referanser står fortsatt som TODO fordi sikker matching mot eksisterende place-id ikke kunne bekreftes uten å opprette nye steder:

- `det_norske_teatret`
- `blaa`
- `rockefeller`
- `john_dee`
- `sentrum_scene`
- `tinghuset`
- `regjeringskvartalet`
- `schous_plass`

I tillegg er ødelagte asset-paths i stor grad uendret fordi sikre filmatcher ikke kunne bekreftes med eksisterende assets alene.

## Filer som fortsatt trenger innholdsfylling senere

- Place-filer med mange mangler i `popupDesc`, `quiz_profile`, `image`, `cardImage` og/eller `emne_ids` (ingen kreativ utfylling gjort i denne runden).
- `data/places/places_nature_aliases.json` inneholder flere alias-steder uten komplette basisfelt (inkludert manglende `lat/lon`), som krever kuratert datagrunnlag før utfylling.
