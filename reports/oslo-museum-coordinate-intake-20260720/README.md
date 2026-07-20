# Oslo museum completeness — coordinate intake queue

Date: 2026-07-20

## Purpose

This queue converts the completed museum/visitor-source research pass into a reproducible coordinate-production step without weakening the repository's address-first policy.

The current execution environment could not resolve `ws.geonorge.no`, so no coordinate below is marked verified and no substitute map source is silently used. The commands are prepared for the repository's normative address finder and save every result to disk for later audit and PR evidence.

## Standard Geonorge address-first queue

Run from the History-Go repository root.

```bash
set -euo pipefail
mkdir -p reports/oslo-museum-coordinate-intake-20260720/geonorge

npm run places:coords:find:address -- --address "Museumsveien 10 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/norsk_folkemuseum.json

npm run places:coords:find:address -- --address "Bygdøynesveien 37 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/norsk_maritimt_museum.json

npm run places:coords:find:address -- --address "Frederiks gate 2 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/historisk_museum.json

npm run places:coords:find:address -- --address "Halvdan Svartes gate 58 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/frogner_hovedgard.json

npm run places:coords:find:address -- --address "Sagveien 28 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/arbeidermuseet.json

npm run places:coords:find:address -- --address "Brynjulf Bulls plass 1 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/nobels_fredssenter.json

npm run places:coords:find:address -- --address "Wergelandsveien 17 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/kunstnernes_hus.json

npm run places:coords:find:address -- --address "Nobels gate 32 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/vigelandmuseet.json

npm run places:coords:find:address -- --address "Møllergata 49 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/mollergata_skole.json

npm run places:coords:find:address -- --address "Calmeyers gate 15B Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/jodisk_museum_oslo.json

npm run places:coords:find:address -- --address "Lille Frøens vei 4 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/det_internasjonale_barnekunstmuseet.json

npm run places:coords:find:address -- --address "Oscars gate 23 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/tbs_gallery.json

npm run places:coords:find:address -- --address "Fridtjof Nansens plass 4 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/viking_planet_oslo.json

npm run places:coords:find:address -- --address "Strandpromenaden 11 Oslo" \
  | tee reports/oslo-museum-coordinate-intake-20260720/geonorge/the_salmon_vitensenter.json
```

## Acceptance gate for each standard result

A returned hit is not accepted merely because the command produced JSON.

For each candidate:

1. confirm the returned address text, postcode and municipality;
2. confirm the result is unique enough for the intended address;
3. capture the Geonorge object identity as `geonorge-adresser-v1:<kommunenummer>:<adressekode>:<nummer><bokstav>`;
4. use the returned representation point as `lat` / `lon`;
5. set `locatorType` to the actual physical object type, normally `building`;
6. set `sourceProvider: "official_address"`;
7. set `geocodeAccuracy: "rooftop"`;
8. set `coordRole: "display_marker"`;
9. set `coordType: "address_point"`;
10. set `coordStatus: "verified"` only after the source record and runtime representation have been checked.

## Special coordinate-review queue

These four candidates must not be forced through the ordinary address-point path without additional physical-role review.

### `ibsen_museum_teater`

- Current visitor entrance: Henrik Ibsens gate 26.
- Historic Ibsen apartment: Arbins gate 1.
- Required decision: whether the canonical display marker represents the public entrance or the historic apartment building/site.
- Required output: explicit `coordRole` rationale and relationship between entrance and historic site.

### `norges_hjemmefrontmuseum`

- Official visitor location: Akershus festning, building 21.
- Required method: authoritative internal fortress/building source.
- Forbidden shortcut: reusing the broad `akershus_festning` marker.

### `forsvarsmuseet`

- Official visitor location: Akershus festning, building 62.
- Required method: authoritative internal fortress/building source.
- Forbidden shortcut: reusing the broad `akershus_festning` marker.

### `roseslottet`

- Official description places the entrance near Frognerseteren T-banestasjon.
- Required method: verified site/entrance anchor from an authoritative or cross-checked source.
- Forbidden shortcut: using the station coordinate merely because it is nearby.

## Status-sensitive production flags

Coordinate verification does not remove the need for current-status metadata:

- `jodisk_museum_oslo`: temporarily closed for renovation; estimated completion autumn 2028.
- `det_internasjonale_barnekunstmuseet`: ordinary opening suspended; reopening uncertain.
- `roseslottet`: time-limited installation currently planned through the end of 2026.
- `ibsen_museum_teater`: entrance and historic-home distinction must remain explicit.

## Production sequence after coordinate evidence

1. Review all saved Geonorge outputs and special-source evidence.
2. Reject or hold any ambiguous result instead of promoting it to `verified`.
3. Create canonical place source files in the correct categories.
4. Add coordinate-evidence records where required by the repository workflow.
5. Update manifests only through the established source-file workflow.
6. Regenerate indexes/build outputs; do not hand-edit generated indexes.
7. Run source/runtime parity, place health, strict-new intake, split-manifest audit and coordinate-evidence audit.
8. Update `docs/coordinates/coordinate-control-protocol.md` in the same completed coordinate batch.

## Current queue count

- Standard address-first: 14
- Special coordinate review: 4
- Total approved candidate places awaiting coordinate completion: 18
