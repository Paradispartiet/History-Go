# Sørum kirke coordinate production

Date: 2026-07-26

## Result

`sorum_kirke` has been moved from an incorrect point south of the church site to the deterministic centroid of the named medieval church-building geometry.

- Previous coordinate: `59.9866, 11.2391`
- Applied coordinate: `60.006675264823, 11.234479236208`
- Displacement: approximately `2,247.0 m`
- Applied geometry: OpenStreetMap way `531229103`
- National building reference: `150291933`
- Official address: `Bingenveien 23, 1923 Sørum`
- Kartverket identity: municipality `3205`, farm/use number `235/2`, address code `18196`
- Coordinate status: `verified_geometry`
- Coordinate role: `display_marker`
- Radius: `220 m`

## Canonical identity

The canonical record represents the protected medieval stone church at Bingenveien 23.

The wider historical identity includes:

- the old Sørum/Suðrheimr or Sudreim landscape;
- the local medieval elite and farm setting;
- the churchyard;
- the first stage of the 1814 election process;
- the Valgkirke information board;
- the nearby war memorial.

The physical marker remains the church building itself. The information board, memorial and hamlet point are contextual objects, not alternative canonical coordinates.

## Medieval building identity

Sørum parish describes the church as a protected medieval stone long church from the second half of the twelfth century, traditionally dated to 1166.

The building has:

- a lower and narrower choir east of the nave;
- a sacristy north of the choir;
- no windows in the nave's north wall;
- a gallery along the north and west walls;
- later alterations to the choir opening;
- interior restoration led by Domenico Erdmann in 1931.

Lillestrøm municipality records that the church was dedicated to Saints Peter and Paul on the feast of Saint Blaise and that its 850th anniversary was marked in 2016.

## Church geometry

OpenStreetMap way `531229103` is:

- named `Sørum kirke`;
- tagged `building=church`;
- tagged `heritage=yes`;
- tagged `start_date=1166`;
- linked to national building reference `150291933`;
- linked to Wikidata `Q8732053`;
- represented by a 15-node closed polygon.

The deterministic polygon centroid is:

- Latitude: `60.006675264823`
- Longitude: `11.234479236208`

Nominatim independently resolves the same way as Sørum kirke and returns a representative point at `60.0066262, 11.2344729` with the complete polygon.

## Official address and spelling variant

The parish's visitor page displays `Bingenvegen 23`, while Kartverket's authoritative address registry uses `Bingenveien 23`.

A first exact search using the parish spelling returned no official address object. A second search using both variants and municipality number 3205 returned exactly one object:

- Address: `Bingenveien 23`
- Municipality: `3205 Lillestrøm`
- Farm/use number: `235/2`
- Address code: `18196`
- Postal code: `1923`
- Representation point: `60.00661887200286, 11.234544136751357`

The address point lies approximately `7.2 m` from the applied church centroid.

The canonical address therefore follows Kartverket's official spelling while the evidence preserves the parish's display variant.

## Sudreim and 1814 election context

Store norske leksikon connects Sørum to Suðrheimr/Sudreim, seat of one of the major Norwegian medieval lineages.

SNL also documents that the first stage of the elections to the Constituent Assembly in 1814 was held in Sørum kirke. This was part of Norway's first national election process.

The local OSM extract contains an information board named `Valgkirke` at `60.0065786, 11.2344085`, approximately `11.5 m` from the church centroid. The board confirms on-site interpretation but is explicitly not used as the canonical coordinate because it is tagged as an information board rather than a church or historical-event site.

## Memorial context

A nearby memorial node lies at `60.0064814, 11.2349613`, approximately `34.3 m` from the church centroid.

This represents a later commemorative layer at the church site. It remains contextual and is not merged into the medieval church's physical identity.

## Legacy-point assessment

The previous coordinate `59.9866, 11.2391` lies approximately `2,247.0 m` south of the church-building centroid.

It could not be tied to:

- the named church polygon;
- Bingenveien 23;
- the cemetery;
- the Valgkirke board;
- the memorial;
- the Sørum/Sudreim hamlet and farm setting.

This is a major physical correction rather than only a provenance upgrade.

## Radius decision

The existing radius of `220 m` is retained to support gameplay coverage of:

- the church building;
- the cemetery;
- the Valgkirke and memorial layers;
- the nearest Sørum/Sudreim farm and church-site context.

The radius must not be interpreted as:

- the exact cemetery boundary;
- a cadastral parcel;
- a legal heritage-protection zone;
- the full Sudreim estate landscape;
- a coordinate for every event associated with the church.

## Source matrix

| Source | Role | Coordinate authority |
|---|---|---|
| OSM way 531229103 | Named medieval church polygon | Primary applied geometry |
| Kartverket, Bingenveien 23 | Official church-address point | Physical/address cross-check |
| Sørum parish | Official building description and visitor address | Historical identity and spelling cross-check |
| Lillestrøm municipality | Dedication and anniversary history | Official historical cross-check |
| SNL – Sørum kirke | Independent medieval and restoration history | Authoritative context |
| SNL – Lillestrøm | Sudreim and 1814 election history | Authoritative context |
| OSM Valgkirke board | On-site election interpretation | Context only |
| OSM memorial | Later commemorative layer | Context only |
| Legacy coordinate | Incorrect southern point | Rejected |

## Raw source material

The source workflows persisted:

- `reports/akershus-coordinate-sorum-kirke-source-probe/osm-way-531229103-full.xml`
- `reports/akershus-coordinate-sorum-kirke-source-probe/nominatim-sorum-kirke.json`
- `reports/akershus-coordinate-sorum-kirke-source-probe/osm-sorum-church-site-bbox.xml`
- `reports/akershus-coordinate-sorum-kirke-source-probe/geonorge-bingenvegen-23.json`
- `reports/akershus-coordinate-sorum-kirke-source-probe/geonorge-bingenveien-23.json`
- `reports/akershus-coordinate-sorum-kirke-source-probe/source-summary.txt`
- `reports/akershus-coordinate-sorum-kirke-source-probe/address-summary.txt`

The temporary workflows removed themselves before the production diff was finalized.

## Changed files

- `data/places/historie/akershus/places_historie_akershus_batch5/sorum_kirke.json`
- `data/coordinate-evidence/akershus/historie/sorum_kirke.json`
- `reports/akershus-coordinate-sorum-kirke-production-2026-07-26.md`
- the seven raw-source files listed above

## Next record

Continue with `feiring_jernverk`, the next place in the active Akershus batch-5 sequence.
