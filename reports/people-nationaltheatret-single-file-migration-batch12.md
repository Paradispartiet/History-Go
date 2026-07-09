# Nationaltheatret people — single-file migration batch 12

Generated: 2026-07-09

## Scope

Migrates the latest Nationaltheatret people batch from a multi-person batch file to one file per person.

This implements the single-file rule going forward and starts cleanup of the earlier batch-file structure.

## Migrated from

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch12.json`

## Migrated to

- `data/people/litteratur/oslo/nationaltheatret/henrik_ibsen.json`
- `data/people/litteratur/oslo/nationaltheatret/bjornstjerne_bjornson.json`
- `data/people/litteratur/oslo/nationaltheatret/ludvig_holberg.json`
- `data/people/litteratur/oslo/nationaltheatret/gunnar_heiberg.json`
- `data/people/litteratur/oslo/nationaltheatret/sigurd_eldegard.json`

Each new file keeps the existing loader-compatible array shape, but contains exactly one person entry.

## Manifest change

`data/people/manifest.json` no longer points to `people_litteratur_oslo_nationaltheatret_batch12.json`. It now points to the five single-person files above.

## Not yet migrated

Nationaltheatret batch files 1–11 are still batch files and should be split in follow-up PRs before more Nationaltheatret expansion is produced.

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/henrik_ibsen.json','data/people/litteratur/oslo/nationaltheatret/bjornstjerne_bjornson.json','data/people/litteratur/oslo/nationaltheatret/ludvig_holberg.json','data/people/litteratur/oslo/nationaltheatret/gunnar_heiberg.json','data/people/litteratur/oslo/nationaltheatret/sigurd_eldegard.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
