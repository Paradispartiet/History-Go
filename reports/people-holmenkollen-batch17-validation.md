# People of Places — Holmenkollen batch 17 validation

## Expected final scope

- 5 new one-person JSON files under `data/people/sport/oslo/holmenkollen_nasjonalanlegg/`
- 5 new entries in `data/people/manifest.json`
- this validation report
- the batch research report
- no place, image, UI, runtime, or unrelated data changes

Expected final net diff: exactly 8 files.

## Person records

Expected ids:
- `helena_olsson`
- `eirin_maria_kvandal`
- `nika_prevc`
- `gyda_westvold_hansen`
- `ida_marie_hagen`

For each record:
- JSON is an array containing one person object
- `placeId` is `holmenkollen_nasjonalanlegg`
- `places` contains `holmenkollen_nasjonalanlegg`
- `category` is `sport`
- `visual.designCode` is `person_skier_miniature`
- image fields remain empty

## Duplicate gate

Fresh canonical repository searches were run against post-batch-16 `main`. No existing canonical person record was found for the five selected ids or names.

## Manifest gate

The final branch must register exactly these five paths and retain all existing manifest entries. Expected manifest patch: +5 / -0.

## Final merge gates

Before merge:
- temporary clean-rebase workflow absent from final branch
- final net diff exactly 8 files
- manifest +5 / -0
- branch 0 commits behind current `main`
- People data CI passed
- Places data CI passed
- PR mergeable
