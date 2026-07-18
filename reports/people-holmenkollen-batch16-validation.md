# People of Places — Holmenkollen batch 16 validation

## Expected final scope

- 5 new one-person JSON files under `data/people/sport/oslo/holmenkollen_nasjonalanlegg/`
- 5 new entries in `data/people/manifest.json`
- this validation report
- the batch research report
- no place, image, UI, runtime, or unrelated data changes

Expected final net diff: exactly 8 files.

## Person records

Expected ids:
- `daniela_iraschko_stolz`
- `sarah_hendrickson`
- `yuki_ito`
- `silje_opseth`
- `ema_klinec`

For each record:
- JSON is an array containing one person object
- `placeId` is `holmenkollen_nasjonalanlegg`
- `places` contains `holmenkollen_nasjonalanlegg`
- `category` is `sport`
- `visual.designCode` is `person_skier_miniature`
- image fields remain empty

## Duplicate gate

A fresh canonical search was rerun against current `main` after parallel People changes landed. No existing canonical person record was found for the five selected ids or names.

## Manifest gate

The final branch must register exactly these five paths and retain all existing manifest entries. The expected manifest patch is +5 / -0.

## Final merge gates

Before merge:
- temporary manifest workflow removed
- final net diff exactly 8 files
- manifest +5 / -0
- branch 0 commits behind current `main`
- People data CI passed
- Places data CI passed
- PR mergeable
