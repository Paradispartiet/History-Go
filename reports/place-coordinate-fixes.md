# Place coordinate fixes – 2026-04-30

## Endrede filer
- data/places/manifest.json
- data/places/places_by.json
- data/places/places_historie.json
- data/places/places_kunst.json
- data/places/places_litteratur.json
- data/places/places_naeringsliv.json
- data/places/oslo/places_oslo_natur_akerselvarute.json

## Rettede conflict-steder (prioritet 1)

| id | Filer | Gammel lat/lon/r | Ny lat/lon/r | coordType |
|---|---|---|---|---|
| ullevål_hageby | places_by, places_litteratur | 59.9369,10.7317,240 / 59.9394,10.7463,200 | 59.9369,10.7317,240 | area_center |
| tjuvholmen | places_by, places_kunst | 59.9075,10.7200,200 / 59.9070,10.7205,150 | 59.9066,10.7221,190 | area_center |
| deichman_bjorvika | places_by, places_litteratur | 59.9078,10.7546,180 / 59.9079,10.7541,150 | 59.90782,10.75457,120 | building_center |
| barcode | places_by, places_kunst | 59.9100,10.7594,210 / 59.9093,10.7539,150 | 59.9101,10.7580,240 | area_center |
| damstredet_telthusbakken | places_by, places_historie | 59.9219,10.7468,180 / 59.9295,10.7431,150 | 59.9236,10.7474,190 | street_midpoint |
| vigelandsparken | places_by, places_kunst | 59.9270,10.7005,260 / 59.9270,10.7003,200 | 59.9271,10.7008,260 | park_center |
| voienvolden | places_by, places_litteratur | 59.9260,10.7435,170 / 59.9292,10.7514,150 | 59.9292,10.7514,130 | historical_site |
| frysja_industriomrade | places_naeringsliv, places_oslo_natur_akerselvarute | 59.9611,10.7645,240 / 59.9695,10.7845,180 | 59.9608,10.7726,260 | area_center |

Alle oppdaterte objekter fikk metadata:
- `coordStatus: "verified"`
- `coordSource: "manual_map_check"`
- `coordVerifiedAt: "2026-04-30"`

## places_nature_aliases.json (prioritet 2)
- Filen ble vurdert som alias-/koblingsdata (ingen runtime-oppslag i appkode ble funnet).
- `places/places_nature_aliases.json` ble derfor fjernet fra `data/places/manifest.json` slik at den ikke behandles som aktiv place-datastrøm i coordinate-audit.
- Ingen tilfeldige koordinater ble lagt inn i aliasfilen.

## Audit etter endringer (prioritet 3)
Kjøring:
- `node --check tools/audit-place-coordinates.mjs`
- `node tools/audit-place-coordinates.mjs`

Resultat:
- conflict: 0
- invalid: 0
- duplicate: 16
- outside_expected_area: 0

Gjenstående `duplicate` er ikke lenger `duplicate_id_different_coord` (koordinatkonflikt), men samme id brukt flere steder på tvers av kategorier.
