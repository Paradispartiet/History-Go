# Nationaltheatret people — single files 21 validation

Generated: 2026-07-09

## Scope

Adds five new Nationaltheatret-linked people entries as single-person files. No batch file is introduced.

## Added files

- `data/people/litteratur/oslo/nationaltheatret/anne_marie_ottersen.json`
- `data/people/litteratur/oslo/nationaltheatret/svein_tindberg.json`
- `data/people/litteratur/oslo/nationaltheatret/bjarte_hjelmeland.json`
- `data/people/litteratur/oslo/nationaltheatret/lasse_lindtner.json`
- `data/people/litteratur/oslo/nationaltheatret/geir_kvarme.json`

## Manifest

`data/people/manifest.json` now references all five new single-person files.

## Source basis

Primary source: Store norske leksikon individual articles.

- Anne Marie Ottersen is described by SNL as employed at Nationaltheatret in 1970, where she debuted as Kirsten in `Sandkassen`, and as having her fixed workplace there.
- Svein Tindberg is described by SNL as guesting at Nationaltheatret in 1996–1999, with named Nationaltheatret roles in Wilde, Ibsen and Shakespeare.
- Bjarte Hjelmeland is described by SNL as permanently employed at Nationaltheatret from 1991 to 2020, with roles there and at Torshovteatret.
- Lasse Lindtner is described by SNL as working for Nationaltheatret after Trøndelag Teater, with named important Nationaltheatret roles.
- Geir Kvarme is described by SNL as employed at Nationaltheatret in 1989–1996 and as receiving the 2025 Heddaprisen for `Arven` at Nationaltheatret.

## Duplicate gate

Exact repository search before creation returned no active matches for:

- `anne_marie_ottersen`
- `svein_tindberg`
- `bjarte_hjelmeland`
- `lasse_lindtner`
- `geir_kvarme`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/manifest.json','data/people/litteratur/oslo/nationaltheatret/anne_marie_ottersen.json','data/people/litteratur/oslo/nationaltheatret/svein_tindberg.json','data/people/litteratur/oslo/nationaltheatret/bjarte_hjelmeland.json','data/people/litteratur/oslo/nationaltheatret/lasse_lindtner.json','data/people/litteratur/oslo/nationaltheatret/geir_kvarme.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
