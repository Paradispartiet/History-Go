# Holmenkollen People of Place — batch 10 validation

Date: 2026-07-18
Branch: `data/people-holmenkollen-batch10-20260718`

## Records

Expected new canonical IDs:

- `toini_gustafsson`
- `klavdija_bojarskikh`
- `helena_takalo`
- `hilkka_riihivuori`
- `jelena_valbe`

## Structure checks

Each new file:

- is a one-element JSON array
- uses `category: "sport"`
- uses `placeId: "holmenkollen_nasjonalanlegg"`
- includes `holmenkollen_nasjonalanlegg` in `places`
- uses `visual.designCode: "person_skier_miniature"`
- keeps `image` and `cardImage` empty

## Place gate

Every selected person has direct documented individual Holmenkollen competition victories:

- Toini Gustafsson: 10 km wins in 1960, 1967 and 1968.
- Klavdija Bojarskikh: 10 km wins in 1965 and 1966, plus 5 km win in 1967.
- Helena Takalo: 5 km and 10 km wins in 1976.
- Hilkka Riihivuori: 10 km in 1974, 5 km in 1977, and both 5 km and 10 km in 1980; the earlier wins were recorded under the surname Kuntola.
- Jelena Välbe: 5 km in 1991 and 15 km in 1992.

## Canonical audit

Fresh pre-creation repository searches found no existing canonical records for the five selected IDs or names. Relevant surname and transliteration variants were included for Hilkka Riihivuori and Jelena Välbe.

## Manifest

Expected manifest delta: exactly five new file registrations, one for each batch 10 person file.

## Scope

Expected final net diff:

- 5 new person files
- 1 manifest modification
- 1 research report
- 1 validation report

No unrelated people, place, image, UI or runtime changes belong in this batch.
