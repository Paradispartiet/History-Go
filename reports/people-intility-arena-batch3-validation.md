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

## Manifest

De fem nye filene er registrert enkeltvis i `data/people/manifest.json`, samlet etter de øvrige Intility Arena-profilene.

## Avgrensning

- Ingen eksisterende personfiler endres.
- Ingen person-ID-er dupliseres.
- Ingen place-filer, place-ID-er, bilder, UI-filer eller runtimefiler endres.
- Ingen permanent workflowfil inngår i nettodiffen.

## Kontroller

Første komplette branch-head-pass:

- People data: **success**
- Places data: **success**
- PR mergeable mot siste `main`: **ja**

Et nytt sluttpass kjøres på committen som inneholder denne ferdige valideringsrapporten.
