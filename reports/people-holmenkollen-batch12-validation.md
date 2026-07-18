# Holmenkollen People of Place — batch 12 validation

Date: 2026-07-18
Branch: `data/people-holmenkollen-batch12-20260718`

## Records

Expected new canonical IDs:

- `per_bergerud`
- `armin_kogler`
- `steinar_braten`
- `ernst_vettori`
- `andreas_felder`

## Structure checks

Each new file:

- is a one-element JSON array
- uses `category: "sport"`
- uses `placeId: "holmenkollen_nasjonalanlegg"`
- includes `holmenkollen_nasjonalanlegg` in `places`
- uses `visual.designCode: "person_skier_miniature"`
- keeps `image` and `cardImage` empty

## Place gate

Every selected person has direct documented individual Holmenkollen ski jumping victories:

- Per Bergerud: 1979.
- Armin Kogler: 1980.
- Steinar Bråten: 1983.
- Ernst Vettori: 1986 and 1991.
- Andreas Felder: 1987.

## Canonical audit

Fresh searches for IDs, full names and the relevant Bråten/Braten variant returned no existing canonical records before creation.

## Expected final diff

After manifest registration and removal of the temporary helper workflow:

- 5 new one-person JSON files
- `data/people/manifest.json`: exactly 5 additions, 0 deletions
- 1 research report
- 1 validation report
- no place, image, UI, runtime, or permanent workflow changes

Final data checks must pass for both People data and Places data before merge.
