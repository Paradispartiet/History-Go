# Place coordinate display trust gate

Generert: 2026-07-09

## Hvorfor dette trengs

Mange aktive place-objekter har `lat`/`lon`/`r` uten full koordinatmetadata eller uten visuell kontroll. Intake-gaten stopper nye eller endrede dårlige koordinater, men gammel backlog er fortsatt med i runtime-data. Uten en display-gate ser mangelfulle, uverifiserte og verifiserte kartpunkter like autoritative ut.

Denne endringen er derfor en datatillit-gate for kartvisning. Den markerer bare tillit til koordinaten, ikke tillit til selve stedet, historien eller innholdet.

## Hvor getCoordinateTrust ligger

`getCoordinateTrust(place)` ligger i `js/map.js` og eksponeres som både `window.HGCoordinateTrust.getCoordinateTrust` og `window.HGMap.getCoordinateTrust`.

Returverdier:

- `verified`: `coordStatus === "verified"` og `coordSource`, `coordType` og `coordNote` finnes.
- `review`: kjente review-statuser, lavpresisjons-lat/lon, eller `r >= 300` uten en tilstrekkelig note.
- `unknown`: manglende `coordStatus`, `coordType` eller `coordNote`.
- `invalid`: manglende/ugyldig `lat`, `lon` eller `r`.

## Hvor marker-rendering bruker trust

Place-markører rendres i `drawPlaceMarkers()` i `js/map.js`. Der beregnes `coordinateTrust` før GeoJSON-feature bygges.

- `verified`: rendres med vanlig marker.
- `review` og `unknown`: rendres fortsatt, men GeoJSON-feature får `coordinateTrust` og `coordinateTrustNote`, og sirkel/glow får lavere opacity slik at punktet ikke ser like autoritativt ut som verified.
- `invalid`: rendres ikke.

## Hva som skjer med invalid places

Hvis `getCoordinateTrust(place)` returnerer `invalid`, hopper kartlaget over markøren og logger en warning med `id` og `name` via `console.warn("[HGMap] Skipping invalid place coordinate", ...)`.

## PlaceCard/popup

`js/ui/place-card.js` beregner samme koordinat-trust når et sted åpnes. Hvis trust er `review` eller `unknown`, legges en diskret intern QA-linje i `#pcMeta`:

> Koordinat trenger kontroll

Dette vises ikke for `verified`.

## Dataendringer

- Ingen koordinater ble flyttet.
- Ingen gamle steder ble fjernet fra source.
- `data/places/places_index.json` ble ikke håndredigert.
- Endringen rører kartvisning og PlaceCard-visning, ikke quiz, stories, people, brands, rundinger eller civication.
