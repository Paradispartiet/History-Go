# Oslo koordinatkontroll – batch 28

Dato: 2026-07-19

Kontroll 173–174 avslutter `places_by_manifest.json`. Begge stedene får full coordinate source contract basert på eksakt navngitt plassgeometri.

| placeId | resultat | kildeobjekt |
|---|---|---|
| `bankplassen` | verified_geometry | `osm-relation:12044741` |
| `christiania_torv` | verified_geometry | `osm-way:594329484` |

## Overlap-audit

- Bankplassen er selve plassen og er fysisk modellert separat fra `grunnlovsbygget_bankplassen` / Den gamle Norges Bank.
- Christiania Torv er selve torvet og er fysisk modellert separat fra `gamle_radhus`.
- Ingen bygningsadresse er brukt som erstatning for et plassanker.
- Bankplassens tidligere Wikidata-punkt er beholdt som uavhengig identitetskryssjekk, mens det eksakte OSM-plassobjektet er canonical koordinatkilde.
