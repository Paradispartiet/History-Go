# Oslo koordinatkontroll – batch 22

Dato: 2026-07-19

Sju kontroller er fullført. Fire steder er godkjent og tre medie-records er dokumentert som needs_review på grunn av fysisk overlap eller fleradresse-identitet.

| placeId | resultat | kilde / avgjørelse |
|---|---|---|
| `good_game_redaksjon` | needs_review | delmiljø inne i canonical NRK Marienlyst |
| `aftenposten_akersgata` | needs_review | overlap med A55 / historisk fleradresse |
| `dagbladet_akersgata` | needs_review | historisk fleradresse 36 og 47/49 |
| `klassekampen_redaksjon` | verified | `geonorge-adresser-v1:0301:12446:4` |
| `oslo_gassverk` | verified_historical_source | `oslobyleksikon:gassverket:storgata-36c` |
| `oslo_posthus` | verified | `geonorge-adresser-v1:0301:11309:15` |
| `telegrafbygningen` | verified_geometry | `wikidata:Q17195132` |

## Viktige identitetsavgjørelser

- Klassekampen-recorden er korrigert fra den utdaterte Hausmanns gate-identiteten til dagens offisielle Grønland 4.
- Gassverket forankres til den bevarte kontorbygningen i Storgata 36C, ikke til et oppdiktet sentrum for hele det revne produksjonsområdet.
- Oslo Posthus-recorden fra 1924 flyttes fra Postgirobygget til det faktiske Hovedpostkontoret i Dronningens gate 15.
- Geonorge-oppslaget for Telegrafbygningen var flertydig; det ble avvist som direkte koordinatkilde. Telegrafbygningen forankres i stedet til det identifiserte objektet Wikidata Q17195132, kryssjekket mot OSM relation 13931026, Kulturminne 163682, Oslo byleksikon og Telenor Kulturarv.
- Good Game, Aftenposten og Dagbladet godkjennes ikke som nye separate fysiske punkter uten videre identitetsmodellering.
