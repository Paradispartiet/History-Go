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

Hver fil inneholder én person pakket i en én-elements JSON-array. Dette bevarer én-person-per-fil-modellen og er kompatibelt med alle eksisterende runtime-loadere.

## Eksisterende dekning

- `espen_knutsen`, `roy_johansen` og `einar_bruno_larsen` beholdes uendret.
- Sekundærkoblingene fra `petter_thoresen` og `mathias_trygg` beholdes uendret.

## Avgrensning

- Ingen person-ID-er dupliseres.
- Ingen eksisterende personfiler endres.
- Ingen place-filer, place-ID-er, bilder, UI-filer eller runtimefiler endres.
- De fem nye enkeltfilene er registrert i `data/people/manifest.json`.
- Ingen permanent workflowfil inngår i nettodiffen.

## Reviewfiks

Codex-funnet om at runtime-loaderne ignorerer enkeltstående JSON-objekter er håndtert ved å pakke hver av de fem nye personene i en støttet array-payload. Ingen loaderkode måtte endres.

## Kontroller

Tidligere branch-head-pass:

- People data: **success**
- Places data: **success**

Et nytt sluttpass kjøres på den endelige payloadformen.
