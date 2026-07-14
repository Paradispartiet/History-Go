# Bislett Stadion – historiske Vålerenga-profiler, batch 3: validering

## Nye enkeltfiler

- `erik_foss`
- `yngve_andersen`
- `stein_gran`
- `anton_ploderer`
- `helmuth_steffens`

Alle fem bruker:

- `placeId: bislett_stadion`
- `places: [bislett_stadion]`
- `category: sport`
- én person per fil, pakket som en én-elements JSON-array for kompatibilitet med eksisterende runtime-loadere

## Epokedekning

- 1965: Anton Ploderer og Helmuth Steffens som trener- og kulturbyggerankre for det første seriegullet.
- 1970-/1980-tallet: Yngve Andersen og Erik Foss som langvarige klubb- og bohemprofiler rundt cupgullet i 1980.
- 1983–1984: Stein Gran som del av de siste to seriegullårene i Bislett-dynastiet.

## Duplikatkontroll

Alle fem ID-ene ble søkt repo-wide og ble ikke funnet før opprettelse.

## Avgrensning

- Ingen eksisterende personfiler endres.
- Ingen place-filer, bilder, UI-filer eller runtimefiler endres.
- De fem nye filene er registrert i `data/people/manifest.json` rett etter Bislett batch 2-filene.
- Ingen permanent workflowfil inngår i nettodiffen.

## Kontroller

Første branch-head-pass:

- People data: **success**
- Places data: **success**

Et nytt sluttpass kjøres på committen som inneholder denne ferdige valideringsrapporten.
