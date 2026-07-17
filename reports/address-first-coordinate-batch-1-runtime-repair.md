# Address-first coordinate batch 1 runtime repair

## Method and scope

Only the five stored files in `reports/geonorge-address-batch-1/` were used as coordinate evidence. Each has `ok: true` and `status: "verified_candidate"`; no live Geonorge request was made.

`data/places/manifest.json` activates each legacy aggregate entry, but the index builder detects its sibling `*_manifest.json` and loads the listed one-place split file instead. Thus the aggregate copies below are legacy duplicates, not runtime sources. The split manifest, its lightweight split index, and `data/places/places_index.json` were checked as duplicate/generated records. The lightweight indexes were refreshed so they do not retain stale lat/lon values. `data/places/coordinate_overrides.json` is empty, and `js/geo/place-coordinate-overrides.js` contains no target ID; therefore neither the index builder nor the map-facing override guard replaces these coordinates.

The runtime index now carries the full address-coordinate provenance needed to compare `sourceObjectId` and `coordRole` directly with the canonical split source. `js/dataHub.js` loads `data/places/places_index.json` for the map-facing place data.

## nasjonalmuseet — PASS

- **placeId / name:** `nasjonalmuseet` / Nasjonalmuseet
- **Stored Geonorge input:** `reports/geonorge-address-batch-1/nasjonalmuseet.json`
- **Every repository data source/index file containing the ID:** `data/places/kunst/oslo/places_kunst.json` (legacy aggregate), `data/places/kunst/oslo/places_kunst/nasjonalmuseet.json` (split record), `data/places/kunst/oslo/places_kunst_manifest.json` (split selector), `data/places/kunst/oslo/places_kunst_index.json` (lightweight generated index), and `data/places/places_index.json` (generated runtime index).
- **Chosen canonical active source:** `data/places/kunst/oslo/places_kunst/nasjonalmuseet.json`.
- **Why active:** the root manifest names `places/kunst/oslo/places_kunst.json`; its sibling split manifest selects `places_kunst/nasjonalmuseet.json`, which the index builder loads instead of the aggregate record.
- **Previous canonical lat/lon:** `59.9146`, `10.7229`.
- **New canonical lat/lon:** `59.91149437954434`, `10.729109219868187`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:18199:3`.
- **Address:** Brynjulf Bulls plass 3, 0250 Oslo, NO.
- **Matching runtime-index lat/lon:** `59.91149437954434`, `10.729109219868187`.
- **Matching runtime-index sourceObjectId:** `geonorge-adresser-v1:0301:18199:3`.
- **Override search result:** none; no JSON override or JavaScript target-ID override.

## munch_museet — PASS

- **placeId / name:** `munch_museet` / MUNCH
- **Stored Geonorge input:** `reports/geonorge-address-batch-1/munch_museet.json`
- **Every repository data source/index file containing the ID:** `data/places/kunst/oslo/places_kunst.json` (legacy aggregate), `data/places/kunst/oslo/places_kunst/munch_museet.json` (split record), `data/places/kunst/oslo/places_kunst_manifest.json` (split selector), `data/places/kunst/oslo/places_kunst_index.json` (lightweight generated index), and `data/places/places_index.json` (generated runtime index).
- **Chosen canonical active source:** `data/places/kunst/oslo/places_kunst/munch_museet.json`.
- **Why active:** the root manifest activates the aggregate entry and its sibling split manifest selects this one-place split record for the runtime index.
- **Previous canonical lat/lon:** `59.9057`, `10.7606`.
- **New canonical lat/lon:** `59.90610626117622`, `10.75534950637971`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:21680:1`.
- **Address:** Edvard Munchs plass 1, 0194 Oslo, NO.
- **Matching runtime-index lat/lon:** `59.90610626117622`, `10.75534950637971`.
- **Matching runtime-index sourceObjectId:** `geonorge-adresser-v1:0301:21680:1`.
- **Override search result:** none; the stale `manual_map_patch` canonical metadata was replaced and no JSON or JavaScript override targets this ID.

## astrup_fearnley — PASS

- **placeId / name:** `astrup_fearnley` / Astrup Fearnley Museet
- **Stored Geonorge input:** `reports/geonorge-address-batch-1/astrup_fearnley.json`
- **Every repository data source/index file containing the ID:** `data/places/kunst/oslo/places_kunst.json` (legacy aggregate), `data/places/kunst/oslo/places_kunst/astrup_fearnley.json` (split record), `data/places/kunst/oslo/places_kunst_manifest.json` (split selector), `data/places/kunst/oslo/places_kunst_index.json` (lightweight generated index), and `data/places/places_index.json` (generated runtime index).
- **Chosen canonical active source:** `data/places/kunst/oslo/places_kunst/astrup_fearnley.json`.
- **Why active:** the root manifest activates the aggregate entry and its sibling split manifest selects this one-place split record for the runtime index.
- **Previous canonical lat/lon:** `59.9071`, `10.7201`.
- **New canonical lat/lon:** `59.90679078788014`, `10.721563360663236`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:21458:2`.
- **Address:** Strandpromenaden 2, 0252 Oslo, NO.
- **Matching runtime-index lat/lon:** `59.90679078788014`, `10.721563360663236`.
- **Matching runtime-index sourceObjectId:** `geonorge-adresser-v1:0301:21458:2`.
- **Override search result:** none; no JSON or JavaScript target-ID override.

## nasjonalbiblioteket — PASS

- **placeId / name:** `nasjonalbiblioteket` / Nasjonalbiblioteket
- **Stored Geonorge input:** `reports/geonorge-address-batch-1/nasjonalbiblioteket.json`
- **Every repository data source/index file containing the ID:** `data/places/litteratur/oslo/places_litteratur.json` (legacy aggregate), `data/places/litteratur/oslo/places_litteratur/nasjonalbiblioteket.json` (split record), `data/places/litteratur/oslo/places_litteratur_manifest.json` (split selector), `data/places/litteratur/oslo/places_litteratur_index.json` (lightweight generated index), and `data/places/places_index.json` (generated runtime index).
- **Chosen canonical active source:** `data/places/litteratur/oslo/places_litteratur/nasjonalbiblioteket.json`.
- **Why active:** the root manifest activates the aggregate entry and its sibling split manifest selects this one-place split record for the runtime index.
- **Previous canonical lat/lon:** `59.9138`, `10.7168`.
- **New canonical lat/lon:** `59.91429565254146`, `10.717362462417718`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:21471:110`.
- **Address:** Henrik Ibsens gate 110, 0255 Oslo, NO.
- **Matching runtime-index lat/lon:** `59.91429565254146`, `10.717362462417718`.
- **Matching runtime-index sourceObjectId:** `geonorge-adresser-v1:0301:21471:110`.
- **Override search result:** none; no JSON or JavaScript target-ID override.

## vg_huset — PASS

- **placeId / name:** `vg_huset` / VG-huset
- **Stored Geonorge input:** `reports/geonorge-address-batch-1/vg_huset.json`
- **Every repository data source/index file containing the ID:** `data/places/media/oslo/places_oslo_media.json` (legacy aggregate), `data/places/media/oslo/places_oslo_media/vg_huset.json` (split record), `data/places/media/oslo/places_oslo_media_manifest.json` (split selector), `data/places/media/oslo/places_oslo_media_index.json` (lightweight generated index), and `data/places/places_index.json` (generated runtime index).
- **Chosen canonical active source:** `data/places/media/oslo/places_oslo_media/vg_huset.json`.
- **Why active:** the root manifest activates the aggregate entry and its sibling split manifest selects this one-place split record for the runtime index.
- **Previous canonical lat/lon:** `59.9146`, `10.7426`.
- **New canonical lat/lon:** `59.91512243824226`, `10.743666267309775`.
- **Geonorge sourceObjectId:** `geonorge-adresser-v1:0301:10069:55`.
- **Address:** Akersgata 55, 0180 Oslo, NO.
- **Matching runtime-index lat/lon:** `59.91512243824226`, `10.743666267309775`.
- **Matching runtime-index sourceObjectId:** `geonorge-adresser-v1:0301:10069:55`.
- **Override search result:** none; no JSON or JavaScript target-ID override.

## Final result

| placeId | canonical source updated | runtime index matches | no stale override | final result |
|---|---:|---:|---:|---|
| nasjonalmuseet | yes | yes | yes | PASS |
| munch_museet | yes | yes | yes | PASS |
| astrup_fearnley | yes | yes | yes | PASS |
| nasjonalbiblioteket | yes | yes | yes | PASS |
| vg_huset | yes | yes | yes | PASS |
