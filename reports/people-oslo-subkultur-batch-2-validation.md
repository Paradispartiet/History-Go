# People Oslo subkultur batch 2 validation

## Scope

- Target file: `data/people/subkultur/oslo/people_subkultur_oslo.json`.
- New collective scene-/miljøankre appended: `bla_miljoet`, `brenneriveien_ingens_gate_miljoet`, `xray_ungdomskulturhus_miljoet`.
- Existing anchor repaired: `blitz_miljoet`.
- New places created: 0.
- Place files changed: 0.
- `data/places/places_index.json` changed: no.
- `data/people/manifest.json` changed: no.

## Preflight files read

Read before update:

- `data/people/manifest.json`
- `data/places/manifest.json`
- `data/places/places_index.json`
- `data/people/subkultur/oslo/people_subkultur_oslo.json`
- `data/places/subkultur/oslo/places_subkultur.json`
- `reports/people-of-places-status.md`
- `reports/people-place-coverage.md`

## Candidate IDs checked repo-wide

Checked all manifest-listed people files from `data/people/manifest.json` before append.

| candidate ID | pre-existing manifest-listed people hit | action |
| --- | ---: | --- |
| `bla_miljoet` | 0 | appended |
| `brenneriveien_ingens_gate_miljoet` | 0 | appended |
| `xray_ungdomskulturhus_miljoet` | 0 | appended |

No `skipped_existing_anchor` cases.

## Existing Blitz anchor verification

- Existing `blitz_miljoet` was found in `data/people/subkultur/oslo/people_subkultur_oslo.json`.
- No `blitzhuset_miljoet` was created.
- `blitz_miljoet` was updated in place because the existing anchor is semantically the same collective Blitz milieu.
- `placeId` was changed to `blitzhuset`.
- `places` now contains `blitzhuset`, `youngstorget`, and `torggata`.
- No `missing_existing_blitz_anchor` case.

## PlaceIds verified in `places_index.json`

| placeId | status | use |
| --- | --- | --- |
| `bla` | found | primary for `bla_miljoet`; secondary for `brenneriveien_ingens_gate_miljoet` |
| `brenneriveien_ingens_gate` | found | primary for `brenneriveien_ingens_gate_miljoet`; secondary for `bla_miljoet` and `xray_ungdomskulturhus_miljoet` |
| `xray_ungdomskulturhus` | found | primary for `xray_ungdomskulturhus_miljoet` |
| `blitzhuset` | found | primary for repaired `blitz_miljoet` |
| `youngstorget` | found | secondary for repaired `blitz_miljoet` |
| `torggata` | found | secondary for repaired `blitz_miljoet` |

No `skipped_missing_place` cases. No secondary placeIds were removed because all requested secondary IDs were valid.

## Research-gate

### `bla_miljoet`

Repoet definerer Blå as a concrete concert scene by Akerselva with graffiti, club culture and underground pulse. Repoet also describes Blå as central to Oslo underground culture since the late 1990s, with club culture, hiphop, electronica, jazz, skate audiences and street art overlapping around the venue. This makes `bla_miljoet` a safe collective scene-/miljøanker for placeId `bla`.

### `brenneriveien_ingens_gate_miljoet`

Repoet definerer Brenneriveien / Ingens gate as a street and backroom milieu by Akerselva where graffiti, street art, Sunday market activity, clubs and alternative cultural venues overlap. Repoet describes it as an area point rather than one building, with walls, alleys, markets, concerts, nightlife and informal visual expression working together. This makes `brenneriveien_ingens_gate_miljoet` a safe area-/miljøanker for placeId `brenneriveien_ingens_gate`.

### `xray_ungdomskulturhus_miljoet`

Repoet definerer X-Ray Ungdomskulturhus as a self-governed, drug-free youth culture house at Grünerløkka with dance, music studio, DJ courses, breaking, podcast, theatre workshop and youth board. Repoet describes X-Ray as a clear site for hiphop, youth culture, participation and learning. The place entry already includes an official Oslo kommune source as `coordSourceUrl`. This makes `xray_ungdomskulturhus_miljoet` a safe youth-culture-/miljøanker for placeId `xray_ungdomskulturhus`.

### `blitz_miljoet` repair

Repoet already had the people anchor `blitz_miljoet`. Repoet also has the place `blitzhuset`, defined as a self-governed youth and activity house in Pilestredet tied to punk, activism, counterculture, café activity, concerts and independent milieus. The existing `blitz_miljoet` is semantically the same milieu, so duplicating it as `blitzhuset_miljoet` would create a duplicate anchor. The correct repair in this batch was to make `blitzhuset` the primary placeId and keep `youngstorget` and `torggata` as secondary centre/public-activism connections because both IDs are valid.

## Why these are collective scene-/miljøankre, not named individuals

- All new entries describe collective venues, publics, practices, scenes, infrastructure and area use.
- No named individual people were added.
- The entries are place-specific and tied to explicit repo-defined places.
- No loose generic Oslo-culture associations were added.

## Post-batch audit

Commands run after update:

```sh
node -e "for (const f of ['data/people/subkultur/oslo/people_subkultur_oslo.json','data/people/manifest.json','data/places/places_index.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
node - <<'NODE'
const fs=require('fs'), path=require('path');
const manifest=JSON.parse(fs.readFileSync('data/people/manifest.json','utf8')).files;
const seen=new Map(), dups=[];
for (const rel of manifest) {
 const arr=JSON.parse(fs.readFileSync(path.join('data',rel),'utf8'));
 for (const person of arr) {
  if (seen.has(person.id)) dups.push({id:person.id, files:[seen.get(person.id), rel]});
  else seen.set(person.id, rel);
 }
}
console.log(JSON.stringify({duplicatePeopleIds:dups.length, duplicates:dups}, null, 2));
NODE
npm run build:tools
node dist/tools/audit-people-invalid-place-refs.mjs
node dist/tools/audit-people-of-places-status.mjs
node dist/tools/audit-people-place-coverage.mjs
```

Audit results:

| metric | result |
| --- | ---: |
| new places | 0 |
| new people / collective anchors | 3 |
| repaired existing people anchor | 1 |
| duplicatePeopleIds | 0 |
| invalidPlaceRefs | 0 |
| peopleWithoutValidPrimaryAnchor | 0 |
| peopleWithEmptyPlacesArray | 0 |
| flatPeopleFiles | 0 |
| geographicPeopleFiles | 28 |
| totalPeople | 499 |

Generated/updated audit reports:

- `reports/people-invalid-place-refs.json`
- `reports/people-invalid-place-refs.md`
- `reports/people-of-places-status.json`
- `reports/people-of-places-status.md`
- `reports/people-place-coverage.json`
- `reports/people-place-coverage.md`
