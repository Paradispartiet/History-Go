# Nationaltheatret people — single files 14 validation

Generated: 2026-07-09

## Scope

Adds five new Nationaltheatret-linked people entries as single-person files. No batch file is introduced.

## Added files

- `data/people/litteratur/oslo/nationaltheatret/gustav_thomassen.json`
- `data/people/litteratur/oslo/nationaltheatret/oliver_neerland.json`
- `data/people/litteratur/oslo/nationaltheatret/lubos_hruza.json`
- `data/people/litteratur/oslo/nationaltheatret/johan_halvorsen.json`
- `data/people/litteratur/oslo/nationaltheatret/charles_marowitz.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files.

## Source basis

Primary source: Store norske leksikon, `Nationaltheatret`.

- Gustav Thomassen is named as a leading instructor in the early Nationaltheatret line.
- Oliver Neerland is named as leader of the theatre's paint shop from 1918 to 1934 and linked to modern theatre decoration.
- Lubos Hruza is named as an original and distinctive postwar scenographer.
- Johan Halvorsen is named as musical leader for Nationaltheatret's opera performances in 1899–1919.
- Charles Marowitz is named through the controversial 1979 Nationaltheatret production of Ibsen's `En folkefiende`.

## Duplicate gate

Exact repository search before creation returned no active matches for:

- `gustav_thomassen`
- `oliver_neerland`
- `lubos_hruza`
- `johan_halvorsen`
- `charles_marowitz`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/gustav_thomassen.json','data/people/litteratur/oslo/nationaltheatret/oliver_neerland.json','data/people/litteratur/oslo/nationaltheatret/lubos_hruza.json','data/people/litteratur/oslo/nationaltheatret/johan_halvorsen.json','data/people/litteratur/oslo/nationaltheatret/charles_marowitz.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

Expected:

- `duplicatePeopleIds = 0`
- `invalidPlaceRefs = 0`
- `peopleWithoutValidPrimaryAnchor = 0`
- `peopleWithEmptyPlacesArray = 0`
