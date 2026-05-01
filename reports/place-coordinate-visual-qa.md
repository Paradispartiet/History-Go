# Place coordinate visual QA

Generert: 2026-05-01

## Aktive place-filer lest
- data/places/places_by.json
- data/places/places_historie.json
- data/places/places_kunst.json
- data/places/places_litteratur.json
- data/places/places_musikk.json
- data/places/places_naeringsliv.json
- data/places/places_natur.json
- data/places/places_politikk.json
- data/places/places_sport.json
- data/places/places_subkultur.json
- data/places/places_vitenskap.json
- data/places/oslo/places_oslo_natur_akerselvarute.json
- data/places/oslo/places_oslo_natur_hovedsteder.json
- data/places/oslo/places_oslo_natur_alnaelva_rute.json
- data/places/oslo/places_oslo_natur_ljanselva_rute.json
- data/places/oslo/places_oslo_natur_ostensjovannet.json
- data/places/oslo/places_oslo_natur_bygdoy.json

## Oppsummering
- Antall steder (aktive): **221**
- Antall steder med anchors: **20**
- Antall steder uten anchors (fallback lat/lon/r): **201**
- Antall quality warnings: **20**
- Antall quality errors: **0**

## Hva QA-siden viser
- Alle aktive steder fra `data/places/manifest.json` (ingen arkivfiler).
- Hovedpunkt for hvert sted (`lat/lon/r`) med radius-sirkel.
- Anchors med egne punkter og radius-sirkler der `anchors` finnes.
- Fargekoder:
  - grønn = verified/ok
  - blå = semantic_anchor / anchors
  - gul = needs_review / warning
  - rød = invalid / quality-gate-error
- Filter:
  - kategori
  - coordStatus
  - steder med anchors
  - steder uten anchors
  - warnings/errors fra quality gate

## Eksempler testet visuelt
- `data/places/places_by.json#ring_3` (anchor-basert unlock-rute, semantic/anchor-visning).
- `data/places/oslo/places_oslo_natur_hovedsteder.json#akerselva_hovedsteder` (flere anchors + hovedpunkt).
- `data/places/oslo/places_oslo_natur_alnaelva_rute.json#alnaelva_rute` (lineær rute med anchors).
- `data/places/places_historie.json#kampen_kirke` (fallback med kun lat/lon/r).

## Konkrete bugs funnet
- Ingen konkrete bugs funnet i unlock/distance-ankerkjøring.
- `window.getPlaceUnlockAnchors()` brukes av unlock-flyt og har fallback til stedets `lat/lon/r` når anchors mangler.
