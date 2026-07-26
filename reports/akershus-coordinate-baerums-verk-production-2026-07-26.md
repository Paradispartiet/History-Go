# Bærums Verk coordinate production

Date: 2026-07-26

## Result

`baerums_verk_jernverk` has been moved from an uncontracted point in the southern Verksgata environment to Kartverket's location-verified address point for Bærums Verk at Verksgata 15.

- Previous coordinate: `59.93839, 10.50178`
- Applied coordinate: `59.94050204982565, 10.501268319641312`
- Displacement: approximately `236.6 m`
- Previous radius: `260 m`
- Applied radius: `360 m`
- Official address: `Verksgata 15, 1353 Bærums Verk`
- Kartverket identity: municipality `3201`, farm/use number `118/67`, address code `1306`
- Coordinate status: `verified_historical_source`
- Coordinate role: `area_anchor`

## Canonical identity

The canonical place represents the integrated historical ironworks and workers' settlement along Lomma, not:

- the modern Bærums Verk settlement node;
- Bærums Verk AS as a company;
- the retail land-use polygon alone;
- one selected worker dwelling;
- Slagghaugen alone;
- an invented blast-furnace centroid.

Bærum municipality describes the cultural environment as Verksgata with old worker housing, storehouse, main building, Klokkeboden, inn and outbuildings beside the waterfall that powered the furnace bellows. The lower blast-furnace structure survives and the furnace crown can be seen in the former foundry building.

## Applied area anchor

Bærums Verk uses Verksgata as a core visitor area and identifies Verksgata 15 as the current contact and visitor address.

Kartverket returned exactly one object for Verksgata 15:

- Municipality: `3201 Bærum`
- Farm/use number: `118/67`
- Address code: `1306`
- Postal code: `1353`
- Location verified: `true`
- Representation point: `59.94050204982565, 10.501268319641312`

The address point is applied as a semantic `area_anchor`. It is not described as a building centroid or the exact centre of the historical production plant.

## Map cross-checks

The materialized OSM extract distinguishes several different uses of the Bærums Verk name:

- settlement node `127833112`, approximately `397.1 m` from the legacy point;
- current retail land-use way `255050219`, whose representation point lies approximately `4.5 m` from the applied address anchor;
- visitor information map points;
- named buildings, shops, galleries and artworks along Verksgata;
- Slagghaugen node `8306775207`, approximately `312.9 m` south of the applied anchor.

Separate Nominatim searches for `Bærums Verk jernverk`, `Klokkeboden` and `Ovnsmuseet` returned no stable named object suitable for use as the single canonical marker.

The current retail polygon is therefore retained only as a physical cross-check. It must not be presented as the historical cultural-environment boundary.

## Radius decision

The radius is increased from `260 m` to `360 m`.

From the applied anchor:

- the previous southern Verksgata point is approximately `236.6 m` away;
- Slagghaugen is approximately `312.9 m` south;
- the published Vertshuset location is approximately `287.5 m` northeast;
- the Wikidata/Kulturminne 86120 cross-check point is approximately `99.2 m` away.

The 360-metre gameplay radius supports the central historical sequence from Slagghaugen and Verksgata toward the main building and Vertshuset.

It must not be interpreted as:

- a cadastral parcel;
- a protected cultural-environment polygon;
- the boundary of Kulturminne ID `86120`;
- the extent of all mining, charcoal or transport activity connected to the ironworks;
- a precise archaeological or industrial-production boundary.

## Historical identity

Bærums ironworks history began in the early seventeenth century. Production was later assembled at the present Lomma site, where falling water powered the bellows. The works became one of the country's major iron producers, supported by ore transport, charcoal production and a large labour hinterland.

The blast furnace was shut down in 1874. Foundry activity continued later, and much of the surviving environment was subsequently restored and adapted for commerce, crafts, culture and hospitality.

The canonical text has been strengthened so the place is read as:

- industrial technology and water power;
- labour, housing and paternalistic organisation;
- ownership and regional resource networks;
- preserved production remains;
- transformation from industrial works to cultural and commercial reuse.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| Bærum municipality – Bærums Verk | Official cultural-environment identity and physical components | Primary semantic identity |
| Kartverket – Verksgata 15 | Location-verified current visitor address | Primary applied point |
| Bærum municipality – heritage protection overview | Central extent from Verksgata to Vertshuset | Radius and representation context |
| Bærums Verk operator | Current visitor and site identity | Address and use cross-check |
| Store norske leksikon | Industrial chronology and surviving furnace/building remains | Historical identity |
| OSM way 255050219 | Current retail area | Physical cross-check only |
| OSM node 8306775207 | Slagghaugen | Southern industrial context only |
| Wikidata Q11962817 / Kulturminne 86120 | Heritage identity and published point | Non-applied cross-check |
| Legacy coordinate | Uncontracted southern point | Rejected |

## Raw source material

The one-time source workflow persisted:

- `reports/akershus-coordinate-baerums-verk-source-probe/geonorge-verksgata-15.json`
- `reports/akershus-coordinate-baerums-verk-source-probe/nominatim-baerums-verk.json`
- `reports/akershus-coordinate-baerums-verk-source-probe/nominatim-baerums-verk-jernverk.json`
- `reports/akershus-coordinate-baerums-verk-source-probe/nominatim-klokkeboden.json`
- `reports/akershus-coordinate-baerums-verk-source-probe/nominatim-ovnsmuseet.json`
- `reports/akershus-coordinate-baerums-verk-source-probe/osm-baerums-verk-bbox.xml`
- `reports/akershus-coordinate-baerums-verk-source-probe/source-summary.txt`

The temporary workflow removed itself before the production diff was finalized.

## Changed files

- `data/places/naeringsliv/akershus/baerums_verk_jernverk/baerums_verk_jernverk.json`
- `data/coordinate-evidence/akershus/naeringsliv/baerums_verk_jernverk.json`
- `reports/akershus-coordinate-baerums-verk-production-2026-07-26.md`
- the seven raw-source files listed above

## Next step

Continue the Akershus-wide manifest audit and select the next place without Coordinate Evidence or a completed coordinate-production pull request.
