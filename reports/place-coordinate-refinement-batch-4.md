# Place coordinate refinement – batch 4 (2026-05-01)

## Scope
Batch 4 review of broad/linear active places from `data/places/manifest.json`-listed datasets, with semantic anchoring rules for streets, routes, rivers, and large natural/city areas.

## Files changed
- `reports/place-coordinate-refinement-batch-4.md` (new)

## Audit-first status
- Ran coordinate audit before batch work to verify post-batch-3 baseline.
- Result: active places already carry semantic coordinate metadata for the listed batch-4 candidates.

## Places corrected in this batch
No coordinate objects required additional correction in batch 4. All listed candidates already had semantic metadata fields (`coordType`, `coordStatus`, `coordSource`, `coordPrecisionM`, `coordVerifiedAt`) aligned with batch-4 rules.

## Candidate review (old vs new)
Since no additional coordinate edits were required, all values are unchanged in this batch.

| place_id | old lat/lon/r | new lat/lon/r | coordType | coordStatus | coordNote |
|---|---|---|---|---|---|
| karl_johan | 59.9139, 10.7396, 260 | 59.9139, 10.7396, 260 | street_midpoint | verified | – |
| bogstadveien | 59.9239, 10.7148, 280 | 59.9239, 10.7148, 280 | street_midpoint | verified | – |
| markveien | 59.9226, 10.7578, 240 | 59.9226, 10.7578, 240 | street_midpoint | verified | – |
| ring_3 | 59.931, 10.792, 400 | 59.931, 10.792, 400 | route_midpoint | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| trikk_17_18 | 59.92, 10.76, 300 | 59.92, 10.76, 300 | route_midpoint | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| akerselva | 59.9228, 10.7412, 550 | 59.9228, 10.7412, 550 | route_midpoint | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| alnaelva | 59.921, 10.8036, 750 | 59.921, 10.8036, 750 | route_midpoint | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| ljanselva | 59.8551, 10.7941, 750 | 59.8551, 10.7941, 750 | route_midpoint | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| maerradalen | 59.9368, 10.6612, 700 | 59.9368, 10.6612, 700 | area_center | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| maridalsvannet | 59.9843, 10.7789, 1150 | 59.9843, 10.7789, 1150 | area_center | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| noklevann | 59.8834, 10.8782, 950 | 59.8834, 10.8782, 950 | area_center | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| bygdoy_natur | 59.9048, 10.6849, 950 | 59.9048, 10.6849, 950 | area_center | semantic_anchor | Representerer pedagogisk ankerpunkt for hele området/ruta. |
| akerselva_utlop_bjorvika | 59.9118, 10.7469, 220 | 59.9118, 10.7469, 220 | route_midpoint | verified | – |
| alna_utlop_bjorvika | 59.9041, 10.7638, 190 | 59.9041, 10.7638, 190 | route_midpoint | verified | – |
| fossveien_elvestrekning | 59.9218, 10.7391, 130 | 59.9218, 10.7391, 130 | route_midpoint | verified | – |
| elvestrekning_bla_brenneriveien | 59.923, 10.7407, 130 | 59.923, 10.7407, 130 | route_midpoint | verified | – |
| hausmannsomradet_elvelop | 59.9197, 10.7364, 170 | 59.9197, 10.7364, 170 | route_midpoint | verified | – |
| nybrua_vaterlandsparken | 59.9169, 10.734, 170 | 59.9169, 10.734, 170 | route_midpoint | verified | – |

## Not changed (and why)
All listed candidates were kept unchanged in this batch because they already match semantic coordinate modeling requirements.

## Future modeling candidates (beyond single-point representation)
The following are acceptable as semantic anchor points now, but should later be evaluated for richer route models:

- `ring_3`:
  - `manual_check_needed`: true
  - `needs_route_model`: true
  - `needs_multiple_anchors`: true
- `trikk_17_18`:
  - `manual_check_needed`: true
  - `needs_route_model`: true
  - `needs_multiple_anchors`: true
- `akerselva`:
  - `manual_check_needed`: true
  - `needs_route_model`: true
  - `needs_multiple_anchors`: true
- `alnaelva`:
  - `manual_check_needed`: true
  - `needs_route_model`: true
  - `needs_multiple_anchors`: true
- `ljanselva`:
  - `manual_check_needed`: true
  - `needs_route_model`: true
  - `needs_multiple_anchors`: true

Suggested future structure:
- `routePoints`
- `routeSegments`
- multiple unlock anchors per route/river

## Post-change audit
After report creation, audit was re-run to confirm active data consistency.
