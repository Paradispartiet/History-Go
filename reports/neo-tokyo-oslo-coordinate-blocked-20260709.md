# Neo Tokyo Oslo place insertion blocked: coordinate not verified

Date: 2026-07-09

## Scope

Task was to add one concrete subkultur place for `neo_tokyo_oslo` / Neo Tokyo Oslo at Karl Johans Gate 7, Arkaden 2. etasje, 0154 Oslo, based on the locked source basis from PR #1949.

## Preflight checks

- Checked for the locked source-ready report path: `reports/neo-tokyo-place-source-ready-20260709.md`.
  - Result: file is not present on this branch.
- Checked for existing duplicate identifiers/names with ripgrep:
  - `neo_tokyo_oslo` appears only in `reports/oslo-subkultur-concrete-place-candidates-20260709.md`.
  - `Neo Tokyo` appears only in `reports/oslo-subkultur-concrete-place-candidates-20260709.md`.
  - Result: no active place entry with `neo_tokyo_oslo` / `Neo Tokyo Oslo` was found.

## Coordinate verification

The task explicitly required that coordinates must only come from mechanical/verifiable geocoding of Karl Johans Gate 7 / Arkaden, and that coordinates must not be guessed.

Attempted mechanical geocoding from the environment:

1. OpenStreetMap Nominatim API query for `Karl Johans Gate 7, 0154 Oslo, Norway`.
   - Result: blocked by environment/proxy with `Tunnel connection failed: 403 Forbidden`.
2. Kartverket/Geonorge address API query for `Karl Johans gate 7 Oslo`.
   - Result: blocked by environment/proxy with `Tunnel connection failed: 403 Forbidden` over HTTPS and `Forbidden` over HTTP.

Because no coordinate could be mechanically verified in this environment, the place entry was not added.

## Files intentionally not changed

- `data/places/subkultur/oslo/places_subkultur.json`
- `data/places/places_index.json`
- `data/place_exclusions.json`
- UI/runtime files
- People files
- Quiz files

## Validation status

`bash scripts/check-places.sh` was not run after a place insertion, because no place insertion was made. Running the full place validation without a coordinate-backed place entry would not validate the requested content.

## Required follow-up

To proceed, rerun the task in an environment where a mechanical/verifiable address geocoder is available, or provide the verified coordinates together with their verifiable source metadata. Do not add coordinates by estimation.
