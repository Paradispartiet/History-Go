# Oslo subkultur named people — batch 5 validation

Dato: 2026-07-18

## Added entries

- `stein_lillevolden` → `blitzhuset`
- `bror_wyller` → `torggata_blad`
- `hermann_stene` → `oslo_skatehall`

## Connector-side checks

- Repo search returned no existing canonical IDs for the three new entries before insertion.
- All three target place IDs are already represented in the active Oslo subkultur place data/index.
- Existing people schema in `people_subkultur_oslo_named_batch4.json` was preserved.
- No manifest update was needed because the modified people file is already listed in `data/people/manifest.json`.

## Expected repository validation

Run:

```bash
bash scripts/check-people.sh
```

Expected gates:

- duplicatePeopleIds = 0
- invalidPlaceRefs = 0
- peopleWithoutValidPrimaryAnchor = 0
- peopleWithEmptyPlacesArray = 0

## Changed files

- `data/people/subkultur/oslo/people_subkultur_oslo_named_batch4.json`
- `reports/people-oslo-subkultur-named-batch5-research.md`
- `reports/people-oslo-subkultur-named-batch5-validation.md`

## Not changed

- No place data.
- No people manifest.
- No places manifest/index.
- No UI/runtime.
- No quiz.
