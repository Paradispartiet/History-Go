# Oslo coordinate control batch 122 – sport closure

- `kfum_arena` → verified → `geonorge-adresser-v1:0301:11462:109` (address_first_official_address)
- `nordre_aasen_idrettspark` → verified → `geonorge-adresser-v1:0301:13747:7` (address_first_official_address)
- `gressbanen` → verified_geometry → `osm-way:5046575` (address_first_then_exact_named_osm_geometry)
- `daelenenga_idrettspark` → verified_geometry → `osm-composite:way/4708872+way/101769218` (address_first_then_composite_exact_osm_components)

KFUM Arena and Nordre Åsen resolve through exact Geonorge address-first. Gressbanen uses its exact named OSM ground only after an ambiguous address-first result. Dælenenga uses an explicit two-component model only after no Geonorge result. No nearest/first-hit logic is used.
