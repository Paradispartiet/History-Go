# Hakadal Verk coordinate production

## Result

- Place: `hakadal_verk`
- Legacy coordinate: `60.12083, 10.82278`
- Retained production coordinate: `60.122400847631, 10.824335391711`
- Original displacement from legacy: approximately `194.8 m`
- Coordinate change in this pass: `0 m`
- Radius: retained at `360 m`
- Status: `verified_geometry`
- Coordinate Source Contract role: `area_anchor`
- Locator type: `institutional_area`
- Accuracy: `semantic_anchor`
- Applied source object: OpenStreetMap way `249239760`
- National building reference: `151094600`

## Why the coordinate is retained

The 2026-07-26 production already moved the unresolved legacy point approximately 194.8 metres north-east to the deterministic centroid of the named surviving industrial-building geometry on the Hakadal Verk site. The raw nine-node polygon and the Nominatim representation point still agree to approximately one metre.

This pass does not invent another coordinate movement. It repairs the Coordinate Source Contract classification. `historic_site` requires a historical-map or manual-research primary coordinate source, while the applied point is reproducible OSM geometry. The record is therefore classified as `institutional_area` with `osm`, `semantic_anchor`, `area_anchor` and `verified_geometry`. Historical sources continue to define the identity, chronology and representation limits of the wider ironworks environment.

## Canonical identity

The place represents the former Hakadal ironworks and the coherent works, waterpower, worker, school and estate environment that developed around it.

The surviving named building is a physical same-site anchor. It is not represented as:

- the modern hamlet generically;
- Hakadal railway station;
- one exact sixteenth-century rennverk structure;
- a reconstructed furnace, hammer or smelting location;
- an exact property, archaeological or heritage polygon.

## Historical basis

Store norske leksikon identifies Hakadal Verk as a former ironworks established around 1550 and closed in 1869. It describes surviving dams, falls and industrial buildings, including the main building, worker housing, school and crofter communities.

Nittedal Historielag documents the same works history in greater local detail, including ore from Grua, royal privileges, forest and charcoal dependence and the disappearance of almost all direct iron-production traces apart from the main building and old iron store.

SNL’s separate rennverk article documents earlier production phases in Hakadal. This reinforces the need to avoid treating the surviving building as the exact location of every historic production structure.

## Geometry basis

OpenStreetMap way `249239760` is named `Hakadal verk` and tagged:

```json
{
  "building": "industrial",
  "historic": "works",
  "name": "Hakadal verk",
  "ref:bygningsnr": "151094600"
}
```

The polygon centroid calculated from the raw geometry is:

- Latitude: `60.122400847631`
- Longitude: `10.824335391711`

Nominatim resolves the same object at `60.1224095, 10.8243370`, approximately one metre from the calculated centroid.

## Access and representation limits

- Buildings, yards, farm, workshop, storage and residential areas require permission or ordinary public access rights.
- Dams, falls, waterways, ruins and terrain must not be treated as unrestricted or hazard-free gameplay space.
- The marker represents the coherent ironworks institution and surviving environment through one named physical anchor.
- The `360 m` radius is not an ownership, heritage, archaeological, industrial-production, water-system or access boundary.

## Files

- `data/places/naeringsliv/akershus/hakadal_verk/hakadal_verk.json`
- `data/coordinate-evidence/akershus/naeringsliv/hakadal_verk.json`
- `reports/akershus-coordinate-hakadal-verk-source-probe/source-summary.txt`
- `reports/akershus-coordinate-hakadal-verk-production-2026-07-26.md`

The previously persisted raw OSM and Nominatim probe files remain unchanged as underlying evidence.

## Next manifest item

Continue with `nesodden_kirke` after this contract migration passes review and data checks.
