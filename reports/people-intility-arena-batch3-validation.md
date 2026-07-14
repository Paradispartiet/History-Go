# Intility Arena – people batch 3: validering

## Nye enkeltfiler

- `dag_eilev_fagermo`
- `nils_lexerod`
- `ajara_nchout`
- `janni_thomsen`
- `odin_thiago_holm`

Alle fem bruker:

- `placeId: intility_arena`
- `places: [intility_arena]`
- `category: sport`

## Avgrensning

- Ingen eksisterende personfiler endres.
- Ingen person-ID-er dupliseres.
- Ingen place-filer, place-ID-er, bilder, UI-filer eller runtimefiler endres.
- De fem nye enkeltfilene registreres i `data/people/manifest.json`.
- Den midlertidige workflowfilen fjernes før PR-en åpnes.

## Kontroller

Automatiske data-kontroller kjøres etter at manifestoppdateringen er fullført og den midlertidige workflowfilen er fjernet.
