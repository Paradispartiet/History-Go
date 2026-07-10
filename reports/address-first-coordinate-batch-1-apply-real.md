# Apply Geonorge address batch 1 for real

Dato: 2026-07-10

## Kilde og validering

Brukte kun JSON-filene i `reports/geonorge-address-batch-1/*.json` som kilde. Ingen live Geonorge-oppslag ble utført.

Alle åtte resultater ble validert med:

- `ok: true`
- `status: "verified_candidate"`
- `coordinate`-objektet som fasit

## Oppdaterte aktive source-filer

Aktiv source-fil ble funnet via `data/places/manifest.json`.

| placeId | Aktiv source-fil | Adresse | sourceObjectId |
| --- | --- | --- | --- |
| `nasjonalmuseet` | `data/places/kunst/oslo/places_kunst.json` | Brynjulf Bulls plass 3, 0250 Oslo | `geonorge-adresser-v1:0301:18199:3` |
| `munch_museet` | `data/places/kunst/oslo/places_kunst.json` | Edvard Munchs plass 1, 0194 Oslo | `geonorge-adresser-v1:0301:21680:1` |
| `astrup_fearnley` | `data/places/kunst/oslo/places_kunst.json` | Strandpromenaden 2, 0252 Oslo | `geonorge-adresser-v1:0301:21458:2` |
| `nasjonalbiblioteket` | `data/places/litteratur/oslo/places_litteratur.json` | Henrik Ibsens gate 110, 0255 Oslo | `geonorge-adresser-v1:0301:21471:110` |
| `vg_huset` | `data/places/media/oslo/places_oslo_media.json` | Akersgata 55, 0180 Oslo | `geonorge-adresser-v1:0301:10069:55` |
| `nrk_huset_marienlyst` | `data/places/media/oslo/places_oslo_media.json` | Bjørnstjerne Bjørnsons plass 1, 0340 Oslo | `geonorge-adresser-v1:0301:10722:1` |
| `deichman_grunerlokka` | `data/places/litteratur/oslo/places_litteratur.json` | Schous plass 10, 0552 Oslo | `geonorge-adresser-v1:0301:16240:10` |
| `deichman_bjorvika` | `data/places/by/oslo/places_by.json` | Anne-Cath. Vestlys plass 1, 0150 Oslo | `geonorge-adresser-v1:0301:21670:1` |

## Felter satt per place

For hvert place-objekt ble følgende felter satt fra `coordinate`:

- `lat`
- `lon`
- `r`
- `locatorType`
- `sourceProvider`
- `sourceObjectId`
- `address`
- `geocodeAccuracy`
- `coordRole`
- `coordStatus`
- `coordSource`
- `coordType`
- `coordNote`

I tillegg ble `coordVerifiedAt` satt til `2026-07-10`.

## Etterkontroll

Kjørte:

```sh
npm run build:tools
npm run places:index:check
```

`places_index.json` var i sync, så `npm run places:coords:sync` ble ikke kjørt.
