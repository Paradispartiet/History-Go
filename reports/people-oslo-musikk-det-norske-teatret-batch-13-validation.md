# People Oslo musikk — Det Norske Teatret batch 13 validation

Generated: 2026-07-08

## Scope

Adds five researched Det Norske Teatret ensemble-/institution-network anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This PR is intentionally a draft stacked on the batch 12 branch because PR #1866 is still a draft and earlier PRs in the stack must be merged into `main` first.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch13.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-13-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `ola_b_johannessen` | Ola B. Johannessen | `det_norske_teatret` | Stage debut at DNT in 1961; worked there 1962–1970 |
| `astrid_folstad` | Astrid Folstad | `det_norske_teatret` | Employed at DNT from 1956 to 1959 |
| `bab_christensen` | Bab Christensen | `det_norske_teatret` | Employed at DNT from 1970 |
| `nils_ole_oftebro` | Nils Ole Oftebro | `det_norske_teatret` | Employed at DNT from 1968 after theatre training |
| `bjorn_sundquist` | Bjørn Sundquist | `det_norske_teatret` | Worked for many years at DNT and Nationaltheatret |

## Research gate

### Ola B. Johannessen

Reference basis: Ola B. Johannessen is documented as making his stage debut at Det Norske Teatret in 1961 and working at the theatre from 1962 to 1970.

Decision: safe. Direct stage-debut and employment relationship with the target place.

### Astrid Folstad

Reference basis: Astrid Folstad is documented as employed at Det Norske Teatret from 1956 to 1959 after theatre training.

Decision: safe. Direct time-bounded ensemble relationship with the target place.

### Bab Christensen

Reference basis: Bab Christensen is documented as employed at Det Norske Teatret from 1970 after work at several other Norwegian theatre institutions.

Decision: safe. Direct DNT employment relationship.

### Nils Ole Oftebro

Reference basis: Nils Ole Oftebro is documented as employed at Det Norske Teatret from 1968 after actor training.

Decision: safe. Direct early career employment relationship with the target place.

### Bjørn Sundquist

Reference basis: Bjørn Sundquist is documented as having worked for many years at Det Norske Teatret and Nationaltheatret.

Decision: safe, but broader than the exact date-bounded anchors. Kept because the DNT relation is explicit and the entry frames him as a scene anchor, not a loose film/TV profile.

## Rejected / held back

- `toralv_maurstad`: held back because the quick source pass produced a DNT guest-role relation rather than a clean employment/debut anchor.
- `liv_dommersnes`: held back because the quick source pass did not produce a clean enough direct DNT relationship.
- `jack_fjeldstad`: held back because the quick source pass did not produce a clean enough direct DNT relationship.
- `knut_risan`: held back because the quick source pass did not produce a clean enough direct DNT relationship.

## Repo gate

Repo/PR searches were performed before this batch proposal for these candidate IDs:

- `ola_b_johannessen`
- `astrid_folstad`
- `bab_christensen`
- `nils_ole_oftebro`
- `bjorn_sundquist`

No existing people ID hits were returned for the exact candidate IDs or batch13 file.

## Stack note

This PR is based on:

```text
data/det-norske-teatret-people-batch-12-20260708
```

because PR #1866 is still a draft. Do not merge this draft PR before the earlier stack is merged in the correct order. Once the stack is merged, retarget this PR to `main` or recreate it cleanly from updated `main` if GitHub shows inherited diff.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch13.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run after PR #1866 is included:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch13.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
- No generated audit reports manually edited.
