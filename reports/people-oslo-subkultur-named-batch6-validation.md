# Validation — Oslo subkultur named people batch 6

Dato: 2026-07-18

## Added

- `paul_brady` → `torggata_blad`
- `hege_vadstein` → `torggata_blad`
- `anne_rita_andal` → `torggata_blad`
- `christian_engfelt` → `oslo_skatehall`

## Expected invariants

- all four IDs are unique
- all four `placeId` values exist
- all four `places` arrays contain their primary `placeId`
- all four use `category: "subkultur"`
- no manifest change is required because the modified people file is already manifest-listed

## Validation command

```bash
bash scripts/check-people.sh
```

Expected:

- duplicatePeopleIds = 0
- invalidPlaceRefs = 0
- peopleWithoutValidPrimaryAnchor = 0
- peopleWithEmptyPlacesArray = 0

## Not changed

- no places
- no manifests
- no place index
- no UI/runtime
- no quiz
