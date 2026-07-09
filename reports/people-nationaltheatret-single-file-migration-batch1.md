# Nationaltheatret people — single-file migration batch 1

Generated: 2026-07-09

## Scope

Migrates the final remaining Nationaltheatret people batch from a multi-person batch file to one file per person.

## Migrated from

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch1.json`

## Migrated to

- `data/people/litteratur/oslo/nationaltheatret/bjorn_bjornson.json`
- `data/people/litteratur/oslo/nationaltheatret/johanne_dybwad.json`
- `data/people/litteratur/oslo/nationaltheatret/halfdan_christensen.json`
- `data/people/litteratur/oslo/nationaltheatret/ragna_wettergreen.json`
- `data/people/litteratur/oslo/nationaltheatret/egil_eide.json`

Each new file keeps the existing loader-compatible array shape, but contains exactly one person entry.

## Manifest change

`data/people/manifest.json` no longer points to `people_litteratur_oslo_nationaltheatret_batch1.json`. It now points to the five single-person files above.

## Completion note

After this migration, Nationaltheatret people batches 1–12 have all been migrated from batch files to one-person files under:

- `data/people/litteratur/oslo/nationaltheatret/`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/bjorn_bjornson.json','data/people/litteratur/oslo/nationaltheatret/johanne_dybwad.json','data/people/litteratur/oslo/nationaltheatret/halfdan_christensen.json','data/people/litteratur/oslo/nationaltheatret/ragna_wettergreen.json','data/people/litteratur/oslo/nationaltheatret/egil_eide.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

Expected:

- `new people entries = 0`
- `duplicatePeopleIds = 0`
- `invalidPlaceRefs = 0`
- `peopleWithoutValidPrimaryAnchor = 0`
- `peopleWithEmptyPlacesArray = 0`
