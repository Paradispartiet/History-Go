# Oslo coordinate control batch 107 – nature main sites

Processed the remaining uncontrolled records in `places_oslo_natur_hovedsteder.json`. Previously completed IDs are skipped from the protocol and not counted twice.

## Verified
- `ostensjovannet` → `miljodirektoratet-naturvern:VV00000972`
- `hovedoya` → `osm-relation:20749306`
- `gressholmen` → `osm-relation:11816903`
- `maerradalen` → `osm-way:844862938`
- `maridalsvannet` → `osm-relation:1438314`
- `noklevann` → `osm-relation:16661`

## Completed without approved coordinate
- `bygdoy_natur` → needs_review / needs_source
- `ljanselva` → needs_review / needs_source
- `alnaelva_hovedsteder` → needs_review / needs_source

Raw Naturbase and Nominatim candidate payloads are saved in this report directory. No nearest/first-hit selection is used.
