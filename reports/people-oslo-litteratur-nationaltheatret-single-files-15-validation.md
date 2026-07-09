# Nationaltheatret people — single files 15 validation

Generated: 2026-07-09

## Scope

Adds five new Nationaltheatret-linked people entries as single-person files. No batch file is introduced.

Also restores three previously created Nationaltheatret single-person files to `data/people/manifest.json` after they were found missing from the active manifest while still present on disk.

## Added files

- `data/people/litteratur/oslo/nationaltheatret/sebastian_hartmann.json`
- `data/people/litteratur/oslo/nationaltheatret/thorbjorn_egner.json`
- `data/people/litteratur/oslo/nationaltheatret/sverre_brandt.json`
- `data/people/litteratur/oslo/nationaltheatret/marc_connelly.json`
- `data/people/litteratur/oslo/nationaltheatret/henrik_bull.json`

## Restored manifest entries

- `data/people/litteratur/oslo/nationaltheatret/henrik_ibsen.json`
- `data/people/litteratur/oslo/nationaltheatret/bjornstjerne_bjornson.json`
- `data/people/litteratur/oslo/nationaltheatret/sigurd_eldegard.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files and restores the three missing Nationaltheatret single-person files above.

## Source basis

Primary source: Store norske leksikon, `Nationaltheatret`.

- Sebastian Hartmann is named through the 2004 Nationaltheatret production of Ibsen's `John Gabriel Borkman`.
- Thorbjørn Egner is named through the annually repeated family repertoire in the Ellen Horn period.
- Sverre Brandt is named through `Reisen til Julestjernen` in the same repertoire line.
- Marc Connelly is connected through the 1933 `Guds grønne enger` controversy.
- Henrik Bull is named as architect of the Nationaltheatret building.

## Duplicate gate

Exact repository search before creation returned no active matches for:

- `sebastian_hartmann`
- `thorbjorn_egner`
- `sverre_brandt`
- `marc_connelly`
- `henrik_bull`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/sebastian_hartmann.json','data/people/litteratur/oslo/nationaltheatret/thorbjorn_egner.json','data/people/litteratur/oslo/nationaltheatret/sverre_brandt.json','data/people/litteratur/oslo/nationaltheatret/marc_connelly.json','data/people/litteratur/oslo/nationaltheatret/henrik_bull.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
