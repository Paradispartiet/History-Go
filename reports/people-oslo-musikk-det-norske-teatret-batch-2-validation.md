# People Oslo musikk — Det Norske Teatret batch 2 validation

Generated: 2026-07-08

## Scope

Adds five researched people anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This follows the project rule that new focused people work should live in a dedicated people file instead of being appended to the large category/city file.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch2.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-2-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `tormod_skagestad` | Tormod Skagestad | `det_norske_teatret` | Long-serving theatre director; modernized and professionalized music theatre |
| `egil_monn_iversen` | Egil Monn-Iversen | `det_norske_teatret` | Kapellmeister and composer tied to Det Norske Teatret musical productions |
| `svein_erik_brodal` | Svein Erik Brodal | `det_norske_teatret` | Actor, instructor and theatre director; led the new-building and musical era |
| `hans_jacob_nilsen` | Hans Jacob Nilsen | `det_norske_teatret` | Theatre director; introduced American musical at the theatre |
| `knut_hergel` | Knut Hergel | `det_norske_teatret` | Theatre director before and after the wartime interruption |

## Research gate

### Tormod Skagestad

SNL documents that Skagestad was head of Det Norske Teatret from 1960 to 1979, with one year's exception, and that he strongly shaped both Det Norske Teatret and Norwegian theatre in the second half of the twentieth century. SNL also documents that he professionalized the music theatre, brought in Egil Monn-Iversen as musical leader, imported Broadway successes and developed Norwegian musicals such as `Bør Børson jr.` and `Jeppe på Berget`.

Decision: safe. Direct long-term leadership and music-theatre development at the target place.

### Egil Monn-Iversen

SNL documents that Monn-Iversen was kapellmeister at Det Norske Teatret from 1967. It also documents that he wrote music for `Bør Børson Jr.` at Det Norske Teatret in 1972 and `Ungen` at Det Norske Teatret in 1973.

Decision: safe. Direct musical role and production links at the target place.

### Svein Erik Brodal

SNL documents that Brodal came to Det Norske Teatret in 1962 and stayed until retirement in 2009. He was theatre director twice, inaugurated the new building in the Karl Johan quarter in 1985, and invested in large musical projects including `Cats` in 1985 and `Les Misérables` in 1988.

Decision: safe. Direct actor/instructor/director relationship and music-theatre relevance at the target place.

### Hans Jacob Nilsen

SNL documents that Nilsen became head of Det Norske Teatret in 1933, returned as head in 1946 and remained until 1950. It also documents that he introduced the American musical at Det Norske Teatret with `Oklahoma!` in 1949 and `Show Boat` in 1950, and led the important 1948 `Peer Gynt` production with music by Harald Sæverud.

Decision: safe. Direct leadership and music-theatre/repertoire role at the target place.

### Knut Hergel

SNL documents that Knut Hergel was head of the theatre from 1936 to 1946, interrupted during the war when the theatre was nazified and Hergel fled to Sweden. The Det Norske Teatret theatre-director list ties him directly to the periods 1936–1942 and 1945–1946.

Decision: safe. Direct leadership role at the target place.

## Repo gate

Repo search was performed before this batch proposal for these candidate IDs:

- `tormod_skagestad`
- `egil_monn_iversen`
- `svein_erik_brodal`
- `hans_jacob_nilsen`
- `knut_hergel`

No existing people ID hits were returned for the exact candidate IDs.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch2.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps the Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch2.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
