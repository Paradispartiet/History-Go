# People of Places — Akershus festning batch 1 validation

## Intended scope

Stacked base: `agent/eidsvollsbygningen-people-batch9`

Batch 1 is intended to change only:

- `data/people/manifest.json`
- five new canonical person files under `data/people/historie/oslo/akershus_festning/`
- `reports/people-akershus-festning-batch1-research.md`
- `reports/people-akershus-festning-batch1-validation.md`

No place data, place indexes, quiz data, Civication data, or unrelated people records are intentionally changed.

## Canonical audit

No canonical person records were found for:

- `hannibal_sehested`
- `ulrik_frederik_gyldenlove`
- `karl_xii`
- `jorgen_christopher_von_klenow`
- `knut_alvsson`

Name-variant searches were also performed where relevant, including `Gyldenløve`, `Carl XII`, `Klenow`, and `Knut Alvssøn`.

Existing canonical records were found for Håkon V Magnusson, Christian IV, Vidkun Quisling, Einar Gerhardsen and Trygve Bratteli, so none of these are recreated.

## Place gate

Every new record has a direct Akershus festning relation:

- Hannibal Sehested: stattholder and høvedsmann at Akershus; directly tied to the fortress's 17th-century modernization
- Ulrik Frederik Gyldenløve: documented in activity at Akershus as stattholder and stiftamtmann
- Karl XII: personally led the army that besieged the fortress in 1716
- Jørgen Christopher von Klenow: commandant who led the defence during the 1716 siege
- Knut Alvsson: captured and controlled Akershus in the 1502 rebellion

Loose memorial associations and short transit stays were rejected.

## Static structure checks

Each new canonical record has:

- a unique planned canonical ID
- `visual.designCode: "person_politician_miniature"`
- `category: "historie"`
- `placeId: "akershus_festning"`
- a non-empty `places` array containing `akershus_festning`
- a historically relevant `year`
- `image` and `cardImage` fields

## Repository-local validation

The connected GitHub environment does not provide a runnable repository checkout. The following commands are therefore not reported as having passed locally:

```bash
mkdir -p reports/people-akershus-festning-batch1-runtime
npm run audit:people-of-places \
  | tee reports/people-akershus-festning-batch1-runtime/audit-people-of-places.txt
npm run tools:check \
  | tee reports/people-akershus-festning-batch1-runtime/tools-check.txt
```

Expected People of Places audit invariants remain:

- `duplicatePeopleIds: 0`
- `invalidPlaceRefs: 0`
- `peopleWithoutValidPrimaryAnchor: 0`
- `peopleWithEmptyPlacesArray: 0`

## Structural validation

Before opening the pull request, a direct comparison against `agent/eidsvollsbygningen-people-batch9` must show exactly eight changed files:

- one manifest update adding five new file paths
- five new canonical person files
- the batch-1 research report
- this validation report

Any unrelated file in that comparison is out of scope and must be removed before the PR is opened.
