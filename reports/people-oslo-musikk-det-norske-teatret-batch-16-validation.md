# People Oslo musikk — Det Norske Teatret batch 16 validation

Generated: 2026-07-09

## Scope

Adds five researched markante Det Norske Teatret actor anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This PR is intentionally a draft stacked on the batch 15 branch because PR #1875 is still a draft and earlier PRs in the stack must be merged into `main` first.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch16.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-16-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `pal_sverre_hagen` | Pål Sverre Hagen | `det_norske_teatret` | DNT stage debut, ensemble membership and Hedda-winning DNT roles |
| `renate_reinsve` | Renate Reinsve | `det_norske_teatret` | Contracted to DNT from 2016; later international film breakthrough |
| `ellen_dorrit_petersen` | Ellen Dorrit Petersen | `det_norske_teatret` | Worked at DNT after Rogaland Teater; Amanda/Kanon/Gullruten profile |
| `andrea_braein_hovig` | Andrea Bræin Hovig | `det_norske_teatret` | Stage debut and several early DNT roles; actor/singer profile |
| `silje_storstein` | Silje Storstein | `det_norske_teatret` | Multiple DNT roles after theatre school; known from `Sofies verden` |

## Research gate

### Pål Sverre Hagen

Reference basis: Pål Sverre Hagen is documented with stage debut in `Bikubesong` at Det Norske Teatret in 2003, repertory company membership from 2006, and Hedda-winning DNT-related roles in 2007.

Decision: safe. Very strong DNT scene relationship and markant national/international actor profile.

### Renate Reinsve

Reference basis: Renate Reinsve is documented as contracted to Det Norske Teatret from 2016. She later became internationally known through `Verdens verste menneske`, Cannes recognition and major film roles.

Decision: safe. Direct DNT employment/contract relationship and very markant modern actor profile.

### Ellen Dorrit Petersen

Reference basis: Ellen Dorrit Petersen is documented as working at Det Norske Teatret after Rogaland Teater and as a major film/TV actor with Amanda, Kanon and Gullruten recognition.

Decision: safe. Direct DNT relation plus markant modern actor profile.

### Andrea Bræin Hovig

Reference basis: Andrea Bræin Hovig is documented as making her theatre debut at Det Norske Teatret in `Kranes konditori` in 1995 and later having several roles at DNT, including `Ifigenia i Aulis`, `Skolen for kvinner`, `Sommardag` and `Romeo og Julie`.

Decision: safe. Direct stage-debut and repeated DNT role relationship, plus actor/singer profile.

### Silje Storstein

Reference basis: Silje Storstein is documented with multiple Det Norske Teatret roles after theatre school, including `Før solnedgang`, `Peter Pan`, `Vi har så korte armar`, `Tida og rommet`, `Gjøglaren`, `Evita`, `Bjørnen` and `Woyzeck`.

Decision: safe. Direct repeated DNT role relationship and markant enough due to `Sofies verden` plus later DNT repertoire.

## Rejected / held back in this research pass

- `are_kalvo`: strong DNT writer/satirist connection, but not primarily a skuespiller anchor for this pass.
- `marit_moum_aune`: strong DNT director connection, but not primarily a skuespiller anchor for this pass.
- `liv_bernhoft_osa`: DNT guest relation found, but weaker than the five selected direct actor anchors.
- `gina_bernhoft_gorvell`: DNT debut found, but held back as a newer/emerging profile rather than a fully markant national anchor.
- `kyrre_hellum`, `kaia_varjord`, `gjertrud_jynge`, `mariann_hole`: current/recent DNT roles found, but the quick source pass did not produce a stronger markant+direct basis than the five selected.

## Repo gate

Repo/PR searches were performed before this batch proposal for these candidate IDs:

- `pal_sverre_hagen`
- `renate_reinsve`
- `ellen_dorrit_petersen`
- `andrea_braein_hovig`
- `silje_storstein`

No existing people ID hits were returned for the exact candidate IDs or batch16 file.

## Stack note

This PR is based on:

```text
data/det-norske-teatret-people-batch-15-20260708
```

because PR #1875 is still a draft. Do not merge this draft PR before the earlier stack is merged in the correct order. Once the stack is merged, retarget this PR to `main` or recreate it cleanly from updated `main` if GitHub shows inherited diff.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch16.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run after PR #1875 is included:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch16.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
