# Oslo domkirke runtime marker repair

Generated: 2026-07-18

## Scope

- Place id: `oslo_domkirke`
- Canonical active source file: `data/places/by/oslo/oslo_domkirke.json`
- Runtime sourceFile: `places/by/oslo/oslo_domkirke.json`

## Why Karl Johans gate 11 was wrong

The previous marker used Geonorge address provenance `geonorge-adresser-v1:0301:13630:11` for `Karl Johans gate 11, 0154 Oslo`. That address point belongs to Kirkeristen / the bazaar buildings beside Oslo domkirke, not to the church building itself. It was therefore rejected as a display marker for `oslo_domkirke`.

## Repository finder result for Stortorvet 1, 0155 Oslo

Command attempted:

```bash
npm run places:coords:find:address -- --address "Stortorvet 1, 0155 Oslo"
```

Result: the repository finder could not reach Geonorge from this environment (`getaddrinfo EAI_AGAIN ws.geonorge.no`). Because the address-point candidate could not be obtained and manually accepted as lying on the church building, the repair uses the official Kartverket SSR place-name point requested for the church itself.

## Coordinate change

| Field | Old value | New value |
|---|---:|---:|
| lat | `59.91198982723361` | `59.91259` |
| lon | `10.746574591052143` | `10.74663` |
| r | `60` | `60` |
| coordType | `address_point` | `building_center` |
| coordSource | `geonorge_adresser_v1` | `kartverket_ssr` |
| sourceProvider | `official_address` | `official_place_name` |
| sourceObjectId | `geonorge-adresser-v1:0301:13630:11` | `kartverket-ssr:308088` |
| address | `Karl Johans gate 11, 0154 Oslo, NO` | `Stortorvet 1, 0155 Oslo, NO` |

## Official source selected

Kartverket SSR:

- name: `Oslo domkirke`
- navneobjekttype: `Kyrkje`
- stadnummer: `308088`
- coordinate: `59.91259, 10.74663`

Den norske kirke control address:

- visiting address: `Stortorvet 1, 0155 Oslo`

## Manifest and sourceFile confirmation

- `data/places/manifest.json` includes `places/by/oslo/oslo_domkirke.json` as an active source file.
- Canonical active source file confirmed as `data/places/by/oslo/oslo_domkirke.json`.
- Runtime `sourceFile` confirmed as `places/by/oslo/oslo_domkirke.json`.

## Runtime parity

| Field | Canonical | Runtime index | Parity |
|---|---|---|---|
| lat | `59.91259` | `59.91259` | PASS |
| lon | `10.74663` | `10.74663` | PASS |
| sourceObjectId | `kartverket-ssr:308088` | `kartverket-ssr:308088` | PASS |
| coordSource | `kartverket_ssr` | `kartverket_ssr` | PASS |
| coordType | `building_center` | `building_center` | PASS |
| coordRole | `display_marker` | `display_marker` | PASS |
| sourceFile | `data/places/by/oslo/oslo_domkirke.json` | `places/by/oslo/oslo_domkirke.json` | PASS |

## Override result

- `data/places/coordinate_overrides.json` contains no override for `oslo_domkirke`.
- `places_index.json` is therefore generated directly from the canonical place source.

## Removed conflicting provenance

Removed from canonical active `oslo_domkirke`:

- `sourceObjectId: geonorge-adresser-v1:0301:13630:11`
- address `Karl Johans gate 11, 0154 Oslo, NO`
- `coordSource: geonorge_adresser_v1`
- `coordType: address_point`
- `sourceProvider: official_address`
- address-point/geocoding precision field `geocodeAccuracy`

## Status

PASS
