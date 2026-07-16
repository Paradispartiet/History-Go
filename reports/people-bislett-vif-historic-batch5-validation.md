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
- De fem nye filene er registrert i `data/people/manifest.json` rett etter Bislett batch 4-filene.
- Ingen permanent workflowfil inngår i nettodiffen.

## Kontroller

Endelig people-datahead:

- People data: **success**
- Places data: **failure – ekstern baselinefeil på `main`**

Places-feilen er diagnostisert med full logg fra samme hovedgrenbaseline. `places:coords:check` rapporterer 29 eksisterende paritetsavvik mellom kildefiler og eldre place-indeksfiler. Avvikene omfatter blant annet manglende kilderader i eldre Lisboa-, Norge- og Oslo-indekser, samt koordinat- og `coordStatus`-avvik for eksisterende Oslo-steder som `middelalder_oslo`, `gamle_aker_kirke`, `gamlebyen_gravlund` og flere.

Ingen av de 29 avvikene gjelder `bislett_stadion`, de fem nye people-filene eller `data/people/manifest.json`. Batch 5 endrer ingen place-data. People-gaten er derfor den relevante datagaten for denne PR-ens egen diff, og den er grønn.
