# People Oslo litteratur — Nationaltheatret batch 9 validation

Generated: 2026-07-09

## Scope

Adds five researched Nationaltheatret people anchors for the existing Oslo literature/scenekunst place `nationaltheatret`.

This batch continues the teatersjef/institution-leadership line after merged batch 8.

## Changed files

- `data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch9.json`
- `data/people/manifest.json`
- `reports/people-oslo-litteratur-nationaltheatret-batch-9-validation.md`

## Target place

- `placeId`: `nationaltheatret`
- source file: `data/places/litteratur/oslo/places_litteratur/nationaltheatret.json`
- category: `litteratur`
- year: `1899`
- repo description: hovedscene for norsk dramatikk, nært knyttet til Ibsen og Bjørnson.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `gustav_berg_jaeger` | Gustav Berg-Jæger | `nationaltheatret` | Teatersjef 1941–1945 during the occupation period |
| `knut_hergel` | Knut Hergel | `nationaltheatret` | Teatersjef 1946–1960; important postwar director/institution builder |
| `carl_fredrik_engelstad` | Carl Fredrik Engelstad | `nationaltheatret` | Teatersjef 1960–1961 |
| `erik_kristen_johanssen` | Erik Kristen-Johanssen | `nationaltheatret` | Teatersjef 1961–1967 |
| `arild_brinchmann` | Arild Brinchmann | `nationaltheatret` | Teatersjef 1967–1978; reorganization/democratization line |

## Research gate

Reference basis: Store norske leksikon's Nationaltheatret article lists the theatre-manager sequence and years, including Gustav Berg-Jæger 1941–1945, Knut Hergel 1946–1960, Carl Fredrik Engelstad 1960–1961, Erik Kristen-Johanssen 1961–1967 and Arild Brinchmann 1967–1978. The same source describes the 1941 conflict with the occupying power and the audience boycott, Hergel's postwar directing contribution, and Brinchmann's reorganization/democratization of the institution.

Decision: safe. All five have direct teatersjef relationship with the target place.

## Repo gate

Repo search was performed before this batch for these candidate IDs:

- `gustav_berg_jaeger`
- `knut_hergel`
- `carl_fredrik_engelstad`
- `erik_kristen_johanssen`
- `arild_brinchmann`

No existing people ID hits were returned for the exact candidate IDs in the active people data.

Existing leaders already represented in earlier Nationaltheatret batches and intentionally not duplicated here:

- `bjorn_bjornson`
- `halfdan_christensen`
- `toralv_maurstad`

## Validation required before merge

```bash
node -e "for (const f of ['data/people/litteratur/oslo/people_litteratur_oslo_nationaltheatret_batch9.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
