# Bislett Stadion – historiske Vålerenga-profiler, batch 2: validering

## Nye enkeltfiler

- `tom_rusz_jacobsen`
- `tom_h_jacobsen`
- `arild_mathisen`
- `jorn_andersen`
- `eivind_arnevag`

Alle fem bruker:

- `placeId: bislett_stadion`
- `places: [bislett_stadion]`
- `category: sport`
- én person per fil, pakket som en én-elements JSON-array for kompatibilitet med eksisterende runtime-loadere

## Epokedekning

- 1965: Arild Mathisen og klubbens første seriegull.
- 1979–1982: Tom H. Jacobsen, cupgull 1980 og seriegull 1981.
- 1980–1984: Tom Rüsz Jacobsen, cupgull og tre seriegull.
- 1985: Jørn Andersen som toppscorer med 23 mål.
- 1986–1989: Eivind Arnevåg som målscorer i den sene Bislett-perioden.

## Duplikatkontroll

De fem endelige ID-ene ble søkt repo-wide og ble ikke funnet før opprettelse.

`henning_berg` ble funnet som eksisterende kanonisk fil under `ullevaal_stadion` og ble derfor eksplisitt fjernet fra batchen før manifestregistrering.

## Avgrensning

- Ingen eksisterende personfiler endres.
- Ingen place-filer, bilder, UI-filer eller runtimefiler endres.
- De fem nye filene registreres i `data/people/manifest.json` rett etter Bislett batch 1-filene.
- Ingen permanent workflowfil skal inngå i nettodiffen.

## Kontroller

People data og Places data kjøres etter manifestregistrering og fjerning av den midlertidige workflowfilen.
