# Bislett Stadion – Vålerenga-krysskoblinger: research

## Formål

Denne oppryddingen oppretter ingen nye person-ID-er og endrer ikke people-manifestet. Den korrigerer to eksisterende kanoniske oppføringer slik at arenaene følger dokumenterte perioder.

## Klanen

Klanen ble etablert som Vålerengas uavhengige supporterklubb i 1991, ikke 1997. Vålerenga brukte Bislett i denne første organiserte supporterperioden, senere Ullevaal som fast hjemmebane fra 1999 til 2017 og deretter Intility Arena.

Oppdatering:

- Intility Arena beholdes som hovedanker.
- `bislett_stadion` og `ullevaal_stadion` legges til som historiske supporterarenaer.
- `valle_hovin_stadion` beholdes som sekundær områdekobling.
- `year` rettes fra 1997 til 1991.

Kilder:

- https://en.wikipedia.org/wiki/V%C3%A5lerenga_Fotball
- https://en.wikipedia.org/wiki/Bislett_Stadium

## Henning Berg

Henning Berg startet toppkarrieren i Vålerenga i 1988 og spilte for klubben til 1991. Denne Vålerenga-perioden hører til Bislett-epoken. Hans eksisterende hovedanker på Ullevaal beholdes fordi den kanoniske oppføringen handler om hans 100 landskamper og Norges mesterskapsgenerasjon.

Oppdatering:

- `ullevaal_stadion` beholdes som hovedanker.
- `bislett_stadion` legges til som sekundært gjennombruddsanker.
- Beskrivelse og popup utvides med Vålerenga-perioden 1988–91.
- Den separate filen pakkes som en én-elements JSON-array for kompatibilitet med eksisterende runtime-loadere.

Kilder:

- https://en.wikipedia.org/wiki/Henning_Berg
- https://de.wikipedia.org/wiki/Henning_Berg_%28Fu%C3%9Fballspieler%29

## Avgrensning

Ingen place-filer, bilder, UI-filer, runtimefiler eller manifestlinjer endres.