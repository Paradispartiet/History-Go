# Bislett Stadion – Vålerenga-krysskoblinger: validering

## Oppdaterte kanoniske oppføringer

- `klanen`
- `henning_berg`

## Forventet resultat

### Klanen

- hovedanker: `intility_arena`
- historiske arenaer i `places`: `bislett_stadion`, `ullevaal_stadion`
- eksisterende områdekobling: `valle_hovin_stadion`
- etableringsår: 1991

### Henning Berg

- hovedanker: `ullevaal_stadion`
- sekundært gjennombruddsanker: `bislett_stadion`
- separat fil pakket som én-elements JSON-array

## Avgrensning

- Ingen nye person-ID-er.
- Ingen manifestendring.
- Ingen place-, bilde-, UI- eller runtimeendring.
- Den midlertidige workflowfilen skal ikke inngå i nettodiffen.

## Kontroller

People data og Places data kjøres etter at oppdateringene er skrevet og den midlertidige workflowfilen er fjernet.