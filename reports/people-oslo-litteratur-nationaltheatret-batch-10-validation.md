# People Oslo litteratur — Nationaltheatret batch 10 validation

Generated: 2026-07-09

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This batch continues the teatersjef/institution-leadership line after merged batches 8–9.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch10.json`
- `data/people/manifest.json`
- `reports/people-oslo-litteratur-nationaltheatret-batch-10-validation.md`

## Target place

- `placeId`: `nationaltheatret`
- source file: `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json`
- category: `litteratur`
- year: `1899`
- repo description: hovedscene for norsk dramatikk, nært knyttet til Ibsen og Bjørnson.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `kjetil_bang_hansen` | Kjetil Bang-Hansen | `nationaltheatret` | Teatersjef 1986–1988; director/institution-theatre anchor |
| `ellen_horn` | Ellen Horn | `nationaltheatret` | Teatersjef 1992–2000; actor/leader/culture-politics anchor |
| `ole_jorgen_nilsen` | Ole-Jørgen Nilsen | `nationaltheatret` | Teatersjef 2000–2001; transition leadership anchor |
| `sverre_rodahl` | Sverre Rødahl | `nationaltheatret` | Teatersjef 2001–2002; transition leadership anchor |
| `stein_winge` | Stein Winge | `nationaltheatret` | Teatersjef 2002–2004; modern director/scenekanon anchor |

## Research gate

Reference basis: Store norske leksikon's Nationaltheatret article lists the theatre-manager sequence and years, including Kjetil Bang-Hansen 1986–1988, Ellen Horn 1992–2000, Ole-Jørgen Nilsen 2000–2001, Sverre Rødahl 2001–2002 and Stein Winge 2002–2004.

Decision: safe. All five have direct teatersjef relationship with the target place.

## Repo gate

Repo search was performed before this batch for these candidate IDs:

- `kjetil_bang_hansen`
- `ellen_horn`
- `ole_jorgen_nilsen`
- `sverre_rodahl`
- `stein_winge`

No existing people ID hits were returned for the exact candidate IDs in the active people data.

Existing leaders already represented in earlier Nationaltheatret batches and intentionally not duplicated here:

- `bjorn_bjornson`
- `halfdan_christensen`
- `toralv_maurstad`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch10.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
