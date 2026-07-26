# Criciúma new places — batch 1 v4

Date: 2026-07-26

## Scope

This batch implements five new Criciúma place records selected in `reports/criciuma-new-place-candidates-2026-07-26.md`:

- Memorial Casa do Agente Ferroviário Mário Ghisi
- Arquivo Histórico Municipal Pedro Milanez
- Locomóvel da Praça da Chaminé
- Galeria de Arte Octávia Búrigo Gaidzinski
- Centro de Memória e Documentação da Unesc (CEDOC)

## Description contract

All five records follow `history_go_place_description_templates_v4`.

| Place | desc words | popupDesc words | popup paragraphs |
|---|---:|---:|---:|
| Memorial Casa do Agente Ferroviário Mário Ghisi | 49 | 310 | 3 |
| Arquivo Histórico Municipal Pedro Milanez | 47 | 356 | 4 |
| Locomóvel da Praça da Chaminé | 52 | 356 | 4 |
| Galeria de Arte Octávia Búrigo Gaidzinski | 51 | 360 | 4 |
| Centro de Memória e Documentação da Unesc (CEDOC) | 52 | 367 | 4 |

Each popup contains more than 300 words, at least three paragraphs and multiple dates, institutions, named actors, physical details, collection objects, documented events and present-day functions.

## Runtime integration repair

The Criciúma city manifest still referenced eight aggregate files removed by the 2026-07-25 single-file migration. The manifest now lists all 45 active leaf records directly.

`js/data/city-package-loader.js` now accepts one-place JSON objects in addition to arrays and `{ "places": [...] }` wrappers. This restores loading of the existing 40 places and enables the five new records without recreating deprecated aggregate files.

## Coordinate decisions

All five records remain `needs_source`.

- The railway memorial uses a secondary published candidate point, while the official address and protected identity are resolved.
- The archive uses a municipal cultural-institution candidate until Rua Visconde de Cairú 1127 has an exact building or entrance object.
- The locomóvel is intentionally co-located with Praça da Chaminé until the machine's object point is captured.
- The gallery is intentionally co-located with Teatro Elias Angeloni as an interior destination.
- CEDOC is intentionally co-located with the Unesc campus until Bloco Administrativo and sala 5 receive an exact entrance or interior anchor.

Each place has a separate Coordinate Evidence v1 file with identity, sources, address candidates, coordinate candidates, blocked reason and next action.

## Counts after implementation

- Criciúma places: 45
- History: 14
- Art: 6
- Business: 5
- Coordinate-evidence records: 45
- Verified coordinates: 0
- `needs_source`: 45

## Validation performed

- All new JSON files parse successfully.
- Place IDs and coordinate-evidence `placeId` values are unique and paired one-to-one.
- Every evidence `placeFile` points to the corresponding new leaf file.
- Every `desc` is within 40–80 words.
- Every `popupDesc` is at least 300 words and contains at least three paragraphs.
- The repaired city manifest contains 45 unique place paths.
- The loader change is limited to accepting a single place object as one row.
- The modified loader passes `node --check`.

The generated global `data/places/places_index.json` is not edited manually. Criciúma remains loaded through the city-package registry and its repaired city manifest.
