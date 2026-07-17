# Etne / northern Rogaland nature batch 2 — research and duplicate audit

## Scope

This batch continues the requested nature-first expansion around Etne by moving south across the county boundary into northern Rogaland / inner Ryfylke. It adds five distinct natural systems rather than near-duplicate viewpoints or generic hiking stops.

## Candidates added

1. `vikedalselva` — Vindafjord — protected type watercourse
2. `vindafjorden` — Vindafjord / northern Ryfylke — regional fjord system
3. `svandalsfossen` — Sauda — waterfall and Scenic Route landscape access
4. `suldalslagen` — Suldal — national salmon watercourse in a regulated river system
5. `suldalsvatnet` — Suldal — deep fjord lake and central reservoir/watershed node

## Duplicate audit

Before creating the records, repository code search and pull-request search were run for the five names and the surrounding Etne / northern Rogaland nature expansion. No existing canonical place record or prior place-adding PR was found for these exact candidate names. The already-open Etne batch 1 contains only `langfoss_etne`, `akrafjorden`, `jettegrytene_rullestad`, `etneelva`, and `stordalsvatnet_etne`; none of those IDs are duplicated here.

## Source basis

### Vikedalselva

Primary source: NVE, Verneplan for vassdrag, `038/1 Vikedalselva`.

Key claims used:
- recommended type watercourse for the region
- protected in Verneplan III in 1986
- many lakes, varied river courses and wetlands
- runs from the upland lake system through the Vikedal valley to Sandeidfjorden
- important salmon and sea-trout river and a significant remaining unregulated landscape in a heavily hydropower-developed region

Source: https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/rogaland/038-1-vikedalselva/

### Vindafjorden

Primary source: Store norske leksikon, `Vindafjorden`.

Key claims used:
- about 31 km maximum length
- maximum depth about 720 m
- branches into Sandeidfjorden, the inner Vindafjorden and Yrkefjorden
- name connected to the bend / turning form of the fjord

Source: https://snl.no/Vindafjorden

### Svandalsfossen

Primary sources: Nasjonale turistveger / Statens vegvesen and Reisemål Ryfylke via Visit Norway.

Key claims used:
- official visitor anchor GPS: 59.62537531, 6.29210259
- total fall around 180 m
- visitor stair / walkway installation opened in 2006
- water volume varies strongly with precipitation and snowmelt

Sources:
- https://www.nasjonaleturistveger.no/en/routes/ryfylke/svandalsfossen/
- https://www.visitnorway.com/listings/svandalsfossen-falls-in-sauda/232991/

### Suldalslågen

Primary sources: Suldal municipality and Store norske leksikon.

Key claims used:
- 22 km river stretch from Suldalsvatnet to Sandsfjorden
- national salmon watercourse; Sandsfjorden is a national salmon fjord
- protected status adopted in 2007
- river landscape shaped by transported sediments
- river ecology and flow are managed within a heavily regulated hydropower system

Sources:
- https://www.suldal.kommune.no/tenester/klima-natur-og-miljo/naturforvaltning/vassmiljo-og-vassforvaltning/suldalsvassdraget/
- https://snl.no/Suldalsvassdraget

### Suldalsvatnet

Primary source: Store norske leksikon, `Suldalsvatnet`.

Key claims used:
- 28.8 km² area
- about 28 km long
- maximum depth 376 m
- among Norway's deepest lakes
- narrows dramatically at Suldalsporten
- central part of the Suldalsvassdraget and modern hydropower system

Source: https://snl.no/Suldalsvatnet

## Coordinate note

`svandalsfossen` uses the official GPS coordinate published by Nasjonale turistveger. The other four are representative map anchors for large linear or areal natural features rather than building/address points. They should therefore be checked by the repository's normal coordinate validation and manual map review before the PR is made ready for merge.

## Editorial separation from batch 1

Batch 1 covers Etne itself: waterfall, Åkrafjorden, glacial potholes, Etneelva and Stordalsvatnet. Batch 2 deliberately crosses into Rogaland and adds a different regional chain: a protected type watercourse, the Vindafjorden system, a Sauda waterfall, a national salmon river and a deep fjord lake.

## Integration required

Register exactly these five source files in `data/places/manifest.json`, rebuild `data/places/places_index.json`, then run the normal place manifest/index/coordinate/duplicate gates. Do not alter the five records unless a validation or coordinate review identifies a concrete defect.
