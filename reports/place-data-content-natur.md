# Place data content – natur (places_natur.json)

Dato: 2026-04-30

## Ferdigstilte steder

- `botanisk_hage`
- `sognsvann`

## Felt som ble lagt til

For begge stedene ble følgende felt lagt til:

- `popupDesc`
- `emne_ids`
- `quiz_profile`

## Brukte emne_ids

- `em_nat_by_natur_motepunkt`
- `em_nat_okologi_grenser`

Begge emne-id-ene finnes i `data/fag/natur/emner_natur.json` og er brukt på begge stedene.

## Asset-status (fortsatt åpne forhold)

Ingen bildebaner ble lagt til eller endret i denne runden.

Følgende mangler står fortsatt igjen i `places_natur.json`:

- `botanisk_hage`: mangler `image` og `cardImage`
- `sognsvann`: mangler `image` og `cardImage`

## Før/etter fra audit (places_natur.json)

Basert på audit før og etter innholdsarbeidet:

- Manglende `popupDesc`: **2 → 0**
- Manglende `emne_ids`: **2 → 0**
- Manglende `quiz_profile`: **2 → 0**

## Global konsistens

- Globale ugyldige place-referanser er fortsatt **0**.
