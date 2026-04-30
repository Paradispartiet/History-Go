# Place-data Remaining Work (etter siste merges)

Basert på: `node tools/audit-place-data.mjs` kjørt 2026-04-30, og `reports/place-data-audit.md`.

## A) Totalsammendrag

- Totalt antall places (manifest): **228**
- Antall mangler `year`: **48**
- Antall mangler `popupDesc`: **49**
- Antall mangler `emne_ids`: **49**
- Antall mangler `quiz_profile`: **49**
- Antall mangler `image`: **136**
- Antall mangler `cardImage`: **136**
- Antall ødelagte asset paths: **120**
- Globale ugyldige place-referanser: **0**

## B) Restliste per fil (de etterspurte rundene)

Kun filer fra rundene:
`places_historie`, `places_kunst`, `places_litteratur`, `places_vitenskap`, `places_politikk`, `places_musikk`, `places_sport`, `places_subkultur`, `places_natur`, `places_naeringsliv`, `places_oslo_natur_akerselvarute`.

| Fil | Places | Mangler year | Mangler popupDesc | Mangler emne_ids | Mangler quiz_profile | image/cardImage-mangler | Ødelagte asset paths |
|---|---:|---:|---:|---:|---:|---:|---:|
| `data/places/places_historie.json` | 10 | 0 | 0 | 0 | 0 | 2 | 2 |
| `data/places/places_kunst.json` | 7 | 0 | 0 | 0 | 0 | 7 | 0 |
| `data/places/places_litteratur.json` | 24 | 0 | 0 | 0 | 0 | 1 | 12 |
| `data/places/places_vitenskap.json` | 5 | 0 | 0 | 0 | 0 | 1 | 1 |
| `data/places/places_politikk.json` | 6 | 0 | 0 | 0 | 0 | 6 | 0 |
| `data/places/places_musikk.json` | 6 | 0 | 0 | 0 | 0 | 6 | 0 |
| `data/places/places_sport.json` | 3 | 0 | 0 | 0 | 0 | 3 | 0 |
| `data/places/places_subkultur.json` | 5 | 0 | 0 | 0 | 0 | 4 | 1 |
| `data/places/places_natur.json` | 2 | 0 | 0 | 0 | 0 | 2 | 0 |
| `data/places/places_naeringsliv.json` | 33 | 0 | 0 | 0 | 0 | 27 | 3 |
| `data/places/oslo/places_oslo_natur_akerselvarute.json` | 24 | 0 | 0 | 0 | 0 | 24 | 0 |

## C) Konkret restliste (steder som mangler innholdsfelt)

Status for de 11 etterspurte filene: **ingen steder mangler innholdsfeltene** `year`, `popupDesc`, `emne_ids`, `quiz_profile`.

- **Tom liste** (0 steder).

> Merk: Globale mangler på innholdsfelt finnes fortsatt i andre manifest-filer (f.eks. `data/places/oslo/places_oslo_natur_hovedsteder.json` og `data/places/places_by.json`), men de inngår ikke i de 11 rundene over.

## D) Skille mellom arbeidstyper

### 1) Innholdsjobb (`year` / `popupDesc` / `emne_ids` / `quiz_profile`)

- **For de 11 rundefilene: ingen gjenstående innholdsjobb.**

### 2) Asset-jobb (`image`/`cardImage` eller ødelagte paths)

Gjenstår i alle disse rundefilene:

- `places_oslo_natur_akerselvarute` (24 med image/cardImage-mangler)
- `places_naeringsliv` (27 med image/cardImage-mangler, 3 med ødelagte paths)
- `places_litteratur` (1 med image/cardImage-mangel, 12 med ødelagte paths)
- `places_kunst` (7 med image/cardImage-mangler)
- `places_politikk` (6 med image/cardImage-mangler)
- `places_musikk` (6 med image/cardImage-mangler)
- `places_subkultur` (4 med image/cardImage-mangler, 1 med ødelagt path)
- `places_sport` (3 med image/cardImage-mangler)
- `places_historie` (2 med image/cardImage-mangler, 2 med ødelagte paths)
- `places_natur` (2 med image/cardImage-mangler)
- `places_vitenskap` (1 med image/cardImage-mangel, 1 med ødelagt path)

### 3) Kvalitetssjekk (duplikater / kategori-/schemaavvik)

- Ingen globale ugyldige place-referanser i audit (0).
- Mulige duplikater på tvers av filer bør vurderes manuelt i senere QA (f.eks. samme sted-id brukt i flere temafiler der det er tilsiktet eller utilsiktet).
- Ingen dokumenterte schema-brudd i audit utover felt-/asset-funnene over.

### 4) Ferdige filer (uten mangler i innholdsfeltene `year`/`popupDesc`/`emne_ids`/`quiz_profile`)

Alle de 11 etterspurte rundefilene er ferdige på **innholdsfelter**:

- `data/places/places_historie.json`
- `data/places/places_kunst.json`
- `data/places/places_litteratur.json`
- `data/places/places_vitenskap.json`
- `data/places/places_politikk.json`
- `data/places/places_musikk.json`
- `data/places/places_sport.json`
- `data/places/places_subkultur.json`
- `data/places/places_natur.json`
- `data/places/places_naeringsliv.json`
- `data/places/oslo/places_oslo_natur_akerselvarute.json`

## E) Anbefalt rekkefølge videre (3–6 neste Codex-jobber, ikke utført)

Prioritering brukt: små avgrensede filer først, deretter store Oslo-rutefiler, asset-path-runde til slutt.

1. **Jobb 1 – små filer, rene image/cardImage-hull:**
   - `places_natur`, `places_sport`, `places_politikk`, `places_musikk`.
2. **Jobb 2 – små/mellomstore med blandet asset-type:**
   - `places_historie`, `places_vitenskap`, `places_subkultur`.
3. **Jobb 3 – `places_kunst`:**
   - fyll image/cardImage konsistent for alle 7.
4. **Jobb 4 – `places_litteratur`:**
   - først rette 12 ødelagte paths, så 1 manglende image/cardImage.
5. **Jobb 5 – `places_naeringsliv`:**
   - fylle 27 mangler + rette 3 ødelagte paths.
6. **Jobb 6 – stor Oslo-rutefil + avsluttende asset-path-runde:**
   - `places_oslo_natur_akerselvarute` (24 mangler), deretter samlet verifikasjonsrunde av alle asset-paths i hele manifestet.

---

Denne rapporten er en ren audit/rapport-status. Ingen place-data, manifest, UI/runtime eller assets er endret.
