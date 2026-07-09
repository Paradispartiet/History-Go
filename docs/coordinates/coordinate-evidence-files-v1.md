# Coordinate Evidence Files v1

Coordinate evidence files are the evidence layer between a reported coordinate problem and a later coordinate change.

They exist because a `lat`/`lon` pair is not evidence. A coordinate can only become `verified` after the place identity, source object, address, geometry, geocode accuracy and coordinate role are clear enough to satisfy Coordinate Source Contract v1.

## Relationship to Coordinate Source Contract v1

`docs/coordinates/coordinate-source-contract-v1.md` defines the rules. Evidence files do not replace those rules.

An evidence file:

- records why a coordinate is blocked from verification
- lists the evidence needed before a coordinate PR
- stores candidate addresses, source objects, geometries and coordinate candidates
- preserves the current coordinate without changing it

An evidence file never makes a place `verified` by itself. `verified` can only be set in a later place-data PR after the evidence is complete and the place satisfies Coordinate Source Contract v1.

## Place types

### Current place / building

Use this for existing buildings or places that can be tied to a current official address or map object.

Required evidence normally includes:

- structured address or official address source
- source object id where possible
- geocode accuracy such as `rooftop`, `entrance`, `building` or `parcel`
- `coordRole` such as `building_center`, `entrance` or `display_marker`

### POI / current venue

Use this for named venues, businesses and cultural arenas.

A name alone is not enough. POI evidence should use a source object such as OSM, Google Places, Mapbox, an official map entry or a structured address from an official venue/source.

### Quay / linear area

Use this for kaier, streets, rivers, routes and other linear or area-like places.

These must not be reduced to a random point. They need geometry, anchors or a documented line/area anchor with a clear coordinate role.

### Historic site

Use this for historical, moved or demolished places.

Current address is not enough if the historical object no longer exists at that address. Evidence should include historical map/reference material or explicit `manual_research` with a source-backed historical anchor.

## Oslo Mek rule

`oslo_mek` is an identity problem before it is a coordinate problem. The current Oslo Mek venue/name and a historical mechanical workshop or industrial site must not be mixed into one verified coordinate. Evidence must resolve whether the place is a current venue, a historical site, or should be split into two records.

## Evidence lifecycle

Allowed `evidenceStatus` values:

- `needs_research`
- `candidate_sources_collected`
- `ready_for_coordinate_pr`
- `applied_to_place`
- `rejected`

Allowed `coordinateDecision` values:

- `do_not_change_coordinates_yet`
- `needs_address_source`
- `needs_poi_source`
- `needs_geometry`
- `needs_historical_source`
- `needs_identity_split`

## Rule

No coordinate update should be made from an evidence file until `decision.canBecomeVerified` is true and the evidence supports the required locator type, source provider, source object/address, geocode accuracy and coordinate role.
