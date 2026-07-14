# Jordal Amfi – people batch 1: validering

## Nye enkeltfiler

- `valerenga_ishockey`
- `steinar_bjolbakk`
- `jim_marthinsen`
- `geir_myhre`
- `arne_billkvam`

Alle fem bruker:

- `placeId: jordal_amfi`
- `places: [jordal_amfi]`
- `category: sport`

## Eksisterende dekning

- `espen_knutsen`, `roy_johansen` og `einar_bruno_larsen` beholdes uendret.
- Sekundærkoblingene fra `petter_thoresen` og `mathias_trygg` beholdes uendret.

## Avgrensning

- Ingen person-ID-er dupliseres.
- Ingen eksisterende personfiler endres.
- Ingen place-filer, place-ID-er, bilder, UI-filer eller runtimefiler endres.
- De fem nye enkeltfilene registreres i `data/people/manifest.json`.
- Den midlertidige workflowfilen fjernes før PR-en åpnes.

## Kontroller

Automatiske data-kontroller kjøres etter at manifestoppdateringen er fullført og den midlertidige workflowfilen er fjernet.

Manifestregistreringen er utløst på den ferdige branch-diffen.
