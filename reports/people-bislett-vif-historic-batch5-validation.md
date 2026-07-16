# Bislett Stadion – historiske Vålerenga-profiler, batch 5: validering

## Nye enkeltfiler

- `trond_sollied`
- `henning_bjarnoy`
- `tor_brevik`
- `jo_bergsvand`
- `olle_nordin`

Alle fem bruker:

- `placeId: bislett_stadion`
- `places: [bislett_stadion]`
- `category: sport`
- én person per fil, pakket som en én-elements JSON-array for kompatibilitet med eksisterende runtime-loadere

## Historisk dekning

- Trond Sollied: seriemester i 1983 og 1984.
- Henning Bjarnøy: seriemester i 1981, 1983 og 1984.
- Tor Brevik: cupmester i 1980 og seriemester i 1981, 1983 og 1984.
- Jo Bergsvand: seriemester i 1983.
- Olle Nordin: Vålerenga-trener i 1985 og 1990–1992.

## Duplikatkontroll

Alle fem ID-ene ble søkt repo-wide og ble ikke funnet før opprettelse.

## Avgrensning

- Ingen eksisterende personfiler endres.
- Ingen place-filer, bilder, UI-filer eller runtimefiler endres.
- De fem nye filene skal registreres i `data/people/manifest.json` rett etter Bislett batch 4-filene.
- Ingen permanent workflowfil skal inngå i nettodiffen.

## Kontroller

People data og Places data kjøres etter manifestregistrering og fjerning av eventuell midlertidig workflowfil.

Manifestregistreringen utløses på den ferdige batchgrenen før PR-kontrollene kjøres.
