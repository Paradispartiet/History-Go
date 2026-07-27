# Gjellestadskipet / Jellhaugen – coordinate production

Date: 2026-07-27

## Result

- Place: `gjellestadskipet_jellhaugen`
- Previous coordinate: `59.1517, 11.2962`
- Applied coordinate: `59.14857, 11.25038`
- Displacement: approximately `2,635.7 m` west-southwest
- Radius: `360 m` retained
- Status: `verified_historical_source`
- Primary role: `ship_grave_findspot_anchor`
- Primary source object: `osm-node:5985030252`
- Secondary anchor: Jellhaugen at `59.14704, 11.25114`
- Secondary source object: `osm-way:891998939;wikidata:Q19376190;riksantikvaren-kulturminne:42959`

## Identity resolution

The combined name contains two separate archaeological monuments within the same landscape:

1. The Gjellestad ship grave lies in a ploughed-out burial mound on Viksletta.
2. The surviving monumental Jellhaugen lies approximately 175.6 metres to the south.

The ship was not buried inside the mound that is visible as Jellhaugen today. The canonical point therefore follows the named ship-grave archaeological object, while Jellhaugen is retained as a secondary anchor within the existing gameplay radius.

## Applied sources

OpenStreetMap node `5985030252` identifies the archaeological ship and settlement remains at:

- `59.14857, 11.25038`

OpenStreetMap way `891998939` maps Jellhaugen with centroid:

- `59.14704, 11.25114`

NIKU documents the 2018 georadar discovery of the approximately 20-metre ship imprint, multiple burial mounds and Iron Age buildings, followed by excavation in 2020–2021. Store norske leksikon documents Jellhaugen as a separate surviving oval mound approximately 85 by 70 metres and up to nine metres high. Halden municipality confirms that the fragile ship remains remain at the findspot and are currently monitored.

## Rejected candidates

- Legacy point `59.1517, 11.2962`: approximately 2.64 km east of both archaeological anchors and without a source-object identity.
- Jellhaugen alone: valid secondary monument, but not the grave mound that contained the ship.
- Gjellestad farm or locality centroid: too broad and does not identify either monument.
- Reconstructed full central-place landscape: not applied because no verified canonical geometry was captured for the complete burial, settlement and ritual landscape.

## Radius decision

The existing 360 m gameplay radius is retained. It covers the ship grave, Jellhaugen and the immediate connecting part of Viksletta.

The radius is explicitly not:

- the full archaeological central-place landscape
- a legal protection or security zone
- a proposed World Heritage boundary
- a property or farm boundary

## Production files

- `data/places/historie/ostfold/places_historie_ostfold_batch2/gjellestadskipet_jellhaugen.json`
- `data/coordinate-evidence/ostfold/historie/gjellestadskipet_jellhaugen.json`
- `reports/ostfold-coordinate-gjellestadskipet-source-probe/source-summary.json`
- `reports/ostfold-coordinate-gjellestadskipet-production-2026-07-27.md`

## Queue

The next manifest entry is `hoytorp_fort`.
