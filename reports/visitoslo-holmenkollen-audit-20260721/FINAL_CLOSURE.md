# VisitOSLO Holmenkollen — final source closure

Date: 2026-07-21

Source: https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/omraader/holmenkollen/attraksjoner/

## Final status

The bounded VisitOSLO Holmenkollen audit is **closed**.

- Audited source items: **29**
- Source items resolved: **29 / 29**
- Fixed canonical place identities represented: **14**
- Sub-attractions resolved to existing parent places: **4**
- Service/activity/route/event rows resolved as non-place scope: **11**
- New canonical places produced during the closure chain: **2**
- Unresolved scope items: **0**
- Unresolved coordinate decisions: **0**
- Remaining canonical gaps: **0**

The source page mixes durable physical places with commercial services, ski schools, rentals, ticket products, routes and event products. The closure therefore counts every source item, but only stable physical identities become History Go places.

## Fixed canonical coverage

The following source items resolve to canonical places:

- Skimore Oslo → `skimore_oslo`
- Emanuel Vigeland Museum → `emanuel_vigeland_mausoleum`
- Bogstadvannet lake → `bogstadvannet`
- Holmenkollen Chapel → `holmenkollen_kapell`
- Toboggan run: Korketrekkeren → `korketrekkeren`
- Bogstad Manor → `bogstad_gard`
- Oslo Golf Club Bogstad → `oslo_golfklubb_bogstad`
- Holmenkollen National Ski Arena → `holmenkollen_nasjonalanlegg`
- The Holmenkollen Troll → `kollentrollet`
- Holmenkollen Ski Museum & Tower → `holmenkollen_skimuseum` + existing `holmenkollen_nasjonalanlegg`
- Hike to Vettakollen → `vettakollen`
- Rose Castle → `roseslottet`
- Gressbanen → `gressbanen`
- Kragstøtten → `kragstotten`

The Ski Museum & Tower row intentionally resolves to two already-separated physical/institutional scales: the museum is its own persistent institution, while the jump tower remains part of the broader national ski arena place.

## Sub-attractions resolved without new canonical places

- Ski Simulator Holmenkollen → `holmenkollen_nasjonalanlegg`
- Open farm with animals at Bogstad → `bogstad_gard`
- Skimore Oslo Summer Park → `skimore_oslo`
- Holmenkollen zipline → `holmenkollen_nasjonalanlegg`

These rows describe activities or facilities inside broader existing place identities and did not justify duplicate or overlapping markers in this source pass.

## Non-place source rows

The following source items were audited and deliberately excluded from canonical place production because they are services, rentals, coaching products, routes, events or ticket products:

Ski & Guide; Skiglede ski school; Skimore Oslo Ski School; Race up Oslos Bratteste; Green Bike Route from Bogstadvannet to Radiumhospitalet; Bull Superski; Holmenkollen Park Fitness & Spa; XP Coaching; GoSki Oslo; Bike Rental Holmenkollen; Ski Pass at Skimore Oslo.

## New canonical production in the closure chain

### Oslo Golfklubb Bogstad

- canonical id: `oslo_golfklubb_bogstad`
- merged in PR #3121
- Oslo coordinate batch 117
- produced by a concurrent earlier Holmenkollen workstream and therefore reclassified as existing canonical in the corrected final scope audit

### Skimuseet i Holmenkollen

- canonical id: `holmenkollen_skimuseum`
- merged in PR #3148
- Oslo coordinate batch 120
- primary category: `historie`
- selected visitor address: **Kongeveien 5, 0787 Oslo**
- coordinate source: `geonorge-adresser-v1:0301:13850:5`
- coordinate: `59.96263248232449, 10.666289172703161`

The source set contained a real address conflict. Current visitor-facing museum sources identify Kongeveien 5, while a Skiforeningen directions page also mentions Kongeveien 40. Both addresses were resolved through Geonorge. Kongeveien 40 lies 231.8 metres from the selected museum marker and remains documented as an alternate access/complex address in coordinate evidence.

The museum's physical proximity to `holmenkollen_nasjonalanlegg` is intentional parent/child overlap rather than identity duplication. No separate jump-tower marker was created.

## Audit chain

1. PR #3127 — initial 29-item source/scope resolution.
2. PR #3139 — current-main correction after Oslo Golfklubb was concurrently merged.
3. PR #3145 — final corrected Ski Museum coordinate intake and address-conflict resolution.
4. PR #3148 — canonical Ski Museum production as Oslo coordinate batch 120.

## Durable rules

- Marketing-page inclusion does not make a service or activity a canonical place.
- Parent/child physical overlap is allowed when the child is a persistent independently documented institution or place identity.
- Commercial product bundling does not determine canonical place boundaries.
- The jump tower remains part of `holmenkollen_nasjonalanlegg`.
- The Ski Museum remains a separate canonical museum identity.
- Address conflicts must remain visible in evidence instead of being silently overwritten.

Status: **SOURCE CLOSED — 29/29 RESOLVED, 0 GAPS.**
