# Skimuseet i Holmenkollen — superseded early coordinate intake

Date: 2026-07-21

This file preserves the audit trail from the first clean retry, which selected **Kongeveien 40** after no unique exact named OSM museum object was resolved. That address decision is **superseded** and must not be used for canonical production.

## Final canonical decision

- placeId: `holmenkollen_skimuseum`
- category: `historie`
- canonical visitor address: **Kongeveien 5, 0787 Oslo**
- coordinate: **59.96263248232449, 10.666289172703161**
- source object: `geonorge-adresser-v1:0301:13850:5`
- coordinate batch: **120**
- production PR: **#3148**
- final Holmenkollen scope closure: **#3150**

Current visitor-facing VisitOSLO, booking and Holmenkollen/Skiforeningen sources use Kongeveien 5 for Skimuseet. Kongeveien 40 remains documented as an alternative access/complex address, 231.8 metres from the selected marker, but is not the canonical museum coordinate.

The authoritative coordinate decision is `reports/visitoslo-holmenkollen-audit-20260721/skimuseum-coordinate-intake-final.json`, and the applied canonical evidence is `data/coordinate-evidence/oslo/historie/holmenkollen_skimuseum.json`.

The museum remains a distinct persistent institution inside `holmenkollen_nasjonalanlegg`; the jump tower and broader arena stay with the parent place and do not receive another marker from the bundled visitor product.
