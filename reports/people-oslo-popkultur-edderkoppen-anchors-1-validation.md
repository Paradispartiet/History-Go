# Edderkoppen Scene people anchors 1 — validation

Generated: 2026-07-09

## Scope

Adds five Edderkoppen-linked people entries as single-person files. No batch file is introduced.

## Added files

- `data/people/popkultur/oslo/edderkoppen_scene/leif_juster.json`
- `data/people/popkultur/oslo/edderkoppen_scene/einar_schanke.json`
- `data/people/popkultur/oslo/edderkoppen_scene/lalla_carlsen.json`
- `data/people/popkultur/oslo/edderkoppen_scene/kari_diesen.json`
- `data/people/popkultur/oslo/edderkoppen_scene/ernst_diesen.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files.

## Source basis

Primary source: Store norske leksikon.

- Leif Juster: SNL describes him as opening Edderkoppen in 1942 in Søilen in Keysers gate and moving it to St. Olavs plass in 1945.
- Einar Schanke: SNL describes him as writing for Edderkoppen and reopening Edderkoppen in 1978 as `ABC-teatret`, where he was later director.
- Lalla Carlsen, Kari Diesen and Ernst Diesen: SNL's Leif Juster article names them among Edderkoppen-linked collaborators around Juster.

## Duplicate gate

Repository search before creation returned no active matches for:

- `leif_juster`
- `einar_schanke`
- `lalla_carlsen`
- `kari_diesen`
- `ernst_diesen`

## Place dependency

These people reference `edderkoppen_scene`, added in PR #2058. Since PR #2058 did not regenerate the global `data/places/places_index.json`, full local validation should rebuild the place index before running people place-ref audits.

## Validation required before merge / after full local build

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/popkultur/oslo/edderkoppen_scene/leif_juster.json','data/people/popkultur/oslo/edderkoppen_scene/einar_schanke.json','data/people/popkultur/oslo/edderkoppen_scene/lalla_carlsen.json','data/people/popkultur/oslo/edderkoppen_scene/kari_diesen.json','data/people/popkultur/oslo/edderkoppen_scene/ernst_diesen.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run places:index:build
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

Expected after place index rebuild:

- `duplicatePeopleIds = 0`
- `invalidPlaceRefs = 0`
- `peopleWithoutValidPrimaryAnchor = 0`
- `peopleWithEmptyPlacesArray = 0`
