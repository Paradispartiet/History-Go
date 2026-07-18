# Oslo koordinatkontroll – batch 12

Dato: 2026-07-19

## Resultat

Sju canonical Oslo-steder er kontrollert. Fem får full Coordinate Source Contract v1 som dokumenterte områdeankre. To lineære ruteobjekter beholdes som `needs_review` fordi dagens enkeltpunkt ikke kan verifisere hele traseen.

| placeId | resultat | kilde |
|---|---|---|
| `ring_3` | needs_review / needs_geometry | Statens vegvesen – rv. 150 Ring 3 |
| `trikk_17_18` | needs_review / needs_geometry | Ruter – trikkelinjer 17 og 18 |
| `grunerlokka_helgesens_tm` | verified_geometry | Oslo byleksikon – Thorvald Meyers gate |
| `toyen_torg` | verified_geometry | Oslo kommune – torg- og møteplassprogrammet |
| `majorstuen_krysset` | verified_geometry | Oslo byleksikon – Valkyriegata / Majorstukrysset |
| `st_hanshaugen_park` | verified_geometry | Oslo kommune – St. Hanshaugen |
| `aker_brygge` | verified_geometry | Oslo kommune – Fjordbyen: Aker brygge |

## Metodebeslutninger

- Ring 3 og trikk 17/18 blir ikke kunstig «presisert» ved å legge til desimaler på gamle symbolpunkter. Begge trenger traségeometri eller flere kildebelagte routeSegments.
- Kryss-, torg-, park- og områdeobjektene bruker eksplisitt `semantic_anchor` + `area_anchor`; punktet er representativt for det dokumenterte fysiske området og ikke et påstått matematisk sentrum.
- Ingen av de fem godkjente stedene flyttes i denne batchen. Arbeidet oppgraderer kildekontrakten og dokumenterer hvorfor eksisterende punkt er et gyldig display-/områdeanker.

## Kilder

- Statens vegvesen – sykkelveger langs rv. 150 Ring 3: https://www.vegvesen.no/vegprosjekter/prosjekt/sykkelvegeroslo/
- Ruter – trikkelinjer og linjekart: https://ruter.no/planlegg-reise/rutetabeller-og-linjekart/trikk
- Oslo byleksikon – Thorvald Meyers gate: https://oslobyleksikon.no/side/Thorvald_Meyers_gate
- Oslo kommune – møteplasser/Tøyen torg: https://magasin.oslo.kommune.no/byplan/gode-ideer-gir-gode-moteplasser
- Oslo byleksikon – Valkyriegata: https://oslobyleksikon.no/side/Valkyriegata
- Oslo kommune – St. Hanshaugen: https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/st-hanshaugen/
- Oslo kommune – Aker brygge: https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/aker-brygge
