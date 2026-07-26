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
- Ferdig før denne batchen: **12 steder**
- Denne batchen: **10 steder**
- Ferdig etter merge av denne batchen: **22 steder**
- Gjenstår etter merge: **36 steder**

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
| 13 | Grønland Basarene | `gronland_basarene` | 46 | 300 | 4 | Denne PR-en |
| 14 | Karl Johans gate | `karl_johan` | 46 | 386 | 5 | Denne PR-en |
| 15 | Rådhusplassen | `radhusplassen` | 48 | 311 | 5 | Denne PR-en |
| 16 | Tigerstatuen | `tigeren` | 46 | 316 | 5 | Denne PR-en |
| 17 | Tøyen torg | `toyen_torg` | 43 | 336 | 6 | Denne PR-en |
| 18 | Oslo S | `oslo_s` | 45 | 370 | 6 | Denne PR-en |
| 19 | Jernbanetorget | `jernbanetorget` | 48 | 353 | 6 | Denne PR-en |
| 20 | Aker Brygge | `aker_brygge` | 51 | 382 | 6 | Denne PR-en |
| 21 | Vulkan energisentral | `vulkan_energisentral` | 48 | 351 | 6 | Denne PR-en |
| 22 | Oslo bussterminal | `oslo_bussterminal` | 50 | 366 | 7 | Denne PR-en |

## Gjenstående Oslo-kø

1. Helsfyr
2. Bogstadveien
3. Markveien
4. Grønlandsleiret
5. Majorstukrysset
6. Rodeløkka
7. Vålerenga
8. Vinderen
9. Ullern
10. Grønland kirke
11. Kampen kirke
12. Ullevål Hageby
13. Romsås
14. Grünerløkka – Helgesens / Thorvald Meyers
15. Spikersuppa
16. Bankplassen
17. Christiania Torv
18. Botsparken
19. Slottsparken
20. Tjuvholmen
21. Sørenga
22. Majorstuen T-banestasjon
23. Nationaltheatret stasjon
24. Bislett
25. Olaf Ryes plass
26. Birkelunden
27. Universitetsplassen
28. Deichman Bjørvika
29. Vigelandsparken
30. Voienvolden
31. Carl Berners plass
32. Tullin
33. Økern
34. Skøyen
35. Trikkelinje 17/18
36. St. Hanshaugen park

## Batchlogg

| Batch | Steder | Resultat |
|---|---:|---|
| Pilot | 1 | Torggata merget i #3954 |
| Pilot | 1 | Bispelokket merget i #3958 |
| Oslo V4 batch 1 | 10 | Merget i #4014 |
| Oslo V4 batch 2 | 10 | Denne PR-en |

Protokollen skal oppdateres i samme PR som hver nye batch. Et sted flyttes først til «Ferdige steder» når teksten oppfyller ord-, avsnitts-, kilde- og valideringskravene.
