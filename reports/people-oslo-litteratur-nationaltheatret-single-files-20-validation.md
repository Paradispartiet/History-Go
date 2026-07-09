# Nationaltheatret people — single files 20 validation

Generated: 2026-07-09

## Scope

Adds five new Nationaltheatret-linked people entries as single-person files. No batch file is introduced.

## Added files

- `data/people/litteratur/oslo/nationaltheatret/henrik_mestad.json`
- `data/people/litteratur/oslo/nationaltheatret/mari_maurstad.json`
- `data/people/litteratur/oslo/nationaltheatret/jan_gronli.json`
- `data/people/litteratur/oslo/nationaltheatret/oystein_roger.json`
- `data/people/litteratur/oslo/nationaltheatret/kjersti_elvik.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files.

## Source basis

Primary source: Store norske leksikon individual articles.

- Henrik Mestad is described by SNL as employed at Nationaltheatret since 1991, with debut there in `Hærmennene på Helgeland` and many later roles including Torshovteatret work.
- Mari Maurstad is described by SNL as employed at Nationaltheatret from 1981, with more than 60 roles there.
- Jan Grønli is described by SNL as being at Nationaltheatret in 1989–1991 and receiving the 2004 Heddaprisen for `Teatermakeren` at Nationaltheatret.
- Øystein Røger is described by SNL as employed at Nationaltheatret for most of his theatre life and as beginning there in 1993.
- Kjersti Elvik is described by SNL as attached to Nationaltheatret, part of Torshovteatret artistic leadership 2001–2003, with named Nationaltheatret roles and a 2014 directing debut there.

## Duplicate gate

Exact repository search before creation returned no active matches for:

- `henrik_mestad`
- `mari_maurstad`
- `jan_gronli`
- `oystein_roger`
- `kjersti_elvik`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/henrik_mestad.json','data/people/litteratur/oslo/nationaltheatret/mari_maurstad.json','data/people/litteratur/oslo/nationaltheatret/jan_gronli.json','data/people/litteratur/oslo/nationaltheatret/oystein_roger.json','data/people/litteratur/oslo/nationaltheatret/kjersti_elvik.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
