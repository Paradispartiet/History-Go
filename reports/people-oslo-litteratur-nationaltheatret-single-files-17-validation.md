# Nationaltheatret people — single files 17 validation

Generated: 2026-07-09

## Scope

Adds five new Nationaltheatret-linked people entries as single-person files. No batch file is introduced.

## Added files

- `data/people/litteratur/oslo/nationaltheatret/mads_ousdal.json`
- `data/people/litteratur/oslo/nationaltheatret/andrine_saether.json`
- `data/people/litteratur/oslo/nationaltheatret/laila_goody.json`
- `data/people/litteratur/oslo/nationaltheatret/petronella_barker.json`
- `data/people/litteratur/oslo/nationaltheatret/trond_espen_seim.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files.

## Source basis

Primary source: Store norske leksikon individual articles.

- Mads Ousdal is described by SNL as employed at Nationaltheatret from 2000 and as part of the Torshovteatret leadership group from 2004 to 2006.
- Andrine Sæther is described by SNL as employed at Nationaltheatret from 1995 and as part of Torshovteatret leadership in 1998–2000.
- Laila Goody is described by SNL as employed at Nationaltheatret from 1994, with major roles there and on Torshovteatret.
- Petronella Barker is described by SNL as having moved to Nationaltheatret in 1996 and as Heddapris-nominated for `Rosmersholm` there.
- Trond Espen Seim is described by SNL as being at Nationaltheatret from 2000, with multiple named roles there.

## Duplicate gate

Exact repository search before creation returned no active matches for:

- `mads_ousdal`
- `andrine_saether`
- `laila_goody`
- `petronella_barker`
- `trond_espen_seim`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/mads_ousdal.json','data/people/litteratur/oslo/nationaltheatret/andrine_saether.json','data/people/litteratur/oslo/nationaltheatret/laila_goody.json','data/people/litteratur/oslo/nationaltheatret/petronella_barker.json','data/people/litteratur/oslo/nationaltheatret/trond_espen_seim.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
