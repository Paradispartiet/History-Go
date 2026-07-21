# VisitOSLO Holmenkollen – canonical coverage closure

Date: 2026-07-21

Scope: the 19 visible results in the bounded VisitOSLO Holmenkollen attraction result set, plus Kragstøtten because VisitOSLO explicitly features it in the page introduction.

## Final status

**Research complete. Coordinate intake complete. Production complete.**

The 19 visible result rows are fully resolved:

- 11 resolve to existing canonical places or to an existing parent place whose physical identity already represents the listed activity or sub-offer.
- 5 became distinct new canonical places.
- 3 are services, courses or event/itinerary products and create no new canonical place.
- 0 visible rows remain unresolved.

In addition, `kragstotten` was approved and produced as a sixth new place because the source page itself explicitly highlights Kragstøtten as a named Holmenkollen landmark outside the 19 visible result cards.

## New canonical places produced — 6/6

### Coordinate batch 115

1. `bogstadvannet`
   - Category: `natur`
   - Exact named lake geometry: `osm-way:4351126`
   - Distinct from `bogstad_gard` and from individual bathing facilities.

2. `holmenkollen_kapell`
   - Category: `by`
   - Geonorge address-first: `geonorge-adresser-v1:0301:13070:142`
   - Public marker: Holmenkollveien 142.

3. `kollentrollet`
   - Category: `kunst`
   - Exact named sculpture point: `osm-node:1768125117`
   - Distinct from `holmenkollen_nasjonalanlegg`.

4. `vettakollen`
   - Category: `natur`
   - Exact 419-metre summit: `osm-node:301173327`
   - Station, stop-area and residential namesakes were explicitly rejected.

5. `kragstotten`
   - Category: `kunst`
   - Exact 1909 memorial statue: `osm-node:484968664`
   - Same-name guidepost and viewpoint objects were explicitly rejected.

### Coordinate batch 117

6. `oslo_golfklubb_bogstad`
   - Category: `sport`
   - Geonorge address-first: `geonorge-adresser-v1:0301:10163:127`
   - Stable display/unlock marker: current clubhouse at Ankerveien 127.
   - The 18-hole course is the wider physical site extent; the address point is not claimed to be the geometric centre of the course.

## Existing canonical or parent resolutions

- Skimore Oslo → `skimore_oslo`
- Ski-simulator Holmenkollen → activity within `holmenkollen_nasjonalanlegg`
- Emanuel Vigelands museum → `emanuel_vigeland_mausoleum`
- Korketrekkeren → `korketrekkeren`
- Bogstad gård → `bogstad_gard`
- Bogstad besøksgård → visitor-farm use layer on `bogstad_gard`; no separate marker from this source alone
- Holmenkollen nasjonalanlegg → `holmenkollen_nasjonalanlegg`
- Holmenkollen skimuseum & hopptårn → museum/tower layer within `holmenkollen_nasjonalanlegg`; no competing marker in this pass
- Skimore Oslo skiskole → activity/service on `skimore_oslo`
- Skimore Oslo - Sommerpark → seasonal/use layer on `skimore_oslo`
- Kollensvevet zipline → activity on `holmenkollen_nasjonalanlegg`

## No new canonical place

- Ski & Guide — mobile/guided service, not a stable independent place.
- Skiglede skiskole — course/service offering, not a separate physical place.
- Løp opp Oslos bratteste — event/activity product rather than a stable independent place.

## Production trail

- Scope closure: PR #3085
- Clean durable coordinate intake: PR #3093
- Five-place production: PR #3104, coordinate batch 115
- Oslo Golfklubb production: PR #3121, coordinate batch 117

The intermediate runner and rebuild PRs were superseded and closed. No approved Holmenkollen candidate remains in the production backlog.

## Closure

The bounded VisitOSLO Holmenkollen source cluster is complete. Future Holmenkollen work should come from a new source, a new completeness pass, or enrichment of existing canonical records rather than reprocessing this closed result set.
