# People Oslo musikk — Det Norske Teatret batch 5 validation

Generated: 2026-07-08

## Scope

Adds five researched ensemble-/actor anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This batch follows the project rule that new focused people work should live in a dedicated people file instead of being appended to the large category/city file.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch5.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-5-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `nils_sletta` | Nils Sletta | `det_norske_teatret` | Appointed at Det Norske Teatret from 1969; Kritikerprisen for `Fuglane` |
| `britt_langlie` | Britt Langlie | `det_norske_teatret` | Worked at Det Norske Teatret from 1967; Kritikerprisen for `Piaf` |
| `svein_tindberg` | Svein Tindberg | `det_norske_teatret` | Stage debut at Det Norske Teatret in 1966 in `The King and I` |
| `lasse_kolstad` | Lasse Kolstad | `det_norske_teatret` | Long Det Norske Teatret career and musical theatre/singing roles |
| `ane_dahl_torp` | Ane Dahl Torp | `det_norske_teatret` | Performed at Det Norske Teatret from 2002; modern ensemble anchor |

## Research gate

### Nils Sletta

Reference basis: Nils Sletta is documented as appointed at Det Norske Teatret from 1969. He received Kritikerprisen in 1997 for the role of Mattis in a stage adaptation of Vesaas' `Fuglane`, and Aksel Waldemars minnepris for contributions to Nynorsk on stage.

Decision: safe. Direct long-term ensemble and Nynorsk stage relationship with the target place.

### Britt Langlie

Reference basis: Britt Langlie is documented as working at Det Norske Teatret from 1967. She received Kritikerprisen in 1981 for the role of Edith Piaf in `Piaf`.

Decision: safe. Direct ensemble and music-theatre relationship with the target place.

### Svein Tindberg

Reference basis: Svein Tindberg is documented as having made his stage debut at Det Norske Teatret in 1966, at age 13, in the musical `The King and I`, and later worked at Det Norske Teatret among other stages.

Decision: safe. Direct stage-debut and later actor relationship with the target place.

### Lasse Kolstad

Reference basis: Lasse Kolstad is documented as having worked at Det Norske Teatret, with long periods including 1956–1965 and from 1969 to 1992. He is especially tied to musical-theatre and singing roles at the theatre, including Tevje in `Spelemann på taket`.

Decision: safe. Direct and highly relevant music-theatre relationship with the target place.

### Ane Dahl Torp

Reference basis: Ane Dahl Torp is documented as performing at Det Norske Teatret from 2002, with a long list of roles at the theatre. This gives a direct modern ensemble relationship, not a loose film/TV association.

Decision: safe. Direct modern actor/ensemble relationship with the target place.

## Repo gate

Repo search was performed before this batch proposal for these candidate IDs:

- `nils_sletta`
- `britt_langlie`
- `svein_tindberg`
- `lasse_kolstad`
- `ane_dahl_torp`

No existing people ID hits were returned for the exact candidate IDs.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch5.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch5.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
