# People Oslo litteratur — Nationaltheatret batch 10 validation

Generated: 2026-07-09

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This batch continues the teatersjef/institution-leadership line after merged batches 8–9.

## Correction note

This report corrects the first merged batch 10 wording for the late-1980s/1990s leadership sequence. `stein_winge` belongs to the 1990–1992 teatersjef period, while the 2000s line continues with `eirik_stubo` in the next batch. `ellen_horn`, `ole_jorgen_nilsen` and `sverre_rodahl` are represented as the 1988–1990 teatersjefkollegium, with Ellen Horn also described as later teatersjef 1992–2000.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch10.json`
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
| `ellen_horn` | Ellen Horn | `nationaltheatret` | Teatersjefkollegium 1988–1990 and teatersjef 1992–2000; actor/leader/culture-politics anchor |
| `ole_jorgen_nilsen` | Ole-Jørgen Nilsen | `nationaltheatret` | Part of the 1988–1990 teatersjefkollegium; transition leadership anchor |
| `sverre_rodahl` | Sverre Rødahl | `nationaltheatret` | Part of the 1988–1990 teatersjefkollegium; transition leadership anchor |
| `stein_winge` | Stein Winge | `nationaltheatret` | Teatersjef 1990–1992; modern director/scenekanon anchor |

## Research gate

Reference basis: the verified Nationaltheatret theatre-manager sequence gives Kjetil Bang-Hansen 1986–1988; Ellen Horn, Ole-Jørgen Nilsen and Sverre Rødahl 1988–1990; Stein Winge 1990–1992; Ellen Horn 1992–2000; and then Eirik Stubø from 2000.

Decision: safe. All five have direct teatersjef or teatersjefkollegium relationship with the target place.

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

- `duplicatePeopleIds = 0`
- `invalidPlaceRefs = 0`
- `peopleWithoutValidPrimaryAnchor = 0`
- `peopleWithEmptyPlacesArray = 0`
- `flatPeopleFiles = 0`

## Not changed

- No manifest changes in this correction PR.
- No place files.
- No `data/places/places_index.json`.
- No UI/runtime/loader files.
- No unrelated people files.
