# People duplicate IDs cleanup

Generated: 2026-07-04

## Scope

Pure duplicatePeopleIds cleanup for people files listed in `data/people/manifest.json`. No new people, no new places, no place files, and no `data/places/places_index.json` changes.

## Duplicate IDs found before cleanup

| duplicate id | count | files | names | category | placeIds | assessment |
| --- | ---: | --- | --- | --- | --- | --- |
| `magnus_den_gode` | 2 | `data/people/historie/norge/people_historie_norge_for_1500_to_add_47.json`; `data/people/historie/oslo/people_historie_oslo.json` | Magnus den gode; Magnus den gode | historie; historie | `nidaros_erkebispegarden`; `middelalder_oslo` | same_person_cross_file |
| `harald_hardrade` | 2 | `data/people/historie/norge/people_historie_norge_for_1500_to_add_47.json`; `data/people/historie/oslo/people_historie_oslo.json` | Harald Hardråde; Harald Hardråde | historie; historie | `middelalder_oslo`; `middelalder_oslo` | same_person_cross_file |
| `sigurd_jorsalfare` | 2 | `data/people/historie/norge/people_historie_norge_for_1500_to_add_47.json`; `data/people/historie/oslo/people_historie_oslo.json` | Sigurd Jorsalfare; Sigurd Jorsalfare | historie; historie | `middelalder_oslo`; `middelalder_oslo` | same_person_cross_file |
| `haakon_haakonsson` | 2 | `data/people/historie/norge/people_historie_norge_for_1500_to_add_47.json`; `data/people/historie/oslo/people_historie_oslo.json` | Håkon Håkonsson; Håkon Håkonsson | historie; historie | `bergenhus_haakonshallen`; `oslo_domkirke` | same_person_cross_file |
| `magnus_lagabote` | 2 | `data/people/historie/norge/people_historie_norge_for_1500_to_add_47.json`; `data/people/historie/oslo/people_historie_oslo.json` | Magnus Lagabøte; Magnus Lagabøte | historie; historie | `bergenhus_haakonshallen`; `middelalder_oslo` | same_person_cross_file |
| `haakon_v_magnusson` | 2 | `data/people/historie/norge/people_historie_norge_for_1500_to_add_47.json`; `data/people/historie/oslo/people_historie_oslo.json` | Håkon V Magnusson; Håkon V Magnusson | historie; historie | `akerhus_slott`; `akerhus_slott` | exact_duplicate_same_person |
| `eufemia_av_rugen` | 2 | `data/people/historie/norge/people_historie_norge_for_1500_to_add_47.json`; `data/people/historie/oslo/people_historie_oslo.json` | Eufemia av Rügen; Eufemia av Rügen | historie; historie | `akerhus_slott`; `akerhus_slott` | exact_duplicate_same_person |

## Cleanup actions

| duplicate id | action | details |
| --- | --- | --- |
| `magnus_den_gode` | kept_canonical, merged_places, removed_duplicate | Kept the richer Oslo entry, merged `nidaros_erkebispegarden`, `kristkirken_bergenhus`, and `jelling_kongsgard` into `places`, removed the Norway duplicate. |
| `harald_hardrade` | kept_canonical, merged_places, removed_duplicate | Kept the richer Oslo entry, merged `stiklestad`, `elgeseter_kloster`, and `stamford_bridge_battlefield` into `places`, removed the Norway duplicate. |
| `sigurd_jorsalfare` | kept_canonical, merged_places, removed_duplicate | Kept the richer Oslo entry, merged `hallvardskirken_oslo` into `places`, removed the Norway duplicate. |
| `haakon_haakonsson` | kept_canonical, merged_places, removed_duplicate | Kept the richer Oslo entry, merged `bergenhus_haakonshallen`, `tonsberg_slottsfjell`, and `nidaros_erkebispegarden` into `places`, removed the Norway duplicate. |
| `magnus_lagabote` | kept_canonical, merged_places, removed_duplicate | Kept the richer Oslo entry, merged `bergenhus_haakonshallen`, `tonsberg_slottsfjell`, and `frostatinget_logtun` into `places`, removed the Norway duplicate. |
| `haakon_v_magnusson` | kept_canonical, removed_duplicate | Kept the richer Oslo entry; Norway duplicate had the same valid place refs and was removed. |
| `eufemia_av_rugen` | kept_canonical, removed_duplicate | Kept the richer Oslo entry; Norway duplicate had the same valid place refs and was removed. |

## Audit after cleanup

- `duplicatePeopleIds`: 0
- `peopleWithoutValidPrimaryAnchor`: 0
- `peopleWithEmptyPlacesArray`: 0
- `flatPeopleFiles`: 0
- `geographicPeopleFiles`: 28
- `invalidPlaceRefs`: 1 reported by the current audit script for pre-existing `fagerborg_kirke` in `data/people/by/oslo/people_by_oslo.json`; this cleanup did not touch that unrelated people file or any place file.
