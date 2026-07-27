# Kornsjø grensestasjon coordinate production

Date: 2026-07-27  
Place ID: `kornsjo_grensestasjon`  
Category: `by`  
Municipality: Halden, Østfold

## Production decision

Move the canonical coordinate from a remote point north in Halden municipality to the historic Kornsjø border-station complex at Nordre Kornsjø.

- Previous coordinate: `59.0974, 11.6682`
- Applied coordinate: `58.94167, 11.65972`
- Displacement: approximately `17,323.5 m` south
- Coordinate status: `verified_historical_source`
- Coordinate role: `historic_border_station_complex_anchor`
- Source entity: `wikidata:Q211527`
- Bane NOR location code: `KO`
- Heritage identity: `kulturminne:86054`
- Radius: `300 m`

## Why this point

Wikidata Q211527 provides the named station-entity point and links the station to Bane NOR code KO, kilometre 169.12 and Kulturminne ID 86054. Bane NOR independently confirms Kornsjø station on the Østfold Line and its present infrastructure status.

The applied point represents the station complex. It is not the Kornsjø settlement point, the station-building photo position, the locomotive shed or the international rail-border point.

## Major legacy error

The previous coordinate was approximately 17.32 kilometres north of Kornsjø. It did not identify any relevant station, settlement or border object and had no source-object contract.

## Station chronology

Specialist and local railway sources support the following chronology:

- the station was taken into use in July `1879`;
- the first timber building followed type drawings by Peter Andreas Blix;
- that building burned in `1898`;
- a larger masonry building designed by Paul Due was completed in `1900`;
- the replacement building accommodated both station and customs functions;
- passenger service ended in `1999`;
- the station building was protected in `2001`.

Sources vary between 18 and 25 July 1879 for the exact opening date. The canonical record therefore retains the year 1879 but does not present one disputed day as certain.

## Current infrastructure status

Bane NOR states that passenger trains do not stop at Kornsjø. Its station page nevertheless documents an active railway layout with main, passing and additional tracks.

The record therefore distinguishes:

- no current passenger stop;
- continuing railway infrastructure;
- the historical station and customs environment;
- possible separate ownership and access rules for buildings.

## Station versus border

The actual railway border is represented by Wikidata Q130338241 and Bane NOR code KOG at approximately `58.93489, 11.66981`.

- Distance from station anchor: approximately `950.1 m`
- Direction: south-east
- Role: separate international rail-border context

The station is a border station by function, but it does not stand exactly on the national boundary.

## Component controls

### Station complex

- Coordinate: `58.94167, 11.65972`
- Source: Wikidata Q211527 and Bane NOR KO
- Role: canonical station-complex anchor

### Protected station building

- Control coordinate: approximately `58.94137, 11.65926`
- Heritage ID: `86054`
- Role: control for Paul Due's 1900 masonry building; not asserted as complete building geometry

### Railway border

- Coordinate: `58.93489, 11.66981`
- Source: Wikidata Q130338241 and Bane NOR KOG
- Role: separate border-infrastructure point

### Locomotive shed

Riksantikvaren's 2022 decision treats the locomotive shed as a separate technical-industrial heritage component near Kornsjø station. It is not used as the canonical station anchor.

## Gameplay and safety

- Passenger trains do not stop, but railway infrastructure remains operational.
- No task may require walking in tracks or crossing outside authorised public crossings.
- Buildings and technical areas may have separate ownership and access conditions.
- The coordinate does not grant entry to the protected station building or other structures.
- The radius is not a track, railway, heritage, property, platform, customs or safety boundary.

## Files changed

1. `data/places/by/ostfold/kornsjo_grensestasjon/kornsjo_grensestasjon.json`
2. `data/coordinate-evidence/ostfold/by/kornsjo_grensestasjon.json`
3. `reports/ostfold-coordinate-kornsjo-grensestasjon-source-probe/source-summary.json`
4. `reports/ostfold-coordinate-kornsjo-grensestasjon-production-2026-07-27.md`

## Next unresolved manifest entry

`tomb_herregard`
