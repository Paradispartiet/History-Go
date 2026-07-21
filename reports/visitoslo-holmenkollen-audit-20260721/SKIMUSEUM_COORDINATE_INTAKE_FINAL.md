# Skimuseet i Holmenkollen — final coordinate intake

Date: 2026-07-21

## Result

`holmenkollen_skimuseum` is **ready for canonical production**.

Selected canonical visitor address:

- **Kongeveien 5, 0787 Oslo**
- Geonorge object: `geonorge-adresser-v1:0301:13850:5`
- Coordinate: **59.96263248232449, 10.666289172703161**

## Address conflict

The source set contains a real address inconsistency.

Current visitor-facing sources identify **Kongeveien 5**:

- VisitOSLO's current Ski Museum listing
- VisitOSLO's booking location for the museum
- Holmenkollen.com / Skiforeningen contact information

A Skiforeningen directions page also mentions **Kongeveien 40** in its directions text. Both addresses were therefore run through the locked Geonorge address-first method.

- Kongeveien 5: `59.96263248232449, 10.666289172703161`
- Kongeveien 40: `59.96471254074996, 10.666572782635253`
- Separation: **231.8 m**

Kongeveien 5 is selected as the canonical museum visitor marker. Kongeveien 40 remains recorded as an alternate access/complex address and is not silently discarded.

## Parent-overlap audit

The Ski Museum is physically inside the broader Holmenkollen arena complex.

- Existing parent: `holmenkollen_nasjonalanlegg`
- Distance from selected museum marker to current parent anchor: **323.3 m**
- Distance from Kongeveien 40 to current parent anchor: **239.0 m**

This is expected parent/child overlap rather than identity duplication. The museum has its own persistent institution, collections, visitor entrance and history. The jump tower remains represented by the existing arena place and does not get a separate canonical marker from the bundled VisitOSLO product.

## Production lock

- Canonical id: `holmenkollen_skimuseum`
- Name: Skimuseet i Holmenkollen
- Primary category: `historie`
- Canonical year: `1923`
- Coordinate source: exact Geonorge address point for Kongeveien 5
- No canonical identity duplicate on current main

Status: **COORDINATE INTAKE CLOSED — READY FOR CANONICAL PRODUCTION.**
