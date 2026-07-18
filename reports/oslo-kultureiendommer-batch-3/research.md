# Oslo kultureiendommer completeness pass — batch 3

Date: 2026-07-18

Source set: Oslo kommune / Kulturetaten cultural properties, cross-checked against current History Go repository search.

## Hauges Minde

No canonical History Go record was found for `Hauges Minde`, `Hans Nielsen Hauges Minde`, `Storjohann`, or Olaf Ryes plass 2.

Oslo kommune documents the building as a purpose-built 1875 prayer house initiated by Johan Cordt Harmens Storjohann and named for Hans Nielsen Hauge. Its later uses include interim church, parish building, German occupation propaganda offices, youth hostel, women's shelter and crisis centre. Today the property includes artist studios and Atelier Nord.

Representation: canonical `historie` place focused on changing religious, occupation, welfare and cultural uses of one physical building.

Address-first result:
- `59.92228111752553, 10.75817184314198`
- `geonorge-adresser-v1:0301:15331:2`
- Olaf Ryes plass 2, 0552 Oslo

## Slurpen

No canonical History Go record was found for `Slurpen`, the former municipal common kitchen at Lakkegata 79C, or the historical school-meal function.

Oslo kommune documents the 1901 building as the common kitchen for Lakkegata school. The school complex stands on the former Tøyen cholera cemetery. The building later became a culture and assembly venue; the municipality's current meeting-place page also documents later artist use and today's local community functions.

Representation: canonical `historie` place focused on public school meals, urban health history, reuse and neighbourhood community life — not merely the current venue programme.

Address-first result:
- `59.91931038465871, 10.768086181233059`
- `geonorge-adresser-v1:0301:14097:79C`
- Lakkegata 79C, 0562 Oslo

## Frysja decision

`frysja_industriomrade` already exists as a canonical History Go place, with dedicated quiz coverage. Frysja kunstsenter is therefore not duplicated in this pass; its art-reuse layer should enrich the existing canonical place instead if future content work finds a gap.

## Validation path

A dedicated branch workflow registers the batch source, rebuilds the global place index, runs strict coordinate intake and validates canonical emne IDs before the workflow files are removed from the final PR.
