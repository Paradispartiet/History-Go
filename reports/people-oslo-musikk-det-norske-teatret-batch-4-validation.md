# People Oslo musikk — Det Norske Teatret batch 4 validation

Generated: 2026-07-08

## Scope

Adds five researched people anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This is the clean batch 4 branch created from updated `main` after closing the earlier stacked PR that showed inherited diff.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch4.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-4-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `sigurd_eldegard` | Sigurd Eldegard | `det_norske_teatret` | Actor, playwright and theatre director 1918–1920; early repertoire link |
| `amund_rydland` | Amund Rydland | `det_norske_teatret` | Actor/theatre director in the early institution-building phase |
| `ingjald_haaland` | Ingjald Haaland | `det_norske_teatret` | Ensemble member from the start and theatre director 1922–1933 |
| `olav_hoprekstad` | Olav Hoprekstad | `det_norske_teatret` | Playwright in the opening/early repertoire; board role later |
| `harald_saeverud` | Harald Sæverud | `det_norske_teatret` | Composer of new music for the 1948 nynorsk Peer Gynt production |

## Research gate

### Sigurd Eldegard

Reference basis: Sigurd Eldegard is documented as actor, playwright and theatre director. He served as theatre director at Det Norske Teatret from 1918 to 1920, and Det Norske Teatret played his `Gamlelandet` in 1914.

Decision: safe. Direct theatre-director and early-repertoire relationship with the target place.

### Amund Rydland

Reference basis: Amund Rydland is tied to Det Norske Teatret through the early theatre-director sequence after Rasmus Rasmussen and Edvard Drabløs. The entry is used as an early institution-building and leadership anchor, not as a generic actor association.

Decision: safe, but should be checked carefully in audit/review because the source basis is narrower than for Haaland, Skagestad or Brodal.

### Ingjald Haaland

Reference basis: Ingjald Haaland is documented as an ensemble member at Det Norske Teatret from the start in 1913, employed when the theatre was established in Oslo, theatre director from 1922, and staying at the theatre until 1940.

Decision: safe. Direct start-phase ensemble and long leadership relationship with the target place.

### Olav Hoprekstad

Reference basis: Olav Hoprekstad's `Bjørnefjell` was part of the opening repertoire at Det Norske Teatret in 1913. `Friarar` was staged later in 1913, and several of his later plays were also staged there. He later served on the board of Det Norske Teatret from 1948 to 1963.

Decision: safe. Direct opening-repertoire and later board relationship with the target place.

### Harald Sæverud

Reference basis: Harald Sæverud composed new music for the 1948 nynorsk `Peer Gynt` production at Det Norske Teatret. This is a direct music-history link and is especially relevant because the target place is in the `musikk` category.

Decision: safe. Direct production/composition relationship with the target place.

## Rejected / skipped in this batch

- `jon_fosse`: skipped because repo history shows he already exists in `data/people/litteratur/oslo/people_litteratur_oslo.json`; he should be extended later, not duplicated.
- `oskar_braaten`: skipped because current `data/people/litteratur/oslo/people_litteratur_oslo.json` already contains `oskar_braaten`; he should be extended later, not duplicated.
- `cally_monrad`: skipped despite direct theatre-director relation because her wartime NS/Nazi-period role needs a separate, explicit historical framing if used.

## Repo gate

Repo/PR searches were performed before this batch proposal for candidate IDs and known duplicate risks. Exact existing IDs were identified for `jon_fosse` and `oskar_braaten`, so those two were not added.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch4.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch4.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
