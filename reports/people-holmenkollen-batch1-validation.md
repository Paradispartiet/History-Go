# Holmenkollen nasjonalanlegg – People batch 1: validering

## Nye ID-er

- `thorleif_haug`
- `birger_ruud`
- `gjermund_eggen`
- `matti_nykanen`
- `maren_lundby`

## Datastruktur

Alle fem nye filer:

- bruker `category: "sport"`
- bruker `placeId: "holmenkollen_nasjonalanlegg"`
- bruker `places: ["holmenkollen_nasjonalanlegg"]`
- er pakket som runtime-kompatible én-elements JSON-arrays
- er registrert i `data/people/manifest.json`

Manifestregistreringen ligger samlet rett etter `people/sport/oslo/people_sport_oslo.json`. Den midlertidige manifest-workflowen er fjernet og inngår ikke i nettodiffen.

## Avgrensning

Ingen eksisterende canonical people-records er duplisert. Ingen place-, bilde-, UI- eller runtimefiler inngår i batchen.

## Kontroller

Et ordinært sluttpass utløses på denne committen etter manifestregistreringen. Resultatet føres inn når People data og Places data er ferdige.
