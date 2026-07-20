# Oslo coordinate retro-audit from batch 6

## Scope

Retroactive method audit of Oslo coordinate-control batches 6–35 against the locked object-type-first coordinate method. Concrete relevant Norwegian addresses use Geonorge first. Streets, parks, areas, routes, monuments, historical sites and other non-address objects require suitable object/geometry or historical evidence instead of arbitrary address proxies.

## Batch 6 — corrected

The original batch-6 Geonorge run stored unambiguous verified candidates for three concrete addressable buildings. Later visual-marker corrections had replaced the canonical source with OSM geometry. That was a source-priority regression.

Corrected back to the stored Geonorge candidates:

- `gronland_basarene` — Tøyengata 2 — `geonorge-adresser-v1:0301:17875:2`
- `mollergata_19` — Møllergata 19 — `geonorge-adresser-v1:0301:14943:19`
- `villa_grande` — Huk aveny 56 — `geonorge-adresser-v1:0301:13153:56`

## Batch 7 — method-compliant

- `blaa`: address-first was attempted for Brenneriveien 9C and Geonorge returned `not_found`; exact named OSM POI is a documented fallback.
- `tinghuset`: official Geonorge address point.
- `bogstad_gard`: multiple lettered address points for a whole manor complex; exact estate geometry avoids arbitrary address selection.
- `salt`: Langkaia 1 points to Havnelageret rather than the SALT site; exact named site POI is appropriate.
- `tollbukaia`, `akershus_kaier` and `oslo_mek`: historical/linear object treatment is appropriate.

## Pass 2 — corrections through batch 16

- Batch 11: `torggata` restored from an arbitrary house-number point to documented street/line representation.
- Batch 13: `storgata` restored from an arbitrary house-number point to documented street/line representation.
- Batch 14: `botsparken` now uses Oslo kommune rather than Lokalhistoriewiki as the primary park-definition source.
- Batch 16: `carl_berner_plass`, `okern`, `skoyen` and `torshov` no longer use Wikidata as the primary verification source.

## Pass 3 — source-object corrections in batches 21–24

- `henrik_wergeland_statue`: stable primary identity moved from the Commons host page to Oslo Museum accession `OB.A17403`; coordinate unchanged.
- `telegrafbygningen`: primary geometry source moved from Wikidata to documented exact OSM relation `13931026` after the saved Geonorge lookup proved ambiguous; coordinate unchanged.
- `ovre_foss`: the saved batch-24 evidence proves that Sagveien 23 was already tried through Geonorge first and was ambiguous. Primary identity is now Kulturminnesøk `164747`, and the existing point is explicitly modeled as a semantic historical area anchor with `verified_historical_source` rather than as an address or exact building center.

## Sequential completeness result

All coordinate-control batches from 6 through 35 were reviewed. The following batches required canonical corrections: **6, 11, 13, 14, 16, 21, 22 and 24**. The remaining batches were method-compliant after review, including the replacement batch 29 v3 that superseded the closed method-mixed PR #2459.

The audit corrected 13 canonical records:

`gronland_basarene`, `mollergata_19`, `villa_grande`, `torggata`, `storgata`, `botsparken`, `carl_berner_plass`, `okern`, `skoyen`, `torshov`, `henrik_wergeland_statue`, `telegrafbygningen`, `ovre_foss`.

Detailed per-batch classification is stored in `final-batch-classification.json`.

## Final validation

The completed correction set passed:

- split-manifest sync
- place-index sync and source/runtime coordinate parity
- coordinate source contract
- coordinate quality gate
- strict-new coordinate intake
- coordinate evidence audit
- place health capture
- diff whitespace check

Runner logs are persisted under `reports/coordinate-branch-runner/agent_audit-oslo-coordinates-from-batch-6/`.
