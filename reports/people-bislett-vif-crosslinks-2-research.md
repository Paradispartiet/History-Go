# Bislett Stadion – Vålerenga-krysskoblinger 2: research

## Formål

Denne oppryddingen oppretter ingen nye person-ID-er og endrer ikke people-manifestet. Den korrigerer to eksisterende kanoniske profiler slik at arenaene følger dokumenterte perioder og faktisk funksjon.

## Einar Bruno Larsen

Einar Bruno Larsen spilte hele seniorkarrieren i fotball for Vålerenga fra 1957 til 1968. Han spilte tolv sesonger, scoret 99 mål og var del av laget som tok klubbens første seriegull i 1965. Parallelt spilte han tretten ishockeysesonger for Vålerenga, vant seks norske mesterskap og mottok Gullpucken i 1963.

Kanonisk plassering:

- `jordal_amfi` beholdes som hovedanker for ishockeykarrieren og Gullpucken.
- `bislett_stadion` legges til som sekundært fotballanker for Vålerenga-perioden og seriegullet i 1965.
- `intility_arena` fjernes. Arenaen åpnet først i 2017 og er ikke et historisk karriereanker for Larsen.

Kilder:

- https://en.wikipedia.org/wiki/Einar_Bruno_Larsen
- https://de.wikipedia.org/wiki/Einar_Bruno_Larsen
- https://www.aftenposten.no/sport/fotball/i/O3OO6V/vaalerenga-legenden-einar-bruno-larsen-er-doed

## Egil «Drillo» Olsen

Egil Olsen hadde spillerperioder i Vålerenga i 1964 og 1966–1967. Han var ikke del av seriemesterlaget i 1965; dette må ikke hevdes. Han kom senere tilbake som Vålerenga-trener fra august 1998 til juni 1999, i klubbens overgangsperiode fra Bislett til Ullevaal.

Kanonisk plassering:

- `ullevaal_stadion` beholdes som hovedanker for landslagstrenerkarrieren og VM-kvalifiseringene.
- `bislett_stadion` legges til som sekundært Vålerenga-anker for spillerperiodene og trenerstarten i 1998.
- Den separate filen pakkes som en én-elements JSON-array for kompatibilitet med eksisterende runtime-loadere.

Kilder:

- https://en.wikipedia.org/wiki/Egil_Olsen
- https://de.wikipedia.org/wiki/Egil_Olsen
- https://en.wikipedia.org/wiki/V%C3%A5lerenga_Fotball

## Avgrensning

Ingen manifestlinjer, place-filer, bilder, UI-filer eller runtimefiler endres.