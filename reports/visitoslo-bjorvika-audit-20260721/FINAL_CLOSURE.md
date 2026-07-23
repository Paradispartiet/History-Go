# VisitOSLO Bjørvika — final source closure

Date: 2026-07-23

Scope: first 30 visible VisitOSLO Bjørvika results captured in the 2026-07-21 audit.

## Final status

The bounded Bjørvika audit is **closed**.

- Source entries: **30**
- Resolved: **30 / 30**
- Existing or parent-place resolutions: **12**
- New canonical places produced: **4**
- No-new-place retail/service/mobile/itinerary/seasonal rows: **14**
- Unresolved scope decisions: **0**
- Unresolved coordinate decisions: **0**
- Remaining canonical gaps: **0**

## New canonical production

| placeId | Category | Oslo coordinate batch | Coordinate source |
|---|---|---:|---|
| `sukkerbiten_badstulandsby` | `by` | 108 | `geonorge-adresser-v1:0301:15256:28` |
| `losaeter` | `by` | 109 | `osm-way:172520783` |
| `friluftshuset_sorenga` | `sport` | 110 | `geonorge-adresser-v1:0301:21549:124` |
| `operastranda` | `sport` | 111 | `osm-way:936040800` |

All four were merged in PR #3080 after the full coordinate/index/evidence gate chain passed.

## Durable existing/parent resolutions

The audit reuses existing canonical identities including `salt`, `deichman_bjorvika`, `munch_museet`, `bjorvika`, `operahuset`, `sorenga_sjobad`, `barcode`, `kosk_oslo` and `flop_museum` where the VisitOSLO source rows do not define a separate persistent physical place.

## Representation locks

- `sukkerbiten_badstulandsby` represents one stable sauna-village site at Sukkerbiten. Individual sauna units and other Oslo Badstuforening locations are not copied into overlapping markers from this source.
- `losaeter` represents the exact named Losæter place, not a generic Sørenga/Bjørvika proxy.
- `friluftshuset_sorenga` represents DNT's concrete institution/activity centre at Sørengkaia 124, separate from Sørenga sjøbad and the broader Sørenga area.
- `operastranda` represents the exact named municipal beach and remains distinct from both the broad Bjørvika anchor and Sørenga sjøbad.

## Audit chain

1. PR #3057 — physical/source scope closed: 30/30 rows classified, four stable production candidates approved, zero unresolved scope decisions.
2. PR #3080 — all four approved candidates produced and validated as Oslo coordinate batches 108–111.

Status: **SOURCE CLOSED — 30/30 RESOLVED, 0 GAPS.**
