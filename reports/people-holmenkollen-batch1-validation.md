# Holmenkollen nasjonalanlegg – People batch 1: validering

## Nye ID-er

- `thorleif_haug`
- `birger_ruud`
- `gjermund_eggen`
- `matti_nykanen`
- `maren_lundby`

## Forventet datastruktur

Alle fem nye filer:

- bruker `category: "sport"`
- bruker `placeId: "holmenkollen_nasjonalanlegg"`
- bruker `places: ["holmenkollen_nasjonalanlegg"]`
- er pakket som runtime-kompatible én-elements JSON-arrays
- skal registreres i `data/people/manifest.json`

## Avgrensning

Ingen eksisterende canonical people-records skal dupliseres. Ingen place-, bilde-, UI- eller runtimefiler inngår i batchen.

## Kontroller

CI-resultater føres inn etter at manifestregistreringen er fullført og PR-en er åpnet.
