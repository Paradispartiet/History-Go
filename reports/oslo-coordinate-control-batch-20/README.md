# Oslo koordinatkontroll – batch 20

Dato: 2026-07-19

Denne batchen avslutter Oslo-klyngen i det globale place-manifestet. Fire canonical steder er kontrollert. 3 er godkjent. Prinds Christian Augusts Minde er fullført som needs_review uten koordinatendring fordi adressefinneren ikke ga ett entydig kompleksanker.

| placeId | resultat | kildeobjekt / avgjørelse |
|---|---|---|
| `oslo_hospital` | verified_geometry | `osm-way:111555053`; adressefinner-resultatet beholdes som dokumentert flertydighet |
| `botsfengselet` | verified | `geonorge-adresser-v1:0301:18780:11` |
| `prinds_christian_augusts_minde` | needs_review | flere ikke-entydige treff for Storgata 36 |
| `gamle_radhus` | verified | `geonorge-adresser-v1:0301:15006:1` |

## Metode

- Oslo Hospital: Ekebergveien 1 ble prøvd adresse-first og ga flere treff. Fallback er et eksplisitt representativt kompleksanker på OSM way 111555053, kryssjekket mot den offisielt beskrevne hospitaltomten.
- Botsfengselet: Åkebergveien 11.
- Prindsen: Storgata 36; godkjennes bare ved ett entydig finder-treff.
- Gamle Rådhus: Nedre Slottsgate 1.

Alle finder-resultater er lagret med `tee` i denne rapportmappen.
