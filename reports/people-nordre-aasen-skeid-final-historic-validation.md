# Nordre Åsen – siste historiske Skeid-batch: validering

## Innhold

Fem nye personer er lagt til som separate JSON-filer:

- `tor_egil_johansen`
- `finn_thorsen`
- `pal_saethrang`
- `stein_thunberg`
- `mike_kjolo`

Alle fem bruker:

- `placeId: nordre_aasen_idrettspark`
- `places: [nordre_aasen_idrettspark]`
- `category: sport`

## Avgrensning

- Ingen eksisterende personfiler er endret.
- Ingen place-filer, place-ID-er, bilder, UI-filer eller runtimefiler er endret.
- De fem nye filene registreres enkeltvis i `data/people/manifest.json`.

## Kontroller

Automatiske data-kontroller kjøres etter at manifestoppdateringen er fullført og den midlertidige workflowfilen er fjernet.
