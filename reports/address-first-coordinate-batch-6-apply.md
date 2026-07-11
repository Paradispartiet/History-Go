# Address-first coordinate batch 6 apply

Koordinatkilde: `reports/geonorge-address-batch-6/*.json` på main. Brukte kun resultater med `ok: true` og `status: "verified_candidate"`, og kopierte hele `coordinate`-objektets koordinatfelter til aktiv source-fil. `coordVerifiedAt` er satt til `2026-07-12`.

## Applied

| placeId | navn | source file | Geonorge sourceObjectId | adresse | lat/lon | status |
|---|---|---|---|---|---|---|
| `gronland_basarene` | Grønland basarene | `data/places/by/oslo/places_by.json` | `geonorge-adresser-v1:0301:17875:2` | Tøyengata 2, 0190 Oslo, NO | `59.91278287002734`, `10.76391148376898` | verified |
| `mollergata_19` | Møllergata 19 | `data/places/historie/oslo/places_historie.json` | `geonorge-adresser-v1:0301:14943:19` | Møllergata 19, 0179 Oslo, NO | `59.91528413168428`, `10.747869191554551` | verified |
| `villa_grande` | Villa Grande | `data/places/historie/oslo/places_historie.json` | `geonorge-adresser-v1:0301:13153:56` | Huk aveny 56, 0287 Oslo, NO | `59.89911019330011`, `10.678158888428362` | verified |

## Skipped

| placeId | status |
|---|---|
| `tinghuset` | skipped: not_found |
| `bogstad_gard` | skipped: needs_review |

## Kontroller

| Kommando | Resultat |
|---|---|
| `npm run build:tools` | Failed: TypeScript manglet `@types/node` i lokalt miljø (`TS2688: Cannot find type definition file for 'node'`). |
| `npm run places:index:check` | Failed av samme miljøårsak fordi kommandoen starter med `npm run build:tools`. |
| `npm run places:coords:check` | Passed: `Place coordinate index parity OK: runtime index coordinate fields match source files.` |
| `npm run places:coords:sync` | Failed av samme miljøårsak fordi kommandoen starter med `npm run build:tools`. |
| `node dist/tools/build_places_index.mjs` | Passed: `Wrote 1124 places -> data/places/places_index.json; skipped 9 disabled place(s)`. |
| `node dist/tools/check_no_lng_coordinates.mjs` | Passed: `OK: Ingen active place-data bruker lng. History Go bruker lat/lon.` |
| `node dist/tools/check_places_index_sync.mjs` | Passed: `places_index.json is in sync with source place files after disabled-place filtering.` |
