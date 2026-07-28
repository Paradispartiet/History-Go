# Trandumskogen coordinate production

Date: 2026-07-28

## Result

- Place: `trandumskogen`
- Previous coordinate: `60.2189, 11.1177`
- Applied coordinate: `60.2189, 11.1177`
- Coordinate change: `0 m`
- Radius: retained at `300 m`
- Status: `verified_historical_source`
- Locator type: `historic_site`
- Source provider: `manual_research`
- Accuracy: `semantic_anchor`
- Coordinate role: `historical_anchor`
- Physical named point: OpenStreetMap node `8745441267`
- Historical identity: Riksantikvaren protection of Trandumskogen, 8 May 2020

## Why the coordinate is retained

The coordinate itself was already correct. OpenStreetMap node `8745441267`, named Trandumskogen and linked to Wikidata `Q7833396`, is exactly at `60.2189, 11.1177`, the same coordinate as the previous canonical marker.

The production problem was the source contract. The previous record used custom values that are not valid Coordinate Source Contract v1 enums:

- `locatorType: memorial_site`
- `geocodeAccuracy: named_point`
- `coordRole: memorial_site_anchor`

The coordinate is therefore retained while the record is migrated to:

- `locatorType: historic_site`
- `sourceProvider: manual_research`
- `geocodeAccuracy: semantic_anchor`
- `coordRole: historical_anchor`
- `coordStatus: verified_historical_source`

The `manual_research` source provider reflects the actual production decision: the OSM point supplies a stable named map anchor, while Riksantikvaren and Ullensaker municipality define what historical place that point represents and how the broader protected culture environment must be interpreted.

## Historical and protected identity

Riksantikvaren identifies Trandumskogen as a national war memorial and documents that 194 people were executed here by the German occupation authorities during the Second World War. The protected culture environment includes:

- a defined forest area associated with the execution and former-grave landscape;
- the tank shooting range;
- the ceremonial memorial area.

The site was formally protected on 8 May 2020.

The ceremonial area includes the monument unveiled in 1954 and the memorial plaque erected in 1970. The former mass graves are no longer burial places, but marked grave traces remain part of the memorial landscape.

## Canonical anchor

The named point at `60.2189, 11.1177` is retained as the canonical historical anchor because it represents the memorial, ceremonial and former-grave visitor core without pretending to be the centroid of the entire legal protection area.

The marker therefore represents:

- the national memorial destination;
- the central ceremonial area;
- the route through the marked former-grave landscape.

It does not represent:

- an exact former mass-grave polygon;
- a legal protected-area centroid;
- a property centroid;
- every execution-site trace as one geometric point.

## Tank shooting range secondary anchor

Riksantikvaren describes the tank shooting range as the only known preserved range of its type and as an integrated part of the Trandumskogen culture environment. It also documents the historical relationship between the range and the concealment of shooting noise from executions.

OpenStreetMap way `42996009`, named `Stridsvognskytebanen i Trandumskogen`, has a representative point near:

- Latitude: `60.2206`
- Longitude: `11.1171`
- Distance from canonical anchor: approximately `191.9 m`

The shooting range is retained as a secondary historical anchor and remains inside the existing `300 m` gameplay radius. It does not replace the memorial core as the canonical marker.

## Radius decision

The existing `300 m` radius is retained.

At gameplay scale it covers:

- the memorial and ceremonial core;
- the marked former-grave visitor area;
- the nearby tank shooting range component.

It must not be interpreted as:

- the legal protection polygon;
- a cadastral or property boundary;
- the geometry of the former mass graves;
- an archaeological boundary;
- a guarantee that every protected trace lies inside the circle.

## Access and memorial conduct

Riksantikvaren describes Trandumskogen as accessible to the public and a popular walking area. Public accessibility does not make the memorial landscape ordinary recreational infrastructure.

History Go should therefore treat the former-grave markers, ceremonial memorial and execution-site traces with a deliberately respectful access model. Current conservation, safety and site-management instructions take precedence over gameplay. Closed or unsafe military remnants are not automatically accessible merely because they lie inside the gameplay radius.

## Content governance

The existing `desc` and `popupDesc` are retained unchanged. The coordinate-production change concerns provenance, representation, access context and Coordinate Source Contract compliance, not a rewrite of the historical narrative.

## Files

- `data/places/historie/akershus/places_historie_akershus_batch1/trandumskogen.json`
- `data/coordinate-evidence/akershus/historie/trandumskogen.json`
- `reports/akershus-coordinate-trandumskogen-source-probe/source-summary.json`
- `reports/akershus-coordinate-trandumskogen-production-2026-07-28.md`

## Sources

- Riksantikvaren – Trandumskogen: https://riksantikvaren.no/fredninger/trandumskogen/
- Ullensaker kommune – Trandumskogen: https://www.ullensaker.kommune.no/trandumskogen
- OpenStreetMap node 8745441267 – Trandumskogen: https://www.openstreetmap.org/node/8745441267
- OpenStreetMap way 42996009 – Stridsvognskytebanen i Trandumskogen: https://www.openstreetmap.org/way/42996009
- Wikidata Q7833396 – Trandumskogen: https://www.wikidata.org/wiki/Q7833396

## Next manifest item

Continue with `grini_fangeleir` after this contract migration passes review and data checks.
