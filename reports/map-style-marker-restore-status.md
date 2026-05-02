# Map style marker restore status (PR #173)

Dato: 2026-05-02

## Konklusjon
PR #173 fremstår som **redundant/konfliktende** mot dagens `main`-implementasjon i `js/map.js`.

Jeg finner at dagens kode allerede har mekanismene som var målet med PR-en:
- style-switch via `MAP.setStyle(...)` med kontrollflagg (`isApplyingStyle`, `pendingStyleMode`)
- gjenopptegning av place-markører etter `style.load` (`redrawPlacesAfterStyleLoad`)
- reetablering av source/layers (`drawPlaceMarkers` + `removeIfExists`)
- re-binding av layer-handlere etter style-bytte (`bindPlaceLayerHandlers`)
- fjerning av gamle handlere før ny binding (`MAP.__hgPlaceHandlers` + `MAP.off(...)`)
- fallback til standardkart ved style-feil, med ny restore-kjøring
- `MAP.resize()` og `renderMapStyleToggle()` kjøres etter restore

## Steg 1: Sammenligning main vs PR-branch
PR-branchen `codex/fix-marker-visibility-after-style-switch` finnes ikke lokalt i denne arbeidskopien (ingen remote/ingen ekstra refs), så direkte diff mot branch kunne ikke kjøres her.

## Steg 2: Hva som allerede ligger på dagens main (`js/map.js`)
- `applyMapStyle(nextMode)` setter `isApplyingStyle=true`, `pendingStyleMode`, binder `style.load` + `error`, og kaller `MAP.setStyle(styleUrl)`.
- `onError` i style-switch nullstiller state (`isApplyingStyle=false`, `pendingStyleMode=null`), setter standardmodus og kjører fallback restore.
- `redrawPlacesAfterStyleLoad(mode)` nullstiller style-state, lagrer mode, tegner markører og kjører `moveMarkersOnTop()`, `MAP.resize()`, `renderMapStyleToggle()`.
- `drawPlaceMarkers()` håndterer både oppdatering av eksisterende source (`src.setData`) og clean oppretting av source/layers.
- `bindPlaceLayerHandlers()` bruker én handler-modell (`MAP.__hgPlaceHandlers`), unbinder gamle handlers før rebinding.

## Sjekkpunkter fra oppgaven
- Trygg rebind etter style switch: **Ja**.
- Fjerning av gamle handlers før nye: **Ja**.
- Fallback til standardkart tegner markører: **Ja** (via `redrawPlacesAfterStyleLoad(STYLE_MODE_STANDARD)`).
- Nullstilling av `isApplyingStyle` / `pendingStyleMode`: **Ja**.
- Ingen duplicate handlers: **Ja**, eksisterende handlers fjernes først.
- Ingen duplicate layers/source: **Ja**, `removeIfExists()` + early source-update.
- `MAP.resize()` og `renderMapStyleToggle()` etter restore: **Ja**.

## Steg 5: Test
Kjørt syntakssjekk:
- `node --check js/map.js` ✅

## Anbefaling
- Ikke tving inn PR #173 slik den står.
- Lukk PR #173 som konfliktende/redundant, eller erstatt med en ny, ren PR kun dersom det identifiseres et konkret edge-case som *ikke* allerede dekkes av dagens `main`.
