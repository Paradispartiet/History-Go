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
- De fem nye enkeltfilene er registrert i `data/people/manifest.json`.
- Ingen permanent workflowfil inngår i nettodiffen.

## Kontroller

Første branch-head-pass:

- People data: **success**
- Places data: **success**

Et nytt sluttpass kjøres på committen som inneholder denne ferdige valideringsrapporten.
