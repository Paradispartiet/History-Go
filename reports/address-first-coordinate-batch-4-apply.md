# Geonorge address batch 4 apply

Dato: 2026-07-11

Kildegrunnlag: `reports/geonorge-address-batch-4/*.json` på main. Alle fem rapporter hadde `ok: true` og `status: verified_candidate`; `coordinate`-objektet er brukt som fasit.

## Oppdaterte steder

| placeId | navn | source file | Geonorge sourceObjectId | adresse | lat/lon | status |
|---|---|---|---|---|---|---|
| `operahuset` | Operahuset | `data/places/by/oslo/places_by.json` | `geonorge-adresser-v1:0301:21493:1` | Kirsten Flagstads plass 1, 0150 Oslo, NO | 59.90777660297918, 10.752057851974856 | verified |
| `oslo_domkirke` | Oslo domkirke | `data/places/historie/oslo/places_historie.json` | `geonorge-adresser-v1:0301:13630:11` | Karl Johans gate 11, 0154 Oslo, NO | 59.91198982723361, 10.746574591052143 | verified |
| `slottet` | Det kongelige slott | `data/places/historie/oslo/places_historie.json` | `geonorge-adresser-v1:0301:21608:1` | Slottsplassen 1, 0010 Oslo, NO | 59.917063045432855, 10.727724636631736 | verified |
| `sofienberg_kirke` | Sofienberg kirke | `data/places/historie/oslo/places_historie.json` | `geonorge-adresser-v1:0301:15821:18` | Rathkes gate 18, 0558 Oslo, NO | 59.922239531059745, 10.765987821107696 | verified |
| `gamle_aker_kirke` | Gamle Aker kirke | `data/places/historie/oslo/places_historie.json` | `geonorge-adresser-v1:0301:10057:26` | Akersbakken 26, 0172 Oslo, NO | 59.923779239528116, 10.74681853984208 | verified |

## Kontroller

- `npm run build:tools` ble blokkert av miljø-/dependency-feil: `error TS2688: Cannot find type definition file for 'node'.` Typebiblioteket er referert fra `compilerOptions`.
- `npm run places:index:check` ble blokkert av samme `build:tools`-steg fordi scriptet starter med `npm run build:tools`.
- `node dist/tools/check_no_lng_coordinates.mjs` passerte.
- `node dist/tools/check_places_index_sync.mjs` passerte.
- `npm run places:coords:check` passerte.

Index var ikke ute av sync i dist-kontrollen, så `npm run places:coords:sync` ble ikke kjørt.
