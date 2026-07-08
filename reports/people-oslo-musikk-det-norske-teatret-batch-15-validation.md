# People Oslo musikk — Det Norske Teatret batch 15 validation

Generated: 2026-07-08

## Scope

Adds five researched markante Det Norske Teatret actor/music-theatre anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This PR is intentionally a draft stacked on the batch 14 branch because PR #1870 is still a draft and earlier PRs in the stack must be merged into `main` first.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch15.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-15-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `jon_eikemo` | Jon Eikemo | `det_norske_teatret` | Long central DNT relationship from 1978 and Jakob Sande performance success |
| `pia_tjelta` | Pia Tjelta | `det_norske_teatret` | Stage debut at DNT in 2006 and early DNT roles |
| `ingrid_bolso_berdal` | Ingrid Bolsø Berdal | `det_norske_teatret` | Multiple early DNT roles; Hedda debut recognition; later international profile |
| `jannike_kruse` | Jannike Kruse | `det_norske_teatret` | Music-theatre roles at DNT including `Hair` and `Musical Musikal!` |
| `lena_kristin_ellingsen` | Lena Kristin Ellingsen | `det_norske_teatret` | Worked at DNT; Gullruten/Hedda-recognised actor |

## Research gate

### Jon Eikemo

Reference basis: Jon Eikemo is documented as assigned to Det Norske Teatret from 1978 onwards, with central roles at the theatre. His `Jakob Sande & Jon Eikemo, trur eg...` became one of the theatre's major successes and contributed to his Critics' Award recognition.

Decision: safe. Very strong markant actor anchor and direct DNT relation.

### Pia Tjelta

Reference basis: Pia Tjelta is documented as making her stage debut in `Fyrverkerimakarens dotter` at Det Norske Teatret in 2006 and later starring in `Få meg på, for faen` at the same theatre.

Decision: safe. Direct DNT debut/role relation and markant modern actor profile.

### Ingrid Bolsø Berdal

Reference basis: Ingrid Bolsø Berdal is documented with a series of early Det Norske Teatret roles, including `Ned til sol`, `Bikubesong`, `Frank`, `Hair`, `Black Milk`, `Ivanov`, `Yvonne, Princess of Burgundy`, `Frøken Else` and `Baby`. She also received Hedda recognition after her early DNT work.

Decision: safe. Strong DNT stage relation and markant national/international actor profile.

### Jannike Kruse

Reference basis: Jannike Kruse is documented with Det Norske Teatret roles in `Hair` and `Musical Musikal!`, alongside a broader singer/actor/musical profile.

Decision: safe. Direct DNT music-theatre relationship.

### Lena Kristin Ellingsen

Reference basis: Lena Kristin Ellingsen is documented as having worked at Det Norske Teatret among several Norwegian theatres and as a Gullruten/Hedda-recognised actor.

Decision: safe, but broader than the exact date-bounded anchors. Kept because the DNT relationship is explicit and she is a markant modern actor.

## Rejected / held back in this research pass

- `bjarte_hjelmeland`: held back because the research pass did not produce a clean DNT employment/debut/production anchor.
- `helge_jordal`: held back because sources pointed primarily to Nationaltheatret, Hålogaland Teater and DNS, not a clean DNT relationship.
- `kare_conradi`: held back because the research pass did not produce a clean enough direct DNT relationship.
- `hildegun_riise`: held back again because the research pass still did not produce a clean direct DNT source.
- `natalie_bjerke_roland`: held back because the `Pippi på Sirkus` role is clear but she is still more of an emerging/current musical lead than a markant historical/national anchor.

## Repo gate

Repo/PR searches were performed before this batch proposal for these candidate IDs:

- `jon_eikemo`
- `pia_tjelta`
- `ingrid_bolso_berdal`
- `jannike_kruse`
- `lena_kristin_ellingsen`

No existing people ID hits were returned for the exact candidate IDs or batch15 file.

## Stack note

This PR is based on:

```text
data/det-norske-teatret-people-batch-14-20260708
```

because PR #1870 is still a draft. Do not merge this draft PR before the earlier stack is merged in the correct order. Once the stack is merged, retarget this PR to `main` or recreate it cleanly from updated `main` if GitHub shows inherited diff.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch15.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run after PR #1870 is included:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch15.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
