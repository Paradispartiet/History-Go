# Holmenkollen People of Place — batch 11 validation

Date: 2026-07-18
Branch: `data/people-holmenkollen-batch11-20260718`

## Records

Expected new canonical IDs:

- `marjo_matikainen`
- `ljubov_jegorova`
- `larissa_lazutina`
- `stefania_belmondo`
- `julija_tsjepalova`

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

- Marjo Matikainen: 30 km win in 1988.
- Ljubov Jegorova: 15 km win in 1994.
- Larissa Lazutina: 30 km wins in 1995, 1998 and 2001.
- Stefania Belmondo: 30 km wins in 1997 and 2002.
- Julija Tsjepalova: 30 km wins in 1999, 2004 and 2006.

## Canonical audit

Fresh pre-creation repository searches found no existing canonical records for the five selected IDs or names. Relevant transliteration variants were included for Jegorova, Lazutina and Tsjepalova.

## Manifest

Expected manifest delta: exactly five new file registrations, one for each batch 11 person file.

## Scope

Expected net batch diff:

- 5 new person files
- 1 manifest modification
- 1 research report
- 1 validation report

No unrelated people, place, image, UI or runtime changes belong in this batch.
