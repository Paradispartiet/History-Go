# Etne sport batch 4 — Skånevik skytebane

## Scope

One-place follow-up to the merged Etne `sport` batches 1–3.

Selected:

- `skanevik_skytebane`

Still deferred:

- Etne Golfsimulator — documented at the same physical Skakke complex, without evidence for a separately mappable facility outside the existing `skakke_kultursenter_etne` place.

## Duplicate and physical-place gate

Current `main` was audited for `skanevik_skytebane`, Skånevik skytebane, Skånevik Skyttarlag and close outdoor-range variants. No canonical place record or duplicate ID was found.

Skånevik Idrettshall documents separate seasonal use: the shooting club trains on the indoor 15-metre range in winter and on the outdoor shooting range in summer. The outdoor range is therefore a distinct physical facility rather than the same place as `skanevik_kultur_og_idrettshall`.

Source:

- https://skaanevikidrettshall.no/fasilitetar/skytebane/

Etne municipality's adopted KPA plan description separately lists `Skånevik idrettsplass`, `Skånevik skytebane` and `Fikse skytebane` as existing sports facilities. Municipal KU/ROS material for Leknes 3 also documents the road towards the shooting range at Leknes.

Sources:

- https://www.etne.kommune.no/aktuelt/kunngjering-vedtak-av-kommuneplanen-sin-arealdel.12954.aspx
- https://www.etne.kommune.no/_f/p1/i30d1aef3-10cb-4cdc-8a5b-490d07860e0e/kpa-etne-kommune-planomtale-10122024.pdf
- https://www.etne.kommune.no/_f/p1/i6a44e9d2-072e-4ae0-8c56-29173c70fed3/kpa-etne-kommune-plankart-10122024_vedteke.pdf
- https://www.etne.kommune.no/_f/p1/iac4c1266-26a0-4845-af98-7f1457434e16/ku-og-ros-hoyring.pdf

## Coordinate contract

The address-first rule was considered first. The club's organisation/office address and the indoor hall address are not valid substitutes for the outdoor facility, and no sufficiently specific civic address for the range was established.

The adopted KPA map shows a separate long, narrow existing `Idrettsanlegg` polygon southwest of Leknes. The plan description and KU/ROS location evidence identify this facility as the outdoor Skånevik shooting range.

Representative point derivation from the published EUREF89 UTM32 plan map:

- approximate UTM32 centre: `E 325770 / N 6624696`
- converted WGS84: approximately `59.7235673, 5.9014130`
- canonical rounded anchor: `59.72357, 5.90141`

The canonical coordinate contract is:

- `coordType: area_center`
- `coordStatus: verified_geometry`
- `sourceProvider: official_map`
- `sourceObjectId: etne-kpa-2023-2030:skanevik-skytebane-idrettsanlegg`
- `geocodeAccuracy: geometric_center`
- `coordRole: area_anchor`
- `r: 420`

The radius and marker represent the elongated facility area. The point is explicitly not claimed as a surveyed standplass, firing line, target line, clubhouse or entrance point.

## Physical overlap audit

Using the representative anchor:

- Skånevik skytebane ↔ `skanevik_skatepark`: about `1.264 km`
- Skånevik skytebane ↔ `skanevik_discgolf`: about `1.312 km`
- Skånevik skytebane ↔ `skanevik_idrettsanlegg`: about `1.512 km`

The outdoor range is both physically and functionally distinct from the existing Skånevik sports records and from the indoor 15-metre range.

## Integration gate

This branch is rebuilt from current `main` after Etne nature batch 1 was integrated, so manifest/runtime generation must use that updated baseline.

Before merge:

1. register `places/sport/vestland/etne/skanevik_skytebane.json` exactly once in `data/places/manifest.json`
2. rebuild `data/places/places_index.json`
3. run coordinate intake, place checks, split-manifest sync and coordinate-quality validation
4. prove source/runtime coordinate-contract parity and exactly one active runtime occurrence
5. verify global duplicate active place IDs remain zero
6. save reusable validation output with `tee` or `>`
7. remove any temporary workflow/helper from the final diff
