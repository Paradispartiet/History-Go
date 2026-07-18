# Holmenkollen People of Place — batch 14 validation

Date: 2026-07-18
Branch: `data/people-holmenkollen-batch14-20260718`

## Records

Expected new canonical IDs:

- `sven_hannawald`
- `roar_ljokelsoy`
- `daniel_andre_tande`
- `robert_johansson`
- `marius_lindvik`

## Structure checks

Each new file:

- is a one-element JSON array
- uses `category: "sport"`
- uses `placeId: "holmenkollen_nasjonalanlegg"`
- includes `holmenkollen_nasjonalanlegg` in `places`
- uses `visual.designCode: "person_skier_miniature"`
- keeps `image` and `cardImage` empty

## Place gate

Every selected person has direct documented individual Holmenkollen ski jumping victories:

- Sven Hannawald: 2000.
- Roar Ljøkelsøy: 2004.
- Daniel-André Tande: 2018 and 2022.
- Robert Johansson: 2019.
- Marius Lindvik: 2022.

## Canonical audit

Fresh searches for IDs, full names and relevant spelling variants returned no existing canonical records before creation.

## Expected final diff

After manifest registration and removal of the temporary helper workflow:

- 5 new one-person JSON files
- `data/people/manifest.json`: exactly 5 additions, 0 deletions
- 1 research report
- 1 validation report
- no place, image, UI, runtime, or permanent workflow changes

Final data checks must pass for both People data and Places data before merge.
