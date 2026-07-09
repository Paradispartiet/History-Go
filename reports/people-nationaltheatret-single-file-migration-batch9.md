# Nationaltheatret people — single-file migration batch 9

Generated: 2026-07-09

## Scope

Migrates Nationaltheatret people batch 9 from a multi-person batch file to one file per person.

## Migrated from

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch9.json`

## Migrated to

- `data/people/litteratur/oslo/nationaltheatret/gustav_berg_jaeger.json`
- `data/people/litteratur/oslo/nationaltheatret/knut_hergel.json`
- `data/people/litteratur/oslo/nationaltheatret/carl_fredrik_engelstad.json`
- `data/people/litteratur/oslo/nationaltheatret/erik_kristen_johanssen.json`
- `data/people/litteratur/oslo/nationaltheatret/arild_brinchmann.json`

Each new file keeps the existing loader-compatible array shape, but contains exactly one person entry.

## Manifest change

`data/people/manifest.json` no longer points to `people_litteratur_oslo_nationaltheatret_batch9.json`. It now points to the five single-person files above.

## Not yet migrated

Nationaltheatret batch files 1–8 are still batch files and should be split in follow-up PRs before more Nationaltheatret expansion is produced.

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/gustav_berg_jaeger.json','data/people/litteratur/oslo/nationaltheatret/knut_hergel.json','data/people/litteratur/oslo/nationaltheatret/carl_fredrik_engelstad.json','data/people/litteratur/oslo/nationaltheatret/erik_kristen_johanssen.json','data/people/litteratur/oslo/nationaltheatret/arild_brinchmann.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
