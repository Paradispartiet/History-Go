# Frognerstranda footway topology and scope

Date: 2026-07-24

- exact OSM object: osm-way:71423688
- type: footway
- nodes: 41
- length: 918.4 m
- deterministic midpoint: 59.91375968032277, 10.699520653286015
- east endpoint connected pedestrian ways: 0
- west endpoint connected pedestrian ways: 0
- west scope-anchor distance: 381.64 m
- east scope-anchor distance: 329.95 m
- broad municipal scope covered: false

Decision: **exact_named_strandpromenade_segment_supports_identity_narrowing**

The exact 918.4 m public footway is explicitly named Frognerstranda and matches the documented outer strandpromenade, but it does not cover the full municipal Frognerkilen–Hjortnes/Framnes corridor. Production is supportable only with explicit identity narrowing to the strandpromenade segment.

Run a fresh production batch only with the explicit identity and content-scope constraints recorded here.
