# Oslo kultureiendommer completeness pass — batch 2

Date: 2026-07-18

Source set: Oslo kommune / Kulturetaten cultural properties, cross-checked against current History Go repository search.

## Rådmannsgården og Anatomibygget

No canonical History Go match was found for `Rådmannsgården`, `Anatomibygget`, `Kommisariatsgården`, `Lauritz Hansen`, or Rådhusgata 19.

The two buildings are represented as one canonical place because Oslo kommune treats them as one cultural property and the normative address-first method resolves both to the same visitor address and display anchor. Creating two place records would produce overlapping map markers. Their separate histories remain explicit inside the record and quiz profile.

Coordinate reused from the saved Geonorge pass in batch 1:

- `59.91014146776003, 10.740325400685213`
- `geonorge-adresser-v1:0301:16115:19`

## Magistratgården

No canonical History Go match was found for `Magistratgården`, `Helge Berntsen`, `Morten Leuch Eliesen`, or Dronningens gate 11.

The building is a distinct 1647 baroque property and receives its own canonical record.

Coordinate reused from the saved Geonorge pass in batch 1:

- `59.9092795875744, 10.745055179458067`
- `geonorge-adresser-v1:0301:11309:11`

## Representation rule

This batch adds buildings that are individually legible physical heritage sites. It does not create a generic `Kvadraturen` duplicate and does not split same-address sub-buildings into overlapping map points when a combined cultural-property record is more precise for runtime navigation.

## Runtime integration

The dedicated batch source is registered through the branch integration workflow, which rebuilds `data/places/places_index.json` and saves index, coordinate, emne and place-health validation before the temporary workflow is removed.
