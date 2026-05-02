# Place anchor runtime check

Dato: 2026-05-01

## Filer lest (uten arkiv)
- `js/ui/popup-utils.js`
- `js/ui/lists.js`
- `js/ui/place-card.js`
- `js/core/pos.js`
- `js/core/geo.js`
- `data/places/manifest.json`
- aktive place-filer listet i `data/places/manifest.json`

## Runtime-filer kontrollert
- Unlock/distance gate: `canUnlockPlaceNow(place)` i `js/ui/popup-utils.js`
- Distance helper: `getPlaceUnlockAnchors(place)` + ny `getPlaceDistanceTargets(place)` i `js/ui/popup-utils.js`
- Nearby-sortering/avstandsvisning: `renderNearbyPlaces()` i `js/ui/lists.js`
- PlaceCard unlock-knapp og "gå nærmere": `updateUnlockUI()` og unlock-onclick i `js/ui/place-card.js`
- Auto-unlock fra posisjon: `autoUnlockPlacesFromPosition()` i `js/core/pos.js`

## Resultat

### 1) Nearby-sortering
- Status: **OK etter endring**.
- Nå brukes nærmeste distance target (anchor hvis gyldig, ellers fallback til place.lat/lon/r).

### 2) Avstandsvisning
- Status: **OK etter endring**.
- Nearby-listens meter-visning bruker nå nærmeste target i stedet for kun hovedpunkt.

### 3) Unlock/check distance
- Status: **OK**.
- `canUnlockPlaceNow(place)` evaluerer alle gyldige targets og låser opp når bruker er innenfor radius til ett target.

### 4) "Gå nærmere"-tekst
- Status: **OK**.
- Teksten bruker `gate.d - gate.r` fra nærmeste target/radius.

### 5) Fallback uten anchors
- Status: **OK**.
- Place uten anchors får fallback-target fra `place.lat/place.lon/place.r` (som før).

## Bugs funnet
- Konkrete runtime-bugs funnet før endring:
  1. Nearby-sortering i `renderNearbyPlaces()` brukte kun `place.lat/lon`.
  2. Nearby avstandsvisning brukte kun `place.lat/lon`.
  3. PlaceCard sin interne `_d`-beregning brukte kun `place.lat/lon`.

## Filer endret
- `js/ui/popup-utils.js`
- `js/ui/lists.js`
- `js/ui/place-card.js`
- `tools/test-place-anchor-distance.mjs` (ny)
- `reports/place-anchor-runtime-check.md` (ny)

## Testscript
- `tools/test-place-anchor-distance.mjs`
- Leser `data/places/manifest.json`
- Bekrefter:
  - place med anchors: nearest target blir anchor, ikke hovedpunkt
  - unlock innenfor anchor-radius
  - place uten anchors: fallback-target brukes
