# VisitOSLO Holmenkollen — final scope resolution

Date: 2026-07-21

## Current-main correction

The initial 29-item audit correctly identified Oslo Golfklubb Bogstad as a stable physical place, but that place was concurrently produced and merged through an earlier Holmenkollen workstream before this audit's coordinate intake completed. `oslo_golfklubb_bogstad` is therefore **existing canonical on current main**, merged as Oslo coordinate batch 117 in PR #3121, and must not be recreated.

## Result

All **29 audited source items** have a scope decision.

- **13** stable fixed places already canonical
- **4** sub-attractions resolved to existing parent places
- **11** service/activity/route/event rows resolved as non-place scope
- **1** approved new canonical candidate
- **0** unresolved scope items

The Holmenkollen source is unusually noisy because VisitOSLO mixes museums, arenas and landscape attractions with ski schools, rentals, ticket products, events and activity products. Those commercial/source-presentation rows are not copied into History Go as places.

## Existing canonical fixed places

`skimore_oslo`, `emanuel_vigeland_mausoleum`, `bogstadvannet`, `holmenkollen_kapell`, `korketrekkeren`, `bogstad_gard`, `oslo_golfklubb_bogstad`, `holmenkollen_nasjonalanlegg`, `kollentrollet`, `vettakollen`, `roseslottet`, `gressbanen`, `kragstotten`.

`oslo_golfklubb_bogstad` was merged in PR #3121 as coordinate batch 117 with Ankerveien 127 as the stable display/unlock marker and the 18-hole course as the wider site extent.

## Sub-attractions resolved without new places

- Ski Simulator Holmenkollen → existing Holmenkollen arena/visitor complex.
- Open farm with animals at Bogstad → `bogstad_gard`.
- Skimore Oslo Summer Park → seasonal layer of `skimore_oslo` in this source pass.
- Holmenkollen zipline → activity using `holmenkollen_nasjonalanlegg` infrastructure.

## Non-place source rows

The following source items are services, rentals, coaching products, ticket products, events or routes and do not create canonical places in this pass:

Ski & Guide; Skiglede ski school; Skimore Oslo Ski School; Race up Oslos Bratteste; Green Bike Route from Bogstadvannet to Radiumhospitalet; Bull Superski; Holmenkollen Park Fitness & Spa; XP Coaching; GoSki Oslo; Bike Rental Holmenkollen; Ski Pass at Skimore Oslo.

## Only remaining approved candidate — Skimuseet i Holmenkollen

Proposed id: `holmenkollen_skimuseum`  
Primary category: `historie`

The Ski Museum is a persistent museum institution established in 1923 and located in Holmenkollbakken since the period around the 1952 Olympics. It is physically inside the broader ski-jump complex but has its own institution, collections, visitor entrance and history.

VisitOSLO bundles the museum and jump tower as one visitor product. History Go should not copy that commercial packaging literally:

- `holmenkollen_nasjonalanlegg` already represents the ski-jump/arena scope, including the tower infrastructure.
- `holmenkollen_skimuseum` is the one genuinely missing stable institution/place identity.
- No separate new jump-tower marker is approved.

## Coordinate decision — closed

The candidate is coordinate-ready for production.

- Selected canonical visitor address: **Kongeveien 5, 0787 Oslo**
- Geonorge object: `geonorge-adresser-v1:0301:13850:5`
- Coordinate: `59.96263248232449, 10.666289172703161`
- Alternative documented address: Kongeveien 40
- Separation between the two official address points: 231.8 m

Current visitor-facing VisitOSLO and Holmenkollen/Skiforeningen sources identify Kongeveien 5 for the museum. A Skiforeningen directions page also mentions Kongeveien 40, so the alternate address is retained transparently as an access/complex address rather than silently discarded.

The selected museum marker is 323.3 m from the current `holmenkollen_nasjonalanlegg` anchor. This is expected parent/child proximity, not identity duplication: the museum is a persistent institution with its own collections and visitor identity, while the arena remains the broader sports-infrastructure place.

Final coordinate decision: `reports/visitoslo-holmenkollen-audit-20260721/skimuseum-coordinate-intake-final.json`.

## Final status

**SCOPE CLOSED — 29/29 SOURCE ITEMS RESOLVED, 1 CANDIDATE COORDINATE-READY FOR CANONICAL PRODUCTION.**
