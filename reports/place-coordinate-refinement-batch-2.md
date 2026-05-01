# Place coordinate refinement — batch 2

Dato: 2026-05-01

## Endrede filer
- `data/places/places_naeringsliv.json`
- `data/places/places_vitenskap.json`
- `reports/place-coordinate-refinement-batch-2.md`

## Rettede steder (små, entydige bygg/institusjoner)

| Sted (id) | Fil | Gammel lat/lon/r | Ny lat/lon/r | coordType | coordSource |
|---|---|---|---|---|---|
| Den gamle Norges Bank / Bankplassen (`grunnlovsbygget_bankplassen`) | `data/places/places_naeringsliv.json` | 59.91086, 10.74178, 30 | 59.91086, 10.74178, 25 | `building_center` | `manual_map_check` |
| Universitetets gamle kjemibygning (`universitetets_gamle_kjemi`) | `data/places/places_vitenskap.json` | 59.911, 10.7414, 140 | 59.91456, 10.73872, 25 | `building_center` | `manual_map_check` |

Begge rettede steder fikk også:
- `coordStatus: verified`
- `coordPrecisionM: 25`
- `coordVerifiedAt: 2026-05-01`

## Vurdert men ikke endret

| Sted (id) | Fil | Årsak |
|---|---|---|
| Litteraturhuset (`litteraturhuset`) | `data/places/places_litteratur.json` | Allerede presist satt med verifisert coord-metadata i tidligere batch; ingen trygg forbedring nødvendig nå. |
| Karl Johans gate (`karl_johan`) | `data/places/places_by.json` | Lang gate (linjeobjekt), utenfor batch 2-scope. |
| Akerselva (`akerselva`) | `data/places/places_by.json` | Elv/lineært objekt, utenfor batch 2-scope. |
