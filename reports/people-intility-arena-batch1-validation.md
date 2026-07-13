# Intility Arena – people batch 1: validering

## Innhold

Fem nye personer og miljøankre er lagt til som separate JSON-filer:

- `valerenga_fotball`
- `stephanie_verdoia`
- `christian_grindheim`
- `aron_donnum`
- `osame_sahraoui`

Alle fem bruker:

- `placeId: intility_arena`
- `places: [intility_arena]`
- `category: sport`

## Avgrensning

- Ingen eksisterende personfiler er endret.
- `ronny_deila`, `klanen` og `einar_bruno_larsen` er ikke duplisert.
- Ingen place-filer, place-ID-er, bilder, UI-filer eller runtimefiler er endret.
- De fem nye filene registreres enkeltvis i `data/people/manifest.json`.

## Kontroller

Automatiske data-kontroller kjøres etter at manifestoppdateringen er fullført og den midlertidige workflowfilen er fjernet.
