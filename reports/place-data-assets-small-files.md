# Place Data Assets – Jobb 1 (små filer)

Dato: 2026-04-30

## Behandlede filer

- `data/places/places_natur.json`
- `data/places/places_sport.json`
- `data/places/places_politikk.json`
- `data/places/places_musikk.json`

## Utført metode

- Kjørte `node tools/audit-place-data.mjs` før og etter.
- Leste `reports/place-data-audit.md` og `reports/place-data-remaining-work.md`.
- Kartla eksisterende assets i repoet med fokus på:
  - `bilder/places/`
  - `bilder/kort/places/`
  - eventuelle undermapper
- Verifiserte om noen filer matchet sted-id-ene sikkert (eksakt place-id/mønster).

## Resultat per sted

### `places_natur.json`
- `botanisk_hage`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `sognsvann`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.

### `places_sport.json`
- `ullevaal_stadion`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `valle_hovin`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `holmenkollen`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.

### `places_politikk.json`
- `stortinget`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `youngstorget`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `oslo_radhus`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `eidsvolls_plass`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `tinghuset`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `regjeringskvartalet`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.

### `places_musikk.json`
- `salt`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `det_norske_teatret`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `blaa`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `rockefeller`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `john_dee`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.
- `sentrum_scene`: ingen sikker eksisterende `image` eller `cardImage`-asset funnet.

## Hva som ble fylt

- `image`: ingen felter fylt.
- `cardImage`: ingen felter fylt.
- Brukte asset-paths: ingen (ingen 100 % sikre matcher eksisterte for disse place-id-ene).

## Hva som fortsatt mangler og hvorfor

Alle 17 steder over mangler fortsatt både `image` og `cardImage`.

Årsak:
- Ingen eksakt/sikker asset-match i repoet etter kravene (place-id-likhet eller etablert navnemønster med entydig stedstilknytning).
- Potensielt like eller tematiske filer ble ikke brukt, i tråd med reglene om å unngå usikre matcher.

## Før/etter-tall for de fire filene

| Fil | Mangler image (før) | Mangler image (etter) | Mangler cardImage (før) | Mangler cardImage (etter) | Ødelagte asset paths (før) | Ødelagte asset paths (etter) |
|---|---:|---:|---:|---:|---:|---:|
| `data/places/places_natur.json` | 2 | 2 | 2 | 2 | 0 | 0 |
| `data/places/places_sport.json` | 3 | 3 | 3 | 3 | 0 | 0 |
| `data/places/places_politikk.json` | 6 | 6 | 6 | 6 | 0 | 0 |
| `data/places/places_musikk.json` | 6 | 6 | 6 | 6 | 0 | 0 |

## Globale tall (audit)

- Ødelagte asset paths: **120 → 120**
- Ugyldige place-referanser: **0 → 0**
