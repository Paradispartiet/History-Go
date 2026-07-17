# Bislett Stadion – historiske Vålerenga-profiler, batch 6: research

## Research-gate og audit

Før utvalg ble alle aktive people-ID-er kontrollert ved å lese hele people-datasettet (869 unike ID-er), og alle profiler med `placeId: bislett_stadion` eller `bislett_stadion` i `places` ble listet. Audit-en bekrefter at de fem tidligere historiske Vålerenga-batchene allerede dekker gullgenerasjonene rundt 1965, 1980–1985 og flere trenere. Den bekrefter også at Klanen, Henning Berg, Einar Bruno Larsen og Egil «Drillo» Olsen allerede er korrekte Bislett-krysskoblinger, og at ingen av deres ID-er skal opprettes på nytt.

Følgende tidligere rapporter er gjennomgått: historisk batch 1–5, begge krysskoblingsrapporter og tilhørende valideringer. Vålerengas sesonghistorikk og historiske spiller-/trenerprofiler ble deretter vurdert mot stadionhistorikken: Bislett var klubbens sentrale hjemmebane i de valgte periodene. Kandidater med bare korte opphold, eller med en tydeligere moderne/annen primærtilknytning, ble ikke valgt.

## Kandidatvurdering

| Kandidat | Vålerenga-periode | Rolle | Dokumentert Bislett-relevans | Historisk betydning | Finnes allerede i people-data | Anbefaling |
| --- | --- | --- | --- | --- | --- | --- |
| Roy Helge Olsen | Lang spillerperiode fram til og med gullsesongen 1965 | Spiller | Var del av klubbens første seriemesterlag; sesongen tilhører Bisletts hjemmebaneepoke. | Klubbikon og representant for den første gullgenerasjonen. | Nei | **add** |
| Rolf Aaberg | Slutten av 1970-årene–1981 | Spiller | Cupgullet 1980 og seriegullet 1981 ble vunnet i Bislett-epoken. | Tydelig del av laget som innledet klubbens 1980-tallssuksess. | Nei | **add** |
| Lars Bohinen | 1989–1993 | Midtbanespiller | Hele Vålerenga-perioden ligger i den sene Bislett-epoken. | Lang nok Vålerenga-periode og et tydelig gjennombrudd før landslag og utland. | Nei | **add** |
| Ståle Solbakken | 1989–1994 | Midtbanespiller og kaptein | Kapteinsperioden og den definerende tidlige Vålerenga-fasen fant sted mens Bislett var hjemmebane. | Sentralt klubbnavn og senere en av norsk fotballs viktigste trenere. | Ja, med Ullevaal som primæranker | **cross-link** |
| Ronny Johnsen | 1992–1995 | Forsvarsspiller | Seniorgjennombruddet i Vålerenga faller i Bisletts sene hjemmebaneepoke. | Tydelig historisk betydning som klubbens internasjonale forsvarsprofil. | Nei | **add** |
| Kjetil Rekdal | Senere Vålerenga-periode | Spiller/trener | Den eksisterende profilen er kanonisk ankret til Ullevaal for landslaget; den valgte femmergruppen er allerede dekket uten å utvide cross-link-scope ytterligere. | Stor norsk fotballprofil, men ikke nødvendig for å fylle batchen. | Ja | **skip** |
| Henning Berg | 1988–1991 | Spiller | Har allerede `bislett_stadion` som sekundær historisk tilknytning. | Vålerenga-gjennombrudd og landslagsprofil. | Ja | **skip** |
| Einar Bruno Larsen | 1957–1968 | Spiller | Har allerede Bislett som sekundært fotballanker, mens Jordal beholdes som hovedanker for ishockeyen. | Fleridrettslegende og 1965-mester. | Ja | **skip** |

## Stedsprinsipp

De fire nye profilene får `bislett_stadion` som hovedanker fordi den definerende Vålerenga-perioden, ikke bare en tilfeldig kamp eller moderne etterkarriere, faller i Bislett-epoken. Ståle Solbakken beholder `ullevaal_stadion` som primæranker for den eksisterende landslagsprofilen og får Bislett kun i `places`. Ingen profiler kobles retroaktivt til Intility Arena.

## Kildegrunnlag

- Vålerenga Fotball, klubb- og sesonghistorikk: https://www.valerenga.no/om-klubben/historie
- Vålerenga Fotball, historiske sesongoversikter: https://en.wikipedia.org/wiki/List_of_V%C3%A5lerenga_Fotball_seasons
- Bislett Stadion, stadion- og hjemmebanehistorikk: https://snl.no/Bislett_stadion
- Norges Fotballforbund, spillerprofiler og landslagsstatistikk: https://www.fotball.no/landslag/norge-a-herrer/
- Norsk biografisk/encyklopedisk bakgrunn for de enkelte profilene, blant annet: https://snl.no/St%C3%A5le_Solbakken og https://snl.no/Ronny_Johnsen
