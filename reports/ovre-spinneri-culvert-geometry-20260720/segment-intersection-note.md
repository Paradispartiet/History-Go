# Øvre Spinneri — corrected culvert/building intersection

Date: 2026-07-20

The first culvert pass only checked whether culvert geometry vertices fell inside building polygons. That is insufficient when both tunnel endpoints sit outside a building while the connecting segment passes underneath it. This correction performs true line-segment/polygon-edge intersection tests.

Decision: **no_unique_geometry_candidate**

Found 0 building polygons intersecting OSM culvert way 116542040; geometry alone does not yet identify one unique building.
