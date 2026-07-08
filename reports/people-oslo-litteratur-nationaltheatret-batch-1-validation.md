# People Oslo litteratur — Nationaltheatret batch 1 validation

Generated: 2026-07-09

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This is a clean opening/gullalder batch based on `main`. It is not stacked on the stale Det Norske Teatret draft stack.

## Cleanup from first draft

The first draft mixed early Nationaltheatret anchors with later postwar and theatre-renewal candidates. This report now records the cleanup decision:

- `agnes_mowinckel` is held for a later theatre-renewal/regi batch.
- `per_aabel` is held for a later postwar/transition batch.
- `wenche_foss` is not created here because repo research found an existing `wenche_foss` entry in `data/people/popkultur/oslo/people_popkultur_oslo.json`; she should be handled by a later update batch, not duplicated.

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
| `bjorn_bjornson` | Bjørn Bjørnson | `nationaltheatret` | First director of Nationaltheatret from the 1899 opening; institution-building anchor |
| `johanne_dybwad` | Johanne Dybwad | `nationaltheatret` | Joined Nationaltheatret from the 1899 opening and played most of her career there; direct memorial/place anchor |
| `halfdan_christensen` | Halfdan Christensen | `nationaltheatret` | Actor from the opening generation; later instructor and theatre director |
| `ragna_wettergreen` | Ragna Wettergreen | `nationaltheatret` | One of the central performers in Nationaltheatret's early/golden-age ensemble |
| `egil_eide` | Egil Næss Eide | `nationaltheatret` | One of the main forces at Nationaltheatret from 1899; actor/director anchor |

## Research gate

### Bjørn Bjørnson

Reference basis: Nationaltheatret opened in 1899 with Bjørn Bjørnson as its first theatre director. Biographical sources also document that he led Nationaltheatret from 1899 to 1907 and again from 1923 to 1927.

Decision: safe. Direct institution-building relationship with the target place.

### Johanne Dybwad

Reference basis: Johanne Dybwad was connected to Nationaltheatret from its opening in 1899 and played there through the main part of her career. She is also memorialised directly at the theatre through the statue in front of the building and Johanne Dybwads plass.

Decision: safe. One of the strongest possible Nationaltheatret person anchors.

### Halfdan Christensen

Reference basis: Halfdan Christensen belongs to Nationaltheatret's opening generation as actor, later instructor and theatre director.

Decision: safe. Direct artistic and institutional relationship with the target place.

### Ragna Wettergreen

Reference basis: Ragna Wettergreen is documented as one of the central names in Nationaltheatret's early/golden-age ensemble.

Decision: safe. Direct long-term stage relationship with the target place.

### Egil Næss Eide

Reference basis: Egil Næss Eide is documented as one of the main forces at Nationaltheatret from 1899, with both actor and director significance.

Decision: safe. Direct opening-generation relationship with the target place.

## Repo gate

Repo search was performed before this cleaned batch for these candidate IDs:

- `bjorn_bjornson`
- `johanne_dybwad`
- `halfdan_christensen`
- `ragna_wettergreen`
- `egil_eide`

No existing people ID hits were returned for the exact candidate IDs in the active people data.

Known existing people held out of this batch:

- `wenche_foss` exists in `data/people/popkultur/oslo/people_popkultur_oslo.json`.
- `liv_ullmann` exists in `data/people/film_tv/oslo/people_film_tv_oslo.json`.
- `kjersti_holmen` exists in `data/people/film_tv/oslo/people_film_tv_oslo.json`.

These should be handled in a separate update batch if Nationaltheatret is added to their `places` arrays.

## File structure decision

The batch creates/uses this people file:

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
