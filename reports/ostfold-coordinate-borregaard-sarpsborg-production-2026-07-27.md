# Borregaard Sarpsborg – coordinate production

Date: 2026-07-27

## Result

- Place: `borregaard_sarpsborg_industri`
- Previous coordinate: `59.2846, 11.1139`
- Applied coordinate: `59.27224, 11.11388`
- Displacement: approximately `1,374.4 m` south
- Radius: `420 m` retained
- Status: `verified_geometry`
- Role: `biorefinery_industrial_area_anchor`
- Source object: `osm-way:190303979;business-register:998753562`
- Year: `1889` retained as the start of modern industrial activity

## Identity resolution

The canonical object is the active Borregaard industrial and biorefinery complex in Sarpsborg. The name Borregaard is also used for several separate nearby entities:

- Borregaard hovedgård
- Borregaard power station
- the company and headquarters address
- a generic Borregård locality
- the wider historical industrial landscape around Sarpsfossen

The named industrial-area polygon is the correct physical anchor for the factory record. The manor, power station and waterfall remain separate objects or contextual controls.

## Applied source

OpenStreetMap way `190303979` maps the named Borregaard industrial area. Its representative point is:

- `59.27224, 11.11388`

Borregaard's official plant and office information identifies the Sarpsborg site and gives Hjalmar Wessels vei 6 as the plant and headquarters address. Brønnøysundregistrene independently confirms Borregaard ASA at the same address. The address is used to verify current identity, while the industrial-area geometry supplies the coordinate.

## Historical decision

Borregaard's official history and Store norske leksikon both identify 1889 as the beginning of modern industrial activity at the site, when Kellner Partington acquired Borregård and developed cellulose production.

The production therefore retains:

- `year: 1889`
- interpretation: start of the modern industrial development, not the first industrial activity ever conducted in the area and not the incorporation date of the present Borregaard ASA

The Sarpsborg site later developed from cellulose and related production toward specialised cellulose, lignin-based biopolymers, vanillin and other biochemicals. Borregaard currently describes the site as a biorefinery.

## Rejected candidates

- Legacy point `59.2846, 11.1139`: approximately 1.37 km north of the named industrial area and without a source-object identity.
- Borregaard power station, OSM way `194919724` / Wikidata `Q11961992`: separate energy facility approximately 1.0 km east.
- Borregaard hovedgård, Wikidata `Q11961990`: historic manor approximately 544 m west.
- Sarpsfossen: separate waterfall and resource landscape.
- Generic Borregård locality: not the active factory complex.
- Hjalmar Wessels vei 6 entrance or office point: too narrow for the industrial site.

## Radius and access decision

The existing 420 m gameplay radius is retained. It gives a limited gameplay area around the western and central industrial core.

The radius is explicitly not:

- the complete OSM industrial polygon
- a factory process or safety zone
- a property, emission or operational boundary
- the extent of the power station, manor or Sarpsfossen

Borregaard is an active, access-controlled industrial site. The coordinate identifies the site but does not grant access. Any gameplay task must remain on lawful public roads or viewpoints and must never require entry through factory gates or into operational areas.

## Production files

- `data/places/naeringsliv/ostfold/borregaard_sarpsborg_industri/borregaard_sarpsborg_industri.json`
- `data/coordinate-evidence/ostfold/naeringsliv/borregaard_sarpsborg_industri.json`
- `reports/ostfold-coordinate-borregaard-sarpsborg-source-probe/source-summary.json`
- `reports/ostfold-coordinate-borregaard-sarpsborg-production-2026-07-27.md`

## Queue

The next active manifest entry is `sarpsfossen`.
