# People Oslo musikk — Det Norske Teatret batch 1 validation

Generated: 2026-07-08

## Scope

Adds the first five researched people anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This batch follows the new rule: place-specific people additions should live in their own people file instead of being appended to the large category/city file.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch1.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-1-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `hulda_garborg` | Hulda Garborg | `det_norske_teatret` | Co-founder / first chair / folk dance and theatre pioneer |
| `rasmus_rasmussen` | Rasmus Rasmussen | `det_norske_teatret` | First theatre director, 1912–1915 |
| `edvard_drablos` | Edvard Drabløs | `det_norske_teatret` | Actor, instructor and theatre director; described as a bearing force from the start |
| `agnes_mowinckel` | Agnes Mowinckel | `det_norske_teatret` | Instructor associated with the theatre's artistic breakthrough in the 1920s |
| `lars_tvinde` | Lars Tvinde | `det_norske_teatret` | Said the first official line at the theatre and stayed in the ensemble until 1957 |

## Research gate

### Hulda Garborg

SNL documents that Hulda Garborg was a writer, cultural entrepreneur and folk educator, with pioneer work in theatre, folk dance, women's cause, bunad use and language movement. SNL also states that she helped found Det Norske Teatret in 1912 and was its first chair. In the theatre section, SNL states that Det Norske Spellaget was the forerunner of Det Norske Teatret and that Garborg's `Rationelt Fjøsstell` was part of the opening performance in 1913.

Decision: safe. Direct founding and institutional role.

### Rasmus Rasmussen

SNL's article on Det Norske Teatret lists Rasmus Rasmussen as theatre director for 1912–1915. That makes him the first theatre director in the institution's history.

Decision: safe. Direct leadership role at the target place.

### Edvard Drabløs

SNL's article on Det Norske Teatret describes Edvard Drabløs as a bearing force at the theatre from the start and onward, as actor, instructor and theatre director. The same article lists him as theatre director in several periods.

Decision: safe. Direct actor/instructor/director relationship with the target place.

### Agnes Mowinckel

SNL's article on Det Norske Teatret says the artistic breakthrough for the theatre came in the 1920s when Agnes Mowinckel was an instructor. Her own SNL article documents her significance as actor and instructor.

Decision: safe. Direct artistic breakthrough / instruction relationship with the target place.

### Lars Tvinde

SNL's article on Det Norske Teatret says Lars Tvinde spoke the first official line at the theatre on 2 January 1913 and remained a loyal member of the ensemble until 1957.

Decision: safe. Direct opening-history and long ensemble relationship with the target place.

## Repo gate

Repo search was performed before the batch proposal for the candidate IDs/names. The batch avoids adding entries that already appear as people IDs in the repo.

This batch also avoids adding generic collective anchors for Rockefeller, John Dee or Sentrum Scene because those places already have people coverage.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch1.json
```

and registers it in:

```text
data/people/manifest.json
```

This follows the new project rule: new focused people work should go in its own people file, not be appended into a large omnibus file.

## Validation required before merge

Run:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch1.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
