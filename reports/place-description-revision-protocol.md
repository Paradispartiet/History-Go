# Protokoll for desc/popupDesc-revisjonen

Dette dokumentet er den løpende produksjonsprotokollen for steder som er oppgradert etter den nye standarden i `PLACE_DESCRIPTION_CANONICAL.md`.

Oslo-omfanget skal telles fra alle aktive Oslo-stedsfiler i `data/places/manifest.json`, ikke bare fra den opprinnelige mappen `data/places/by/oslo/places/`. Den gamle køen på 58 steder var derfor en delmengde, ikke hele Oslo.

## Bindende ferdigkrav

- `desc`: normalt 40–80 ord.
- `popupDesc`: minst 300 ord; normalt 300–600 ord.
- `popupDesc`: minst tre avsnitt.
- Teksten skal være stedsspesifikk, faktabåret og kildegrunnlaget skal være inspiserbart.
- Bare steder som er ferdig skrevet, validert og merget på `main` telles i den publiserte totalen.

## Oslo-status etter denne PR-en

- Totalt i den aktive Oslo-køen: **90 steder**
- Ferdig før denne batchen: **88 steder**
- Denne batchen: **2 steder**
- Ferdig etter merge av denne batchen: **90 steder**
- Gjenstår etter merge: **0 steder**

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
| 23 | Helsfyr | `helsfyr` | 47 | 338 | 5 | #4043 |
| 24 | Bogstadveien | `bogstadveien` | 49 | 329 | 5 | #4043 |
| 25 | Markveien | `markveien` | 48 | 303 | 5 | #4043 |
| 26 | Grønlandsleiret | `gronlandsleiret` | 43 | 329 | 6 | #4043 |
| 27 | Majorstukrysset | `majorstuen_krysset` | 41 | 337 | 6 | #4043 |
| 28 | Rodeløkka | `rodelokka` | 48 | 345 | 6 | #4043 |
| 29 | Vålerenga | `vaalerenga` | 49 | 318 | 6 | #4043 |
| 30 | Vinderen | `vinderen` | 49 | 332 | 6 | #4043 |
| 31 | Ullern | `ullern` | 41 | 310 | 6 | #4043 |
| 32 | Grønland kirke | `gronland_kirke` | 46 | 309 | 6 | #4043 |
| 33 | Kampen kirke | `kampen_kirke` | 51 | 317 | 5 | #4069 |
| 34 | Ullevål Hageby | `ullevål_hageby` | 51 | 351 | 6 | #4069 |
| 35 | Romsås | `romsaås` | 48 | 321 | 6 | #4069 |
| 36 | Grünerløkka – Helgesens / Thorvald Meyers | `grunerlokka_helgesens_tm` | 44 | 321 | 6 | #4069 |
| 37 | Spikersuppa | `spikersuppa` | 45 | 319 | 6 | #4069 |
| 38 | Bankplassen | `bankplassen` | 46 | 372 | 7 | #4069 |
| 39 | Christiania Torv | `christiania_torv` | 49 | 357 | 7 | #4069 |
| 40 | Botsparken | `botsparken` | 44 | 314 | 6 | #4069 |
| 41 | Slottsparken | `slottsparken` | 47 | 335 | 7 | #4069 |
| 42 | Tjuvholmen | `tjuvholmen` | 43 | 351 | 7 | #4069 |
| 43 | Sørenga | `sorenga` | 49 | 326 | 6 | #4101 |
| 44 | Majorstuen T-banestasjon | `majorstuen_tbanestasjon` | 48 | 305 | 6 | #4101 |
| 45 | Nationaltheatret stasjon | `nationaltheatret_stasjon` | 48 | 316 | 6 | #4101 |
| 46 | Bislett | `bislett` | 50 | 340 | 6 | #4101 |
| 47 | Olaf Ryes plass | `olaf_ryes_plass` | 46 | 303 | 6 | #4101 |
| 48 | Birkelunden | `birkelunden` | 54 | 309 | 6 | #4101 |
| 49 | Universitetsplassen | `universitetsplassen` | 54 | 309 | 6 | #4101 |
| 50 | Deichman Bjørvika | `deichman_bjorvika` | 52 | 328 | 6 | #4101 |
| 51 | Vigelandsparken | `vigelandsparken` | 48 | 351 | 7 | #4101 |
| 52 | Voienvolden | `voienvolden` | 50 | 307 | 7 | #4101 |
| 53 | Carl Berners plass | `carl_berner_plass` | 49 | 309 | 6 | #4124 |
| 54 | Tullin | `tullin` | 48 | 318 | 6 | #4124 |
| 55 | Økern | `okern` | 49 | 308 | 6 | #4124 |
| 56 | Skøyen | `skoyen` | 48 | 303 | 6 | #4124 |
| 57 | Trikkelinje 17/18 | `trikk_17_18` | 49 | 301 | 6 | #4124 |
| 58 | St. Hanshaugen park | `st_hanshaugen_park` | 53 | 311 | 7 | #4124 |
| 59 | Saga kino | `saga_kino` | 48 | 337 | 6 | #4137 |
| 60 | Klingenberg kino | `klingenberg_kino` | 45 | 336 | 6 | #4137 |
| 61 | Gimle kino | `gimle_kino` | 51 | 320 | 6 | #4137 |
| 62 | Vika kino | `vika_kino` | 50 | 310 | 6 | #4137 |
| 63 | Hartvig Nissens skole (SKAM) | `hartvig_nissens_skole_skam` | 45 | 331 | 6 | #4137 |
| 64 | Middelalderparken | `middelalder_oslo` | 43 | 308 | 6 | #4137 |
| 65 | Gamlebyen gravlund | `gamlebyen_gravlund` | 44 | 302 | 6 | #4137 |
| 66 | Akershus festning | `akershus_festning` | 48 | 306 | 6 | #4137 |
| 67 | Hovedøya kloster | `hovedoya_kloster` | 44 | 301 | 6 | #4137 |
| 68 | Villa Grande | `villa_grande` | 48 | 325 | 6 | #4137 |

| 69 | Gamle Aker kirke | `gamle_aker_kirke` | 48 | 310 | 6 | #4147 |
| 70 | Vår Frelsers gravlund | `var_frelsers_gravlund` | 52 | 315 | 6 | #4147 |
| 71 | Bogstad gård | `bogstad_gard` | 50 | 307 | 6 | #4147 |
| 72 | Møllergata 19 | `mollergata_19` | 45 | 304 | 6 | #4147 |
| 73 | Sagene skole | `sagene_skole` | 49 | 314 | 6 | #4147 |
| 74 | Oslo domkirke | `oslo_domkirke` | 50 | 304 | 6 | #4147 |
| 75 | Damstredet og Telthusbakken | `damstredet_telthusbakken` | 46 | 304 | 6 | #4147 |
| 76 | Gamle trikkestallen på Sagene | `gamle_trikkestallen` | 47 | 308 | 6 | #4147 |
| 77 | Det kongelige slott | `slottet` | 51 | 301 | 6 | #4147 |
| 78 | Sofienberg kirke | `sofienberg_kirke` | 52 | 302 | 6 | #4147 |

| 79 | Trefoldighetskirken | `trefoldighetskirken` | 50 | 302 | 6 | #4149 |
| 80 | Nonneseter kloster | `nonneseter_kloster` | 53 | 321 | 6 | #4149 |
| 81 | Oslo ladegård | `oslo_ladegard` | 50 | 305 | 6 | #4149 |
| 82 | Galgeberg | `galgeberg` | 49 | 314 | 6 | #4149 |
| 83 | Oslo Hospital | `oslo_hospital` | 52 | 300 | 6 | #4149 |
| 84 | Botsfengselet | `botsfengselet` | 51 | 306 | 6 | #4149 |
| 85 | Prinds Christian Augusts Minde | `prinds_christian_augusts_minde` | 51 | 308 | 6 | #4149 |
| 86 | Peststøtten – Krist kirkegård | `peststotten_krist_kirkegard` | 51 | 302 | 6 | #4149 |
| 87 | Kjærlighetskarusellen | `kjaerlighetskarusellen` | 53 | 300 | 6 | #4149 |
| 88 | Villa Stenersen | `villa_stenersen` | 55 | 317 | 6 | #4149 |

| 89 | St. Hallvard kirke og kloster | `st_hallvard_kirke_kloster` | 52 | 301 | 6 | #4150 |
| 90 | Gamle rådhus | `gamle_radhus` | 50 | 300 | 6 | #4150 |

## Gjenstående Oslo-kø

Ingen. Alle 90 aktive Oslo-steder er ferdige etter merge av denne PR-en.

## Oppdagede metadataavvik utenfor denne PR-ens tekstomfang

- `saga_kino.year` står som 1989, mens kinoen åpnet i 1934 og ble bygget om til kinosenter i 1981.
- `vika_kino.year` står som 1981, mens dagens kino i Ruseløkkveien 14 åpnet i 1997.
- `klingenberg_kino.category` står som `sport` selv om filens emner og innhold gjelder film- og kinokultur.

Disse avvikene skal repareres i et eget, eksplisitt metadataarbeid og ikke blandes skjult inn i desc/popupDesc-revisjonen.

## Batchlogg

| Batch | Steder | Resultat |
|---|---:|---|
| Pilot | 1 | Torggata merget i #3954 |
| Pilot | 1 | Bispelokket merget i #3958 |
| Oslo V4 batch 1 | 10 | Merget i #4014 |
| Oslo V4 batch 2 | 10 | Merget i #4036 |
| Oslo V4 batch 3 | 10 | Merget i #4043 |
| Oslo V4 batch 4 | 10 | #4069 |
| Oslo V4 batch 5 | 10 | #4101 |
| Oslo V4 batch 6 | 6 | #4124 – fullførte den opprinnelige 58-steders delkøen |
| Oslo V4 batch 7 | 10 | #4137 – første batch etter utvidelse til alle 90 aktive Oslo-steder |
| Oslo V4 batch 8 | 10 | #4147 |
| Oslo V4 batch 9 | 10 | #4149 |
| Oslo V4 batch 10 | 2 | #4150 – fullfører alle 90 aktive Oslo-steder |

Protokollen skal oppdateres i samme PR som hver nye batch. Et sted flyttes først til «Ferdige steder» når teksten oppfyller ord-, avsnitts-, kilde- og valideringskravene.
