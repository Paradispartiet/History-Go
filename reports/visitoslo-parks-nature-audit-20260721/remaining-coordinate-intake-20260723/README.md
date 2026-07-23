# VisitOSLO parks/nature — remaining coordinate revalidation

Date: 2026-07-23

The six unproduced candidates are revalidated against the exact OSM object IDs captured in intake PR #3146 and against current canonical runtime data. No nearest/first-hit selection is allowed.

| placeId | Status | Locked object | Representation point | Type | Canonical places within 50 m |
|---|---|---|---|---|---|
| lillomarka | verified_locked_object_candidate | osm-relation:5806405 | 60.0056538, 10.8585573 | woodland | — |
| grorudparken | verified_locked_object_candidate | osm-way:125848624 | 59.9576727, 10.8755562 | park | — |
| aamot_bru | verified_locked_object_candidate | osm-way:791117473 | 60.0185966, 10.615812 | bridge | — |
| klosterenga_skulpturpark | verified_locked_object_candidate | osm-way:4874898 | 59.9082666, 10.7761761 | park | — |
| brekkedammen | locked_object_needs_recreation_scope_anchor_decision | osm-way:66357555 | 59.9667474, 10.7767656 | weir | frysja_33_brekke_kraftstasjon (25.2 m) |
| peer_gynt_parken | verified_locked_object_candidate | osm-way:126850692 | 59.9319086, 10.7922952 | park | — |

Brekkedammen is intentionally held to a separate recreation-scope anchor decision because the locked named OSM object is a weir; it is valid evidence for the place identity but does not automatically represent the full VisitOSLO bathing/recreation site.
