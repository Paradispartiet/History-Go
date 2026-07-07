# People invalid place-ref cleanup

Generated: 2026-07-07T06:35:43Z

## Invalid placeRef before cleanup

- Source file: `data/people/by/oslo/people_by_oslo.json`
- Person id: `hagbarth_schytte_berg`
- Person name: Hagbarth Schytte-Berg
- Invalid field: `places[1]`
- Invalid placeId: `fagerborg_kirke`
- Primary `placeId`: `stensparken` (valid)
- Original `places[]`: `stensparken`, `fagerborg_kirke`
- Nearest safe existing placeId: `stensparken`

## Verification before fix

- `fagerborg_kirke` was not present as a top-level place in `data/places/places_index.json`.
- Manifest-listed place data only contains `fagerborg_kirke` as nested Stensparken content, not as a standalone manifest/index place.
- `stensparken` is an existing valid top-level place in `data/places/places_index.json` and is already the person's primary `placeId`.

## Chosen fix

Removed the invalid secondary `places[]` reference `fagerborg_kirke` and kept the valid primary anchor `stensparken`.

## Why this is safe

This matches fix-policy D: the invalid reference existed only as an extra secondary `places[]` ref while the primary `placeId` was already valid. No new people or places were added, no place source files were changed, and the Stensparken/Fagerborg text was left intact.

## Audit after cleanup

- `duplicatePeopleIds`: 0
- `invalidPlaceRefs`: 0
- `peopleWithoutValidPrimaryAnchor`: 0
- `peopleWithEmptyPlacesArray`: 0
- `flatPeopleFiles`: 0
- `geographicPeopleFiles`: 28
