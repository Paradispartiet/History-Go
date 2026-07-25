# Oslo historical coordinate research — final review

Research only. No canonical coordinates were changed in this PR.

## Accepted for production

1. `clemenskirken` — exact named `historic=ruins` polygon, OSM way 111548139; 59.904283742857146, 10.765706257142856; radius 60 m.
2. `hallvardskatedralen` — published historical locator point; 59.905903, 10.768789; radius 80 m. The reverse result for Olavsklosteret was rejected.
3. `kongsgarden_middelalder_oslo` — published historical locator point; 59.903528, 10.76321; radius 80 m. The information-board node was rejected as the canonical source object.
4. `korskirken` — exact named `historic=ruins` polygon, OSM way 262320927; 59.90700859166666, 10.76957349166667; radius 60 m.
5. `mariakirken` — exact named `historic=ruins` polygon, OSM way 257875433; 59.90346038983052, 10.762135864406781; radius 70 m.
6. `olavsklosteret` — exact named `historic=ruins` polygon, OSM way 1286772112; 59.90637496206896, 10.768813068965517; radius 80 m.
7. `tukthuset` — historical Storgata 33 anchor; 59.9146165881438, 10.753026513871012; radius 140 m. The current address point is explicitly a historical approximation for the demolished complex.

## Blocked as `needs_source`

- `anatomigarden`: the published point does not resolve to a defensible physical object; Rådmannsgården's main building must not stand in for Anatomibygget.
- `bispeborgen`: the identity is confirmed, but the reproducible locator source is unavailable and reverse lookup returns Ladegården rather than Bispeborgen.

The machine-readable decisions, source URLs and rejected mismatched objects are recorded in `final-decisions.json`.
