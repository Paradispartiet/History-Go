# Holmenkollen People of Place — batch 9 validation

Date: 2026-07-18
Branch: `data/people-holmenkollen-batch9-20260718`

## Records

Expected new canonical IDs:

- `marjatta_kajosmaa`
- `raisa_smetanina`
- `alevtina_koltsjina`
- `galina_kulakova`
- `hallgeir_brenden`

## Structure checks

Each new file:

- is a one-element JSON array
- uses `category: "sport"`
- uses `placeId: "holmenkollen_nasjonalanlegg"`
- includes `holmenkollen_nasjonalanlegg` in `places`
- uses `visual.designCode: "person_skier_miniature"`
- keeps `image` and `cardImage` empty

## Place gate

Every selected person has direct documented individual competition victories in Holmenkollen. The batch does not rely on general ski fame, general Oslo association or Holmenkollmedaljen alone.

## Canonical audit

Fresh pre-creation repository searches found no existing canonical records for the five selected IDs or names. Relevant transliteration variants were included for Alevtina Koltsjina.

## Source discrepancy handling

The exact 1979 Raisa Smetanina result was resolved conservatively before finalizing the record. The detailed SNL winner table and Olympedia agree that her third Holmenkollen victory was the 5 km in 1979; the batch uses that result and does not repeat the conflicting 10 km claim from the dedicated SNL biography.

## Manifest

Expected manifest delta: exactly five new file registrations, one for each batch 9 person file.

## Scope

Expected net batch diff:

- 5 new person files
- 1 manifest modification
- 1 research report
- 1 validation report

No unrelated people, place, image, UI or runtime changes belong in this batch.
