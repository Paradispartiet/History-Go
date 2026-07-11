# Oslo popkultur — Chat Noir place validation

Generated: 2026-07-11

## Scope

Adds `chat_noir` as a new Oslo popular-culture place.

## Added / changed files

- `data/places/popkultur/oslo/places_oslo_populaerkultur/chat_noir.json`
- `data/places/popkultur/oslo/places_oslo_populaerkultur_manifest.json`
- `data/places/popkultur/oslo/places_oslo_populaerkultur_index.json`
- `reports/oslo-popkultur-chat-noir-place-validation.md`

## Classification

- Category: `populaerkultur`
- Primary place id: `chat_noir`
- Display name: `Chat Noir`
- Year: `1912`
- Coordinates: `59.913606, 10.732175`
- Coordinate status: `manual_review`
- Coordinate type: `building_center`

## Source basis

- Chat Noir was founded as a cabaret in 1912 by Bokken Lasson and Vilhelm Dybwad.
- The original venue opened in the Tivoli building.
- The current address is Klingenberggata 5.
- Victor Bernau developed the literary cabaret into a modern revue theatre.
- Later leadership and institutional periods include Johan Henrik Wiers-Jenssen, Jens Book-Jenssen, Ernst Diesen, Egil Monn-Iversen, Einar Schanke and Tom Sterri.
- The theatre was damaged by fire in 1963 and reopened in 1964.

## Duplicate gate

Repository search before creation returned no existing place file or active place id for `chat_noir`.

## Runtime/index note

This PR updates the split place file, split manifest and split index. It does not regenerate global `data/places/places_index.json`.

Recommended after merge:

```bash
mkdir -p reports/chat-noir-place-audit
npm run places:index:build | tee reports/chat-noir-place-audit/places-index-build.txt
npm run build:tools | tee reports/chat-noir-place-audit/build-tools.txt
grep -n '"id": "chat_noir"' data/places/places_index.json | tee reports/chat-noir-place-audit/chat-noir-index-check.txt
```
