# Oscarsborg festning coordinate production

Date: 2026-07-28

## Result

- Place: `oscarsborg_festning`
- Previous coordinate: `59.676, 10.606`
- Applied coordinate: `59.67346966441094, 10.607055536295166`
- Displacement: approximately `287.5 m`
- Previous radius: `360 m`
- Applied radius: `520 m`
- Status: `verified_historical_source`
- Locator type: `historic_site`
- Source provider: `manual_research`
- Accuracy: `geometric_center`
- Coordinate role: `historical_anchor`
- Canonical source identity: Lovdata inventory `1`, OpenStreetMap relation `972050`

## Why the legacy point is replaced

The legacy point was a rounded location between the principal parts of the Kaholmene. It was plausible as a rough visitor-core marker, but it had no stable source-object identity and no deterministic derivation. The pre-production evidence therefore correctly left it at `needs_manual_map_check` until raw central geometry and a multi-anchor policy could be materialized.

A one-time read-only GitHub Actions source probe fetched the OpenStreetMap map extract for both Kaholmene and the previously discovered battery objects. The complete artifact has digest:

`sha256:f31f23da9fb900fe0b93fe885e8bed9ed36431422070a2aa5dc136a6d97c98fc`

The temporary workflow was removed after the artifact was captured. The production branch retains compact materialized geometry and the raw Hovedbatteriet way needed to reproduce the coordinate decision.

## Canonical identity

Oscarsborg is not one building and is not one legal polygon. Forsvarsbygg describes a dispersed fortress system across the Kaholmene, Bergholmen, Håøya, Hallangsodden and mainland positions. Riksantikvaren's protection covers more than one hundred objects across a still broader defence landscape.

The canonical History Go record therefore represents the public and historical Kaholmene core through a multi-anchor model:

1. **Hovedfortet on Søndre Kaholmen** is the canonical marker.
2. **Hovedbatteriet** is a secondary 9 April artillery anchor.
3. **Torpedobatteriet on Nordre Kaholmen** is a secondary 9 April torpedo anchor.

Remote components such as Kopås, Seiersten, Heer, Nesset and Håøya are not collapsed into the canonical circle.

## Hovedfortet geometry

Lovdata identifies inventory `1` as Hovedfortet with the coastal-fort sections, constructed `1849–1856`, and protects all parts of the fort exterior and interior on gnr./bnr. `75/1`.

The materialized OpenStreetMap object is relation `972050`, tagged:

```json
{
  "building": "yes",
  "historic": "fort",
  "name": "Hovedfortet",
  "tourism": "attraction",
  "type": "multipolygon"
}
```

The relation consists of one outer ring and two inner rings. One inner ring is assembled from four member ways. A deterministic multipolygon area centroid was calculated in planar `lon*cos(meanLat), lat` space with the inner rings subtracted.

Applied centroid:

- Latitude: `59.67346966441094`
- Longitude: `10.607055536295166`

The centroid lies approximately `287.5 m` from the legacy point.

Persisted geometry:

- `reports/akershus-coordinate-oscarsborg-source-probe/osm-relation-972050-hovedfortet-geometry.json`
- `reports/akershus-coordinate-oscarsborg-source-probe/source-materialization-summary.json`

## Hovedbatteriet secondary anchor

Forsvarsbygg describes Hovedbatteriet as the major battery in front of Hovedfortet on Søndre Kaholmen. It was one of the decisive positions on 9 April 1940.

OpenStreetMap way `528047559` is a named bunker polygon for `Hovedbatteriet`. Its deterministic polygon centroid is:

- Latitude: `59.67263765222266`
- Longitude: `10.607828593105598`
- Distance from Hovedfortet: approximately `102.2 m`

This is retained as a secondary historical anchor rather than replacing Hovedfortet as the canonical marker.

Raw geometry:

- `reports/akershus-coordinate-oscarsborg-source-probe/osm-way-528047559-hovedbatteriet-full.xml`

## Torpedobatteriet secondary anchor

Lovdata identifies inventory `1018` as `Torpedobatteri`, constructed `1898–1901`, with exterior and interior protected on gnr./bnr. `75/1`. Forsvarsbygg describes the torpedo battery as an underground installation on Nordre Kaholmen and documents its decisive role in the sinking of Blücher.

No exact underground battery polygon is invented. The secondary anchor instead uses the named OpenStreetMap semantic point `582909472`:

- Latitude: `59.6777982`
- Longitude: `10.6077141`
- Distance from Hovedfortet: approximately `482.7 m`

The location is physically cross-checked by the materialized surrounding cluster:

- a steel door described as ordered in 1901;
- an underground service tunnel;
- three named sight towers for the torpedo battery;
- `Torpedobatteriverkstedet`;
- an adjacent bunker;
- a bunker described as storage for torpedo warheads.

Persisted cluster:

- `reports/akershus-coordinate-oscarsborg-source-probe/torpedobatteriet-materialized-cluster.json`

## Radius decision

The previous `360 m` radius was centered between the island components. Moving the canonical marker to the physically and historically stronger Hovedfortet coordinate would otherwise exclude the Torpedobatteriet secondary anchor.

The radius is therefore increased to `520 m`.

From Hovedfortet:

- Hovedbatteriet: approximately `102.2 m`
- Torpedobatteriet: approximately `482.7 m`
- Kopåsbatteriet: approximately `920 m`

The `520 m` radius therefore includes the decisive Kaholmene core while excluding remote mainland batteries.

It must not be interpreted as:

- the legal Oscarsborg protection boundary;
- a cadastral or property boundary;
- the complete historical firing sector;
- the Jetéen geometry;
- underground Torpedobatteriet geometry;
- the extent of Håøya or mainland batteries;
- an access guarantee.

## Access model

Oscarsborg is a public fortress destination reached by ferry. Current outdoor, museum, interior, guided-tour, event and transport conditions take precedence over the gameplay radius. Closed bunkers, tunnels, magazines, technical rooms, fenced areas and protected interiors are not automatically public gameplay space.

## Rejected candidates

### Rounded legacy point

`59.676, 10.606` is rejected as canonical because it lacks a stable object identity and deterministic derivation.

### Generic same-name OSM points

Nodes `6463615980` and `582909475` identify Oscarsborg generally but are superseded by the named Hovedfortet geometry.

### One legal-area centroid

Rejected because the formal protected landscape covers more than one hundred objects across islands and mainland positions.

### Kopåsbatteriet as canonical

Rejected because it is an important but geographically separate mainland battery approximately `920 m` from Hovedfortet.

### Torpedobatteriet as canonical

Rejected because it is a decisive secondary component on Nordre Kaholmen, not the central marker for the complete Kaholmene destination.

## Persisted source files

Pre-production audit:

- `reports/akershus-coordinate-oscarsborg-source-probe/official-source-summary.json`
- `reports/akershus-coordinate-oscarsborg-source-probe/osm-candidate-summary.json`

Production materialization:

- `reports/akershus-coordinate-oscarsborg-source-probe/source-materialization-summary.json`
- `reports/akershus-coordinate-oscarsborg-source-probe/osm-relation-972050-hovedfortet-geometry.json`
- `reports/akershus-coordinate-oscarsborg-source-probe/osm-way-528047559-hovedbatteriet-full.xml`
- `reports/akershus-coordinate-oscarsborg-source-probe/torpedobatteriet-materialized-cluster.json`

## Production files

- `data/places/historie/akershus/places_historie_akershus_batch1/oscarsborg_festning.json`
- `data/coordinate-evidence/akershus/historie/oscarsborg_festning.json`
- `reports/akershus-coordinate-oscarsborg-festning-production-2026-07-28.md`

## Sources

- Forsvarsbygg – Oscarsborg festning: https://www.forsvarsbygg.no/no/festningene/finn-din-festning/oscarsborg-festning/
- Forsvarsbygg – landsverneplan: https://www.forsvarsbygg.no/no/verneplaner/landsverneplan-for-forsvaret/ostlandet/oscarsborg-festning/
- Forsvarsbygg – historisk oversikt: https://www.forsvarsbygg.no/no/verneplaner/oscarsborg-festning/historikk/historisk-oversikt/
- Lovdata – FOR-2014-04-09-1986: https://lovdata.no/forskrift/2014-04-09-1986
- Riksantikvaren – Oscarsborg festning fredet: https://www.riksantikvaren.no/fredninger/oscarsborg-festning-fredet/
- OpenStreetMap relation 972050 – Hovedfortet: https://www.openstreetmap.org/relation/972050
- OpenStreetMap way 528047559 – Hovedbatteriet: https://www.openstreetmap.org/way/528047559

## Next manifest item

Continue with `trandumskogen` after this production change passes review and data checks.
