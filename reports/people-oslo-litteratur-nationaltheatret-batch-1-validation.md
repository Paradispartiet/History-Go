# People Oslo litteratur — Nationaltheatret batch 1 validation

Generated: 2026-07-08

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This is a clean Nationaltheatret batch based on `main`. It is not stacked on the stale Det Norske Teatret draft stack.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch1.json`
- `data/people/manifest.json`
- `reports/people-oslo-litteratur-nationaltheatret-batch-1-validation.md`

## Target place

- `placeId`: `nationaltheatret`
- source file: `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json`
- category: `litteratur`
- year: `1899`
- repo description: hovedscene for norsk dramatikk, nært knyttet til Ibsen og Bjørnson.
- repo quiz profile: litteratursted, institusjon, minne og offentlighet.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `bjorn_bjornson` | Bjørn Bjørnson | `nationaltheatret` | First director of Nationaltheatret from its opening in 1899; returned as director in the 1920s |
| `johanne_dybwad` | Johanne Dybwad | `nationaltheatret` | Joined Nationaltheatret from the 1899 opening and played most of her career there; public statue/place memorial |
| `agnes_mowinckel` | Agnes Mowinckel | `nationaltheatret` | Early appearance at Nationaltheatret and multiple later productions there as actor/director |
| `per_aabel` | Per Aabel | `nationaltheatret` | Employed at Nationaltheatret from 1940 to 1972; statue by the stage entrance |
| `wenche_foss` | Wenche Foss | `nationaltheatret` | Regular Nationaltheatret association from 1952 and major postwar stage profile |

## Research gate

### Bjørn Bjørnson

Reference basis: Nationaltheatret opened in 1899 with Bjørn Bjørnson as its first director. Biographical sources also document that he led Nationaltheatret from 1899 to 1907 and again from 1923 to 1927.

Decision: safe. Direct institution-building relationship with the target place.

### Johanne Dybwad

Reference basis: Johanne Dybwad joined Bjørn Bjørnson at Nationaltheatret from its opening in 1899 and played there for most of her career. She is also memorialised directly at the theatre through the statue in front of the building and Johanne Dybwads plass.

Decision: safe. One of the strongest possible Nationaltheatret person anchors.

### Agnes Mowinckel

Reference basis: Agnes Mowinckel is documented with an early Nationaltheatret appearance in 1902 and multiple later Nationaltheatret productions, including stage and directing work.

Decision: safe. Direct theatre relationship, with strong historical value because she represents theatre renewal and female directing history.

### Per Aabel

Reference basis: Per Aabel is documented as employed at Nationaltheatret from 1940 to 1972, with a statue unveiled outside the stage entrance in 1999.

Decision: safe. Direct long-term ensemble relationship plus visible place memory.

### Wenche Foss

Reference basis: Wenche Foss is documented as a regular at Nationaltheatret from 1952, with numerous leading roles in the theatre's postwar repertoire.

Decision: safe. Direct long-term Nationaltheatret relationship and major national stage profile.

## Repo gate

Repo search was performed before this batch proposal for these candidate IDs:

- `bjorn_bjornson`
- `johanne_dybwad`
- `agnes_mowinckel`
- `per_aabel`
- `wenche_foss`

No existing people ID hits were returned for the exact candidate IDs.

## File structure decision

The batch creates a new people file:

```text
people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch1.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Nationaltheatret people work separated from the older large Oslo literature people file.

## Validation required before merge

```bash
node -e "for (const f of ['data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch1.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
