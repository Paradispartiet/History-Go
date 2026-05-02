# i18n manifest duplicate IDs report

## 1) Kort status
- Manifest-filer: **30**
- Master places (aktive via manifest): **264**
- Duplicate master place IDs: **6**
- Audit (`en`): OK **60**, Missing **202**, Stale **2**, Missing `_sourceHash` **0**, Extra translation IDs **1**
- Quality (`en`): Entries checked **63**, Entries with issues **3**, Errors **3**, Warnings **0**

## 2) Full tabell for duplicate IDs

| ID | Forekomster (aktive manifest-filer) | Først brukt av manifest-loader | Identiske / ulike | Sannsynlig årsak | Anbefalt minimal retting |
|---|---|---|---|---|---|
| `sagene_film` | `places_oslo_film.json`, `places_oslo_media.json` | `data/places/film/oslo/places_oslo_film.json` | Identiske (samme name/category/lat/lon/r, ingen year) | a) samme sted i to category-filer (film + media) | Slett én kopi (behold i mest naturlig domene, trolig film) |
| `kampen_film` | `places_oslo_film.json`, `places_oslo_media.json` | `data/places/film/oslo/places_oslo_film.json` | Identiske (samme name/category/lat/lon/r, ingen year) | a) samme sted i to category-filer (film + media) | Slett én kopi (samme strategi som `sagene_film`) |
| `frysja_industriomrade` | `places_naeringsliv.json`, `places_oslo_natur_akerselvarute.json` | `data/places/naeringsliv/oslo/places_naeringsliv.json` | Ulike (`category`: `naeringsliv` vs `historie`; `year`: 1750 vs 1880; øvrig lik) | c) route/hovedsted-lignende rute-duplikat (samme punkt brukt i annen tematisk/rute-fil) | Krever modellbeslutning om canonical kildefil + harmonisert metadata før sletting |
| `alnaelva` | `places_oslo_alna.json`, `places_oslo_natur_hovedsteder.json` | `data/places/natur/oslo/places_oslo_alna.json` | Ulike (`year`: null vs 2005; `lat/lon/r` ulike; name/category like) | c) hovedsted/temapakke-duplikat (samme ID brukt for ulik representasjon/utstrekning) | Ikke autoslett; avklar om dette skal være samme POI-ID eller egen rute-/hovedsteds-ID |
| `tronsmo_bokhandel` | `places_litteratur.json`, `places_oslo_populaerkultur.json` | `data/places/litteratur/oslo/places_litteratur.json` | Identiske (samme name/category? nei: `litteratur` vs `popkultur`; year/lat/lon/r like) | a) samme sted i to category-filer, men med ulik kategori | Behold én master-entry; flytt kategoriansvar til én fil og referer ellers via i18n/quiz-logikk (ikke duplikat) |
| `eldorado_esport` | `places_oslo_media.json`, `places_oslo_populaerkultur.json` | `data/places/media/oslo/places_oslo_media.json` | Identiske (samme name/category/year/lat/lon/r) | a) samme sted i to category-filer (media + popkultur) | Slett én kopi (behold i valgt canonical fil) |

## 3) Detalj per ID

### `sagene_film`
- Forekomst 1 (vinner): `data/places/film/oslo/places_oslo_film.json`
  - `name`: Sagene (filmbydel)
  - `category`: film_tv
  - `year`: (ikke satt)
  - `lat/lon/r`: 59.9372 / 10.7566 / 220
- Forekomst 2 (ignoreres av loader): `data/places/media/oslo/places_oslo_media.json`
  - Felter matcher forekomst 1.
- Konklusjon: ren manifest-aktiv duplikatkopi mellom to kategorifiler.

### `kampen_film`
- Forekomst 1 (vinner): `data/places/film/oslo/places_oslo_film.json`
  - `name`: Kampen (film- og serieområde)
  - `category`: film_tv
  - `year`: (ikke satt)
  - `lat/lon/r`: 59.9148 / 10.7895 / 200
- Forekomst 2 (ignoreres av loader): `data/places/media/oslo/places_oslo_media.json`
  - Felter matcher forekomst 1.
- Konklusjon: ren manifest-aktiv duplikatkopi mellom to kategorifiler.

### `frysja_industriomrade`
- Forekomst 1 (vinner): `data/places/naeringsliv/oslo/places_naeringsliv.json`
  - `name`: Frysja industriområde
  - `category`: naeringsliv
  - `year`: 1750
  - `lat/lon/r`: 59.9608 / 10.7726 / 260
- Forekomst 2 (ignoreres av loader): `data/places/natur/oslo/places_oslo_natur_akerselvarute.json`
  - `name`: Frysja industriområde
  - `category`: historie
  - `year`: 1880
  - `lat/lon/r`: 59.9608 / 10.7726 / 260
- Avvik: `category`, `year`.
- Konklusjon: ikke bare kopi; sannsynlig temakonflikt mellom næringsliv-master og ruteorientert natur/historie-entry.

### `alnaelva`
- Forekomst 1 (vinner): `data/places/natur/oslo/places_oslo_alna.json`
  - `name`: Alnaelva
  - `category`: natur
  - `year`: null
  - `lat/lon/r`: 59.9325 / 10.833 / 400
- Forekomst 2 (ignoreres av loader): `data/places/natur/oslo/places_oslo_natur_hovedsteder.json`
  - `name`: Alnaelva
  - `category`: natur
  - `year`: 2005
  - `lat/lon/r`: 59.921 / 10.8036 / 750
- Avvik: `year`, `lat`, `lon`, `r`.
- Konklusjon: samme ID brukt for to ulike geografiske representasjoner (POI vs større hovedsteds/ruteflate).

### `tronsmo_bokhandel`
- Forekomst 1 (vinner): `data/places/litteratur/oslo/places_litteratur.json`
  - `name`: Tronsmo Bokhandel
  - `category`: litteratur
  - `year`: 1973
  - `lat/lon/r`: 59.9191 / 10.7447 / 80
- Forekomst 2 (ignoreres av loader): `data/places/popkultur/oslo/places_oslo_populaerkultur.json`
  - `name`: Tronsmo Bokhandel
  - `category`: popkultur
  - `year`: 1973
  - `lat/lon/r`: 59.9191 / 10.7447 / 80
- Avvik: `category`.
- Konklusjon: semantisk dobbelplassering på tvers av tema.

### `eldorado_esport`
- Forekomst 1 (vinner): `data/places/media/oslo/places_oslo_media.json`
  - `name`: Eldorado Esport & Gaming
  - `category`: popkultur
  - `year`: 2019
  - `lat/lon/r`: 59.9139 / 10.7498 / 120
- Forekomst 2 (ignoreres av loader): `data/places/popkultur/oslo/places_oslo_populaerkultur.json`
  - Felter matcher forekomst 1.
- Konklusjon: ren manifest-aktiv duplikatkopi mellom to kategorifiler.

## 4) i18n-konsekvens
- Stale translations (2):
  - `damstredet_telthusbakken`
  - `var_frelsers_gravlund`
- Extra translation ID (1):
  - `botanisk_hage`
- Quality errors (3):
  - `botanisk_hage`: `extra_translation_id`
  - `damstredet_telthusbakken`: `stale_sourceHash`
  - `var_frelsers_gravlund`: `stale_sourceHash`
- Kobling mot de 6 duplicate ID-ene:
  - **Ingen direkte kobling** i audit/quality-output; de 3 quality-feilene gjelder andre IDs.
  - Duplicate-IDene øker risiko for feil master-kilde ved senere stempling/oversettelse, men forklarer ikke de nåværende 3 quality-feilene direkte.

## 5) Neste trygge PR
- Kan ryddes først (lav risiko):
  - `sagene_film`, `kampen_film`, `eldorado_esport` (praktisk identiske kopier).
- Krever modellbeslutning før opprydding:
  - `frysja_industriomrade` (ulik `year` + `category`),
  - `alnaelva` (ulik geometri/omfang),
  - `tronsmo_bokhandel` (ulik tematisk `category`).
- Bør ikke røres automatisk:
  - `alnaelva` og `frysja_industriomrade` (kan være bevisste, ulike presentasjonsnivåer).
- ID-endring vurderes:
  - Hvis semantisk ulike objekter faktisk skal leve parallelt, gi unike IDs (f.eks. suffix for `route`/`hovedsted`) i stedet for delt ID.
- Flyttes ut av manifest:
  - Ingen anbefaling om manifest-endring før canonical datamodell er vedtatt.
- Gamle kopier som kan slettes:
  - De tre identiske duplikatparene etter bekreftelse av canonical fil-eierskap.

## 6) Ikke gjør ennå
- Ikke oversett videre før duplicate-strategi er avklart.
- Ikke kjør generell i18n-batch som skriver nye hashes over konfliktgrunnlag.
- Ikke endre `_sourceHash` manuelt.
- Ikke endre manifest-rekkefølge/innhold før årsak og canonical eierskap per ID er besluttet.
