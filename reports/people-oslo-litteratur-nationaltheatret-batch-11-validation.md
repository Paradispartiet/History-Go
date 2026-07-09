# People Oslo litteratur — Nationaltheatret batch 11 validation

Generated: 2026-07-09

## Scope

Adds four researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This batch closes the teatersjef/institution-leadership line after merged batches 8–10.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch11.json`
- `data/people/manifest.json`
- `reports/people-oslo-litteratur-nationaltheatret-batch-11-validation.md`

## Target place

- `placeId`: `nationaltheatret`
- source file: `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json`
- category: `litteratur`
- year: `1899`
- repo description: hovedscene for norsk dramatikk, nært knyttet til Ibsen og Bjørnson.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `eirik_stubo` | Eirik Stubø | `nationaltheatret` | Teatersjef 2000–2008; modern/international regi line |
| `hanne_tomta` | Hanne Tømta | `nationaltheatret` | Teatersjef 2009–2020; newer institutional leadership and regi line |
| `kristian_seltun` | Kristian Seltun | `nationaltheatret` | Teatersjef from 2021; current 2020s leadership line |
| `marit_moum_aune` | Marit Moum Aune | `nationaltheatret` | Appointed teatersjef from 2027; next planned institutional phase |

## Research gate

Reference basis: the verified Nationaltheatret theatre-manager sequence gives Eirik Stubø 2000–2008, Hanne Tømta 2009–2020, Kristian Seltun from 2021 and Marit Moum Aune appointed from 2027. Because this batch touches current/future leadership, the source basis was rechecked before writing.

Decision: safe. All four have direct documented teatersjef relationship with the target place. This batch has four entries because there is no fifth equally direct current/final-period leader candidate without stretching the place relation.

## Repo gate

Repo search was performed before this batch for these candidate IDs:

- `eirik_stubo`
- `hanne_tomta`
- `kristian_seltun`
- `marit_moum_aune`

No existing people ID hits were returned for the exact candidate IDs in the active people data.

Existing leaders already represented in earlier Nationaltheatret batches and intentionally not duplicated here:

- `bjorn_bjornson`
- `halfdan_christensen`
- `toralv_maurstad`
- `ellen_horn`
- `stein_winge`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch11.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

Expected:

- `new people entries = 4`
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
