# Nationaltheatret people — missing giants 24 validation

Generated: 2026-07-09

## Scope

Adds five final missing Nationaltheatret-linked people entries as single-person files. No batch file is introduced.

## Added files

- `data/people/litteratur/oslo/nationaltheatret/bab_christensen.json`
- `data/people/litteratur/oslo/nationaltheatret/urda_arneberg.json`
- `data/people/litteratur/oslo/nationaltheatret/pelle_christensen.json`
- `data/people/litteratur/oslo/nationaltheatret/svein_sturla_hungnes.json`
- `data/people/litteratur/oslo/nationaltheatret/thea_stabell.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files immediately after `bente_borsum.json` and before the next category.

## Source basis

Primary source: Store norske leksikon individual articles.

- Bab Christensen is described by SNL as debuting at Nationaltheatret in 1947 and being employed there in 1952–1963.
- Urda Arneberg is described by SNL as a significant character actor with Nationaltheatret affiliation in 1962–1974 and from 1976, plus Teatret på Torshov from 1976.
- Pelle Christensen is described by SNL as debuting at Nationaltheatret in 1949 and being employed there until 1958.
- Svein Sturla Hungnes is described by SNL as breaking through at Nationaltheatret in 1970 and being employed there until 1991.
- Thea Stabell is described by SNL as artistic leader for Torshovteatret from 1991 to 1993, with several Nationaltheatret productions as actor and director.

## Duplicate gate

Exact repository search before creation returned no active matches for:

- `bab_christensen`
- `urda_arneberg`
- `pelle_christensen`
- `svein_sturla_hungnes`
- `thea_stabell`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/bab_christensen.json','data/people/litteratur/oslo/nationaltheatret/urda_arneberg.json','data/people/litteratur/oslo/nationaltheatret/pelle_christensen.json','data/people/litteratur/oslo/nationaltheatret/svein_sturla_hungnes.json','data/people/litteratur/oslo/nationaltheatret/thea_stabell.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
