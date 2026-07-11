# Address-first coordinate batch 5 apply

Kilde: `reports/geonorge-address-batch-5/*.json` på main. Alle resultater hadde `ok: true` og `status: verified_candidate`; `coordinate`-objektet er brukt som fasit.

| placeId | navn | source file | Geonorge sourceObjectId | adresse | lat/lon | status |
|---|---|---|---|---|---|---|
| chateau_neuf | Chateau Neuf | `data/places/popkultur/oslo/places_oslo_populaerkultur/chateau_neuf.json` | geonorge-adresser-v1:0301:16621:15 | Slemdalsveien 15, 0369 Oslo, NO | 59.93227611011727, 10.71254747404495 | verified |
| litteraturhuset | Litteraturhuset | `data/places/litteratur/oslo/places_litteratur/litteraturhuset.json` | geonorge-adresser-v1:0301:18496:29 | Wergelandsveien 29, 0167 Oslo, NO | 59.92027454485075, 10.728566026476651 | verified |
| nationaltheatret | Nationaltheatret | `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json` | geonorge-adresser-v1:0301:20681:1 | Johanne Dybwads plass 1, 0161 Oslo, NO | 59.91456789100917, 10.733617256734934 | verified |
| tronsmo_bokhandel | Tronsmo Bokhandel | `data/places/litteratur/oslo/places_litteratur/tronsmo_bokhandel.json` | geonorge-adresser-v1:0301:17999:12 | Universitetsgata 12, 0164 Oslo, NO | 59.916504851005804, 10.738621210337177 | verified |
| folketeateret | Folketeateret | `data/places/popkultur/oslo/places_oslo_populaerkultur/folketeateret.json` | geonorge-adresser-v1:0301:18554:2 | Youngstorget 2, 0181 Oslo, NO | 59.9145532904993, 10.749678422671124 | verified |

## Kontroller

- Blokkert av miljøfeil: `npm run build:tools` feilet med `error TS2688: Cannot find type definition file for 'node'. The file is in the program because: Entry point of type library 'node' specified in compilerOptions`.
- Blokkert av samme miljøfeil: `npm run places:index:check` og `npm run places:coords:sync` stopper i `npm run build:tools` med samme TS2688-feil.
- Passert: `node dist/tools/build_places_index.mjs` regenererte `data/places/places_index.json` uten manuell håndredigering.
- Passert: `node dist/tools/check_no_lng_coordinates.mjs`.
- Passert: `node dist/tools/check_places_index_sync.mjs`.
- Passert: `npm run places:coords:check`.

## Særkontroll

- Chateau Neuf er satt til Geonorge-adressen `Slemdalsveien 15, 0369 Oslo, NO` med `coordRole: display_marker`, `coordSource: geonorge_adresser_v1` og `coordType: address_point`.
