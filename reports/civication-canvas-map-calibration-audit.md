# Civication Canvas-kart – Oslo-kalibrering audit

Generert: 2026-06-04T19:49:06.056Z

Denne rapporten beskriver hvordan History Go-steder projiseres på det
Canvas-baserte Civication-Oslo-kartet etter at kalibreringsmodellen
(`CivicationOsloMapCalibration.js`) ble innført. Ingen place-data er endret.

## Nøkkeltall

| Måling | Antall |
|--------|--------|
| Steder lastet totalt (dedup) | 479 |
| Oslo-steder (etter filter) | 303 |
| Steder utenfor Oslo-filter | 176 |
| Med manuell `civiMap.x/y` | 0 |
| Med kalibrert projeksjon | 303 |
| Med fallback (bounding box) | 0 |
| Uten lat/lon | 0 |
| Projisert ut i fjorden (heuristikk) | 28 |

Zoom-grenser (antall synlige): low=18, mid=45, high=80.

## Geo-ankere

| id | navn | x | y |
|----|------|---|---|
| oslo_s | Oslo S | 0.535 | 0.585 |
| bjorvika | Bjørvika | 0.565 | 0.625 |
| akershus | Akershus festning | 0.5 | 0.64 |
| radhuset | Rådhuset | 0.47 | 0.61 |
| stortinget | Stortinget | 0.495 | 0.575 |
| bislett | Bislett | 0.43 | 0.465 |
| majorstuen | Majorstuen | 0.36 | 0.445 |
| frognerparken | Frognerparken | 0.305 | 0.465 |
| grunerlokka | Grünerløkka | 0.555 | 0.455 |
| toyen | Tøyen | 0.625 | 0.52 |
| ekeberg | Ekeberg | 0.66 | 0.705 |
| bygdoy | Bygdøy | 0.25 | 0.68 |
| hovedoya | Hovedøya | 0.465 | 0.76 |
| sognsvann | Sognsvann | 0.42 | 0.115 |

## Steder uten lat/lon (0)

_Ingen._

## Steder som havner i fjorden etter projeksjon (28)

Heuristikk: projisert punkt i fjord/innerFjordArm/Bjørvika-vann og ikke på øy/halvøy/festning.

- `bispelokket` – Bispelokket / Trafikkmaskinen (x=0.547, y=0.615)
- `bjorvika` – Bjørvika (x=0.544, y=0.616)
- `oslo_bussterminal` – Oslo bussterminal (x=0.563, y=0.607)
- `botsparken` – Botsparken (x=0.602, y=0.627)
- `sorenga` – Sørenga (x=0.566, y=0.639)
- `operahuset` – Operahuset (x=0.544, y=0.616)
- `deichman_bjorvika` – Deichman Bjørvika (x=0.551, y=0.617)
- `barcode` – Barcode (x=0.562, y=0.602)
- `middelalder_oslo` – Middelalderparken (x=0.571, y=0.632)
- `gamlebyen_gravlund` – Gamlebyen gravlund (x=0.629, y=0.656)
- `oslo_ladegard` – Oslo ladegård (x=0.595, y=0.619)
- `oslo_hospital` – Oslo hospital (x=0.602, y=0.642)
- `munch_museet` – MUNCH (x=0.572, y=0.628)
- `salt` – SALT (x=0.541, y=0.613)
- `gronlikaia` – Grønlikaia (x=0.567, y=0.666)
- `alna_utlop_bjorvika` – Alna utløp i Bjørvika (x=0.584, y=0.633)
- `hovedoya` – Hovedøya (x=0.488, y=0.742)
- `ljanselva` – Ljanselva (x=0.672, y=0.833)
- `skraperudtjern` – Skraperudtjern (x=0.876, y=0.75)
- `ljanselva_skullerud` – Ljanselva ved Skullerud (x=0.813, y=0.782)
- `ljanselva_hauketo` – Ljanselva ved Hauketo (x=0.736, y=0.838)
- `ljanselva_ljan` – Ljanselva ved Ljan (x=0.715, y=0.896)
- `ljanselva_fiskevollen` – Ljanselva ved Fiskevollen (x=0.7, y=0.909)
- `ljanselva_bunnefjorden` – Ljanselva ut i Bunnefjorden (x=0.696, y=0.92)
- `lekeplass_botsparken` – Botsparken lekeplass (x=0.602, y=0.627)
- `schweigaards_gate_lodalen` – Schweigaards gate–Lodalen veggakse (x=0.611, y=0.603)
- `gamlebyen_sport_og_fritid` – Gamlebyen Sport og Fritid (x=0.602, y=0.628)
- `gamlebyen_skole` – Gamlebyen skole (x=0.598, y=0.638)

## Topp 30 synlige – low zoom (maks 18)

| # | id | navn | kat | asset | prio | x | y | kilde |
|---|----|------|-----|-------|------|---|---|-------|
| 1 | `radhusplassen` | Rådhusplassen | by | civic | 13 | 0.467 | 0.612 | calibrated |
| 2 | `barcode` | Barcode | by | skyline | 13 | 0.562 | 0.602 | calibrated |
| 3 | `gamle_radhus` | Gamle rådhus | historie | civic | 11 | 0.5 | 0.612 | calibrated |
| 4 | `stortinget` | Stortinget | politikk | civic | 11 | 0.492 | 0.577 | calibrated |
| 5 | `oslo_radhus` | Oslo rådhus | politikk | civic | 11 | 0.471 | 0.606 | calibrated |
| 6 | `bislett_stadion` | Bislett Stadion | sport | stadium | 11 | 0.435 | 0.47 | calibrated |
| 7 | `bjorvika` | Bjørvika | by | default | 7 | 0.544 | 0.616 | calibrated |
| 8 | `oslo_s` | Oslo S | by | default | 7 | 0.533 | 0.585 | calibrated |
| 9 | `nationaltheatret_stasjon` | Nationaltheatret stasjon | by | theatre | 7 | 0.467 | 0.592 | calibrated |
| 10 | `bislett` | Bislett | by | default | 7 | 0.433 | 0.468 | calibrated |
| 11 | `deichman_bjorvika` | Deichman Bjørvika | by | default | 7 | 0.551 | 0.617 | calibrated |
| 12 | `nationaltheatret` | Nationaltheatret | litteratur | theatre | 7 | 0.465 | 0.591 | calibrated |
| 13 | `tinghuset` | Oslo tinghus | politikk | civic | 7 | 0.496 | 0.57 | calibrated |
| 14 | `regjeringskvartalet` | Regjeringskvartalet | politikk | civic | 7 | 0.511 | 0.578 | calibrated |
| 15 | `ullevaal_stadion` | Ullevaal Stadion | sport | stadium | 7 | 0.431 | 0.337 | calibrated |
| 16 | `intility_arena` | Intility Arena | sport | stadium | 7 | 0.71 | 0.544 | calibrated |
| 17 | `jordal_amfi` | Jordal Amfi | sport | stadium | 7 | 0.646 | 0.559 | calibrated |
| 18 | `holmenkollen_nasjonalanlegg` | Holmenkollen nasjonalanlegg | sport | stadium | 7 | 0.244 | 0.267 | calibrated |

## Topp 30 synlige – mid zoom (maks 45)

| # | id | navn | kat | asset | prio | x | y | kilde |
|---|----|------|-----|-------|------|---|---|-------|
| 1 | `radhusplassen` | Rådhusplassen | by | civic | 13 | 0.467 | 0.612 | calibrated |
| 2 | `barcode` | Barcode | by | skyline | 13 | 0.562 | 0.602 | calibrated |
| 3 | `gamle_radhus` | Gamle rådhus | historie | civic | 11 | 0.5 | 0.612 | calibrated |
| 4 | `stortinget` | Stortinget | politikk | civic | 11 | 0.492 | 0.577 | calibrated |
| 5 | `oslo_radhus` | Oslo rådhus | politikk | civic | 11 | 0.471 | 0.606 | calibrated |
| 6 | `bislett_stadion` | Bislett Stadion | sport | stadium | 11 | 0.435 | 0.47 | calibrated |
| 7 | `bjorvika` | Bjørvika | by | default | 7 | 0.544 | 0.616 | calibrated |
| 8 | `oslo_s` | Oslo S | by | default | 7 | 0.533 | 0.585 | calibrated |
| 9 | `nationaltheatret_stasjon` | Nationaltheatret stasjon | by | theatre | 7 | 0.467 | 0.592 | calibrated |
| 10 | `bislett` | Bislett | by | default | 7 | 0.433 | 0.468 | calibrated |
| 11 | `deichman_bjorvika` | Deichman Bjørvika | by | default | 7 | 0.551 | 0.617 | calibrated |
| 12 | `nationaltheatret` | Nationaltheatret | litteratur | theatre | 7 | 0.465 | 0.591 | calibrated |
| 13 | `tinghuset` | Oslo tinghus | politikk | civic | 7 | 0.496 | 0.57 | calibrated |
| 14 | `regjeringskvartalet` | Regjeringskvartalet | politikk | civic | 7 | 0.511 | 0.578 | calibrated |
| 15 | `ullevaal_stadion` | Ullevaal Stadion | sport | stadium | 7 | 0.431 | 0.337 | calibrated |
| 16 | `intility_arena` | Intility Arena | sport | stadium | 7 | 0.71 | 0.544 | calibrated |
| 17 | `jordal_amfi` | Jordal Amfi | sport | stadium | 7 | 0.646 | 0.559 | calibrated |
| 18 | `holmenkollen_nasjonalanlegg` | Holmenkollen nasjonalanlegg | sport | stadium | 7 | 0.244 | 0.267 | calibrated |
| 19 | `frogner_stadion` | Frogner stadion | sport | stadium | 7 | 0.346 | 0.459 | calibrated |
| 20 | `valle_hovin_stadion` | Valle Hovin stadion | sport | stadium | 7 | 0.702 | 0.539 | calibrated |
| 21 | `gressbanen` | Gressbanen | sport | stadium | 7 | 0.253 | 0.354 | calibrated |
| 22 | `ekebergsletta` | Ekebergsletta | sport | stadium | 7 | 0.657 | 0.711 | calibrated |
| 23 | `kfum_arena` | KFUM Arena | sport | stadium | 7 | 0.657 | 0.714 | calibrated |
| 24 | `vallhall_arena` | Vallhall Arena | sport | stadium | 7 | 0.706 | 0.531 | calibrated |
| 25 | `manglerudhallen` | Manglerudhallen | sport | stadium | 7 | 0.771 | 0.649 | calibrated |
| 26 | `furuset_forum` | Furuset Forum | sport | stadium | 7 | 0.964 | 0.476 | calibrated |
| 27 | `good_game_redaksjon` | Good Game-redaksjonen (NRK) | media | civic | 6 | 0.375 | 0.441 | calibrated |
| 28 | `vg_huset` | VG-huset | media | civic | 6 | 0.503 | 0.577 | calibrated |
| 29 | `nrk_huset_marienlyst` | NRK-huset på Marienlyst | media | civic | 6 | 0.375 | 0.441 | calibrated |
| 30 | `aftenposten_akersgata` | Aftenposten i Akersgata | media | civic | 6 | 0.5 | 0.577 | calibrated |

## Topp 30 synlige – high zoom (maks 80)

| # | id | navn | kat | asset | prio | x | y | kilde |
|---|----|------|-----|-------|------|---|---|-------|
| 1 | `radhusplassen` | Rådhusplassen | by | civic | 13 | 0.467 | 0.612 | calibrated |
| 2 | `barcode` | Barcode | by | skyline | 13 | 0.562 | 0.602 | calibrated |
| 3 | `gamle_radhus` | Gamle rådhus | historie | civic | 11 | 0.5 | 0.612 | calibrated |
| 4 | `stortinget` | Stortinget | politikk | civic | 11 | 0.492 | 0.577 | calibrated |
| 5 | `oslo_radhus` | Oslo rådhus | politikk | civic | 11 | 0.471 | 0.606 | calibrated |
| 6 | `bislett_stadion` | Bislett Stadion | sport | stadium | 11 | 0.435 | 0.47 | calibrated |
| 7 | `bjorvika` | Bjørvika | by | default | 7 | 0.544 | 0.616 | calibrated |
| 8 | `oslo_s` | Oslo S | by | default | 7 | 0.533 | 0.585 | calibrated |
| 9 | `nationaltheatret_stasjon` | Nationaltheatret stasjon | by | theatre | 7 | 0.467 | 0.592 | calibrated |
| 10 | `bislett` | Bislett | by | default | 7 | 0.433 | 0.468 | calibrated |
| 11 | `deichman_bjorvika` | Deichman Bjørvika | by | default | 7 | 0.551 | 0.617 | calibrated |
| 12 | `nationaltheatret` | Nationaltheatret | litteratur | theatre | 7 | 0.465 | 0.591 | calibrated |
| 13 | `tinghuset` | Oslo tinghus | politikk | civic | 7 | 0.496 | 0.57 | calibrated |
| 14 | `regjeringskvartalet` | Regjeringskvartalet | politikk | civic | 7 | 0.511 | 0.578 | calibrated |
| 15 | `ullevaal_stadion` | Ullevaal Stadion | sport | stadium | 7 | 0.431 | 0.337 | calibrated |
| 16 | `intility_arena` | Intility Arena | sport | stadium | 7 | 0.71 | 0.544 | calibrated |
| 17 | `jordal_amfi` | Jordal Amfi | sport | stadium | 7 | 0.646 | 0.559 | calibrated |
| 18 | `holmenkollen_nasjonalanlegg` | Holmenkollen nasjonalanlegg | sport | stadium | 7 | 0.244 | 0.267 | calibrated |
| 19 | `frogner_stadion` | Frogner stadion | sport | stadium | 7 | 0.346 | 0.459 | calibrated |
| 20 | `valle_hovin_stadion` | Valle Hovin stadion | sport | stadium | 7 | 0.702 | 0.539 | calibrated |
| 21 | `gressbanen` | Gressbanen | sport | stadium | 7 | 0.253 | 0.354 | calibrated |
| 22 | `ekebergsletta` | Ekebergsletta | sport | stadium | 7 | 0.657 | 0.711 | calibrated |
| 23 | `kfum_arena` | KFUM Arena | sport | stadium | 7 | 0.657 | 0.714 | calibrated |
| 24 | `vallhall_arena` | Vallhall Arena | sport | stadium | 7 | 0.706 | 0.531 | calibrated |
| 25 | `manglerudhallen` | Manglerudhallen | sport | stadium | 7 | 0.771 | 0.649 | calibrated |
| 26 | `furuset_forum` | Furuset Forum | sport | stadium | 7 | 0.964 | 0.476 | calibrated |
| 27 | `good_game_redaksjon` | Good Game-redaksjonen (NRK) | media | civic | 6 | 0.375 | 0.441 | calibrated |
| 28 | `vg_huset` | VG-huset | media | civic | 6 | 0.503 | 0.577 | calibrated |
| 29 | `nrk_huset_marienlyst` | NRK-huset på Marienlyst | media | civic | 6 | 0.375 | 0.441 | calibrated |
| 30 | `aftenposten_akersgata` | Aftenposten i Akersgata | media | civic | 6 | 0.5 | 0.577 | calibrated |
