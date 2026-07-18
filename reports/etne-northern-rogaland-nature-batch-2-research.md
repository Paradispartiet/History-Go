# Etne / northern Rogaland nature batch 2 — research, duplicate audit and coordinate contract

## Scope

This batch continues the nature-first expansion around Etne by moving south across the county boundary into northern Rogaland / inner Ryfylke. It adds five distinct natural systems rather than near-duplicate viewpoints or generic hiking stops.

## Candidates

1. `vikedalselva` — Vindafjord — protected type watercourse
2. `vindafjorden` — Vindafjord / northern Ryfylke — regional fjord system
3. `svandalsfossen` — Sauda — waterfall and Scenic Route landscape access
4. `suldalslagen` — Suldal — national salmon watercourse in a regulated river system
5. `suldalsvatnet` — Suldal — deep fjord lake and central reservoir/watershed node

## Duplicate and activation audit

Before coordinate-contract repair, current `main` was searched for the five IDs, names and exact manifest paths.

The five source files exist from the earlier source-only batch #2186, but none of the five paths is registered in `data/places/manifest.json`. They are therefore canonical source candidates but not active runtime places yet.

The already integrated Etne nature batch 1 contains:

- `langfoss_etne`
- `akrafjorden`
- `jettegrytene_rullestad`
- `etneelva`
- `stordalsvatnet_etne`

None of the batch-2 IDs duplicates those records.

## Source basis

### Vikedalselva

Primary source: NVE, Verneplan for vassdrag, `038/1 Vikedalselva`.

Key claims used:

- recommended type watercourse for the region
- protected in Verneplan III in 1986
- many lakes, varied river courses and wetlands
- runs from the upland lake system through the Vikedal valley to Sandeidfjorden
- important salmon and sea-trout river and a significant remaining unregulated landscape in a heavily hydropower-developed region

Source:

- https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/rogaland/038-1-vikedalselva/

### Vindafjorden

Primary source: Store norske leksikon, `Vindafjorden`.

Key claims used:

- about 31 km maximum length
- maximum depth about 720 m
- branches into Sandeidfjorden, the inner Vindafjorden and Yrkefjorden
- name connected to the bend / turning form of the fjord

Source:

- https://snl.no/Vindafjorden

### Svandalsfossen

Primary source: Statens vegvesen / Nasjonale turistveger.

The official attraction page publishes this GPS coordinate:

- `59.62537531, 6.29210259`

The page describes the waterfall and the visitor stair system as one attraction on Nasjonal turistveg Ryfylke.

Source:

- https://www.nasjonaleturistveger.no/no/turistvegene/ryfylke/svandalsfossen

### Suldalslågen

Primary source: Suldal municipality.

Key claims used:

- 22 km river stretch from Suldalsvatnet to Sandsfjorden
- national salmon watercourse; Sandsfjorden is a national salmon fjord
- protected status adopted in 2007
- river landscape shaped by transported sediments
- river ecology and flow are managed within a heavily regulated hydropower system

Source:

- https://www.suldal.kommune.no/tenester/klima-natur-og-miljo/naturforvaltning/vassmiljo-og-vassforvaltning/suldalsvassdraget/

### Suldalsvatnet

Primary research source: Store norske leksikon, `Suldalsvatnet`.

Key claims used:

- 28.8 km² area
- about 28 km long
- maximum depth 376 m
- among Norway's deepest lakes
- narrows dramatically at Suldalsporten
- central part of the Suldalsvassdraget and modern hydropower system

Source:

- https://snl.no/Suldalsvatnet

## Coordinate-contract decisions

The earlier source-only records contained `lat`, `lon` and `r` but no current coordinate-source contract. None is activated unchanged.

### `vikedalselva`

Existing anchor:

- `59.4977, 5.903`
- `r: 650`

Contract:

- `coordType: route_anchor`
- `coordStatus: needs_manual_visual_qa`
- `locatorType: linear_area`
- `sourceProvider: manual_research`
- `geocodeAccuracy: semantic_anchor`
- `coordRole: line_anchor`

Reason: the History Go place represents a large watercourse system, while the stored coordinate is only a representative lower-river anchor and has low coordinate precision. It must not be presented as an exact verified point.

### `vindafjorden`

Existing anchor:

- `59.53333, 5.98333`
- `r: 2600`

Contract:

- `coordType: area_center`
- `coordStatus: needs_manual_visual_qa`
- `locatorType: natural_area`
- `sourceProvider: manual_research`
- `geocodeAccuracy: semantic_anchor`
- `coordRole: area_anchor`

Reason: this is a broad, branching regional fjord system. The point is a representative semantic anchor, not a geometric centroid of the entire water surface.

### `svandalsfossen`

Official published GPS:

- `59.62537531, 6.29210259`
- `r: 320`

Contract:

- `coordType: official_visitor_anchor`
- `coordStatus: needs_manual_visual_qa`
- `locatorType: current_place`
- `sourceProvider: official_map`
- `geocodeAccuracy: semantic_anchor`
- `coordRole: display_marker`

Reason: the exact coordinate is preserved because Statens vegvesen / Nasjonale turistveger explicitly publishes it for the attraction. The coordinate is understood as the official visitor/display anchor for the waterfall and stair landscape, not as a geometric waterfall centroid. The public page does not expose a stable machine-readable source object ID in the repository's coordinate-contract format, so the record is not artificially promoted to `verified` by inventing an ID.

### `suldalslagen`

Existing anchor:

- `59.48333, 6.25`
- `r: 900`

Contract:

- `coordType: route_anchor`
- `coordStatus: needs_manual_visual_qa`
- `locatorType: linear_area`
- `sourceProvider: manual_research`
- `geocodeAccuracy: semantic_anchor`
- `coordRole: line_anchor`

Reason: the place represents the full 22 km river axis from Suldalsvatnet to Sandsfjorden. The stored point is a representative line anchor with low precision, not a single exact physical object.

### `suldalsvatnet`

Existing anchor:

- `59.52667, 6.59911`
- `r: 1800`

Contract:

- `coordType: area_center`
- `coordStatus: needs_manual_visual_qa`
- `locatorType: natural_area`
- `sourceProvider: manual_research`
- `geocodeAccuracy: semantic_anchor`
- `coordRole: area_anchor`

Reason: the place represents a roughly 28 km long lake. The point is a broad representative area anchor, not an exact centroid or access point.

## Editorial separation from Etne nature batch 1

Batch 1 covers Etne itself: waterfall, Åkrafjorden, glacial potholes, Etneelva and Stordalsvatnet. Batch 2 deliberately crosses into Rogaland and adds a different regional chain: a protected type watercourse, the Vindafjorden system, a Sauda waterfall, a national salmon river and a deep fjord lake.

## Integration gate

Before merge:

1. register exactly these five existing source files once in `data/places/manifest.json`
2. rebuild `data/places/places_index.json` from canonical source files
3. run the strict new-coordinate intake gate against the PR base
4. run full `scripts/check-places.sh`
5. run split-manifest sync and coordinate-quality validation
6. prove exactly one active runtime row for each of the five IDs
7. prove source/runtime parity for the full coordinate contract on every ID
8. verify global duplicate active place IDs remain zero
9. save reusable command output with `tee` or `>` under `reports/northern-rogaland-natur-batch-2-integration/`
10. remove all temporary workflow/helper changes from the final diff
