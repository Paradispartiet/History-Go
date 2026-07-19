# Oslo koordinatkontroll – batch 27

Dato: 2026-07-19

Kontroll 166–172 fortsetter i den første ukontrollerte aktive sekundærkøen etter top-level manifestrekkefølgen: by-manifestet. Alle sju records får sporbare, objekttilpassede coordinate contracts.

| placeId | resultat | kildeobjekt |
|---|---|---|
| `ullevål_hageby` | verified_geometry | `osm-node:1125978057` |
| `romsaås` | verified_geometry | `osm-node:963813366` |
| `rodelokka` | verified_geometry | `osm-node:1290871351` |
| `vaalerenga` | verified_geometry | `osm-node:366154118` |
| `vinderen` | verified_geometry | `osm-node:1125573258` |
| `ullern` | verified_geometry | `osm-node:1370932493` |
| `spikersuppa` | verified_geometry | `osm-relation:11158886` |

## Metode

- De seks bolig-/bydelsstedene bruker navngitte OSM place-noder som semantic area anchors; ingen adressepunkt er brukt for hele områder.
- Romsås- og Vinderen-stasjoner er avvist som hovedankre for områdene.
- Ullerns administrative bydel-relasjon er avvist til fordel for suburb-noden som matcher place-scope.
- Rodeløkken på Bygdøy er avvist som navnelik feilmatch for Rodeløkka.
- Spikersuppa bruker den eksakte navngitte OSM-relasjonen for bassenget som site-center; radiusen beholder den bredere byromsbruken.
- Repo-wide duplikataudit fant ingen alternative canonical place-records for de sju ID-ene.
