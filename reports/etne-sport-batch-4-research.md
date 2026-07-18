# Etne sport batch 4 — Skånevik skytebane

## Scope

One-place follow-up to the Etne `sport` completeness passes after batches 1–3.

Selected:

- `skanevik_skytebane`

Still deferred:

- Etne Golfsimulator — the organisation/offer is documented at the same address as Skakke, but there is still no evidence for a separately mappable physical facility outside the existing `skakke_kultursenter_etne` place object.

## Duplicate gate on current main

Current `main` was searched before branch creation for:

- `skanevik_skytebane`
- `Skånevik skytebane`
- `Skånevik Skyttarlag`
- close outdoor-range variants

No canonical place record or duplicate ID was found. Existing hits were research reports that had previously deferred the candidate because the physical anchor was not yet trustworthy enough.

## 1. Physical-place gate

### Local primary source

Skånevik Idrettshall documents that Skånevik Skyttarlag trains in the idrettshall during winter and **on the shooting range during summer**. The same page separately describes the 15-metre indoor range on the second floor of the idrettshall.

Source:

- https://skaanevikidrettshall.no/fasilitetar/skytebane/

This is direct evidence that the outdoor range is a separate physical facility and must not be consolidated into the indoor hall record.

### Official municipal planning evidence

Etne municipality's adopted KPA plan description explicitly states that sports facilities outside the centre are assigned the `Idrettsanlegg` land-use purpose and lists:

- Skånevik idrettsplass
- Skånevik skytebane
- Fikse skytebane

For Skånevik, the plan therefore distinguishes the idrettsplass from the shooting range as separate existing sports facilities.

Sources:

- https://www.etne.kommune.no/aktuelt/kunngjering-vedtak-av-kommuneplanen-sin-arealdel.12954.aspx
- https://www.etne.kommune.no/_f/p1/i30d1aef3-10cb-4cdc-8a5b-490d07860e0e/kpa-etne-kommune-planomtale-10122024.pdf
- https://www.etne.kommune.no/_f/p1/i6a44e9d2-072e-4ae0-8c56-29173c70fed3/kpa-etne-kommune-plankart-10122024_vedteke.pdf

The KPA also uses hazard consideration zone H290 to secure areas around shooting ranges.

### Leknes location evidence

The municipality's KU/ROS for `KPI – 28 – Leknes 3`, gnr/bnr `137/005`, states that the proposed area at **Leknes, Skånevik** lies along the private road from the county road to the shooting range in Skånevik. The same assessment repeatedly describes the area as lying along the road/local road to the shooting range.

Source:

- https://www.etne.kommune.no/_f/p1/iac4c1266-26a0-4845-af98-7f1457434e16/ku-og-ros-hoyring.pdf

This independently anchors the outdoor range to the Leknes side of Skånevik and rules out using the skyttarlag's current registered office address as the range location.

### DFS facility evidence

DFS/Skytebaneguide lists Skånevik Skyttarlag with both an outdoor and an indoor shooting facility. This independently supports the indoor/outdoor distinction.

Sources:

- https://skytebaneguide.no/
- https://skytterkontoret.no/

## 2. Coordinate-source contract

### Address-first rule

The History Go address-first rule was applied conceptually first:

1. A concrete Norwegian facility address should use Geonorge Adresser before generic POI search.
2. The skyttarlag's organisation/office address is not evidence for the outdoor range and is therefore rejected as a coordinate anchor.
3. No sufficiently specific civic address for the outdoor range was found.
4. For a non-addressed sports facility, an official mapped facility geometry is preferred over an invented or organisation-address point.

### Official KPA geometry

The adopted municipality-wide KPA map is published in EUREF89 UTM32 and shows two existing `Idrettsanlegg` polygons in the Skånevik/Leknes area:

- the idrettsplass near the settlement
- a long, narrow facility polygon southwest of Leknes

The plan description establishes that the two separately named existing sports facilities here are Skånevik idrettsplass and Skånevik skytebane. The KU/ROS location evidence places the access to the shooting range at Leknes. Together these sources identify the long, narrow `Idrettsanlegg` polygon as the outdoor shooting range.

### Representative-point derivation

The published A0 KPA map was rendered at 300 dpi and calibrated against its printed UTM grid.

Grid checks used:

- easting: `318000`, `324000`, `330000` at consecutive 6 km grid lines
- northing: `6630000`, `6624000`, `6618000` at consecutive 6 km grid lines

The representative centroid of the mapped long, narrow shooting-range polygon was read at approximately:

- EUREF89 UTM32: `E 325770`, `N 6624696`
- converted WGS84: `59.7235673, 5.9014130`

Canonical rounded anchor:

- `59.72357, 5.90141`

This is a **representative facility anchor derived from the official mapped sports-facility polygon**. It is not claimed to be a surveyed firing-point, firing line, target line or clubhouse coordinate.

## 3. Physical overlap audit

Using the new representative anchor:

- Skånevik skytebane ↔ `skanevik_skatepark`: about `1.264 km`
- Skånevik skytebane ↔ `skanevik_discgolf`: about `1.312 km`
- Skånevik skytebane ↔ `skanevik_idrettsanlegg`: about `1.512 km`

The facility is therefore spatially distinct from the existing Skånevik sports cluster as well as functionally distinct from the indoor 15-metre range in `skanevik_kultur_og_idrettshall`.

## Canonical decision

Create `skanevik_skytebane` as a separate `sport` place.

Reasons:

- explicit separate outdoor physical facility
- official municipal KPA recognition as its own existing `Idrettsanlegg`
- local primary evidence for separate summer outdoor use versus winter indoor use
- independent Leknes location evidence
- representative coordinate derived from official mapped facility geometry
- no canonical duplicate on current `main`
- clear physical separation from nearby existing canonical sport records

## Integration gate

This branch intentionally starts with source record plus research only.

**Do not merge the PR while it is source-only.** Before marking ready, integration must:

1. register `places/sport/vestland/etne/skanevik_skytebane.json` exactly once in `data/places/manifest.json`
2. rebuild the runtime places index through the repository's canonical generation path
3. verify the new ID occurs exactly once in active runtime
4. run the global duplicate-ID audit
5. run missing-`emne_ids`/schema checks required by the current data pipeline
6. verify source/index coordinate parity
7. verify split-manifest sync
8. run the coordinate quality gate
9. run `git diff --check`
10. remove any temporary integration workflow/helper before final merge
