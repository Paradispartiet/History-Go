# VisitOSLO Holmenkollen – canonical coverage scope

Date: 2026-07-21

Scope: the 19 visible results in the current VisitOSLO Holmenkollen attraction result set, plus Kragstøtten because VisitOSLO explicitly features it in the page introduction as a Holmenkollen attraction.

## Result

The 19 visible result rows are fully resolved:

- 11 resolve to existing canonical places or to an existing parent place whose physical identity already represents the listed activity or sub-offer.
- 5 are approved as distinct stable physical-place candidates.
- 3 are services, courses or event/itinerary products and create no new canonical place.
- 0 visible rows remain unresolved.

In addition, `kragstotten` is approved as a sixth candidate because the source page itself explicitly highlights Kragstøtten as a named Holmenkollen landmark, even though it is not one of the 19 visible result cards captured in this bounded snapshot.

## Approved new-place candidates

1. `bogstadvannet`
   - Stable named lake with its own recreational and natural-place identity.
   - It is not the same physical object as `bogstad_gard`; the existing farm record may use the lake as landscape context, but does not represent the lake itself.
   - Next gate: exact named water geometry and Oslo/Bærum boundary-aware representative anchor.

2. `holmenkollen_kapell`
   - Stable church building at Holmenkollveien 142.
   - VisitOSLO documents the 1903 building history and present church use.
   - Next gate: normative Geonorge address-first coordinate intake and duplicate/overlap audit against nearby Holmenkollen places.

3. `oslo_golfklubb_bogstad`
   - Stable named 18-hole golf facility at Bogstad, founded in 1924.
   - Distinct sport facility from `bogstad_gard` and from Bogstadvannet.
   - Next gate: address-first for Ankerveien 127 plus course-geometry/clubhouse role decision.

4. `kollentrollet`
   - Stable named public sculpture at Gratishaugen facing Holmenkollbakken.
   - It is a separate physical artwork, not an activity product of `holmenkollen_nasjonalanlegg`.
   - Next gate: exact named-object geometry or point evidence and physical overlap audit.

5. `vettakollen`
   - Stable named 419-metre hill and viewpoint in Nordmarka.
   - The VisitOSLO row is framed as a hike, but the underlying summit is a durable physical place independent of the itinerary.
   - Next gate: exact summit/topographic anchor and distinction from the residential area and station sharing the name.

6. `kragstotten`
   - Stable named 1909 monument and viewpoint on Voksenkollen, explicitly featured in the VisitOSLO Holmenkollen page introduction.
   - Oslo byleksikon identifies both the statue and the place by this name.
   - Next gate: exact monument point/geometry and identity cross-check.

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

## Next action

Run a combined duplicate and coordinate-intake pass for the six approved candidates only. Addressable concrete places must use Geonorge address-first. Named natural objects, monuments and sculptures must use exact named-object or geometry evidence with identity cross-checks. No other result in this bounded Holmenkollen pass is approved for new-place production.
