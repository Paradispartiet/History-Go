# Holmenkollen People of Place — batch 13 validation

Date: 2026-07-18
Branch: `data/people-holmenkollen-batch13-20260718`

## Records

Expected new canonical IDs:

- `vladimir_podzimek`
- `toni_nieminen`
- `andreas_goldberger`
- `kazuyoshi_funaki`
- `primoz_peterka`

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

- Vladimir Podzimek: 1984.
- Toni Nieminen: 1992.
- Andreas Goldberger: 1995.
- Kazuyoshi Funaki: 1997.
- Primož Peterka: 1998.

## Canonical audit

Fresh searches for IDs, full names and relevant Podzimek and Primož/Primoz Peterka spelling variants returned no existing canonical records before creation.

Erik Johnsen was excluded after his name returned existing repository hits; no record for him is created in this batch.

## Expected final diff

After manifest registration and removal of the temporary helper workflow:

- 5 new one-person JSON files
- `data/people/manifest.json`: exactly 5 additions, 0 deletions
- 1 research report
- 1 validation report
- no place, image, UI, runtime, or permanent workflow changes

Final data checks must pass for both People data and Places data before merge.
