# Tune-skipets funnsted – coordinate production

Date: 2026-07-27

## Result

- Place: `tune_skipet_funnsted`
- Previous coordinate: `59.2713, 10.9867`
- Applied coordinate: `59.27912, 11.00285`
- Displacement: approximately `1,264.1 m`
- Radius: `260 m` retained
- Status: `verified_historical_source`
- Role: `archaeological_findspot_memorial_anchor`
- Source object: `osm-node:798882848`

## Identity resolution

The canonical place is the Båthaugen ship-grave findspot on Haugen farm at Rolvsøy, not the museum location of the ship in Oslo. The original mound was already heavily reduced when the ship was excavated in 1867, so the surviving public destination is the memorial at the documented findspot rather than a fully preserved gravhaug.

Store norske leksikon identifies Båthaugen on Haugen farm as the excavation site and describes the mound as around 60 metres in diameter and approximately four metres high. Tune historielag documents that the memorial stone stands at the findspot and was erected by Østfold Historielag in 1947.

## Applied source

OpenStreetMap node `798882848` is named `Tuneskipet` and tagged as an archaeological site and visitor attraction. Its coordinate is:

- `59.27912, 11.00285`

This named object is used as the physical findspot and memorial anchor. It is supported by the archaeological identity in Store norske leksikon and the local memorial documentation from Tune historielag.

## Rejected candidates

- Legacy point `59.2713, 10.9867`: approximately 1.26 km southwest of the named findspot and without a source-object identity.
- Generic Haugen farm or locality point: identifies the broader farm, not the archaeological findspot and memorial.
- Vikingtidsmuseet on Bygdøy: holds the ship, but is not the Østfold findspot represented by this record.
- Reconstructed mound centroid or boundary: not created because the original Båthaugen was heavily reduced and no verified geometry was captured.

## Radius decision

The existing 260 m gameplay radius is retained. It covers the memorial, the immediate approaches and nearby Haugen farm context.

The radius is explicitly not:

- the original approximately 60-metre Båthaugen geometry
- an archaeological locality or protection polygon
- a property boundary
- the museum location of the ship

## Production files

- `data/places/historie/ostfold/places_historie_ostfold_batch1/tune_skipet_funnsted.json`
- `data/coordinate-evidence/ostfold/historie/tune_skipet_funnsted.json`
- `reports/ostfold-coordinate-tuneskipet-source-probe/source-summary.json`
- `reports/ostfold-coordinate-tuneskipet-production-2026-07-27.md`
