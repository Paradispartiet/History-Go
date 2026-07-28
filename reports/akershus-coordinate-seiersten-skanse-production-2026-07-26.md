# Seiersten skanse coordinate production

## Result

- Place: `seiersten_skanse`
- Legacy coordinate: `59.6719, 10.6471`
- Retained production coordinate: `59.6726278, 10.6396722`
- Original displacement from legacy: approximately `424.8 m`
- Coordinate change in this pass: `0 m`
- Radius: retained at `260 m`
- Status: `verified_historical_source`
- Coordinate Source Contract role: `area_anchor`
- Locator type: `historic_site`
- Accuracy: `semantic_anchor`
- Source provider: `manual_research`
- Applied identity: Lovdata inventory `1002`, OSM node `6463616338`, SSR place number `300433`

## Why the coordinate is retained

The 2026-07-26 production already moved the unresolved legacy point approximately 424.8 metres west to the named military point for Øvre Seiersten skanse. The point remains the strongest available physical anchor because it is named, military-classified and linked to a national SSR place identity.

This pass does not invent another coordinate movement. It repairs the Coordinate Source Contract source classification. A `historic_site` with `verified_historical_source` must use `manual_research` or `historical_map` as the primary source provider. Here the coordinate is not supported by OSM alone: manual research resolves the OSM/SSR point to Seiersten inventory 1002 in the Lovdata protection regulation and distinguishes it from adjacent defence works and information objects.

## Canonical identity

The record represents the protected closed infantry redoubt built at Seiersten in 1898–1900 as part of the landward defence of Oscarsborg and the Drøbak Sound approach.

It does not represent:

- the information map east of the redoubt;
- Follo museum or the wider recreation area;
- Veisvingbatteriet, which is inventory 1001 and a separate artillery battery;
- the southern or northern connecting lines, inventories 1003 and 1004;
- Oscarsborg Fortress itself;
- the complete legal protection polygon for the Seiersten defence system.

## Official legal and historical identity

Lovdata regulation `FOR-2014-04-09-1986` identifies:

- inventory: `1002`;
- name: Seiersten skanse;
- original function: infantry redoubt;
- construction period: `1898–1900`;
- protected scope: the complete installation, including the exteriors and interiors of the shelters;
- cadastral identity: `70/1`.

The regulation separately inventories the ammunition magazine, Veisvingbatteriet and both connecting lines. This separation is essential to the coordinate decision. citeturn343179search0turn343179search2

## Applied physical anchor

OpenStreetMap node `6463616338` is:

- named `Øvre Seiersten skanse`;
- tagged `landuse=military`;
- linked to SSR place number `300433`;
- located at `59.6726278, 10.6396722`.

The co-located attraction point `1763395772` is only a visitor-identity cross-check. Information-map node `1793750671` lies approximately `126.8 m` east of the applied point and remains rejected as canonical.

## Access and representation limits

- Public use must follow established paths, signs, closures and current management rules.
- Shelters, interiors, magazines, tunnels, fenced areas and protected structures may be closed or require explicit permission.
- The marker represents the infantry redoubt through a documented historical-area anchor.
- The `260 m` radius is not the legal protection polygon, property boundary, firing sector, connecting-line extent, military boundary or access guarantee.

## Files

- `data/places/historie/akershus/places_historie_akershus_batch4/seiersten_skanse.json`
- `data/coordinate-evidence/akershus/historie/seiersten_skanse.json`
- `reports/akershus-coordinate-seiersten-skanse-source-probe/source-summary.txt`
- `reports/akershus-coordinate-seiersten-skanse-production-2026-07-26.md`

The previously persisted raw OSM and Nominatim probe files remain unchanged as underlying evidence.

## Next manifest item

Continue with `raelingen_bygdetun` after this contract migration passes review and data checks.
