# Nationaltheatret people — single files 19 validation

Generated: 2026-07-09

## Scope

Adds five new Nationaltheatret-linked people entries as single-person files. No batch file is introduced.

Also restores four previously created Nationaltheatret single-person files to `data/people/manifest.json` after they were found missing from the active manifest while still present on disk.

## Added files

- `data/people/litteratur/oslo/nationaltheatret/nicolai_cleve_broch.json`
- `data/people/litteratur/oslo/nationaltheatret/fridtjov_saheim.json`
- `data/people/litteratur/oslo/nationaltheatret/gard_b_eidsvold.json`
- `data/people/litteratur/oslo/nationaltheatret/kim_haugen.json`
- `data/people/litteratur/oslo/nationaltheatret/bjorn_skagestad.json`

## Restored manifest entries

- `data/people/litteratur/oslo/nationaltheatret/henrik_ibsen.json`
- `data/people/litteratur/oslo/nationaltheatret/bjornstjerne_bjornson.json`
- `data/people/litteratur/oslo/nationaltheatret/sigurd_eldegard.json`
- `data/people/litteratur/oslo/nationaltheatret/henrik_bull.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files and restores the four missing Nationaltheatret entries above.

## Source basis

Primary source: Store norske leksikon individual articles.

- Nicolai Cleve Broch is described by SNL as moving to Nationaltheatret in 2005, with roles in `Skuggar`, `Keiser og galileer`, and `Seks personer søker en forfatter`.
- Fridtjov Såheim is described by SNL as attached to Nationaltheatret in later years, with roles including `Raskolnikov`, `Markens Grøde`, `Eg er vinden`, and `Brødrene Karamasov`.
- Gard B. Eidsvold is described by SNL as long attached to Nationaltheatret, including `Sult`, `Vildanden`, `Kaldt produkt`, and `Verdiløse menn`.
- Kim Haugen is described by SNL as attached to Nationaltheatret and central there for many years, with many named roles.
- Bjørn Skagestad is described by SNL as employed at Nationaltheatret from 1988 and as having a long series of central roles there.

## Duplicate gate

Exact repository search before creation returned no active matches for:

- `nicolai_cleve_broch`
- `fridtjov_saheim`
- `gard_b_eidsvold`
- `kim_haugen`
- `bjorn_skagestad`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/nicolai_cleve_broch.json','data/people/litteratur/oslo/nationaltheatret/fridtjov_saheim.json','data/people/litteratur/oslo/nationaltheatret/gard_b_eidsvold.json','data/people/litteratur/oslo/nationaltheatret/kim_haugen.json','data/people/litteratur/oslo/nationaltheatret/bjorn_skagestad.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
