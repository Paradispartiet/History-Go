# Place Data Assets – Jobb 3 (`places_kunst.json`)

Dato: 2026-04-30

## Behandlede steder

- `nasjonalmuseet`
- `munch_museet`
- `astrup_fearnley`
- `vigelandsparken`
- `ekebergparken`
- `tjuvholmen`
- `barcode`

## Utført metode

- Kjørte `node tools/audit-place-data.mjs` før og etter endring.
- Leste:
  - `reports/place-data-audit.md`
  - `reports/place-data-remaining-work.md`
  - `reports/place-data-assets-small-files.md`
  - `reports/place-data-assets-mixed-small-files.md`
  - `reports/place-data-invalid-reference-fix.md`
  - `data/places/places_kunst.json`
- Kartla eksisterende assets i repoet, særlig i:
  - `bilder/places/`
  - `bilder/kort/places/`
  - `bilder/kort/places/by/`
- Brukte kun 100 % sikre matcher mot faktisk eksisterende filer.

## Steder som fikk `image`

- `nasjonalmuseet`
  - `image`: `bilder/places/Nasjonalmuseet.JPG`

## Steder som fikk `cardImage`

- `nasjonalmuseet`
  - `cardImage`: `bilder/kort/places/Nasjonalmuseet.JPG`

## Steder som fortsatt mangler `image` og/eller `cardImage`

- `munch_museet` (mangler begge)
- `astrup_fearnley` (mangler begge)
- `vigelandsparken` (mangler begge)
- `ekebergparken` (mangler begge)
- `tjuvholmen` (mangler begge)
- `barcode` (mangler begge)

### Hvorfor resterende ikke ble fylt

- Ingen 100 % sikker eksisterende asset-match i repoet for disse id-ene etter reglene.
- Ingen bruk av generiske kunst-/museum-/bybilder.
- Ingen kopiering av potensielt ødelagte paths fra `places_by.json` uten at filene faktisk eksisterer.

## Før/etter for `data/places/places_kunst.json`

- Mangler `image`: **7 -> 6**
- Mangler `cardImage`: **7 -> 6**
- Ødelagte asset paths: **0 -> 0**

## Globale tall (audit)

- Antall ødelagte asset paths: **117 -> 117**
- Antall ugyldige place-referanser: **0 -> 0**
