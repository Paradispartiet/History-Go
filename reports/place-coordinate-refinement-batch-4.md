# Place Coordinate Refinement – Batch 4 (2026-05-01)

## Endrede filer
- `data/places/places_by.json`
- `data/places/oslo/places_oslo_natur_hovedsteder.json`
- `data/places/oslo/places_oslo_natur_akerselvarute.json`
- `data/places/oslo/places_oslo_natur_alnaelva_rute.json`

## Steder som ble rettet

| id | Gammel lat/lon/r | Ny lat/lon/r | coordType | coordStatus | coordNote |
|---|---|---|---|---|---|
| karl_johan | 59.9138, 10.7387, 250 | 59.9139, 10.7396, 260 | street_midpoint | verified | |
| bogstadveien | 59.9279, 10.7157, 220 | 59.9239, 10.7148, 280 | street_midpoint | verified | |
| markveien | 59.9235, 10.7584, 210 | 59.9226, 10.7578, 240 | street_midpoint | verified | |
| ring_3 | 59.931, 10.792, 400 | 59.931, 10.792, 400 | route_midpoint | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| trikk_17_18 | 59.92, 10.76, 300 | 59.92, 10.76, 300 | route_midpoint | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| akerselva | 59.9225, 10.7572, 420 | 59.9228, 10.7412, 550 | route_midpoint | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| bygdoy_natur | 59.9054, 10.6843, 900 | 59.9048, 10.6849, 950 | area_center | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| alnaelva | 59.9211, 10.8039, 700 | 59.921, 10.8036, 750 | route_midpoint | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| ljanselva | 59.8549, 10.7946, 700 | 59.8551, 10.7941, 750 | route_midpoint | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| maerradalen | 59.9372, 10.6608, 650 | 59.9368, 10.6612, 700 | area_center | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| maridalsvannet | 59.98426, 10.77889, 1100 | 59.9843, 10.7789, 1150 | area_center | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| noklevann | 59.88341, 10.87823, 900 | 59.8834, 10.8782, 950 | area_center | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| elvestrekning_bla_brenneriveien | 59.923, 10.7408, 120 | 59.923, 10.7407, 130 | route_midpoint | verified | |
| fossveien_elvestrekning | 59.9218, 10.7392, 120 | 59.9218, 10.7391, 130 | route_midpoint | verified | |
| hausmannsomradet_elvelop | 59.9197, 10.7365, 150 | 59.9197, 10.7364, 170 | route_midpoint | verified | |
| nybrua_vaterlandsparken | 59.9169, 10.734, 160 | 59.9169, 10.734, 170 | route_midpoint | verified | |
| akerselva_utlop_bjorvika | 59.9119, 10.747, 200 | 59.9118, 10.7469, 220 | route_midpoint | verified | |
| alna_utlop_bjorvika | 59.904, 10.7638, 170 | 59.9041, 10.7638, 190 | route_midpoint | verified | |

Alle rettede steder fikk også:
- `coordSource: "manual_map_check"`
- `coordPrecisionM` i intervallet 60–150
- `coordVerifiedAt: "2026-05-01"`

## Steder som ikke ble endret
- Ingen av kandidatene ble stående helt urørt; alle fikk semantisk koordinatmetadata og/eller justert anker/radius.

## Bør få routePoints/multiple anchors senere
- `ring_3` – needs_route_model, needs_multiple_anchors, manual_check_needed
- `trikk_17_18` – needs_route_model, needs_multiple_anchors, manual_check_needed
- `akerselva` – needs_route_model, needs_multiple_anchors, manual_check_needed
- `alnaelva` – needs_route_model, needs_multiple_anchors, manual_check_needed
- `ljanselva` – needs_route_model, needs_multiple_anchors, manual_check_needed

