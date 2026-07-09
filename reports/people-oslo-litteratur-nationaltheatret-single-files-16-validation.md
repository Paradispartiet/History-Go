# Nationaltheatret people — single files 16 validation

Generated: 2026-07-09

## Scope

Adds five new Nationaltheatret-linked people entries as single-person files. No batch file is introduced.

## Added files

- `data/people/litteratur/oslo/nationaltheatret/jan_gunnar_roise.json`
- `data/people/litteratur/oslo/nationaltheatret/kare_conradi.json`
- `data/people/litteratur/oslo/nationaltheatret/mariann_hole.json`
- `data/people/litteratur/oslo/nationaltheatret/thorbjorn_harr.json`
- `data/people/litteratur/oslo/nationaltheatret/anders_mordal.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files.

## Source basis

Primary sources: Store norske leksikon individual articles and the Nationaltheatret article.

- Jan Gunnar Røise is described by SNL as employed by Nationaltheatret from 2000, with debut there the same year.
- Kåre Conradi is described by SNL as working at Nationaltheatret from 1995 and as part of the artistic leadership at Torshovteatret 2001–2003.
- Mariann Hole is described by SNL as having begun working for Nationaltheatret in 2008, with major Nationaltheatret roles and Komilab/Torshovteatret participation.
- Thorbjørn Harr is described by SNL as working at Nationaltheatret since 2000, with Komilab/Torshovteatret participation.
- Anders Mordal is included by SNL in the Komilab/Torshovteatret group connected to `Ti liv` and the Heddaprisen nomination line.

## Duplicate gate

Exact repository search before creation returned no active matches for:

- `jan_gunnar_roise`
- `kare_conradi`
- `mariann_hole`
- `thorbjorn_harr`
- `anders_mordal`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/jan_gunnar_roise.json','data/people/litteratur/oslo/nationaltheatret/kare_conradi.json','data/people/litteratur/oslo/nationaltheatret/mariann_hole.json','data/people/litteratur/oslo/nationaltheatret/thorbjorn_harr.json','data/people/litteratur/oslo/nationaltheatret/anders_mordal.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
