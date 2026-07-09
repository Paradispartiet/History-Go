# Nationaltheatret people — single files 23 validation

Generated: 2026-07-09

## Scope

Adds five new Nationaltheatret-linked people entries as single-person files. No batch file is introduced.

## Added files

- `data/people/litteratur/oslo/nationaltheatret/tone_danielsen.json`
- `data/people/litteratur/oslo/nationaltheatret/per_christian_ellefsen.json`
- `data/people/litteratur/oslo/nationaltheatret/per_sunderland.json`
- `data/people/litteratur/oslo/nationaltheatret/knut_risan.json`
- `data/people/litteratur/oslo/nationaltheatret/bente_borsum.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files.

## Source basis

Primary source: Store norske leksikon individual articles.

- Tone Danielsen is described by SNL as being at Nationaltheatret from 1975, with a varied repertoire including Torshovteatret and Ibsenfestival roles.
- Per Christian Ellefsen is described by SNL as being at Nationaltheatret from 1997, with comedy, fairy-tale and Dostojevskij roles.
- Per Sunderland is described by SNL as working at Nationaltheatret from 1957 to 1997, interrupted only by one season at Den Nationale Scene.
- Knut Risan is described by SNL as debuting at Nationaltheatret in 1956 and being employed there until 1998.
- Bente Børsum is described by SNL as having early student roles at Nationaltheatret in 1959 and later a Nationaltheatret role in Molière's `Don Juan` in 2017.

## Duplicate gate

Exact repository search before creation returned no active matches for:

- `tone_danielsen`
- `per_christian_ellefsen`
- `per_sunderland`
- `knut_risan`
- `bente_borsum`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/tone_danielsen.json','data/people/litteratur/oslo/nationaltheatret/per_christian_ellefsen.json','data/people/litteratur/oslo/nationaltheatret/per_sunderland.json','data/people/litteratur/oslo/nationaltheatret/knut_risan.json','data/people/litteratur/oslo/nationaltheatret/bente_borsum.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
