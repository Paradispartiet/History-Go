# People Oslo musikk — Det Norske Teatret batch 3 validation

Generated: 2026-07-08

## Scope

Adds five researched people anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This batch continues the dedicated-file approach for Det Norske Teatret people work.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch3.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-3-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `otto_homlung` | Otto Homlung | `det_norske_teatret` | Theatre director 1990–1997 |
| `vidar_sandem` | Vidar Sandem | `det_norske_teatret` | Actor/dramatist, at the theatre from 1977 and theatre director 1997–2010 |
| `erik_ulfsby` | Erik Ulfsby | `det_norske_teatret` | Theatre director 2011–2024 and modern repertoire/profile builder |
| `kjersti_horn` | Kjersti Horn | `det_norske_teatret` | Theatre director from 2025 and contemporary directing profile |
| `arne_lygre` | Arne Lygre | `det_norske_teatret` | Contemporary playwright with documented Det Norske Teatret premieres/productions |

## Research gate

### Otto Homlung

Reference basis: the theatre-director list for Det Norske Teatret identifies Otto Homlung as director from 1990 to 1997. His biographical references also identify him as a stage director and theatre director with this Det Norske Teatret period.

Decision: safe. Direct theatre-director relationship with the target place.

### Vidar Sandem

Reference basis: Vidar Sandem is documented as having started at Det Norske Teatret in 1977 and serving as theatre director from 1997 to 2010.

Decision: safe. Direct actor/dramatist/director relationship with the target place.

### Erik Ulfsby

Reference basis: Erik Ulfsby is documented as theatre director at Det Norske Teatret from 2011 to 2024 and associated with a modern repertoire profile, including major stage productions.

Decision: safe. Direct theatre-director relationship with the target place.

### Kjersti Horn

Reference basis: Kjersti Horn is documented as theatre director at Det Norske Teatret from 2025. This is a current/recent leadership anchor and should be understood as a now-time institutional connection, not a generic theatre-director association.

Decision: safe. Direct theatre-director relationship with the target place.

### Arne Lygre

Reference basis: Arne Lygre is documented as a contemporary dramatist with several Det Norske Teatret connections, including `Tid for glede`, which had its premiere on Hovudscenen in 2022 and became a critical and audience success.

Decision: safe. Direct repertoire/premiere relationship with the target place.

## Repo gate

Repo search was performed before this batch proposal for these candidate IDs:

- `otto_homlung`
- `vidar_sandem`
- `erik_ulfsby`
- `kjersti_horn`
- `arne_lygre`

No existing people ID hits were returned for the exact candidate IDs.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch3.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch3.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
