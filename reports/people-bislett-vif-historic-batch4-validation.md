# Bislett Stadion – historiske Vålerenga-profiler, batch 4: validering

## Nye enkeltfiler

- `gunder_bengtsson`
- `morten_haugen`
- `lasse_eriksen`
- `paal_fredheim`
- `knut_arild_loberg`

Alle fem bruker:

- `placeId: bislett_stadion`
- `places: [bislett_stadion]`
- `category: sport`
- én person per fil, pakket som en én-elements JSON-array for kompatibilitet med eksisterende runtime-loadere

## Epokedekning

- 1981: Morten Haugen som nest mestscorende Vålerenga-spiller i gullsesongen.
- 1983–1984: Gunder Bengtsson som trener for to strake seriegull.
- 1983–1984: Lasse Eriksen og Paal Fredheim som spillere i dobbeltgullperioden.
- 1984–1990: Knut Arild Løberg som seriemester, cupfinalist og senere tilbakevendende spiller.

## Duplikatkontroll

Alle fem ID-ene ble søkt repo-wide og ble ikke funnet før opprettelse.

## Avgrensning

- Ingen eksisterende personfiler endres.
- Ingen place-filer, bilder, UI-filer eller runtimefiler endres.
- De fem nye filene skal registreres i `data/people/manifest.json` rett etter Bislett batch 3-filene.
- Ingen permanent workflowfil skal inngå i nettodiffen.

## Kontroller

People data og Places data kjøres etter manifestregistrering og fjerning av den midlertidige workflowfilen.
