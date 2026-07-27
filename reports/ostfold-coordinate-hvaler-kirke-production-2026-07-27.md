# Hvaler kirke – coordinate production

Date: 2026-07-27

## Result

- Place: `hvaler_kirke`
- Previous coordinate: `59.0375, 11.0319`
- Applied coordinate: `59.03267, 11.02568`
- Displacement: approximately `644.3 m` southwest
- Radius: `240 m` retained
- Status: `verified_geometry`
- Role: `medieval_island_church_building_anchor`
- Source object: `osm-way:543076065;wikidata:Q6493554;riksantikvaren-kulturminne:84680;church-of-norway-building:444`

## Identity resolution

The canonical object is Hvaler medieval stone church at Svanekilveien 11 on Kirkøy. It is not the parsonage, cemetery, church office, Skjærhalden or a general Kirkøy or Hvaler locality point.

The church-building polygon is the stable physical anchor. The churchyard, Ørekroken and the wider island and maritime landscape remain important associated context but are not inferred as exact geometry from the marker or radius.

## Applied source

OpenStreetMap way `543076065` maps the named church-building polygon. Its representative point is:

- `59.03267, 11.02568`

Wikidata `Q6493554` identifies the same church and links Kulturminne ID `84680`, Church of Norway building ID `444` and SSR `790650`. The official church identity and visitor address are Svanekilveien 11, 1680 Skjærhalden.

Hvaler municipality describes the church as probably built around 1100 and among Norway's oldest stone churches. Norges Kirker identifies it as the main church of the islands and places it near Ørekroken, a historically important harbor during the herring fisheries.

## Dating note

Published sources vary between the late eleventh century and the first half of the twelfth century. This production retains the existing year `1100` as approximate. It does not assert one exact construction year because the dating question does not affect the building identity or coordinate decision.

## Rejected candidates

- Legacy point `59.0375, 11.0319`: approximately 644.3 m northeast of the church and without a source-object identity.
- Hvaler parsonage: a separate historical property west of the church.
- Churchyard or cemetery centroid: broader church-site context rather than the named building.
- Skjærhalden or Kirkøy centroid: too broad to identify the church.
- Ørekroken harbor: important maritime context, but not the church coordinate.

## Radius decision

The existing 240 m gameplay radius is retained. It covers the church and immediate maritime church-site environment.

The radius is explicitly not:

- the church-building polygon
- the cemetery or churchyard boundary
- the legal heritage-protection geometry
- a property, island or maritime-landscape boundary

## Production files

- `data/places/historie/ostfold/places_historie_ostfold_batch2/hvaler_kirke.json`
- `data/coordinate-evidence/ostfold/historie/hvaler_kirke.json`
- `reports/ostfold-coordinate-hvaler-kirke-source-probe/source-summary.json`
- `reports/ostfold-coordinate-hvaler-kirke-production-2026-07-27.md`

## Queue

The next active manifest entry is `askim_gummivarefabrikk`.
