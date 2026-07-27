# Eidsberg kirke – coordinate production

Date: 2026-07-27

## Result

- Place: `eidsberg_kirke`
- Previous coordinate: `59.5489, 11.3547`
- Applied coordinate: `59.51955, 11.25740`
- Displacement: approximately `6,383.0 m` southwest
- Radius: `260 m` retained
- Status: `verified_geometry`
- Role: `medieval_church_building_anchor`
- Source object: `osm-way:285802498;wikidata:Q6492967;riksantikvaren-kulturminne:84070;church-of-norway-building:824`

## Identity resolution

The canonical record is the protected medieval stone church at Grønnsundveien 1, not the wider parish, cemetery, parsonage, bus stop or Eidsberg locality.

The church building is the stable physical anchor for the place's larger history as the St. Olav church known as Østfolddomen. The immediate church-site environment remains relevant to gameplay, but no churchyard, cemetery, parish or protection geometry is inferred from the point or radius.

## Applied source

OpenStreetMap way `285802498` maps the church-building geometry. Its centroid is:

- `59.51955, 11.25740`

Wikidata `Q6492967` identifies the same church as a church building and cultural property, links the OSM way, Kulturminne ID `84070` and Church of Norway building ID `824`, and gives the address Grønnsundveien 1. Its coordinate lies approximately 38.1 metres from the applied building centroid.

The official Church of Norway page confirms the Eidsberg church identity, the Østfolddomen name, St. Olav dedication, medieval source tradition and major rebuilding in 1880–1881. Norges Kirker supplies deeper architectural and church-site context.

## Dating note

The official church page contains both a dating to 1250–1260 and a statement that the present church may be from the second half of the twelfth century. This coordinate production retains the existing approximate year `1250`; it does not attempt to reconcile the dating question because it does not affect the physical identity or coordinate decision.

## Rejected candidates

- Legacy point `59.5489, 11.3547`: approximately 6.38 km northeast of the church and without a source-object identity.
- Wikidata entity coordinate: valid close cross-check, but less direct than the mapped church-building geometry.
- Eidsberg church bus stop: access infrastructure rather than the church.
- Eidsberg parsonage: separate historical property.
- Eidsberg locality centroid: too broad to identify the church building.

## Radius decision

The existing 260 m gameplay radius is retained. It covers the church building and immediate church-site environment.

The radius is explicitly not:

- the cemetery or churchyard boundary
- the legal heritage-protection geometry
- the property or parish boundary
- the exact church-building polygon

## Production files

- `data/places/historie/ostfold/places_historie_ostfold_batch2/eidsberg_kirke.json`
- `data/coordinate-evidence/ostfold/historie/eidsberg_kirke.json`
- `reports/ostfold-coordinate-eidsberg-kirke-source-probe/source-summary.json`
- `reports/ostfold-coordinate-eidsberg-kirke-production-2026-07-27.md`

## Queue

The next active manifest entry is `rygge_kirke`.
