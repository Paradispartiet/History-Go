# Place Data Assets – Jobb 2 (små/mellomstore filer med blandet asset-type)

Dato: 2026-04-30

## Behandlede filer

- `data/places/places_historie.json`
- `data/places/places_vitenskap.json`
- `data/places/places_subkultur.json`

## Utført

- Kjørte `node tools/audit-place-data.mjs` før og etter.
- Leste:
  - `reports/place-data-audit.md`
  - `reports/place-data-remaining-work.md`
  - `reports/place-data-assets-small-files.md`
  - de tre place-filene.
- Kartla eksisterende assets i repoet under `bilder/places/` og `bilder/kort/places/`.

## Steder som fikk `image`

- `universitetets_gamle_hovedbygning`
  - gammel: `bilder/places/univers_gamle.PNG`
  - ny: `bilder/places/Univers_gamle.PNG`
  - grunn: eksakt eksisterende fil med åpenbar case-feil.

## Steder som fikk `cardImage`

- `gamle_trikkestallen`
  - gammel: `bilder/kort/places/Trikkestallen.PNG`
  - ny: `bilder/kort/places/Trikkestallen .PNG`
  - grunn: eksakt eksisterende fil med åpenbar filnavn-variasjon (mellomrom før `.PNG`).
- `universitetets_gamle_hovedbygning`
  - gammel: `bilder/kort/places/universitetets_gamle_hovedbygning.PNG`
  - ny: `bilder/kort/places/universitetetets_gamle_hovedbygning.PNG`
  - grunn: eksakt eksisterende fil med åpenbar skrivefeil-variant i lagret asset-navn.
- `hausmania`
  - ny: `bilder/kort/places/hausmania.PNG`
  - grunn: manglet `cardImage`, og eksakt place-id-match finnes i repo.

## Ødelagte paths som ble rettet

1. `data/places/places_historie.json`
   - `gamle_trikkestallen.cardImage`
   - `bilder/kort/places/Trikkestallen.PNG` -> `bilder/kort/places/Trikkestallen .PNG`
2. `data/places/places_vitenskap.json`
   - `universitetets_gamle_hovedbygning.image`
   - `bilder/places/univers_gamle.PNG` -> `bilder/places/Univers_gamle.PNG`
3. `data/places/places_vitenskap.json`
   - `universitetets_gamle_hovedbygning.cardImage`
   - `bilder/kort/places/universitetets_gamle_hovedbygning.PNG` -> `bilder/kort/places/universitetetets_gamle_hovedbygning.PNG`

## Fortsatt manglende `image`/`cardImage`

- `places_historie`
  - `gamlebyen_gravlund`: mangler `image`, `cardImage`
  - `akerhus_slott`: mangler `image`, `cardImage`
- `places_vitenskap`
  - `gamlebyen_skole`: mangler `image`, `cardImage`
- `places_subkultur`
  - `hausmania`: mangler `image`
  - `skur13`: mangler `image`, `cardImage`
  - `torggata_blad`: mangler `image`, `cardImage`
  - `stovnertarnet`: mangler `image`, `cardImage`

## Ødelagte paths som fortsatt står igjen

- `places_historie`
  - `sofienberg_kirke.cardImage = bilder/kort/places/sofienberg_kirke.PNG`
- `places_subkultur`
  - `sofienbergparken_subkultur.cardImage = bilder/kort/places/sofienbergparken.PNG`

## Hvorfor resterende ikke ble fylt/rettet

- Ingen 100 % sikker eksisterende asset-match etter reglene (eksakt place-id, etablert navnekonvensjon eller åpenbar teknisk feil).
- For gjenværende mangler/ødelagte paths finnes det ikke en entydig korrekt filbane i repoet uten å gjette.

## Før/etter-tall for de tre filene

| Fil | Mangler image (før) | Mangler image (etter) | Mangler cardImage (før) | Mangler cardImage (etter) | Ødelagte asset paths (før) | Ødelagte asset paths (etter) |
|---|---:|---:|---:|---:|---:|---:|
| `data/places/places_historie.json` | 2 | 2 | 2 | 2 | 2 | 1 |
| `data/places/places_vitenskap.json` | 1 | 1 | 1 | 1 | 1 | 0 |
| `data/places/places_subkultur.json` | 4 | 4 | 4 | 3 | 1 | 1 |

## Globale tall (audit)

- Ødelagte asset paths: **120 -> 117**
- Ugyldige place-referanser: **0 -> 2**

