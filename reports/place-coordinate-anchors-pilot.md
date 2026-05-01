# Place coordinate anchors pilot

## Endrede filer
- `js/ui/popup-utils.js` (allerede i aktiv kodebase): inneholder `getPlaceUnlockAnchors(place)` med validering av `anchors` og fallback til `lat/lon/r`.
- `js/core/pos.js` (allerede i aktiv kodebase): unlock-sjekk bruker `getPlaceUnlockAnchors(place)` i auto-unlock basert på posisjon.
- `data/places/places_by.json` (allerede i aktiv kodebase): pilot-anchors finnes for `karl_johan`, `ring_3` og `akerselva`.
- `data/places/oslo/places_oslo_natur_hovedsteder.json` (oppdatert i denne leveransen): nye pilot-anchors for `alnaelva` og `ljanselva`.

## Pilotsteder med anchors
- Akerselva (`data/places/places_by.json`)
- Ring 3 (`data/places/places_by.json`)
- Karl Johans gate (`data/places/places_by.json`)
- Alnaelva (`data/places/oslo/places_oslo_natur_hovedsteder.json`)
- Ljanselva (`data/places/oslo/places_oslo_natur_hovedsteder.json`)

## Hvorfor anchor-punktene er valgt
- **Akerselva**: nord/midt/sør for å dekke lineær elvekorridor gjennom byen.
- **Ring 3**: vest/sentrum/østlige knutepunkt langs ringstrukturen.
- **Karl Johans gate**: øst/midt/vest langs paradeaksen for lang gate med høy gangbruk.
- **Alnaelva**: øvre (Alnsjøen), midtre (Svartdalen), nedre (Bryn) for representativ dekning av lang korridor.
- **Ljanselva**: øvre (Nøklevann), midtre (Hauketo), nedre (Fiskevollen) for vassdrag fra skog til fjord.

## Bakoverkompatibilitet
- Eksisterende `lat`, `lon` og `r` er beholdt på alle pilotsteder.
- Ingen eksisterende koordinatfelt er fjernet eller omskrevet.
- `anchors` er valgfritt felt, og eksisterende datastruktur fungerer uten endring for steder uten `anchors`.

## Fallback-logikk
- Hvis `place.anchors` finnes og inneholder gyldige punkter (`lat`, `lon`, positiv `r`, gyldig `type`), brukes disse i unlock-sjekk.
- Hvis `anchors` mangler eller er ugyldig, brukes ett fallback-anchor bygget fra `place.lat`, `place.lon`, `place.r`.
- Dette sikrer at eldre steder uten `anchors` oppfører seg som før.
