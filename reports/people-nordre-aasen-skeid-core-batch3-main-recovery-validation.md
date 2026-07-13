# Nordre Åsen – Skeid-kjerne, batch 3: main-gjenoppretting

## Bakgrunn

PR #2122 ble merget til den tidligere PR #2114-branchen etter at #2114 allerede var merget til `main`. Batch 3-endringene kom derfor ikke inn på hovedgrenen.

Denne grenen er opprettet direkte fra oppdatert `main` og gjenoppretter bare batch 3-omfanget:

- fem nye enkeltpersonfiler
- krysskobling av eksisterende `mohammed_abdellaoue`
- fem nye manifestoppføringer
- research- og valideringsrapport

## Personfiler

- `trygve_borno`
- `jan_birkelund`
- `frank_olafsen`
- `omar_elabdellaoui`
- `dagfinn_enerly`

Alle fem bruker `nordre_aasen_idrettspark` som hovedanker og er registrert enkeltvis i `data/people/manifest.json`.

## Krysskobling uten duplikat

Den eksisterende filen for `mohammed_abdellaoue` beholder `ullevaal_stadion` som hovedanker og har nå både `ullevaal_stadion` og `nordre_aasen_idrettspark` i `places`.

## Diffavgrensning

Nettodiffen mot `main` består av ni filer:

- fem nye personfiler
- én oppdatert eksisterende personfil
- people-manifestet
- researchrapporten
- denne recovery-valideringsrapporten

Ingen place-filer, place-ID-er, bildeassets, UI-filer, runtimefiler eller permanente workflowfiler er endret.

## Automatiske kontroller

GitHub Actions på den rene `main`-baserte grenen:

- People data: **success**
- Places data: **success**

People-kontrollen dekker blant annet JSON-parsing, manifestregistrering, unike person-ID-er, gyldige place-referanser og People of Places-auditene.
