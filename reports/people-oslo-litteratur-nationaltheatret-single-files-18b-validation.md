# Nationaltheatret people — single files 18b validation

Generated: 2026-07-09

## Scope

Adds five new Nationaltheatret-linked people entries as single-person files. No batch file is introduced.

## Added files

- `data/people/litteratur/oslo/nationaltheatret/andrea_braein_hovig.json`
- `data/people/litteratur/oslo/nationaltheatret/anneke_von_der_lippe.json`
- `data/people/litteratur/oslo/nationaltheatret/anne_krigsvoll.json`
- `data/people/litteratur/oslo/nationaltheatret/ingjerd_egeberg.json`
- `data/people/litteratur/oslo/nationaltheatret/kari_simonsen.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files.

## Source basis

Primary source: Store norske leksikon individual articles.

- Andrea Bræin Hovig is described by SNL as having interpreted several central roles at Nationaltheatret, including `Reisen til julestjernen`, `Nattergalen`, `Hedda Gabler`, and `Cyrano`.
- Anneke von der Lippe is described by SNL as an employee at Nationaltheatret with roles including Nora in `Et dukkehjem`, Gwendolen in `Hvem er Earnest?`, Eva Braun in `Speer`, and fru Alving in a `Gengangere`-based production.
- Anne Krigsvoll is described by SNL as debuting at Nationaltheatret in 1982, employed there 1982–1985 and again from 1987, with major roles there.
- Ingjerd Egeberg is described by SNL as having worked at Nationaltheatret and as playing Ruth in `Hjemkomsten` there in 2007.
- Kari Simonsen is described by SNL as employed at Nationaltheatret from 1973.

## Duplicate gate

Exact repository search before creation returned no active matches for:

- `andrea_braein_hovig`
- `anneke_von_der_lippe`
- `anne_krigsvoll`
- `ingjerd_egeberg`
- `kari_simonsen`

## PR hygiene note

A stale duplicate draft PR, #1999, was closed unmerged before this clean branch was created.

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/andrea_braein_hovig.json','data/people/litteratur/oslo/nationaltheatret/anneke_von_der_lippe.json','data/people/litteratur/oslo/nationaltheatret/anne_krigsvoll.json','data/people/litteratur/oslo/nationaltheatret/ingjerd_egeberg.json','data/people/litteratur/oslo/nationaltheatret/kari_simonsen.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
