# Split-manifest reverse coverage repair

Date: 2026-07-20

The runtime index builder prefers a valid sibling split manifest over its aggregate source. The Oslo history split manifest had six rows while the aggregate later grew with four more canonical records, hiding `peststotten_krist_kirkegard`, `kjaerlighetskarusellen`, `villa_stenersen` and `st_hallvard_kirke_kloster` from runtime.

All four existing canonical places are restored as split children and the split manifest/index are synchronized. Villa Stenersen and St. Hallvard are reverified with exact Geonorge address-first points; Peststøtten and Kjærlighetskarusellen receive stable v1-compatible object/source identities.

Reverse aggregate-to-split gaps before this repair: **6** across **2** split manifests.

Reverse aggregate-to-split gaps after this targeted repair: **2** across **1** split manifests.
