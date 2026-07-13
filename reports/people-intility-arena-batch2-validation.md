# Intility Arena – people batch 2: validering

## Nye enkeltfiler

- `sherida_spitse`
- `elise_thorsnes`
- `henrik_bjordal`

Alle tre bruker:

- `placeId: intility_arena`
- `places: [intility_arena]`
- `category: sport`

## Eksisterende oppføringer

- `ronny_deila` oppdateres uten ny ID, med Intility Arena som hovedanker og Valle Hovin som sekundær områdekobling.
- `klanen` oppdateres uten ny ID, med Intility Arena som hovedanker og Valle Hovin som sekundær områdekobling.

## Avgrensning

- Ingen person-ID-er dupliseres.
- Ingen place-filer, place-ID-er, bilder, UI-filer eller runtimefiler endres.
- De tre nye enkeltfilene registreres i `data/people/manifest.json`.
- Den midlertidige workflowfilen fjernes før PR-en åpnes.

## Kontroller

Automatiske data-kontroller kjøres etter at oppdateringene er fullført og den midlertidige workflowfilen er fjernet.
