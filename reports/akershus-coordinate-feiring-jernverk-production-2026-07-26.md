# Feiring jernverk coordinate production

Date: 2026-07-26

## Result

`feiring_jernverk` has been moved from an incorrect point southwest of the historical works to the named museum point within the main ironworks and ruin area.

- Previous coordinate: `60.5194, 11.1514`
- Applied coordinate: `60.5395079, 11.1628132`
- Displacement: approximately `2,321.4 m`
- Applied source object: OpenStreetMap node `6593405635`
- Wikidata: `Q11968641`
- Official address: `Jernverksvegen 50, 2093 Feiring`
- Kartverket identity: municipality `3240`, farm/use number `248/36`, address code `10372`
- Coordinate status: `verified_historical_source`
- Coordinate role: `area_anchor`
- Radius: `360 m`

## Canonical identity

The canonical record represents the main Feiring ironworks and ruin complex, including the preserved blast furnace and the nearest structural, waterpower and worker-landscape remains.

It does not represent:

- a geometric centroid of the blast furnace;
- every one of the 25 documented structural elements;
- the complete historical industrial property;
- St. Paul's mine;
- Carsten Anker's pavilion;
- a parking or trail-start point.

## Historical identity

MiA Eidsvoll museum documents that Feiring jernverk was established in 1798 and operated from 1806 to 1818 as part of Eidsvoll Verk under Carsten Anker.

At its largest the small industrial community included 168 men, women and children. Work included mining, timber cutting, hauling, charcoal burning and ore roasting.

The site preserves one of Norway's best-preserved blast furnaces and walls or ruins from the charcoal house, bakery oven, manager's residence and office building.

Store norske leksikon describes Feiring as a complete iron-production complex with blast furnace, dams, crushing works, roasting furnaces, charcoal storage, workshops, office, mill and sawmill. SNL records 25 structural elements at the main site, including Atthaldsdammen.

## Applied area anchor

OpenStreetMap node `6593405635` is:

- named `Feiring jernverk`;
- tagged `tourism=museum`;
- linked to Wikidata `Q11968641`;
- located at `60.5395079, 11.1628132`.

Nominatim independently returns the same object at `60.5395113, 11.1628063`, approximately `0.5 m` from the applied point.

The persisted local OSM extract did not contain a separately named blast-furnace or ruin polygon. The museum node is therefore used as a stable, named area anchor for the main complex. It is not described as the exact centre of the furnace or ruin field.

## Official address

Kartverket returned exactly one, location-verified address object for Jernverksvegen 50:

- Municipality: `3240 Eidsvoll`
- Farm/use number: `248/36`
- Address code: `10372`
- Postal code: `2093`
- Representation point: `60.53947819994073, 11.163730500320105`

The official address point lies approximately `50.3 m` east of the applied museum anchor and independently confirms the physical ironworks area.

## Separate nearby place: Carsten Anker's pavilion

OpenStreetMap node `6593405637`, named Carsten Ankers lysthus / Kristenkollen, lies approximately `309.8 m` northeast of the applied ironworks point.

MiA treats the pavilion as a separate visitor site. It belongs to the wider Carsten Anker historical landscape but is explicitly rejected as the canonical coordinate for `feiring_jernverk`.

## Separate distant place: St. Paul's mine

MiA's official directions state that St. Paul's mine is not close to the ironworks and has its own access route and guided-tour regime.

The mine is part of the resource and labour history of the works but must not be collapsed into the main ironworks marker.

## Legacy-point assessment

The former coordinate `60.5194, 11.1514` lies approximately `2,321.4 m` southwest of the named museum point.

It could not be tied to:

- the main blast-furnace and ruin area;
- Jernverksvegen 50;
- the named museum object;
- Atthaldsdammen;
- a documented parking or access point.

This is a major physical correction rather than a metadata-only upgrade.

## Radius decision

The existing radius of `360 m` is retained to support gameplay coverage of:

- the blast furnace;
- the central ruin field;
- the closest dams and Torgundrudelva environment;
- the nearest structural and industrial traces.

The radius must not be interpreted as:

- the exact cultural-heritage boundary;
- the historical property boundary;
- the complete network of mines and transport routes;
- a polygon for all 25 structural elements;
- inclusion of the separate pavilion or St. Paul's mine as the same object.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| OSM node 6593405635 | Named museum point in main works | Primary applied area anchor |
| Kartverket, Jernverksvegen 50 | Official verified address point | Physical/address cross-check |
| MiA – Feiring jernverk | Official museum history and ruin identity | Primary historical identity |
| MiA – Finn oss | Access guidance and separate-site distinctions | Access/context only |
| Eidsvoll municipality | Municipal attraction and blast-furnace cross-check | Official context |
| SNL – Feiring jernverk | Complete works and 25-element description | Authoritative area context |
| Feiring Jernverks venner | Blast-furnace, river and worker-community context | Local historical cross-check |
| OSM node 6593405637 | Separate Carsten Anker pavilion | Rejected as canonical |
| Legacy coordinate | Incorrect southwestern point | Rejected |

## Raw source material

The one-time source workflow persisted:

- `reports/akershus-coordinate-feiring-jernverk-source-probe/osm-node-6593405635.xml`
- `reports/akershus-coordinate-feiring-jernverk-source-probe/nominatim-feiring-jernverk.json`
- `reports/akershus-coordinate-feiring-jernverk-source-probe/osm-feiring-jernverk-bbox.xml`
- `reports/akershus-coordinate-feiring-jernverk-source-probe/geonorge-jernverksvegen-50.json`
- `reports/akershus-coordinate-feiring-jernverk-source-probe/source-summary.txt`

The temporary workflow removed itself before the production diff was finalized.

## Changed files

- `data/places/naeringsliv/akershus/feiring_jernverk/feiring_jernverk.json`
- `data/coordinate-evidence/akershus/naeringsliv/feiring_jernverk.json`
- `reports/akershus-coordinate-feiring-jernverk-production-2026-07-26.md`
- the five raw-source files listed above

## Next record

Continue with `gardermoen_militaerleir_tunet`, the next place in the active Akershus batch-5 sequence.
