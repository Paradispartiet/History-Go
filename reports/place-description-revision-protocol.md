# Protokoll for desc/popupDesc-revisjonen

Dette dokumentet er den løpende produksjonsprotokollen for steder som er oppgradert etter den nye standarden i `PLACE_DESCRIPTION_CANONICAL.md`.

## Bindende ferdigkrav

- `desc`: normalt 40–80 ord.
- `popupDesc`: minst 300 ord; normalt 300–600 ord.
- `popupDesc`: minst tre avsnitt.
- Teksten skal være stedsspesifikk, faktabåret og kildegrunnlaget skal være inspiserbart.
- Bare steder som er ferdig skrevet, validert og merget på `main` telles i den publiserte totalen.

## Oslo-status etter denne PR-en

- Totalt i Oslo-køen: **58 steder**
- Ferdig før denne batchen: **22 steder**
- Denne batchen: **10 steder**
- Ferdig etter merge av denne batchen: **32 steder**
- Gjenstår etter merge: **26 steder**

## Ferdige steder etter denne PR-en

| Nr. | Sted | place_id | desc | popupDesc | Avsnitt | PR |
|---:|---|---|---:|---:|---:|---|
| 1 | Torggata | `torggata` | 49 | 482 | 5 | #3954 |
| 2 | Bispelokket / Trafikkmaskinen | `bispelokket` | 56 | 401 | 5 | #3958 |
| 3 | Ring 3 | `ring_3` | 50 | 422 | 5 | #4014 |
| 4 | Storgata | `storgata` | 43 | 420 | 7 | #4014 |
| 5 | Nydalen | `nydalen` | 55 | 421 | 7 | #4014 |
| 6 | Stensparken | `stensparken` | 46 | 397 | 7 | #4014 |
| 7 | Akerselva | `akerselva` | 51 | 445 | 8 | #4014 |
| 8 | Torshov | `torshov` | 53 | 411 | 7 | #4014 |
| 9 | Grorud | `grorud` | 57 | 403 | 7 | #4014 |
| 10 | Sagene | `sagene` | 52 | 416 | 7 | #4014 |
| 11 | Barcode | `barcode` | 58 | 411 | 7 | #4014 |
| 12 | Bjørvika | `bjorvika` | 49 | 426 | 8 | #4014 |
| 13 | Grønland Basarene | `gronland_basarene` | 46 | 300 | 4 | #4036 |
| 14 | Karl Johans gate | `karl_johan` | 46 | 386 | 5 | #4036 |
| 15 | Rådhusplassen | `radhusplassen` | 48 | 311 | 5 | #4036 |
| 16 | Tigerstatuen | `tigeren` | 46 | 316 | 5 | #4036 |
| 17 | Tøyen torg | `toyen_torg` | 43 | 336 | 6 | #4036 |
| 18 | Oslo S | `oslo_s` | 45 | 370 | 6 | #4036 |
| 19 | Jernbanetorget | `jernbanetorget` | 48 | 353 | 6 | #4036 |
| 20 | Aker Brygge | `aker_brygge` | 51 | 382 | 6 | #4036 |
| 21 | Vulkan energisentral | `vulkan_energisentral` | 48 | 351 | 6 | #4036 |
| 22 | Oslo bussterminal | `oslo_bussterminal` | 50 | 366 | 7 | #4036 |
| 23 | Helsfyr | `helsfyr` | 47 | 338 | 5 | Denne PR-en |
| 24 | Bogstadveien | `bogstadveien` | 49 | 329 | 5 | Denne PR-en |
| 25 | Markveien | `markveien` | 48 | 303 | 5 | Denne PR-en |
| 26 | Grønlandsleiret | `gronlandsleiret` | 43 | 329 | 6 | Denne PR-en |
| 27 | Majorstukrysset | `majorstuen_krysset` | 41 | 337 | 6 | Denne PR-en |
| 28 | Rodeløkka | `rodelokka` | 48 | 345 | 6 | Denne PR-en |
| 29 | Vålerenga | `vaalerenga` | 49 | 318 | 6 | Denne PR-en |
| 30 | Vinderen | `vinderen` | 49 | 332 | 6 | Denne PR-en |
| 31 | Ullern | `ullern` | 41 | 310 | 6 | Denne PR-en |
| 32 | Grønland kirke | `gronland_kirke` | 46 | 309 | 6 | Denne PR-en |

## Gjenstående Oslo-kø

1. Kampen kirke
2. Ullevål Hageby
3. Romsås
4. Grünerløkka – Helgesens / Thorvald Meyers
5. Spikersuppa
6. Bankplassen
7. Christiania Torv
8. Botsparken
9. Slottsparken
10. Tjuvholmen
11. Sørenga
12. Majorstuen T-banestasjon
13. Nationaltheatret stasjon
14. Bislett
15. Olaf Ryes plass
16. Birkelunden
17. Universitetsplassen
18. Deichman Bjørvika
19. Vigelandsparken
20. Voienvolden
21. Carl Berners plass
22. Tullin
23. Økern
24. Skøyen
25. Trikkelinje 17/18
26. St. Hanshaugen park

## Batchlogg

| Batch | Steder | Resultat |
|---|---:|---|
| Pilot | 1 | Torggata merget i #3954 |
| Pilot | 1 | Bispelokket merget i #3958 |
| Oslo V4 batch 1 | 10 | Merget i #4014 |
| Oslo V4 batch 2 | 10 | Merget i #4036 |
| Oslo V4 batch 3 | 10 | Denne PR-en |

Protokollen skal oppdateres i samme PR som hver nye batch. Et sted flyttes først til «Ferdige steder» når teksten oppfyller ord-, avsnitts-, kilde- og valideringskravene.
