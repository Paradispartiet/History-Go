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

- `ronny_deila` er oppdatert uten ny ID, med Intility Arena som hovedanker og Valle Hovin som sekundær områdekobling.
- `klanen` er oppdatert uten ny ID, med Intility Arena som hovedanker og Valle Hovin som sekundær områdekobling.

## Manifest

De tre nye enkeltfilene er registrert i `data/people/manifest.json`, direkte etter Intility Arena batch 1-profilene.

## Avgrensning

Nettodiffen mot `main` består av:

- tre nye personfiler
- people-manifestet
- den eksisterende Oslo-sportfilen med to målrettede oppdateringer
- researchrapporten
- denne valideringsrapporten

Ingen person-ID-er er duplisert. Ingen place-filer, place-ID-er, bilder, UI-filer, runtimefiler eller permanente workflowfiler er endret.

## Automatiske kontroller

Kontrollene på den rene branchen etter at den midlertidige workflowfilen var fjernet ga:

- People data: **success**
- Places data: **success**

People-kontrollen dekker blant annet JSON-parsing, unike person-ID-er, manifestfiler, gyldige place-referanser og People of Places-auditene.
