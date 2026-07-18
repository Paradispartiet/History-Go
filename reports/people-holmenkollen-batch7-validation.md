# Holmenkollen People of Place — batch 7 validation

Date: 2026-07-18
Branch: `data/people-holmenkollen-batch7-20260718`

## Records

Expected new canonical IDs:

- `gregor_schlierenzauer`
- `severin_freund`
- `stefan_kraft`
- `martin_koch`
- `matti_hautamaki`

## Structure checks

Each new file:

- is a one-element JSON array
- uses `category: "sport"`
- uses `placeId: "holmenkollen_nasjonalanlegg"`
- includes `holmenkollen_nasjonalanlegg` in `places`
- uses `visual.designCode: "person_skier_miniature"`
- keeps `image` and `cardImage` empty

## Place gate

Each selected person has a documented victory in the Holmenkollen ski-jumping competition. The batch does not rely on general ski fame or general Holmenkollen association.

## Canonical audit

Fresh pre-creation searches found no existing canonical records for the five selected IDs or names.

Marit Bjørgen and Therese Johaug were considered but excluded because canonical records already exist in the aggregate Oslo sport people data.

## Manifest

Expected manifest delta: exactly five new file registrations, one for each batch 7 person file.

## Scope

Expected net batch diff:

- 5 new person files
- 1 manifest modification
- 1 research report
- 1 validation report

No unrelated people, place, image, UI, or runtime changes belong in this batch.
