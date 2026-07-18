# People of Places — Holmenkollen batch 19 validation

## Expected final scope

- 5 new one-person JSON files under `data/people/sport/oslo/holmenkollen_nasjonalanlegg/`
- 5 new entries in `data/people/manifest.json`
- this validation report
- the batch research report
- no place, image, UI, runtime, or unrelated data changes

Expected final net diff: exactly 8 files.

## Person records

Expected ids:
- `kalle_heikkinen`
- `martin_matsbo`
- `john_westberg`
- `trygve_brodahl`
- `olav_okern`

For each record:
- JSON is an array containing one person object
- `placeId` is `holmenkollen_nasjonalanlegg`
- `places` contains `holmenkollen_nasjonalanlegg`
- `category` is `sport`
- `visual.designCode` is `person_skier_miniature`
- image fields remain empty

## Duplicate gate

Fresh canonical repository searches were run against post-batch-18 current `main`. No existing canonical person record was found for the five selected ids, names, or relevant spelling variants.

## Manifest gate

The final branch must register exactly these five paths and retain all existing manifest entries. Expected manifest patch: +5 / -0.

## Final merge gates

Before merge:
- temporary clean-rebase workflow absent from final branch
- final net diff exactly 8 files
- manifest +5 / -0
- branch rebuilt on current `main` before final CI
- People data CI passed on the final head
- Places data CI passed on the final head
- fresh comparison against merge-time `main` still shows only the intended 8-file net diff
- PR mergeable

This validation-report update is the ordinary post-rebase commit used to trigger final CI without reopening the PR.
