# Onsøy kirke – coordinate production

Date: 2026-07-27

## Result

- Place: `onsøy_kirke`
- Previous coordinate: `59.2194, 10.8159`
- Applied coordinate: `59.25629, 10.85077`
- Displacement: approximately `4,556.2 m` northeast
- Radius: `240 m` retained
- Status: `verified_geometry`
- Role: `listed_1877_church_building_anchor`
- Source object: `osm-way:246639578;wikidata:Q6494084;riksantikvaren-kulturminne:85220;church-of-norway-building:275`
- Year: changed from `1200` to `1877`

## Identity resolution

The canonical object is the standing Onsøy church at Kolbergveien 7. The current building is not medieval. It was designed by Henrik Thrap-Meyer and constructed in 1875–1877 on the site of a demolished medieval stone church, historically also called Kolberg church.

The standing 1877 building is therefore the physical coordinate anchor. The medieval predecessor remains a documented historical site layer on the same church site.

## Applied source

OpenStreetMap way `246639578` maps the named church-building polygon. Its representative point is:

- `59.25629, 10.85077`

Wikidata `Q6494084` identifies the same church, gives inception `1877` and links Church of Norway building ID `275`. Its coordinate lies approximately 10.8 metres from the applied building point.

Wikimedia Commons links the church identity to Kulturminne ID `85220`. The official Church of Norway page identifies the church, cemetery and chapel at Kolbergveien 7, 1621 Gressvik.

## Building and site-history correction

The previous record conflated the medieval church site with the standing building and used `year: 1200`.

Store norske leksikon and Norges Kirker document that:

- the current masonry church was designed by Henrik Thrap-Meyer
- it was built in 1875–1877
- it replaced a medieval stone church on the same site
- the older church was also known as Kolberg church

The production therefore applies:

- `year: 1877` for the standing physical building
- medieval history retained in `period`, description, popup and evidence

## Rejected candidates

- Legacy point `59.2194, 10.8159`: approximately 4.56 km southwest of the church and without a source-object identity.
- The demolished medieval Kolberg church: important earlier layer, but not the standing building and without separately captured geometry.
- Onsøy chapel: separate cemetery building north of the church.
- Cemetery centroid: broader and less precise than the named church building.
- Parking or service buildings: visitor infrastructure rather than the church.

## Radius decision

The existing 240 m gameplay radius is retained. It covers the standing church, cemetery, chapel and immediate historical church-site environment.

The radius is explicitly not:

- the church-building or cemetery geometry
- a heritage-protection or property boundary
- the exact footprint of the demolished medieval church
- the wider historical Onsøy parish or agricultural landscape

## Production files

- `data/places/historie/ostfold/places_historie_ostfold_batch3/onsøy_kirke.json`
- `data/coordinate-evidence/ostfold/historie/onsøy_kirke.json`
- `reports/ostfold-coordinate-onsoy-kirke-source-probe/source-summary.json`
- `reports/ostfold-coordinate-onsoy-kirke-production-2026-07-27.md`

## Queue

The next active manifest entry is `borregaard_sarpsborg_industri`.
