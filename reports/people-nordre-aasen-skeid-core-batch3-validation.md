# Nordre Åsen – Skeid-kjerne, batch 3: validering

## Innhold

Fem nye personer er lagt til som separate JSON-filer:

- `trygve_borno`
- `jan_birkelund`
- `frank_olafsen`
- `omar_elabdellaoui`
- `dagfinn_enerly`

Alle fem bruker:

- `placeId: nordre_aasen_idrettspark`
- `places: [nordre_aasen_idrettspark]`
- `category: sport`

## Krysskobling uten duplikat

Den eksisterende kanoniske personen `mohammed_abdellaoue` er oppdatert i sin eksisterende Ullevaal-fil:

- `placeId` forblir `ullevaal_stadion`.
- `places` inneholder nå både `ullevaal_stadion` og `nordre_aasen_idrettspark`.
- Beskrivelsen dokumenterer både Skeid-perioden og landslagskoblingen til Ullevaal.

Ingen ny Moa-fil eller ny person-ID er opprettet.

## Manifest

`data/people/manifest.json` registrerer de fem nye enkeltfilene direkte etter Nordre Åsen batch 2-filene.

## Diffavgrensning

Nettodiffen mot den stablede basen for PR #2114 består av:

- fem nye personfiler
- én oppdatert eksisterende personfil
- people-manifestet
- researchrapporten
- denne valideringsrapporten

Ingen place-filer, place-ID-er, bildeassets, UI-filer eller runtimefiler er endret.

## Automatiske kontroller

Kontrollene på den rene branchen etter at midlertidig manifestautomatisering var fjernet ga:

- People data: **success**
- Places data: **success**

People-kontrollen dekker blant annet JSON-parsing, unike person-ID-er, manifestfiler, gyldige place-referanser og People of Places-auditene.

## Stackrekkefølge

Denne PR-en er stablet på PR #2114 og skal ikke merges først. Etter at #2114 er merget skal denne PR-en retargetes til `main` og kontrollene kjøres på nytt mot oppdatert hovedgren.
