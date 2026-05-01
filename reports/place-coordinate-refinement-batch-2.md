# Place coordinate refinement — batch 2

Dato: 2026-05-01

## Endrede filer
- `data/places/places_litteratur.json`
- `data/places/places_musikk.json`
- `data/places/places_politikk.json`
- `data/places/places_naeringsliv.json`

## Rettede steder (små, entydige bygg/institusjoner)

| Sted (id) | Fil | Gammel lat/lon/r | Ny lat/lon/r | coordType | coordSource |
|---|---|---|---|---|---|
| Litteraturhuset (`litteraturhuset`) | `data/places/places_litteratur.json` | 59.921, 10.729, 120 | 59.92096, 10.72936, 30 | `building_center` | `manual_map_check` |
| Det Norske Teatret (`det_norske_teatret`) | `data/places/places_musikk.json` | 59.913, 10.7418, 140 | 59.91376, 10.74092, 30 | `building_center` | `manual_map_check` |
| Oslo tinghus (`tinghuset`) | `data/places/places_politikk.json` | 59.9167, 10.741, 140 | 59.91653, 10.74136, 30 | `building_center` | `manual_map_check` |
| Den gamle Norges Bank / Bankplassen (`grunnlovsbygget_bankplassen`) | `data/places/places_naeringsliv.json` | 59.9107, 10.742, 120 | 59.91086, 10.74178, 30 | `building_center` | `manual_map_check` |

Alle rettede steder fikk også:
- `coordStatus: verified`
- `coordPrecisionM: 25`
- `coordVerifiedAt: 2026-05-01`

## Steder bevisst ikke rettet i denne batchen

| Sted (id) | Fil | Årsak |
|---|---|---|
| Universitetets gamle kjemibygning (`universitetets_gamle_kjemi`) | `data/places/places_vitenskap.json` | `manual_check_needed`: sikkert ankerpunkt (eksakt historisk bygning vs. nærliggende kvartal) bør verifiseres med egen manuell kontroll før oppdatering. |
| Ring 3 (`ring_3`) | `data/places/places_by.json` | Lang rute/gate-type; utenfor batch 2-scope. |
| Akerselva (`akerselva`) | `data/places/places_by.json` | Elv/lineært objekt; krever egen semantisk batch. |
| Alnaelva (`alnaelva`) | `data/places/oslo/places_oslo_natur_hovedsteder.json` | Elv/lineært objekt; krever egen semantisk batch. |
| Ljanselva (`ljanselva`) | `data/places/oslo/places_oslo_natur_hovedsteder.json` | Elv/lineært objekt; krever egen semantisk batch. |
| Maridalsvannet (`maridalsvannet`) | `data/places/oslo/places_oslo_natur_hovedsteder.json` | Stort naturområde/vann; krever egen semantisk batch. |
| Nøklevann (`noklevann`) | `data/places/oslo/places_oslo_natur_hovedsteder.json` | Stort naturområde/vann; krever egen semantisk batch. |
| Bygdøy natur- og kulturmiljø (`bygdoy_natur`) | `data/places/oslo/places_oslo_natur_hovedsteder.json` | Stort område; krever egen semantisk batch. |
