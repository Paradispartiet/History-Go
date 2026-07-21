# VisitOSLO Holmenkollen — final scope resolution

Date: 2026-07-21

## Result

All **29 audited source items** now have a scope decision.

- **12** stable fixed places already canonical
- **4** sub-attractions resolved to existing parent places
- **11** service/activity/route/event rows resolved as non-place scope
- **2** approved new canonical candidates
- **0** unresolved scope items

The Holmenkollen source is unusually noisy because VisitOSLO mixes museums, arenas and landscape attractions with ski schools, rentals, ticket products, events and activity products. Those commercial/source-presentation rows are not copied into History Go as places.

## Existing canonical fixed places

`skimore_oslo`, `emanuel_vigeland_mausoleum`, `bogstadvannet`, `holmenkollen_kapell`, `korketrekkeren`, `bogstad_gard`, `holmenkollen_nasjonalanlegg`, `kollentrollet`, `vettakollen`, `roseslottet`, `gressbanen`, `kragstotten`.

## Sub-attractions resolved without new places

- Ski Simulator Holmenkollen → existing Holmenkollen arena/visitor complex.
- Open farm with animals at Bogstad → `bogstad_gard`.
- Skimore Oslo Summer Park → seasonal layer of `skimore_oslo` in this source pass.
- Holmenkollen zipline → activity using `holmenkollen_nasjonalanlegg` infrastructure.

## Non-place source rows

The following source items are services, rentals, coaching products, ticket products, events or routes and do not create canonical places in this pass:

Ski & Guide; Skiglede ski school; Skimore Oslo Ski School; Race up Oslos Bratteste; Green Bike Route from Bogstadvannet to Radiumhospitalet; Bull Superski; Holmenkollen Park Fitness & Spa; XP Coaching; GoSki Oslo; Bike Rental Holmenkollen; Ski Pass at Skimore Oslo.

## Approved new candidate 1 — Oslo Golfklubb på Bogstad

Proposed id: `oslo_golfklubb_bogstad`  
Primary category: `sport`

Oslo Golfklubb documents a stable, separately identifiable golf facility at Bogstad. The club was founded in 1924 and the course opened the same year. The current 18-hole course is a large physical facility beside Bogstadvannet and Bogstad Manor, but is not part of the manor's canonical identity.

Coordinate rule: resolve the exact named golf-course/facility geometry. Do not use `bogstad_gard`, Bogstadvannet or a generic Bogstad point as proxy.

## Approved new candidate 2 — Skimuseet i Holmenkollen

Proposed id: `holmenkollen_skimuseum`  
Primary category: `historie`

The Ski Museum is a persistent museum institution established in 1923 and located in Holmenkollbakken since the period around the 1952 Olympics. It is physically inside the broader ski-jump complex but has its own institution, collections, visitor entrance and history.

VisitOSLO bundles the museum and jump tower as one visitor product. History Go should not copy that commercial packaging literally:

- `holmenkollen_nasjonalanlegg` already represents the ski-jump/arena scope, including the tower infrastructure.
- `holmenkollen_skimuseum` is the one genuinely missing stable institution/place identity.
- No separate new jump-tower marker is approved.

Coordinate rule: resolve the exact museum entrance/building identity at Kongeveien 40 where possible, and explicitly audit overlap against `holmenkollen_nasjonalanlegg` before production.

## Final status

**SCOPE CLOSED — 29/29 SOURCE ITEMS RESOLVED, 2 CANDIDATES READY FOR COORDINATE INTAKE.**
