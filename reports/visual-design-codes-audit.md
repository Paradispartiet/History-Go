# Visual design codes – audit

Generert: 2026-06-07T05:27:48.056Z

## Register

- designCodes totalt: **58**
- per entityType:
  - place: 25
  - person: 18
  - article: 15
  - story: 15
  - leksikon: 15
  - lesespor: 15

## Data funnet

- places: 489
- people: 426
- leksikon: 335
- lesespor: 9
- artikler totalt (leksikon + lesespor): 344

## Resolusjon

- eksplisitt `visual.designCode`: 169
- per kilde (alle entiteter):
  - explicit: 169
  - assetType: 0
  - category: 264
  - heuristic: 478
  - default: 348

| entityType | explicit | assetType | category | heuristic | default |
| --- | --- | --- | --- | --- | --- |
| places | 68 | 0 | 132 | 274 | 15 |
| people | 65 | 0 | 132 | 167 | 62 |
| articles | 36 | 0 | 0 | 37 | 271 |

## Eksplisitt pilot-merkede designCodes

- places (68):
  - `square_miniature`: 7
  - `park_miniature`: 7
  - `church_miniature`: 6
  - `station_miniature`: 5
  - `museum_miniature`: 5
  - `university_miniature`: 5
  - `street_miniature`: 4
  - `waterfront_miniature`: 4
  - `library_miniature`: 4
  - `cinema_miniature`: 4
  - `stadium_miniature`: 4
  - `ice_arena_miniature`: 4
  - `theatre_miniature`: 2
  - `civic_miniature`: 2
  - `fortress_miniature`: 2
  - `commerce_miniature`: 1
  - `industrial_miniature`: 1
  - `school_miniature`: 1
- people (65):
  - `person_musician_miniature`: 14
  - `person_scientist_miniature`: 11
  - `person_writer_miniature`: 6
  - `person_politician_miniature`: 6
  - `person_athlete_miniature`: 6
  - `person_poet_miniature`: 5
  - `person_runner_miniature`: 5
  - `person_footballer_miniature`: 4
  - `person_skier_miniature`: 4
  - `person_activist_miniature`: 3
  - `person_historical_miniature`: 1
- articles (36):
  - `article_history_miniature`: 13
  - `article_place_essay_miniature`: 9
  - `article_sports_history_miniature`: 5
  - `article_political_history_miniature`: 3
  - `article_art_miniature`: 3
  - `article_local_story_miniature`: 1
  - `article_groundhopper_miniature`: 1
  - `article_object_story_miniature`: 1

## Pilot batch 2

- Batch 1-baseline: 73 eksplisitte `visual.designCode` (28 places, 30 people, 15 articles).
- Nåværende total etter batch 2: 169 eksplisitte `visual.designCode`.
- Netto økning etter batch 1: 96 (40 places, 35 people, 21 articles).
- Omfang: Kontrollert Pilot batch 2: høy nytte for sentrale kartsteder, stedskoblede people og kunnskapslagartikler.

## Topp brukte designCodes

- `article_default_miniature`: 271
- `waterfront_miniature`: 87
- `park_miniature`: 63
- `person_default_miniature`: 62
- `person_writer_miniature`: 45
- `person_historical_miniature`: 44
- `person_scientist_miniature`: 41
- `person_activist_miniature`: 38
- `person_musician_miniature`: 36
- `apartment_block_miniature`: 28
- `person_politician_miniature`: 28
- `person_artist_miniature`: 28
- `museum_miniature`: 26
- `commerce_miniature`: 25
- `university_miniature`: 25

## designCodes uten bruk

- `gallery_miniature`
- `article_literature_miniature`
- `article_architecture_miniature`
- `article_people_portrait_miniature`
- `article_wonderkammer_miniature`

## Invalid eksplisitte designCodes

- (ingen)

## Manglende renderHints

- (ingen)
