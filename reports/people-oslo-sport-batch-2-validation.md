# People expansion — Oslo sport batch 2 validation

Generated: 2026-07-07

## Candidate IDs checked repo-wide

All `data/people/manifest.json`-listed people files were checked before append.

| Candidate ID | Result |
|---|---|
| `morten_berre` | not found before append; added |
| `petter_thoresen` | not found before append; added |
| `mathias_trygg` | not found before append; added |
| `einar_bruno_larsen` | not found before append; added |

`skipped_existing_person`: none.

## placeIds verified

All requested anchors were verified in `data/places/places_index.json` before append.

| placeId | Repo place basis | Result |
|---|---|---|
| `nordre_aasen_idrettspark` | Nordre Åsen idrettspark is described as Skeids hjemmeområde. | verified |
| `manglerudhallen` | Manglerudhallen is described as Manglerud Stars ishockeyhjem. | verified |
| `jordal_amfi` | Jordal Amfi is described as Oslos viktigste ishockeyarena and Vålerenga Ishockey anchor. | verified |

`skipped_missing_place`: none.

## Research-gate per person

| Person | Verification basis | Result |
|---|---|---|
| Morten Berre | Public football references document that Berre started his senior career at Skeid, returned to Skeid, and later served as Skeid assistant manager. Repo place data defines Nordre Åsen idrettspark as Skeids hjemmeområde. Sources consulted: Wikipedia/Morten Berre (https://en.wikipedia.org/wiki/Morten_Berre), FootballDatabase/Morten Berre (https://www.footballdatabase.eu/en/player/details/6474-morten-berre), Skeid.no interview page (https://www.skeid.no/nyheter/morten-berre--lykkes-med-mye). | verified |
| Petter Thoresen | Public hockey references document Manglerud Star and Vålerenga in Thoresen's playing/coaching career, including SNL (https://snl.no/Petter_Thoresen_-_ishockeytrener) and Olympedia (https://www.olympedia.org/athletes/98251). Repo place data defines Manglerudhallen as Manglerud Stars ishockeyhjem. | verified |
| Mathias Trygg | Public hockey references document that Trygg started his senior career with Manglerud Star and later played for Vålerenga; Elite Prospects also lists Manglerud Star as youth team (https://www.eliteprospects.com/player/4635/mathias-trygg); Wikipedia/Mathias Trygg documents senior start with Manglerud Star (https://en.wikipedia.org/wiki/Mathias_Trygg). Repo place data defines Manglerudhallen as Manglerud Stars ishockeyhjem. | verified |
| Einar Bruno Larsen | Public references document Larsen's Vålerenga ice-hockey career and Gullpucken/player-of-the-year recognition in 1963. Repo place data defines Jordal Amfi as Vålerenga Ishockey/Oslos key hockey anchor. Sources consulted: Vålerenga Fotball obituary (https://www.vif-fotball.no/nyheter/einar-bruno-larsen-har-gatt-bort), Olympedia (https://www.olympedia.org/athletes/89435), Wikipedia/Einar Bruno Larsen (https://en.wikipedia.org/wiki/Einar_Bruno_Larsen). | verified |

`skipped_unverified_link`: none.

## New people added

- `morten_berre` → `nordre_aasen_idrettspark`
- `petter_thoresen` → `manglerudhallen` (also linked to `jordal_amfi`)
- `mathias_trygg` → `manglerudhallen` (also linked to `jordal_amfi`)
- `einar_bruno_larsen` → `jordal_amfi` (also linked to `intility_arena`)

Explicitly not added in this batch: Tom Lund, Jan Ivar Jakobsen, Vidar Davidsen.

## Audit after batch

| Check | Result |
|---|---:|
| New places | 0 |
| New people | 4 |
| totalPeople | 492 |
| uniquePeopleIds | 492 |
| duplicatePeopleIds | 0 |
| invalidPlaceRefs | 0 |
| peopleWithoutValidPrimaryAnchor | 0 |
| peopleWithEmptyPlacesArray | 0 |
| flatPeopleFiles | 0 |
| geographicPeopleFiles | 28 |

## Changed files expected from batch

- `data/people/sport/oslo/people_sport_oslo.json`
- `reports/people-invalid-place-refs.json`
- `reports/people-invalid-place-refs.md`
- `reports/people-of-places-status.json`
- `reports/people-of-places-status.md`
- `reports/people-place-coverage.json`
- `reports/people-place-coverage.md`
- `reports/people-oslo-sport-batch-2-validation.md`
