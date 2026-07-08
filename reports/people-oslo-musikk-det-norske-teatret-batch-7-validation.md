# People Oslo musikk — Det Norske Teatret batch 7 validation

Generated: 2026-07-08

## Scope

Adds five researched modern ensemble-/music-theatre anchors for the existing Oslo music/scenekunst place `det_norske_teatret`.

This PR is intentionally stacked on the batch 6 branch because PR #1814 is still open.

## Changed files

- `data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch7.json`
- `data/people/manifest.json`
- `reports/people-oslo-musikk-det-norske-teatret-batch-7-validation.md`

## Target place

- `placeId`: `det_norske_teatret`
- source file: `data/places/musikk/oslo/places_musikk.json`
- category: `musikk`
- repo description: teater- og musikkscene i Oslo sentrum, sentral for norsk scenekunst og musikalske produksjoner.
- repo quiz profile: nasjonal nynorskinstitusjon i sentrum; blanding av teater, musikkteater og scenekunst; kobling mellom scenekunst og språkpolitikk.

## Added people

| id | name | placeId | Reason |
|---|---|---|---|
| `heidi_gjermundsen_broch` | Heidi Gjermundsen Broch | `det_norske_teatret` | Musical theatre roles at DNT, including `Piaf` and `Next to Normal` |
| `frank_kjosas` | Frank Kjosås | `det_norske_teatret` | Cast in `Hair` at DNT and permanently employed there afterwards |
| `charlotte_frogner` | Charlotte Frogner | `det_norske_teatret` | Employed at DNT since 2004; multiple drama and musical roles |
| `morten_svartveit` | Morten Svartveit | `det_norske_teatret` | Played at DNT and returned to the theatre in 2013 |
| `bjorn_floberg` | Bjørn Floberg | `det_norske_teatret` | Joined DNT in 1972 and had a series of notable stage roles there |

## Research gate

### Heidi Gjermundsen Broch

Reference basis: Heidi Gjermundsen Broch is documented as an actor, singer and musical artist, with DNT-linked theatre work including `Piaf`. `Next to Normal` opened in Europe at Det Norske Teatret in Oslo in 2010, with Gjermundsen Broch as Diana, and she received the Hedda Award for that role.

Decision: safe. Direct music-theatre relationship with the target place.

### Frank Kjosås

Reference basis: Frank Kjosås was cast as Woof in `Hair` by Det Norske Teatret while still at the National Academy of Theatre and has been permanently employed by the theatre since. Later DNT roles include `Hamlet`, `Trost i taklampa`, `Sweeney Todd` and `The Book of Mormon`.

Decision: safe. Direct DNT employment and modern music-theatre/ensemble relationship.

### Charlotte Frogner

Reference basis: Charlotte Frogner is documented as employed by Det Norske Teatret since 2004, with listed DNT productions including `Piaf`, `Jesus Christ Superstar`, `Next to Normal` and others.

Decision: safe. Direct DNT employment and both drama/music-theatre relevance.

### Morten Svartveit

Reference basis: Morten Svartveit is documented as having played at Det Norske Teatret, including productions such as `Tolvskillingsoperaen` and `Woyzeck`, and returned to the theatre in 2013.

Decision: safe. Direct DNT ensemble/repertoire relationship.

### Bjørn Floberg

Reference basis: Bjørn Floberg joined Det Norske Teatret in 1972 and appeared in productions such as `Vaktmesteren`, `Lang dags ferd mot natt`, `Mutter Courage`, `Volpone` and `Frøken Julie`.

Decision: safe. Direct DNT ensemble and repertoire relationship.

## Rejected / skipped in this batch

- `mariann_hole`: skipped because quick source pass did not produce a strong direct Det Norske Teatret connection.
- `hildegun_riise`: skipped because quick source pass did not produce a strong direct Det Norske Teatret connection.
- `mimmi_tamba`: relevant to DNT productions, but held for later/possible music batch because the quick source pass was less clean than the five selected anchors.

## Repo gate

Repo search was performed before this batch proposal for these candidate IDs:

- `heidi_gjermundsen_broch`
- `frank_kjosas`
- `charlotte_frogner`
- `morten_svartveit`
- `bjorn_floberg`

No existing people ID hits were returned for the exact candidate IDs.

## Stack note

This PR is based on:

```text
data/det-norske-teatret-people-batch-6-20260708
```

because PR #1814 is still open. Once #1814 is merged, this branch/PR should be retargeted to `main` or recreated cleanly from updated `main` if GitHub shows inherited diff.

## File structure decision

The batch creates a new people file:

```text
people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch7.json
```

and registers it in:

```text
data/people/manifest.json
```

This keeps Det Norske Teatret people work separated from the older large Oslo music people file.

## Validation required before merge

Run after PR #1814 is included:

```bash
node -e "for (const f of ['data/people/musikk/oslo/people_musikk_oslo_det_norske_teatret_batch7.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
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
