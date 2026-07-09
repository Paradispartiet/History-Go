# People Oslo litteratur — Nationaltheatret batch 12 validation

Generated: 2026-07-09

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This batch starts the dramatiker/repertoar line after merged leadership batches 8–11. It is intentionally limited to people with explicit Nationaltheatret connection through opening performances, statues/facade memory, repertory tradition, urpremiere or long engagement at the theatre.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch12.json`
- `data/people/manifest.json`
- `reports/people-oslo-litteratur-nationaltheatret-batch-12-validation.md`

## Target place

- `placeId`: `nationaltheatret`
- source file: `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json`
- category: `litteratur`
- year: `1899`
- repo description: hovedscene for norsk dramatikk, nært knyttet til Ibsen og Bjørnson.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `henrik_ibsen` | Henrik Ibsen | `nationaltheatret` | Nationaltheatret opened with `En folkefiende`; Ibsen is one of the theatre's core repertory/statue figures |
| `bjornstjerne_bjornson` | Bjørnstjerne Bjørnson | `nationaltheatret` | Nationaltheatret opened with `Sigurd Jorsalfar`; Bjørnson is a core repertory/statue figure |
| `ludvig_holberg` | Ludvig Holberg | `nationaltheatret` | Holberg excerpts were part of the opening programme; Holberg statue/repertory line at the theatre |
| `gunnar_heiberg` | Gunnar Heiberg | `nationaltheatret` | Several contemporary plays received first performances at Nationaltheatret |
| `sigurd_eldegard` | Sigurd Eldegard | `nationaltheatret` | Engaged at Nationaltheatret from 1901; `Fossegrimen` first staged there in 1905 |

## Research gate

### Henrik Ibsen

Reference basis: Nationaltheatret's opening sequence included Ibsen's `En folkefiende`, and Ibsen is a core facade/statue/repertory figure for the institution.

Decision: safe. Direct opening/repertory/place-memory relationship.

### Bjørnstjerne Bjørnson

Reference basis: Nationaltheatret's opening sequence included Bjørnson's `Sigurd Jorsalfar`, and Bjørnson is a core facade/statue/repertory figure for the institution.

Decision: safe. Direct opening/repertory/place-memory relationship.

### Ludvig Holberg

Reference basis: Nationaltheatret's opening evening included selected Holberg comedy excerpts; Holberg is also represented as a statue/repertory figure at the theatre.

Decision: safe. Direct opening/repertory/place-memory relationship.

### Gunnar Heiberg

Reference basis: under the early Nationaltheatret line, several works by Gunnar Heiberg received first performances at Nationaltheatret.

Decision: safe. Direct urpremiere/repertory relationship.

### Sigurd Eldegard

Reference basis: Eldegard was engaged at Nationaltheatret from 1901 to 1931, with short interruptions, and `Fossegrimen` was first staged at Nationaltheatret in 1905.

Decision: safe. Direct employment and urpremiere relationship.

## Repo gate

Repo search was performed before this batch for these candidate IDs:

- `henrik_ibsen`
- `bjornstjerne_bjornson`
- `ludvig_holberg`
- `gunnar_heiberg`
- `sigurd_eldegard`

No existing people ID hits were returned for the exact candidate IDs in the active people data. Existing story/relations/quiz hits for Ibsen and Bjørnson were not active people entries.

## Validation required before merge

```bash
node -e "for (const f of ['data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch12.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

Expected:

- `new people entries = 5`
- `duplicatePeopleIds = 0`
- `invalidPlaceRefs = 0`
- `peopleWithoutValidPrimaryAnchor = 0`
- `peopleWithEmptyPlacesArray = 0`
- `flatPeopleFiles = 0`

## Not changed

- No place files.
- No `data/places/places_index.json`.
- No UI/runtime/loader files.
- No unrelated people files.
