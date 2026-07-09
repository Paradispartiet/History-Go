# Nationaltheatret people — single files 22 validation

Generated: 2026-07-09

## Scope

Adds five new Nationaltheatret-linked people entries as single-person files. No batch file is introduced.

## Added files

- `data/people/litteratur/oslo/nationaltheatret/ingar_helge_gimle.json`
- `data/people/litteratur/oslo/nationaltheatret/gorild_mauseth.json`
- `data/people/litteratur/oslo/nationaltheatret/jon_oigarden.json`
- `data/people/litteratur/oslo/nationaltheatret/trine_wiggen.json`
- `data/people/litteratur/oslo/nationaltheatret/eindride_eidsvold.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files.

## Source basis

Primary source: Store norske leksikon individual articles.

- Ingar Helge Gimle is described by SNL as moving to Nationaltheatret from 1996.
- Gørild Mauseth is described by SNL as moving to Nationaltheatret in 1998, where her first role was Agnes in Cecilie Løveid's `Østerrike`.
- Jon Øigarden is described by SNL as being at Nationaltheatret since 2001, with named roles there and a Torshovteatret artistic responsibility line from 2004.
- Trine Wiggen is described by SNL as coming to Nationaltheatret in 1998, with named roles there and a Heddapris line for Teatret på Torshov, Nationaltheatret.
- Eindride Eidsvold is described by SNL as working at Nationaltheatret from 1990, with many profiled roles there.

## Duplicate gate

Exact repository search before creation returned no active matches for:

- `ingar_helge_gimle`
- `gorild_mauseth`
- `jon_oigarden`
- `trine_wiggen`
- `eindride_eidsvold`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/ingar_helge_gimle.json','data/people/litteratur/oslo/nationaltheatret/gorild_mauseth.json','data/people/litteratur/oslo/nationaltheatret/jon_oigarden.json','data/people/litteratur/oslo/nationaltheatret/trine_wiggen.json','data/people/litteratur/oslo/nationaltheatret/eindride_eidsvold.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
