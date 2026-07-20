# Oslo museum completeness batch 3 — research audit

Date: 2026-07-20

## Scope

This batch audits three further Oslo cultural institutions surfaced by the independent museum completeness pass:

1. Nobels Fredssenter
2. Kunstnernes Hus
3. Popsenteret

## 1. Nobels Fredssenter

### Existing-place audit

No canonical `nobels_fredssenter` record was found on current `main`, and no dedicated canonical Vestbanestasjonen place was found that already models the same building.

Nearby `radhusplassen`, `aker_brygge` and `nasjonalmuseet` represent different physical places and do not cover the former Vestbanestasjonen building as a museum destination.

### Source basis

Nobels Fredssenter describes itself as the museum of the Nobel Peace Prize. It operates in the former Vestbanestasjonen building from 1872 at Brynjulf Bulls plass 1.

Official sources:
- https://www.nobelpeacecenter.org/om-oss
- https://www.nobelpeacecenter.org/en/about-us/contact-us

### Representation decision

**Create one canonical candidate: `nobels_fredssenter`.**

The record should combine the present museum function with the reuse of the former railway station building, without treating the museum as part of the general `radhusplassen` area marker.

Status: **APPROVED FOR COORDINATE INTAKE.**

Coordinate method: address-first query for `Brynjulf Bulls plass 1 Oslo`, followed by verification that the returned point represents the former Vestbanestasjonen / Nobel Peace Center building.

## 2. Kunstnernes Hus

### Existing-place audit

No canonical `kunstnernes_hus` record was found on current `main`.

The institution is a distinct building and cultural destination at Wergelandsveien 17. Nearby park, palace and city-area records do not represent the same physical site.

### Source basis

Kunstnernes Hus states that it is Norway's oldest artist-governed institution, founded and built by artists and operating continuously since 1930 as a non-profit exhibition venue and meeting place. The building was designed by Gudolf Blakstad and Herman Munthe-Kaas and is a major work of Norwegian modernist architecture.

Official sources:
- https://kunstnerneshus.no/om
- https://kunstnerneshus.no/om/historie

Official visitor address: Wergelandsveien 17, 0167 Oslo.

### Representation decision

**Create one canonical candidate: `kunstnernes_hus`.**

The place has strong independent value across art history, artist organisation, exhibition history and architecture. It should not be reduced to a generic contemporary-art venue.

Status: **APPROVED FOR COORDINATE INTAKE.**

Coordinate method: address-first query for `Wergelandsveien 17 Oslo`, followed by physical verification of the building point.

## 3. Popsenteret

### Current-status audit

Popsenteret's own current website states that the museum is permanently closed from 1 January 2025 and that the doors closed for good on 22 December 2024.

The former visitor address was Trondheimsveien 2, building T, inside the larger Schous complex. History Go already has `schous_bryggeri` as a canonical place for the physical complex, with a verified address anchor at Trondheimsveien 2.

Official sources:
- https://www.popsenteret.no/
- https://www.popsenteret.no/nyheter/popsenteret-avvikles

### Representation decision

**Do not create Popsenteret as a new active canonical place.**

The museum is no longer a visitable active destination and the physical complex is already represented by `schous_bryggeri`. Until History Go has an explicit closed/historical-venue model, the correct representation is to retain Popsenteret as a documented later-use layer of the Schous complex rather than create a misleading active marker.

Status: **NO NEW ACTIVE MARKER; ENRICH EXISTING `schous_bryggeri`.**

## Batch result

| Candidate | Decision |
| --- | --- |
| Nobels Fredssenter | New canonical candidate; coordinate intake |
| Kunstnernes Hus | New canonical candidate; coordinate intake |
| Popsenteret | Permanently closed; no new active marker; represent as later-use layer under `schous_bryggeri` |

This batch produces two strong new canonical candidates and one duplicate/current-status rejection.
