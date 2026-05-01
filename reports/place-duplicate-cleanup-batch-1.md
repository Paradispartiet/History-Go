# Place duplicate cleanup batch 1

## Flyttet fil
- Fra: `data/places/places_by_22_with_quiz_profiles_v2_refined.json`
- Til: `data/places/arkiv/places_by_22_with_quiz_profiles_v2_refined.json`

## Hvorfor dette var trygt
- Filen var ikke referert i `PLACE_FILES_FALLBACK` i `js/boot.js`.
- Filen var ikke listet i `data/places/manifest.json`.
- Dermed er den ikke aktiv runtime-place-data i dagens loader-flyt.

## Verifikasjon av aktive referanser
- `js/boot.js`: ingen treff for `places_by_22_with_quiz_profiles_v2_refined`.
- `data/places/manifest.json`: ingen treff for `places_by_22_with_quiz_profiles_v2_refined`.

## Duplicate IDs (top-level `data/places/*.json`)
- Før flytt: **82** duplicate IDs.
- Etter flytt: **36** duplicate IDs.
- Endring: **-46** duplicate IDs.

## Duplicate-typer som fortsatt gjenstår
- Semantiske overlapper på tvers av aktive temafiler (f.eks. historie/litteratur/kunst/næringsliv) og by-data.
- Gjenstående duplicate IDs er ikke ryddet i denne batchen (kun lavrisiko inaktiv toppnivåfil ble flyttet).

## Kontroll av dataintegritet
- Ingen innholdsendringer i den flyttede filen (kun relokering til arkiv).
- `places_by.json` er uendret.
- Ingen andre `data/places/*.json` på toppnivå ble endret.
- Runtime-filer ble ikke endret (`js/boot.js` uendret, `data/places/manifest.json` uendret).

## Ekstra sjekk
- `node scripts/i18n-audit-places.js en` kjører fortsatt (rapporterte eksisterende manglende oversettelser, men scriptet feilet ikke).
