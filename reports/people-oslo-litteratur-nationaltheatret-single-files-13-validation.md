# Nationaltheatret people — single files 13 validation

Generated: 2026-07-09

## Scope

Adds five new Nationaltheatret-linked people entries as single-person files. No batch file is introduced.

## Added files

- `data/people/litteratur/oslo/nationaltheatret/lars_nordrum.json`
- `data/people/litteratur/oslo/nationaltheatret/kirsten_sorlie.json`
- `data/people/litteratur/oslo/nationaltheatret/edith_roger.json`
- `data/people/litteratur/oslo/nationaltheatret/bjorn_saether.json`
- `data/people/litteratur/oslo/nationaltheatret/janken_varden.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files.

## Source basis

Primary source: Store norske leksikon, `Nationaltheatret`.

- Lars Nordrum is named among the postwar actor forces that supplemented the prewar generation at Nationaltheatret.
- Kirsten Sørlie and Edith Roger are named as leading instructor forces at the main stage over several decades.
- Bjørn Sæther is named as having had major importance for Torshovteatret, Nationaltheatret's district stage.
- Janken Varden is named in relation to Torshovteatret's outreach work to reach new audience groups.

## Duplicate gate

Exact repository search before creation returned no active matches for:

- `lars_nordrum`
- `kirsten_sorlie`
- `edith_roger`
- `bjorn_saether`
- `janken_varden`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/lars_nordrum.json','data/people/litteratur/oslo/nationaltheatret/kirsten_sorlie.json','data/people/litteratur/oslo/nationaltheatret/edith_roger.json','data/people/litteratur/oslo/nationaltheatret/bjorn_saether.json','data/people/litteratur/oslo/nationaltheatret/janken_varden.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
