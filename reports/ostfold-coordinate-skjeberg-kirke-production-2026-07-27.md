# Skjeberg kirke – coordinate production

Date: 2026-07-27

## Result

- Place: `skjeberg_kirke`
- Previous coordinate: `59.2309, 11.1901`
- Applied coordinate: `59.22886, 11.19030`
- Displacement: approximately `227.1 m` south
- Radius: `260 m` retained
- Status: `verified_geometry`
- Role: `medieval_church_building_anchor`
- Source object: `osm-way:271994592;wikidata:Q6495600;riksantikvaren-kulturminne:85456;church-of-norway-building:792`
- Approximate year: changed from `1180` to `1100`

## Identity resolution

The canonical object is Skjeberg medieval stone church at Prestegårdsbakken 30. It is not the bus stop, a cemetery centroid, the parsonage, Skjeberg settlement or a point representing the complete Oldtidsveien route and prehistoric landscape.

The church building is the stable physical anchor. The churchyard, special grave monuments, grave chapels, parsonage and residence wings form the immediate church-site environment. The rock art, burial fields, stone settings and route traces associated with the wider Oldtidsveien landscape are distributed across a much larger area and remain contextual or separate place records.

## Applied source

OpenStreetMap way `271994592` maps the named church-building polygon. Its representative point is:

- `59.22886, 11.19030`

Wikidata `Q6495600` identifies the same church and links OSM way `271994592`, Kulturminne ID `85456` and Church of Norway building ID `792`. Its entity coordinate lies approximately 34.6 metres from the applied building point.

The official church page confirms the address and describes the church, special grave monuments, parsonage and residence wings as one coherent historical environment. Norges Kirker supplies the detailed medieval building, churchyard, grave-chapel, rune-stone and inventory documentation.

## Year decision

The previous value `1180` was more precise than the sources support. Store norske leksikon describes Skjeberg church as a stone church from approximately 1100. The production therefore applies:

- `year: 1100`
- interpretation: approximate, not an exact construction year

## Rejected candidates

- Legacy point `59.2309, 11.1901`: approximately 227.1 m north of the church and without a source-object identity.
- Skjeberg church bus stop: access infrastructure approximately 170 m north.
- Skjeberg parsonage: separate property in the church-site ensemble.
- Churchyard centroid: broader than the named building.
- Oldtidsveien route or landscape centroid: does not identify the church and would collapse many distributed prehistoric sites into one point.

## Radius decision

The existing 260 m gameplay radius is retained. It covers the church, churchyard and immediate historical church-site environment.

The radius is explicitly not:

- the church-building or churchyard geometry
- a legal heritage-protection or property boundary
- the full Oldtidsveien route
- the distributed prehistoric landscape around Skjeberg

## Production files

- `data/places/historie/ostfold/places_historie_ostfold_batch3/skjeberg_kirke.json`
- `data/coordinate-evidence/ostfold/historie/skjeberg_kirke.json`
- `reports/ostfold-coordinate-skjeberg-kirke-source-probe/source-summary.json`
- `reports/ostfold-coordinate-skjeberg-kirke-production-2026-07-27.md`

## Queue

The next active manifest entry is `indreroed_gard_fredrikstad`.
