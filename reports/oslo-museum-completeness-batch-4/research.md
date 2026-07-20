# Oslo museum completeness batch 4 — research audit

Date: 2026-07-20

## Scope

This batch audits:

1. Vigelandmuseet
2. IBSEN Museum & Teater
3. Oslo Skolemuseum / Møllergata skole

The physical-place-first rule is applied before deciding the final canonical IDs.

## 1. Vigelandmuseet

### Existing-place audit

History Go already has `vigelandsparken`, but this is explicitly modeled as a park/area anchor on the central sculpture axis. The canonical record states that it is not a coordinate for one individual object and distinguishes the park as a combined sculpture and public-space complex.

Vigelandmuseet is a separate protected museum building south of the park at Nobels gate 32. It was built as Gustav Vigeland's studio, workplace and home and later became a museum. The museum is physically and functionally distinct from the outdoor park even though the two institutions and collections are closely connected.

### Source basis

Official Vigeland Museum sources:
- https://vigeland.museum.no/besoksinformasjon
- https://vigeland.museum.no/vigeland-museet/kontakt

Official visitor address: Nobels gate 32, 0268 Oslo.

### Representation decision

**Create one canonical candidate: `vigelandmuseet`.**

Do not merge the museum into `vigelandsparken`. Link the two as related places once the museum record exists.

Status: **APPROVED FOR COORDINATE INTAKE.**

Coordinate method: address-first query for `Nobels gate 32 Oslo`, followed by verification of the museum building point.

## 2. IBSEN Museum & Teater

### Existing-place audit

No canonical Ibsen museum / Arbins gate home record was found on current `main`.

The current institution's main attraction is Henrik and Suzannah Ibsen's final home. They lived in the apartment in Arbins gate from 1895 to 1906, and Ibsen wrote his final two plays there. The museum reopened in its expanded museum-and-theatre form in 2023.

The current official visitor entrance is Henrik Ibsens gate 26, while the historic apartment itself is identified as Arbins gate 1. This distinction must be retained in the coordinate evidence and place description rather than collapsed into an imprecise generic point.

### Source basis

Official IBSEN Museum & Teater sources:
- https://ibsenmt.no/om-oss
- https://ibsenmt.no/fra-dramatikerhjem-til-museum
- https://ibsenmt.no/en/plan-your-visit

Current visitor address: Henrik Ibsens gate 26, 0255 Oslo.
Historic home/apartment: Arbins gate 1.

### Representation decision

**Create one canonical candidate: `ibsen_museum_teater`.**

The record should center the actual Ibsen home and its museum/theatre continuation. Coordinate evidence must explicitly distinguish the public entrance from the historical apartment address.

Status: **APPROVED FOR COORDINATE INTAKE WITH ENTRANCE/HISTORIC-SITE REVIEW.**

Coordinate method: run the normative address-first flow for the current visitor entrance and inspect the geometry/address relationship to Arbins gate 1 before selecting the final display marker.

## 3. Oslo Skolemuseum / Møllergata skole

### Existing-place audit

No canonical `oslo_skolemuseum` or `mollergata_skole` record was found on current `main`.

Oslo Skolemuseum occupies the old headmaster's residence / building D at Møllergata school. The wider school site is independently historically significant: the school opened in 1861 and is described by the school itself as Oslo's oldest municipally built school and Norway's first modern public school. The museum has occupied part of the complex since 2000.

The museum is closed during summer 2026, but its official current site states that an earlier decision to discontinue it has been reversed and that operations will continue, with autumn activity being prepared. It must therefore not be classified as permanently closed.

### Source basis

Official sources:
- https://skolemuseum.osloskolen.no/
- https://skolemuseum.osloskolen.no/oslo-skolemuseum/kontakt-oss/
- https://mollergata.osloskolen.no/om-skolen/om-oss/skolens-historie/

Visitor address: Møllergata skole, Møllergata 49, 0179 Oslo.

### Representation decision

**Create one canonical candidate: `mollergata_skole`.**

Use the historically significant school complex as the physical place and represent Oslo Skolemuseum as a current institutional/use layer within it. Do not create two overlapping markers at the same school complex.

Status: **APPROVED FOR COORDINATE INTAKE as `mollergata_skole`.**

Coordinate method: address-first query for `Møllergata 49 Oslo`, followed by review of whether the returned point should represent the main school complex or the museum building within it.

## Batch result

| Candidate | Decision |
| --- | --- |
| Vigelandmuseet | New canonical `vigelandmuseet`; distinct from park |
| IBSEN Museum & Teater | New canonical `ibsen_museum_teater`; entrance/historic-apartment coordinate review required |
| Oslo Skolemuseum | No separate museum marker; new canonical `mollergata_skole` with museum as current layer |

This batch produces three approved place candidates while preventing a duplicate museum/school marker at Møllergata.
