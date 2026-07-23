# VisitOSLO Galleries — curated priority tranche scope resolution

Date: 2026-07-23

Source: VisitOSLO's current `Kunsthovedstaden` article, section `Flere kunstgallerier`.

## Boundary

This closes a bounded **13-item official VisitOSLO editorial gallery tranche**. It does **not** close the full client-rendered VisitOSLO Galleries category, which could not be captured reproducibly from GitHub Actions because direct source discovery was blocked. Failed technical discovery PR #3433 remains the audit trail for that limitation.

## Result

- 13/13 source items classified
- 5 existing canonical places
- 4 private/commercial galleries deferred under the existing gallery policy
- 3 approved new institutional candidates
  - 2 coordinate-ready: `kunstnerforbundet`, `fotogalleriet`
  - 1 coordinate-blocked: `soft_galleri`
- 1 institution resolved to an existing physical parent with a required content enrichment
- 0 unresolved scope decisions
- full VisitOSLO Galleries-category completeness: **not claimed**

## Existing canonical coverage

- Fotografiens Hus → `fotografiens_hus`
- Kunsthall Oslo → `kunsthall_oslo`
- VI, VII → `vi_vii_gallery`
- KÖSK → `kosk_oslo`
- Van Etten → `van_etten`

## Commercial/private gallery deferrals

The existing Oslo gallery policy remains binding. These listings are not automatic canonical gaps:

- Fineart Oslo — already explicitly deferred in prior source closures.
- Galleri Haaken — already explicitly deferred in the Aker Brygge/Tjuvholmen closure.
- Galleri K — deferred pending a consistent commercial-gallery framework.
- Buer Gallery — deferred pending the same framework.

The framework must be applied consistently and should consider longevity, independent place identity, cultural significance and coordinate stability. A venue is not approved merely because VisitOSLO lists it.

## Approved institutional candidate — Kunstnerforbundet

Canonical id: `kunstnerforbundet`  
Primary category: `kunst`  
Status: **scope approved and coordinate-ready**

Kunstnerforbundet is a durable, artist-run and non-commercial exhibition and mediation institution established in 1910. It has occupied Kjeld Stubs gate 3 since 1917 and owns the building, which contains exhibition spaces, mediation rooms, art storage, offices and artist studios.

Coordinate decision:

- Kjeld Stubs gate 3, 0160 Oslo
- `59.91286247033279, 10.735585135946035`
- `geonorge-adresser-v1:0301:13743:3`
- no canonical identity match
- no existing canonical marker within 35 metres

Decision: ready for canonical production after one final current-main duplicate gate.

## Approved institutional candidate — Fotogalleriet

Canonical id: `fotogalleriet`  
Primary category: `kunst`  
Status: **scope approved and coordinate-ready**

Fotogalleriet is a persistent non-commercial photographic art institution founded in 1977, with a national/international exhibition and mediation role and current main premises published as Møllergata 34.

The unlettered address initially created a real coordinate ambiguity because Geonorge exposes four official address objects, 34A–D. Fotogalleriet's own visit page links to one concrete Google Maps place. That institution-provided map link was used **only as disambiguation evidence** between the four official Geonorge candidates.

The place coordinate encoded by Fotogalleriet's own map link is 0.4 metres from Møllergata 34A, while the second-nearest official address point is 17.7 metres farther away. The canonical coordinate source therefore remains the uniquely selected official Geonorge address object:

- Møllergata 34A, 0179 Oslo
- `59.917455556790614, 10.750260519179827`
- `geonorge-adresser-v1:0301:14943:34A`

Google Maps is not used as the canonical coordinate source. It only resolves which official Geonorge address object the institution's own map link identifies.

Decision: ready for canonical production after one final current-main duplicate gate.

## Approved institutional candidate — SOFT galleri

Canonical id: `soft_galleri`  
Primary category: `kunst`  
Status: **scope approved; coordinate blocked**

SOFT galleri is a persistent textile-art gallery founded in 2006 and operated by Norske Tekstilkunstnere. It has its own exhibition programme, public visitor function and dedicated exhibition space at Rådhusgata 20. The institution also describes a corner entrance and a dedicated 33 m² exhibition room.

The ordinary address point is:

- `59.90951628354778, 10.74209892031479`
- `geonorge-adresser-v1:0301:16115:20`

That is exactly the same display marker already used by `fotografiens_hus`. A dedicated exact-name OSM search for SOFT galleri found no separate gallery or arts object. The existing Fotografiens Hus record is institution-specific rather than a general building parent, so SOFT should not be absorbed into that institution, but two different institutions must not be placed at the exact same point without separate physical evidence.

Decision: approved institutional gap, but production remains blocked until a distinct entrance/visitor point or other stable non-duplicate physical anchor is documented.

## Parent reuse — Oslo Kunstforening

Source item: Oslo Kunstforening  
Physical parent: `radmannsgarden_og_anatomibygget`  
Decision: **no new marker; enrich existing parent**

Oslo Kunstforening is a non-commercial membership institution founded in 1836 and has occupied the second floor of Rådmannsgården since 1936. Its exact current visitor-address point at Rådhusgata 19 is identical to the existing canonical `radmannsgarden_og_anatomibygget` marker:

- `59.91014146776003, 10.740325400685213`
- `geonorge-adresser-v1:0301:16115:19`

The existing parent record explicitly uses one shared marker to avoid overlapping place records on the same cultural-historical property. Oslo Kunstforening should therefore be added as a current institutional/use layer of Rådmannsgården, with its own sourced history in the parent content, rather than duplicated as another map marker.

## Next production work

1. Produce `kunstnerforbundet` and `fotogalleriet` after final current-main duplicate checks.
2. Enrich `radmannsgarden_og_anatomibygget` with Oslo Kunstforening's current use and institutional history without changing its coordinate.
3. Keep `soft_galleri` coordinate-blocked until a separate physical visitor/entrance anchor is documented.
4. Keep the full VisitOSLO Galleries category open until a reproducible complete source snapshot is available.

Status: **CURATED PRIORITY TRANCHE SCOPE CLOSED — 13/13 CLASSIFIED; TWO PRODUCTION-READY, ONE COORDINATE-BLOCKED; FULL GALLERY CATEGORY REMAINS OPEN.**
