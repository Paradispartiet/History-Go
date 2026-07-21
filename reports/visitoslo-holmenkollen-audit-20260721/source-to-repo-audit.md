# VisitOSLO Holmenkollen — source-to-repo audit

Date: 2026-07-21

Source: https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/omraader/holmenkollen/attraksjoner/

Audited source items: **29** (28 visible result cards + Kragstøtten from the source introduction).

The Holmenkollen source page mixes stable physical places with commercial services, activities, event products, routes and sub-attractions. This audit classifies scope before considering canonical gaps.

## Scope summary

```json
{
  "fixed_place_candidate": 14,
  "sub_attraction_or_parent_scope": 4,
  "service_or_activity": 9,
  "route_or_event": 2
}
```

## Machine status summary

```json
{
  "candidate_exact_or_alias_match": 12,
  "candidate_resolved_to_parent_scope": 4,
  "unresolved_fixed_place_candidate": 2,
  "non_place_scope_no_production": 11
}
```

| # | Source item | Scope class | Machine status | Exact/alias canonical hits | Parent hits | Top fuzzy review candidates |
|---|---|---|---|---|---|---|
| 1 | Skimore Oslo | fixed_place_candidate | candidate_exact_or_alias_match | `skimore_oslo` | — | skimore_oslo (1); oslo_s (0.5); oslo_bussterminal (0.333); oslo_domkirke (0.333) |
| 2 | Ski Simulator Holmenkollen | sub_attraction_or_parent_scope | candidate_resolved_to_parent_scope | — | `holmenkollen_nasjonalanlegg` | ski_middelalderkirke (0.25); holmenkollen_nasjonalanlegg (0.25); folkeobservatoriet_holmenkollen (0.25); holmenkollen_kapell (0.25) |
| 3 | Emanuel Vigeland Museum | fixed_place_candidate | candidate_exact_or_alias_match | `emanuel_vigeland_mausoleum` | — | emanuel_vigeland_mausoleum (0.4); folkenborg_museum (0.25); dagali_museum (0.25); bygland_museum (0.25) |
| 4 | Bogstadvannet lake | fixed_place_candidate | candidate_exact_or_alias_match | `bogstadvannet` | — | bogstadvannet (0.5) |
| 5 | Holmenkollen Chapel | fixed_place_candidate | candidate_exact_or_alias_match | `holmenkollen_kapell` | — | holmenkollen_nasjonalanlegg (0.333); folkeobservatoriet_holmenkollen (0.333); holmenkollen_kapell (0.333) |
| 6 | Toboggan run: Korketrekkeren | fixed_place_candidate | candidate_exact_or_alias_match | `korketrekkeren` | — | korketrekkeren (0.333) |
| 7 | Bogstad Manor | fixed_place_candidate | candidate_exact_or_alias_match | `bogstad_gard` | — | bogstad_gard (0.333) |
| 8 | Open farm with animals at Bogstad | sub_attraction_or_parent_scope | candidate_resolved_to_parent_scope | — | `bogstad_gard` | bogstad_gard (0.167) |
| 9 | Oslo Golf Club Bogstad | fixed_place_candidate | unresolved_fixed_place_candidate | — | — | oslo_s (0.25); oslo_bussterminal (0.2); bogstad_gard (0.2); oslo_domkirke (0.2) |
| 10 | Holmenkollen National Ski Arena | fixed_place_candidate | candidate_exact_or_alias_match | `holmenkollen_nasjonalanlegg` | — | ski_middelalderkirke (0.2); intility_arena (0.2); holmenkollen_nasjonalanlegg (0.2); kfum_arena (0.2) |
| 11 | The Holmenkollen Troll | fixed_place_candidate | candidate_exact_or_alias_match | `kollentrollet` | — | holmenkollen_nasjonalanlegg (0.25); the_villa (0.25); folkeobservatoriet_holmenkollen (0.25); holmenkollen_kapell (0.25) |
| 12 | Ski & Guide | service_or_activity | non_place_scope_no_production | — | — | ski_middelalderkirke (0.333) |
| 13 | Skiglede ski school | service_or_activity | non_place_scope_no_production | — | — | ski_middelalderkirke (0.25) |
| 14 | Holmenkollen Ski Museum & Tower | fixed_place_candidate | unresolved_fixed_place_candidate | — | — | ski_middelalderkirke (0.2); folkenborg_museum (0.2); dagali_museum (0.2); bygland_museum (0.2) |
| 15 | Skimore Oslo Ski School | service_or_activity | non_place_scope_no_production | — | `skimore_oslo` | skimore_oslo (0.5); oslo_s (0.25); oslo_bussterminal (0.2); oslo_domkirke (0.2) |
| 16 | Skimore Oslo - Summer Park | sub_attraction_or_parent_scope | candidate_resolved_to_parent_scope | — | `skimore_oslo` | skimore_oslo (0.5); oslo_s (0.25); st_hanshaugen_park (0.2); oslo_bussterminal (0.2) |
| 17 | Holmenkollen zipline | sub_attraction_or_parent_scope | candidate_resolved_to_parent_scope | — | `holmenkollen_nasjonalanlegg` | holmenkollen_nasjonalanlegg (0.333); folkeobservatoriet_holmenkollen (0.333); holmenkollen_kapell (0.333) |
| 18 | Race up Oslos Bratteste | route_or_event | non_place_scope_no_production | — | — | — |
| 19 | Hike to Vettakollen | fixed_place_candidate | candidate_exact_or_alias_match | `vettakollen` | — | vettakollen (0.5) |
| 20 | Green Bike Route: Bogstadvannet Lake to Radiumhospitalet | route_or_event | non_place_scope_no_production | — | — | radiumhospitalet (0.167); bogstadvannet (0.167) |
| 21 | Rose Castle | fixed_place_candidate | candidate_exact_or_alias_match | `roseslottet` | — | — |
| 22 | Bull Superski Shop, ski school and ski rental at Holmenkollen | service_or_activity | non_place_scope_no_production | — | — | ski_middelalderkirke (0.111); holmenkollen_nasjonalanlegg (0.111); folkeobservatoriet_holmenkollen (0.111); holmenkollen_kapell (0.111) |
| 23 | Holmenkollen Park Fitness & Spa | service_or_activity | non_place_scope_no_production | — | — | st_hanshaugen_park (0.2); holmenkollen_nasjonalanlegg (0.2); folkeobservatoriet_holmenkollen (0.2); holmenkollen_kapell (0.2) |
| 24 | XP Coaching | service_or_activity | non_place_scope_no_production | — | — | — |
| 25 | GoSki Oslo | service_or_activity | non_place_scope_no_production | — | — | oslo_s (0.5); oslo_bussterminal (0.333); oslo_domkirke (0.333); oslo_ladegard (0.333) |
| 26 | Bike Rental Holmenkollen | service_or_activity | non_place_scope_no_production | — | — | holmenkollen_nasjonalanlegg (0.25); folkeobservatoriet_holmenkollen (0.25); holmenkollen_kapell (0.25) |
| 27 | Ski Pass at Skimore Oslo, Tryvann | service_or_activity | non_place_scope_no_production | — | `skimore_oslo` | skimore_oslo (0.4); oslo_s (0.2); oslo_bussterminal (0.167); oslo_domkirke (0.167) |
| 28 | Gressbanen | fixed_place_candidate | candidate_exact_or_alias_match | `gressbanen` | — | gressbanen (1) |
| 29 | Kragstøtten | fixed_place_candidate | candidate_exact_or_alias_match | `kragstotten` | — | kragstotten (1) |

## Review gate

Only rows with `unresolved_fixed_place_candidate`, multiple identity matches, or unresolved sub-attraction scope require manual review. Rows classified as services/activities/routes/events are source-resolved as non-place scope unless independent research proves a distinct stable physical identity.
