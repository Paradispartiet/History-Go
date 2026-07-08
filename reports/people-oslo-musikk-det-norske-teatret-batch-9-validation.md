# People Oslo musikk — Det Norske Teatret batch 9 validation

Generated: 2026-07-08

## Scope

Adds five researched institutional/repertoire anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This PR is intentionally a draft stacked on the clean batch 8 branch because PR #1828 is still open and must be merged into `main` first.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch9.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-9-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `anton_heiberg` | Anton Heiberg | `det_norske_teatret` | Early theatre-director period 1916–1917 with Amund Rydland |
| `ole_barman` | Ole Barman | `det_norske_teatret` | Theatre director 1951–1953 |
| `nils_sletbak` | Nils Sletbak | `det_norske_teatret` | Theatre director 1953–1961 |
| `cally_monrad` | Cally Monrad | `det_norske_teatret` | Wartime/nazification-era theatre-director entry, explicitly problematised |
| `arne_garborg` | Arne Garborg | `det_norske_teatret` | Nynorsk theatre idea/repertoire anchor, not a generic literature association |

## Research gate

### Anton Heiberg

Reference basis: Det Norske Teatret's theatre-director list ties Anton Heiberg directly to the institution in 1916–1917, together with Amund Rydland.

Decision: safe. Direct early leadership relationship with the target place.

### Ole Barman

Reference basis: Det Norske Teatret's theatre-director list ties Ole Barman directly to the institution as theatre director from 1951 to 1953.

Decision: safe. Direct leadership relationship with the target place.

### Nils Sletbak

Reference basis: Det Norske Teatret's theatre-director list ties Nils Sletbak directly to the institution as theatre director from 1953 to 1961.

Decision: safe. Direct leadership relationship with the target place.

### Cally Monrad

Reference basis: Det Norske Teatret's theatre-director list ties Cally Monrad directly to the institution during 1942–1945. This was the wartime nazification period after Knut Hergel had to flee to Sweden. The entry is intentionally framed as a problematising war-history anchor, not a neutral honour entry.

Decision: safe only with explicit historical framing. Kept because it documents the institution's occupation history.

### Arne Garborg

Reference basis: Det Norske Teatret's institutional history connects the theatre's foundation and early identity to Nynorsk theatre, the målsak and Garborg's idea of a Nynorsk stage. Early Det Norske Teatret repertoire also included Garborg material.

Decision: safe. Direct idea/repertoire/foundation relationship, not a generic literature association.

## Repo gate

Repo search was performed before this batch proposal for these candidate IDs:

- `anton_heiberg`
- `ole_barman`
- `nils_sletbak`
- `cally_monrad`
- `arne_garborg`

No existing people ID hits were returned for the exact candidate IDs.

## Stack note

This PR is based on:

```text
data/det-norske-teatret-people-batch-8-clean-20260708
```

because PR #1828 is still open. Do not merge this draft PR before #1828 is merged into `main`. Once #1828 is merged, retarget this PR to `main` or recreate it cleanly from updated `main` if GitHub shows inherited diff.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch9.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run after PR #1828 is included:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch9.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
