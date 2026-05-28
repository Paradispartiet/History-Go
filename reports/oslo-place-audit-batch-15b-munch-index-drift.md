# Oslo place audit — Batch 15b: `munch_museet` places index drift

Dato: 2026-05-28

## Kommandoer kjørt

- `npm run places:index:check`
- `sed -n '1,220p' package.json`
- `sed -n '1,240p' tools/check_places_index_sync.mjs`
- `sed -n '1,260p' tools/build_places_index.mjs`
- `cat data/places/manifest.json`
- `rg -n '"id": "munch_museet"|"image":|"frontImage":' data/places/kunst/oslo/places_kunst.json`
- `sed -n '55,75p' data/places/kunst/oslo/places_kunst.json`
- `sed -n '1090,1115p' data/places/places_index.json`
- `npm run places:index:build`
- `git diff -- data/places/places_index.json`
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

`npm run places:index:check` feilet med nøyaktig denne driften:

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

Det ble ikke rapportert annen indeksdrift i denne sjekken.

## Autoritativ kilde

`data/places/manifest.json` inkluderer `places/kunst/oslo/places_kunst.json`, og `tools/check_places_index_sync.mjs` bygger forventet indeks ved å lese filene i manifestet og plukke lette indeksfelt fra source place-dataene.

Den autoritative source-oppføringen for `munch_museet` er derfor `data/places/kunst/oslo/places_kunst.json`.

Source-oppføringen hadde allerede disse verdiene:

```json
"image": "bilder/places/kunst/Munch_liggende.JPG",
"frontImage": "bilder/places/kunst/munch_standing.JPG"
```

`data/places/places_index.json` manglet de samme feltene for `munch_museet`.

## Endrede filer

- `data/places/places_index.json`
- `reports/oslo-place-audit-batch-15b-munch-index-drift.md`

## Retting

`places_index.json` var utdatert for `munch_museet`. Jeg brukte eksisterende script `npm run places:index:build`, som kjører `tools/build_places_index.mjs`, for å regenerere/synke den avledede indeksen fra manifest/source place-filene.

Endringen i `data/places/places_index.json` er begrenset til `munch_museet` og legger til:

```json
"image": "bilder/places/kunst/Munch_liggende.JPG",
"frontImage": "bilder/places/kunst/munch_standing.JPG"
```

Ingen `emne_ids`, canonical emne-filer, manifest, UI, CSS, HTML eller JS ble endret.

## Etter-status

Etter regenerering/synk av indeks:

- `npm run places:index:check` er OK.
- `npm run places:emner:check` feiler fortsatt med forventet eksisterende status: 51 missing `emne_ids`.
- `npm run health:places` rapporterer `Errors: 0`.
