# Bislett Stadion – historiske Vålerenga-profiler, batch 1: validering

## Nye enkeltfiler

- `leif_eriksen`
- `pal_jacobsen`
- `vidar_davidsen`
- `egil_flemming_johansen`
- `per_edmund_mordt`

Alle fem bruker:

- `placeId: bislett_stadion`
- `places: [bislett_stadion]`
- `category: sport`

## Epokeprinsipp

- Profilene er ankret til stadionet der den definerende Vålerenga-perioden faktisk fant sted.
- Intility Arena brukes ikke retroaktivt for historiske spillere.
- Ullevaal Stadion reserveres for Vålerengas hovedperiode der fra 1999 til 2017.

## Duplikatkontroll

Følgende ID-er ble søkt repo-wide før opprettelse og ble ikke funnet:

- `leif_eriksen`
- `pal_jacobsen`
- `vidar_davidsen`
- `egil_flemming_johansen`
- `per_edmund_mordt`

## Avgrensning

- Ingen eksisterende personfiler endres.
- Ingen place-filer, place-ID-er, bilder, UI-filer eller runtimefiler endres.
- De fem nye enkeltfilene er registrert i `data/people/manifest.json` etter eksisterende Bislett batch 8.
- Ingen permanent workflowfil inngår i nettodiffen.

## Stack

Batchen er bygget oppå Jordal Amfi PR #2140 for å bevare manifestrekkefølgen uten konflikt. #2140 må merges før denne batchen kan retargetes eller merges til `main`.

## Kontroller

Første stacked branch-head-pass:

- People data: **success**
- Places data: **success**

Et nytt sluttpass kjøres på committen som inneholder denne ferdige valideringsrapporten.
