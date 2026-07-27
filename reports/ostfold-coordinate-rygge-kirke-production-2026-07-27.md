# Rygge kirke – coordinate production

Date: 2026-07-27

## Result

- Place: `rygge_kirke`
- Previous coordinate: `59.3811, 10.7211`
- Applied coordinate: `59.37966, 10.72254`
- Displacement: approximately `179.7 m` southeast
- Radius: `260 m` retained
- Status: `verified_geometry`
- Role: `medieval_church_building_anchor`
- Source object: `osm-way:370049162;wikidata:Q6494456;riksantikvaren-kulturminne:85325;church-of-norway-building:280`

## Identity resolution

The canonical object is Rygge medieval church at Kirkeveien 280. It is not Rygge chapel across the road, the cemetery, parsonage, Borgleden route or a general Rygge locality point.

The church-building polygon is the stable physical anchor. The churchyard and pilgrimage landscape remain important associated context but are not inferred as exact geometry from the marker or radius.

## Applied source

OpenStreetMap way `370049162` maps the named church-building polygon. Its representative point is:

- `59.37966, 10.72254`

Wikidata `Q6494456` identifies the same church, links OSM way `370049162`, Kulturminne ID `85325` and Church of Norway building ID `280`, and gives the address Kirkeveien 280. Its coordinate lies approximately 4.4 metres from the applied building point.

Store norske leksikon dates the automatically protected church to around 1170 and describes it as little changed since the Middle Ages. Pilegrimsleden places it directly on Borgleden and documents the ashlar masonry, medieval inventory and pilgrim context.

## Rejected candidates

- Legacy point `59.3811, 10.7211`: approximately 179.7 m northwest of the church and without a source-object identity.
- Rygge chapel: a separate building at Kirkeveien 275.
- Churchyard or cemetery centroid: broader church-site context rather than the named building.
- Borgleden route geometry: important historical connection, but not the church coordinate.

## Radius decision

The existing 260 m gameplay radius is retained. It covers the church and immediate church-site environment.

The radius is explicitly not:

- the church-building polygon
- the cemetery or churchyard boundary
- the legal heritage-protection geometry
- a property or pilgrimage-route boundary

## Production files

- `data/places/historie/ostfold/places_historie_ostfold_batch2/rygge_kirke.json`
- `data/coordinate-evidence/ostfold/historie/rygge_kirke.json`
- `reports/ostfold-coordinate-rygge-kirke-source-probe/source-summary.json`
- `reports/ostfold-coordinate-rygge-kirke-production-2026-07-27.md`

## Queue

The next active manifest entry is `hvaler_kirke`.
