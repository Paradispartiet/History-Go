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

## Manifest

De fem nye filene er registrert enkeltvis i `data/people/manifest.json`, samlet mellom Nordre Åsen- og Ullevaal-profilene.

## Avgrensning

- Ingen eksisterende personfiler er endret.
- `ronny_deila`, `klanen` og `einar_bruno_larsen` er ikke duplisert.
- Ingen place-filer, place-ID-er, bilder, UI-filer eller runtimefiler er endret.
- Ingen permanent workflowfil inngår i nettodiffen.

## Automatiske kontroller

Kontrollene på den rene branchen etter at den midlertidige manifestworkflowen var fjernet ga:

- People data: **success**
- Places data: **success**

People-kontrollen dekker blant annet JSON-parsing, unike person-ID-er, manifestfiler, gyldige place-referanser og People of Places-auditene.
