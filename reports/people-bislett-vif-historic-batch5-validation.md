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

Endelig PR-head:

- People data: **success**
- Places data: **failure**

Places-jobben feilet identisk på første kjøring og på en målrettet rerun. Batch 5 endrer ingen place-filer, og den endelige nettodiffen består bare av fem people-filer, people-manifestet og to rapporter. PR-en holdes derfor som draft inntil den eksterne Places-gaten på merge-refen er grønn eller den underliggende place-feilen på hovedgrenen er identifisert og rettet.
