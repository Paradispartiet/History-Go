# Sørenga sjøbad – coordinate intake and anchor decision

- Candidate: `sorenga_sjobad`
- Visit address tested first: `Sørengkaia 69 Oslo`
- Geonorge result: `verified_candidate`
- Geonorge source object: `geonorge-adresser-v1:0301:21549:69`
- Address point: `59.90329520070351, 10.754326773640422`
- Address-point decision: rejected as canonical display/unlock anchor for the sjøbad itself.
- Reason: the address point represents a building farther inside Sørenga and is roughly 300–350 metres from the named bathing-site objects at the tip of Sørenga.
- Preferred physical anchor: named OpenStreetMap POI `5295458069` (`Sørenga sjøbad`), linked to Wikidata `Q25427016`, at `59.90038, 10.75178`.
- Supporting named OSM geometries: beach way `435813605`, pier way `435811537`, grass area way `922847579`.
- Taxonomy: primary `sport`, secondary `by`, hybrid.
- Production decision: approved for canonical production with the named site/POI anchor rather than the postal address point.

The address-first requirement has therefore been satisfied and documented. This is an explicit application of the repository rule: use official address first, then geometry/POI when the address does not physically represent the place being mapped.

## Production

- Canonical place: `sorenga_sjobad`
- Primary category: `sport`
- Secondary category: `by`
- Coordinate source: `osm-node:5295458069`
- Coordinate status: `verified_geometry`
- Coordinate batch: 73
- Oslo verified/source-controlled total after production: 220
