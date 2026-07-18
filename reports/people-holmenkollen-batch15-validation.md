# Holmenkollen People of Place — batch 15 validation

Date: 2026-07-18
Branch: `data/people-holmenkollen-batch15-20260718`

## Records

Expected new canonical IDs:

- `piotr_zyla`
- `johann_andre_forfang`
- `ryoyu_kobayashi`
- `gregor_deschwanden`
- `tomofumi_naito`

## Structure checks

Each new file:

- is a one-element JSON array
- uses `category: "sport"`
- uses `placeId: "holmenkollen_nasjonalanlegg"`
- includes `holmenkollen_nasjonalanlegg` in `places`
- uses `visual.designCode: "person_skier_miniature"`
- keeps `image` and `cardImage` empty

## Place gate

Every selected person has a direct documented individual Holmenkollen ski jumping victory:

- Piotr Żyła: shared winner in 2013.
- Johann André Forfang: 2024.
- Ryoyu Kobayashi: 2025.
- Gregor Deschwanden: Saturday winner in 2026.
- Tomofumi Naito: Sunday winner in 2026.

## Canonical audit

Fresh post-batch-14 `main` searches for IDs, full names and relevant diacritic/transliteration variants returned no existing canonical records before creation.

## Expected final diff

After manifest registration and removal of the temporary helper workflow:

- 5 new one-person JSON files
- `data/people/manifest.json`: exactly 5 additions, 0 deletions
- 1 research report
- 1 validation report
- no place, image, UI, runtime, or permanent workflow changes

Final data checks must pass for both People data and Places data before merge.
