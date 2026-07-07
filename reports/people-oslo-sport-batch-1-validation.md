# People Oslo sport batch 1 validation

## Candidate ID check

Checked repo-wide across all manifest-listed people files before append:

- `espen_knutsen` — not found before append
- `roy_johansen` — not found before append
- `daniel_braaten` — not found before append
- `johannes_moesgaard` — not found before append
- `tom_lund` — not found before append

`skipped_existing_person`: none.

## Place ID check

Verified in `data/places/places_index.json` before append:

- `jordal_amfi`
- `nordre_aasen_idrettspark`
- `kfum_arena`
- `ullevaal_stadion`

`skipped_missing_place`: none.

## Person-place link verification

Accepted safe links:

- Espen Knutsen → Vålerenga/Jordal Amfi
- Roy Johansen → Vålerenga/Jordal Amfi
- Daniel Braaten → Skeid/Nordre Åsen
- Johannes Moesgaard → KFUM Oslo/KFUM Arena

Skipped unsafe link:

- `tom_lund` — skipped because verification did not support the requested Lyn/Ullevaal Stadion anchor. The checked references tied Tom Lund to Lillestrøm and the Norway national team, with Ullevaal as national-team venue, not to Lyn as requested.

## New people added

- `espen_knutsen`
- `roy_johansen`
- `daniel_braaten`
- `johannes_moesgaard`

New places created: 0.

## Audit after batch

From `reports/people-of-places-status.json` after the batch:

- `totalPeople`: 488
- `uniquePeopleIds`: 488
- `duplicatePeopleIds`: 0
- `invalidPlaceRefs`: 0
- `peopleWithoutValidPrimaryAnchor`: 0
- `peopleWithEmptyPlacesArray`: 0
- `flatPeopleFiles`: 0
- `geographicPeopleFiles`: 28

From `reports/people-invalid-place-refs.json` after the batch:

- `peopleWithInvalidRefs`: 0
- `invalidRefs`: 0
- `uniqueInvalidPlaceIds`: 0
- `peopleWithoutValidPlace`: 0

From `reports/people-place-coverage.json` after the batch:

- `people`: 488
- `peopleWithNoValidPlace`: 0
- `invalidPlaceRefs`: 0
