# Address-first coordinate batch 1: remaining runtime repairs

## Method, source-of-truth chain, and override audit

No live Geonorge lookup was made. The only coordinate evidence used was the three stored results under `reports/geonorge-address-batch-1/`. Each stored result was required to have `ok: true` and `status: "verified_candidate"`; its complete `coordinate` object was copied into the selected canonical record, with `coordVerifiedAt` set to `2026-07-17`.

`data/places/manifest.json` activates the media, literature, and city aggregate paths. For each path, the sibling split manifest exists, so both the runtime index generator and the map-facing fallback loader prefer that manifest and load its selected one-place file instead of the legacy aggregate record. `data/places/places_index.json` identifies those same split files in `sourceFile`, and `js/dataHub.js` loads that global index as the map-facing runtime source. There is exactly one manifest-selected canonical source for each target; no duplicate active source was found.

The lightweight split indexes and split-manifest child hashes were regenerated from the selected one-place files, and the global runtime index was regenerated with `npm run places:index:build`. Aggregate copies were deliberately left unchanged as legacy duplicates.

The three IDs do not occur in `data/places/coordinate_overrides.json` or `js/geo/place-coordinate-overrides.js`, and a search of JavaScript coordinate-patch code found no ID-specific lat/lon replacement. Civication mapping entries only associate History Go IDs with Civication/3D-model IDs and do not provide replacement coordinates.

## `nrk_huset_marienlyst` — PASS

- **placeId / name:** `nrk_huset_marienlyst` / NRK-huset på Marienlyst
- **Stored Geonorge result:** `reports/geonorge-address-batch-1/nrk_huset_marienlyst.json` (`ok: true`, `status: verified_candidate`)
- **Source, manifest, and index files containing the ID:** `data/places/media/oslo/places_oslo_media.json` (legacy aggregate), `data/places/media/oslo/places_oslo_media/nrk_huset_marienlyst.json` (split source), `data/places/media/oslo/places_oslo_media_manifest.json` (split selector), `data/places/media/oslo/places_oslo_media_index.json` (lightweight generated index), `data/places/places_index.json` (generated runtime index), and `data/Civication/map/historyGoPlaceMapping.media.json` (model-only mapping).
- **Chosen canonical active source:** `data/places/media/oslo/places_oslo_media/nrk_huset_marienlyst.json`.
- **Why active:** the root manifest activates `places/media/oslo/places_oslo_media.json`; its sibling manifest selects `places_oslo_media/nrk_huset_marienlyst.json`, which is preferred over the aggregate by the index builder and fallback loader. The runtime index confirms the same `sourceFile`.
- **Previous canonical lat/lon:** `59.9323`, `10.7182`.
- **New canonical lat/lon:** `59.934722555717045`, `10.719662425687908`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:10722:1`.
- **Full address:** Bjørnstjerne Bjørnsons plass 1, 0340 Oslo, NO.
- **Runtime-index lat/lon:** `59.934722555717045`, `10.719662425687908`.
- **Runtime-index sourceObjectId:** `geonorge-adresser-v1:0301:10722:1`.
- **Override result:** no JSON or JavaScript lat/lon override; Civication entry is mapping-only.
- **Result:** **PASS**.

## `deichman_grunerlokka` — PASS

- **placeId / name:** `deichman_grunerlokka` / Deichman Grünerløkka
- **Stored Geonorge result:** `reports/geonorge-address-batch-1/deichman_grunerlokka.json` (`ok: true`, `status: verified_candidate`)
- **Source, manifest, and index files containing the ID:** `data/places/litteratur/oslo/places_litteratur.json` (legacy aggregate), `data/places/litteratur/oslo/places_litteratur/deichman_grunerlokka.json` (split source), `data/places/litteratur/oslo/places_litteratur_manifest.json` (split selector), `data/places/litteratur/oslo/places_litteratur_index.json` (lightweight generated index), `data/places/places_index.json` (generated runtime index), and `data/Civication/map/historyGoPlaceMapping.litteratur.json` (model-only mapping).
- **Chosen canonical active source:** `data/places/litteratur/oslo/places_litteratur/deichman_grunerlokka.json`.
- **Why active:** the root manifest activates `places/litteratur/oslo/places_litteratur.json`; its sibling manifest selects `places_litteratur/deichman_grunerlokka.json`, which is preferred over the aggregate by the index builder and fallback loader. The runtime index confirms the same `sourceFile`.
- **Previous canonical lat/lon:** `59.9235`, `10.7596`.
- **New canonical lat/lon:** `59.920789784433865`, `10.760221823170998`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:16240:10`.
- **Full address:** Schous plass 10, 0552 Oslo, NO.
- **Runtime-index lat/lon:** `59.920789784433865`, `10.760221823170998`.
- **Runtime-index sourceObjectId:** `geonorge-adresser-v1:0301:16240:10`.
- **Override result:** no JSON or JavaScript lat/lon override; Civication entry is mapping-only.
- **Result:** **PASS**.

## `deichman_bjorvika` — PASS

- **placeId / name:** `deichman_bjorvika` / Deichman Bjørvika
- **Stored Geonorge result:** `reports/geonorge-address-batch-1/deichman_bjorvika.json` (`ok: true`, `status: verified_candidate`)
- **Source, manifest, and index files containing the ID:** `data/places/by/oslo/places_by.json` (legacy aggregate), `data/places/by/oslo/places/deichman_bjorvika.json` (split source), `data/places/by/oslo/places_by_manifest.json` (split selector), `data/places/by/oslo/places_by_index.json` (lightweight generated index), `data/places/places_index.json` (generated runtime index), and `data/Civication/map/historyGoPlaceMapping.by.json` (model-only mapping). Other place records and category aggregates mention this ID only as a relationship target, not as a source definition.
- **Chosen canonical active source:** `data/places/by/oslo/places/deichman_bjorvika.json`.
- **Why active:** the root manifest activates `places/by/oslo/places_by.json`; its sibling manifest selects `places/deichman_bjorvika.json`, which is preferred over the aggregate by the index builder and fallback loader. The runtime index confirms the same `sourceFile`.
- **Previous canonical lat/lon:** `59.9087`, `10.7527`.
- **New canonical lat/lon:** `59.90868907082338`, `10.75212918471088`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:21670:1`.
- **Full address:** Anne-Cath. Vestlys plass 1, 0150 Oslo, NO.
- **Runtime-index lat/lon:** `59.90868907082338`, `10.75212918471088`.
- **Runtime-index sourceObjectId:** `geonorge-adresser-v1:0301:21670:1`.
- **Override result:** the canonical Wikidata provenance fields were replaced/removed; no JSON or JavaScript lat/lon override exists, and the Civication entry is mapping-only.
- **Result:** **PASS**.

## Final result

| placeId | canonical source updated | runtime index matches | no stale override | final result |
|---|---:|---:|---:|---|
| nrk_huset_marienlyst | yes | yes | yes | PASS |
| deichman_grunerlokka | yes | yes | yes | PASS |
| deichman_bjorvika | yes | yes | yes | PASS |
