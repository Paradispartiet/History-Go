# Batch 15b — munch_museet places_index drift

Dato: 2026-05-28

## Kommandoer kjørt

- `npm run places:index:check`
- `sed -n '1,220p' package.json`
- `sed -n '1,240p' tools/check_places_index_sync.mjs`
- `sed -n '1,260p' tools/build_places_index.mjs`
- `sed -n '1,220p' data/places/manifest.json`
- `rg -n "munch_museet|Munch_liggende|munch_standing" data/places data -g '!places_index.json'`
- `sed -n '52,74p' data/places/kunst/oslo/places_kunst.json`
- Python-inspeksjon av `data/places/places_index.json` for `munch_museet`
- `npm run places:index:build`
- `npm run places:index:check`
- `npm run places:emner:check`
- `npm run health:places`

## Filer undersøkt

- `package.json`
- `tools/check_places_index_sync.mjs`
- `tools/build_places_index.mjs`
- `data/places/manifest.json`
- `data/places/places_index.json`
- `data/places/kunst/oslo/places_kunst.json`

## Før-status fra `places:index:check`

`npm run places:index:check` feilet med nøyaktig disse forskjellene:

```text
places_index sync check failed.
Showing first 2 difference(s):
- index=94 placeId=munch_museet type=missing_field field=image
  expected: "bilder/places/kunst/Munch_liggende.JPG"
  actual:   undefined
- index=94 placeId=munch_museet type=missing_field field=frontImage
  expected: "bilder/places/kunst/munch_standing.JPG"
  actual:   undefined
```

## Autoritativ fil

`data/places/manifest.json` lister `places/kunst/oslo/places_kunst.json` som aktiv source place-fil. `tools/check_places_index_sync.mjs` og `tools/build_places_index.mjs` bygger forventet indeks fra manifestets aktive source-filer og plukker lette felt, inkludert `image` og `frontImage`.

Derfor er `data/places/kunst/oslo/places_kunst.json` autoritativ for `munch_museet`, og `data/places/places_index.json` skal speile denne oppføringen.

## Endrede filer

- `data/places/places_index.json`
- `reports/oslo-place-audit-batch-15b-munch-index-drift.md`

## Rettelse

`munch_museet` i `data/places/kunst/oslo/places_kunst.json` hadde allerede de autoritative feltene:

- `image`: `bilder/places/kunst/Munch_liggende.JPG`
- `frontImage`: `bilder/places/kunst/munch_standing.JPG`

`data/places/places_index.json` manglet disse to feltene for `munch_museet`. Indeksen ble synket med eksisterende repo-script:

```sh
npm run places:index:build
```

Dette oppdaterte kun `munch_museet`-oppføringen i `data/places/places_index.json` med `image` og `frontImage`.

## Etter-status

- `npm run places:index:check`: OK — `places_index.json is in sync with source place files.`
- `npm run places:emner:check`: Feilet forventet med `Missing emne_ids: 51`; ingen emne_id-er ble endret.
- `npm run health:places`: OK med `Errors: 0` (`Warnings: 1374` eksisterer fortsatt).

Ingen UI-, CSS-, HTML-, JS-, manifest-, canonical emne- eller source place-data ble endret.
