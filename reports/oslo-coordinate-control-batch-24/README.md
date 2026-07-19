# Oslo koordinatkontroll – batch 24

Dato: 2026-07-19

Sju kontroller er fullført. Fire steder får nye kildebelagte ankere, mens tre records står som `needs_review` fordi den aktive place-identiteten ikke er presis nok til at et punkt kan godkjennes uten å endre eller gjette hva recorden representerer.

| placeId | resultat | kilde / avgjørelse |
|---|---|---|
| `sagene_kvernhus` | needs_review | sammenblandet mølle-/kvernområde uten ett entydig fysisk objekt |
| `ovre_foss` | verified_geometry | `wikidata:Q11975545` – Hjula Væverier |
| `schous_bryggeri` | verified | `geonorge-adresser-v1:0301:17749:2` – Trondheimsveien 2 |
| `ringnes_bryggeri` | verified | `geonorge-adresser-v1:0301:17489:2A` – Thorvald Meyers gate 2A |
| `st_halvard_bryggeri` | needs_review | identitets-/historiekonflikt; Pilestredet 75C ikke anvendt |
| `oslo_kornmagasin` | needs_review | aktiv 1785-identitet matcher ikke sikkert Akershus Kornmagasinet fra 1788 |
| `akershus_slott_bakeriet` | verified_geometry | `osm-way:669390521` – navngitt Bakeriet-objekt |

## Metode

- Konkrete adresser ble kjørt gjennom den normative Geonorge-finneren med output lagret i `reports/oslo-coordinate-control-batch-24/lookups/`.
- Det brede Sagveien 23-oppslaget og Thorvald Meyers gate 2-oppslaget ble ikke brukt fordi de var tvetydige.
- Ringnes ble presisert til det dokumenterte gamle brygghuset i Thorvald Meyers gate 2A før nytt adresseoppslag.
- Hjula ble forankret til det navngitte kildeobjektet Wikidata Q11975545 etter at adresseoppslaget var tvetydig.
- Bakeriet ble forankret til det eksakte navngitte OSM-bygningsobjektet og kryssjekket mot Akershus-fredningsforskriften.
- De tre `needs_review`-recordene beholder sine eksisterende koordinater uendret.
