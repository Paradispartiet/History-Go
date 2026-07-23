# VisitOSLO Galleries — curated priority tranche production status

Date: 2026-07-23

Source: VisitOSLO's current `Kunsthovedstaden` article, section `Flere kunstgallerier`.

## Boundary

This report closes production status for the bounded **13-item official VisitOSLO editorial gallery tranche**. It does **not** claim completeness or closure of the full client-rendered VisitOSLO Galleries category.

## Final tranche status

- Source items: **13**
- Scope-resolved: **13 / 13**
- Existing canonical places: **5**
- Private/commercial gallery deferrals: **4**
- New canonical places produced: **2**
- Parent reuse/enrichment completed: **1**
- Approved coordinate-blocked backlog: **1**
- Unresolved scope decisions: **0**
- Full VisitOSLO Galleries category closed: **no**

## Existing canonical coverage

- `fotografiens_hus`
- `kunsthall_oslo`
- `vi_vii_gallery`
- `kosk_oslo`
- `van_etten`

## Private/commercial gallery deferrals

The existing gallery policy remains binding for:

- Fineart Oslo
- Galleri Haaken
- Galleri K
- Buer Gallery

These are not treated as missing canonical places merely because they appear in a VisitOSLO gallery guide.

## New canonical production

### Fotogalleriet

- canonical id: `fotogalleriet`
- category: `kunst`
- canonical year: `1977`
- Oslo coordinate batch: **167**
- merged in PR #3472
- coordinate: `59.917455556790614, 10.750260519179827`
- coordinate source: `geonorge-adresser-v1:0301:14943:34A`

Fotogalleriet publishes the unlettered address Møllergata 34. Geonorge exposes four official address objects, 34A–D. Fotogalleriet's own map link was used only to disambiguate those official candidates: it resolves 0.4 metres from 34A, with a 17.7 metre margin to the second-nearest candidate. The applied coordinate source remains Geonorge, not Google Maps.

### Kunstnerforbundet

- canonical id: `kunstnerforbundet`
- category: `kunst`
- canonical year: `1910`
- Oslo coordinate batch: **168**
- merged in PR #3476
- coordinate: `59.91286247033279, 10.735585135946035`
- coordinate source: `geonorge-adresser-v1:0301:13743:3`

The place represents the durable artist-run, non-commercial institution in its own Kjeld Stubs gate 3 building. Temporary exhibitions remain content layers rather than separate places.

## Parent reuse completed — Oslo Kunstforening

Oslo Kunstforening did not receive a duplicate marker.

- institution: Oslo Kunstforening
- physical parent: `radmannsgarden_og_anatomibygget`
- enrichment merged in PR #3468

The parent record now includes Oslo Kunstforening as the current institutional/use layer, including the 1836 founding and continuous presence in Rådmannsgården since 1936. The existing Rådhusgata 19 coordinate is unchanged.

## Remaining approved backlog — SOFT galleri

`soft_galleri` is institutionally approved as a new canonical candidate but remains **coordinate-blocked**.

The ordinary Rådhusgata 20 address point is exactly the same marker already used by `fotografiens_hus`:

- `59.90951628354778, 10.74209892031479`
- `geonorge-adresser-v1:0301:16115:20`

SOFT documents its own corner entrance and dedicated 33 m² exhibition room, so it should not be absorbed into Fotografiens Hus as an institution. However, an exact-name OSM search found no separate SOFT gallery object, and no authoritative distinct entrance coordinate is currently available. History Go must therefore not create two institution markers at the exact same point.

Status: **approved institutional backlog; production blocked until a distinct authoritative physical anchor is documented.**

## Audit and production chain

1. PR #3448 — 13-item curated priority tranche scope closure.
2. PR #3466 — Fotogalleriet official-address disambiguation and updated scope status.
3. PR #3468 — Oslo Kunstforening enrichment on the existing Rådmannsgården parent.
4. PR #3472 — Fotogalleriet canonical production, batch 167.
5. PR #3476 — Kunstnerforbundet canonical production, batch 168.

## Durable boundary

The currently producible work from this 13-item editorial tranche is complete. One approved candidate, SOFT galleri, remains in a coordinate-only backlog.

The **full VisitOSLO Galleries category remains open** because the client-rendered category has not yet been captured as a reproducible complete source snapshot. Future full-category work must begin from such a snapshot, or from an explicitly bounded delta source, rather than treating this 13-item editorial tranche as the whole category.

Status: **PRIORITY TRANCHE PRODUCTION CLOSED FOR ALL CURRENTLY PRODUCIBLE OUTCOMES — ONE APPROVED COORDINATE BACKLOG; FULL GALLERY CATEGORY REMAINS OPEN.**
