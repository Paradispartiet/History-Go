# Place data content update – places_litteratur

Dato: 2026-04-29

## Omfang
Oppdatert kun `data/places/places_litteratur.json` med innholdsfelter:
- `popupDesc`
- `emne_ids`
- `quiz_profile`

Ingen endringer i JS/CSS/HTML/UI/runtime/Wonderkammer. Ingen nye eller endrede asset paths.

## Før → etter (for places_litteratur.json)
Basert på audit før og etter endring:

- Manglende `popupDesc`: **11 → 0**
- Manglende `emne_ids`: **24 → 0**
- Manglende `quiz_profile`: **24 → 0**
- Ugyldige place-referanser globalt: **0 → 0**

## Kvalitetsvalg
- `emne_ids` er valgt fra eksisterende emnekatalog i repoet (`data/fag/by/emner_by.json`).
- Alle 24 steder har nå komplett grunnprofil for quiz-generering (`quiz_profile`).
- Eksisterende bildefelt er beholdt urørt, inkludert kjente broken paths, i tråd med avgrensning.

## Gjenstående (bevisst ikke i scope)
- Manglende/ødelagte `image`/`cardImage` i litteraturfila er ikke rettet i denne datajobben.
