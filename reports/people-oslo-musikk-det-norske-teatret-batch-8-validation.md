# People Oslo musikk — Det Norske Teatret batch 8 validation

Generated: 2026-07-08

## Scope

Adds five researched Det Norske Teatret scene anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This is a clean replacement PR from `main`. The earlier stacked PR #1823 was merged into a feature branch, not into `main`, so `main` still needed this batch.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch8.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-8-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `mimmi_tamba` | Mimmi Tamba | `det_norske_teatret` | DNT musical productions, including `The Book of Mormon` and `Lazarus` |
| `marie_blokhus` | Marie Blokhus | `det_norske_teatret` | Employed/permanent at DNT; Hedda-winning DNT stage work; later directing/writing |
| `oddgeir_thune` | Oddgeir Thune | `det_norske_teatret` | Employed at Det Norske Teatret after actor training |
| `gudrun_waadeland` | Gudrun Waadeland | `det_norske_teatret` | Stage debut at Det Norske Teatret in 1959 |
| `sverre_solberg` | Sverre Solberg | `det_norske_teatret` | Actor at Det Norske Teatret from 1990 to 1992 |

## Research gate

### Mimmi Tamba

Reference basis: Mimmi Tamba is documented with musical theatre work at Det Norske Teatret, including `The Book of Mormon` and David Bowie's `Lazarus`; she was nominated for the Hedda Award for her role in `Lazarus` at Det Norske Teatret.

Decision: safe. Direct modern musical-theatre relationship with the target place.

### Marie Blokhus

Reference basis: Marie Blokhus is documented as employed at Det Norske Teatret after finishing acting school in 2010 and as permanently employed from 2014. She won the Hedda Award for `Fugletribunalet` at Det Norske Teatret and later co-wrote/directed `Werther` at the same theatre.

Decision: safe. Direct DNT actor/director relationship.

### Oddgeir Thune

Reference basis: Oddgeir Thune is documented as becoming employed at Det Norske Teatret after training, with a direct actor profile connection to the theatre.

Decision: safe. Direct DNT employment relationship.

### Gudrun Waadeland

Reference basis: Gudrun Waadeland is documented as having made her stage debut at Det Norske Teatret in 1959.

Decision: safe. Direct stage-debut relationship with the target place.

### Sverre Solberg

Reference basis: Sverre Solberg is documented as working as an actor at Det Norske Teatret from 1990 to 1992.

Decision: safe. Direct time-bounded employment relationship with the target place.

## Repo gate

Repo/PR searches were performed before this batch proposal for these candidate IDs:

- `mimmi_tamba`
- `marie_blokhus`
- `oddgeir_thune`
- `gudrun_waadeland`
- `sverre_solberg`

No existing people ID hits were returned for the exact candidate IDs or batch8 file.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch8.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch8.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
