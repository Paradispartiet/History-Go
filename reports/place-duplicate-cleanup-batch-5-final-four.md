# Place duplicate cleanup – batch 5 final four

Dato: 2026-05-01

## 1) Kort status før batch

- Duplicate ID count før: **4**
- Gjenstående duplicate IDs før:
  - `deichman_bjorvika`
  - `var_frelsers_gravlund`
  - `vigelandsparken`
  - `voienvolden`

(Kilde: batch-4-regression-fix-rapport og ny verifikasjon før opprydding.)

## 2) Rydding per ID

### A) `deichman_bjorvika`

- Forekomster funnet:
  - `data/places/places_by.json`
  - `data/places/places_litteratur.json`
- Valgt masterfil: `data/places/places_by.json`
- Sekundærfil med fjernet entry:
  - `data/places/places_litteratur.json`
- Bevarte perspektiver i master:
  - bibliotek som offentlig kunnskapsrom
  - litteratur/lesing/formidling/demokratisk offentlighet
  - Bjørvika-transformasjonen og waterfront/byutvikling
  - kontrast mellom kommersiell utvikling og ikke-kommersiell møteplass
- `emne_ids` flettet:
  - beholdt fra master
  - lagt til fra sekundær: `em_by_transformasjon_ombruk`
- `quiz_profile` flettet:
  - flettet uten dubletter: `signature_features`, `primary_angles`, `question_families`, `avoid_angles`, `must_include`, `contrast_targets`
  - `place_type`/`subtype` beholdt fra master
  - `notes` utvidet for å bevare litteratur-/offentlighetsperspektiv
- `desc`/`popupDesc`:
  - begge oppdatert/flettet for å ivareta både by- og litteraturperspektiv
- Coord-metadata:
  - beholdt fra master (`building_center`, `verified`, `manual_map_check`, `2026-04-30`)
- Ikke-flettede felt:
  - `image`/`cardImage` fra sekundær ikke overført (master hadde allerede konsistente assets)

### B) `var_frelsers_gravlund`

- Forekomster funnet:
  - `data/places/places_historie.json`
  - `data/places/places_litteratur.json`
- Valgt masterfil: `data/places/places_historie.json`
- Sekundærfil med fjernet entry:
  - `data/places/places_litteratur.json`
- Bevarte perspektiver i master:
  - historisk minnested/gravlund
  - litterært minnelandskap (Wergeland, Ibsen, Bjørnson m.fl.)
  - kollektiv hukommelse og kulturhistorisk kanon
  - gravlund som arkiv i landskapsform
- `emne_ids` flettet:
  - lagt til fra sekundær: `em_by_navneskilt_plaketter_minner`
  - øvrige beholdt fra master
- `quiz_profile` flettet:
  - flettet uten dubletter: `signature_features`, `primary_angles`, `question_families`, `avoid_angles`, `must_include`, `contrast_targets`
  - `notes` oppdatert med tydelig historisk+litterær fagretning
- `desc`/`popupDesc`:
  - begge oppdatert/flettet for å bevare historisk master med tydelig litterær dimensjon
- Coord-metadata:
  - beholdt fra historie-master (`area_center`, `needs_manual_map_check`, `approximate_manual_lookup`)
- Ikke-flettede felt:
  - sekundær manglet ekstra coord-metadata-felt utover standardfelter; ingen strukturkonflikt

### C) `vigelandsparken`

- Forekomster funnet:
  - `data/places/places_by.json`
  - `data/places/places_kunst.json`
- Valgt masterfil: `data/places/places_by.json`
- Sekundærfil med fjernet entry:
  - `data/places/places_kunst.json`
- Bevarte perspektiver i master:
  - park/byrom og folkebruk
  - skulpturanlegg av Gustav Vigeland
  - kropp/form/monumentalitet/offentlig kunst
  - nasjonal kunstkanon i samspill med grøntrom og hverdagsbruk
- `emne_ids` flettet:
  - lagt til kunst-emner fra sekundær (`em_kunst_offentlig_kunst_monumenter`, `em_kunst_representasjon_og_abstraksjon`, `em_kunst_institusjoner_kanon`)
- `quiz_profile` flettet:
  - flettet uten dubletter: `signature_features`, `primary_angles`, `question_families`, `avoid_angles`, `must_include`, `contrast_targets`
  - `notes` omskrevet for å sikre kunst+byrom-dobbelthet
- `desc`/`popupDesc`:
  - oppdatert/flettet for å bevare både kunstfaglig presisjon og byromsperspektiv
- Coord-metadata:
  - uendret (identisk mellom forekomster; beholdt fra master)
- Ikke-flettede felt:
  - ingen relevante ekstrafelter i sekundær uten tilsvarende verdi i master

### D) `voienvolden`

- Forekomster funnet:
  - `data/places/places_by.json`
  - `data/places/places_litteratur.json`
- Valgt masterfil: `data/places/places_by.json`
- Sekundærfil med fjernet entry:
  - `data/places/places_litteratur.json`
- Bevarte perspektiver i master:
  - historisk gård/kulturminne
  - overgang land/by og Sagene-bystruktur
  - Wergeland-/litteraturkobling
  - privat liv, offentlig idé og kulturhistorisk stedserfaring
- `emne_ids` flettet:
  - ingen nye unike fra sekundær utover det master allerede hadde
- `quiz_profile` flettet:
  - flettet uten dubletter: `signature_features`, `primary_angles`, `question_families`, `avoid_angles`, `must_include`, `contrast_targets`
  - `notes` oppdatert med byhistorisk + litterær retning
- `desc`/`popupDesc`:
  - oppdatert/flettet for å sikre begge perspektiver
- Coord-metadata:
  - beholdt fra master (`historical_site`, `verified`, `manual_map_check`, `2026-04-30`)
- Ikke-flettede felt:
  - sekundær `image` ikke overført; master hadde allerede fungerende bildeoppsett

## 3) Status etter batch

- Duplicate ID count etter: **0**
- Gjenstående duplicate IDs: ingen

## 4) i18n-konsekvens

Berørte IDs som kan ha stale `_sourceHash` etter tekstfletting:
- `deichman_bjorvika`
- `var_frelsers_gravlund`
- `vigelandsparken`
- `voienvolden`

Bekreftet:
- i18n content-filer ble **ikke** endret i denne batchen.

## 5) Avgrensning

Bekreftet:
- runtime JS ble ikke endret
- CSS ble ikke endret
- `js/boot.js` ble ikke endret
- `data/places/manifest.json` ble ikke endret
- i18n-filer ble ikke endret
- quiz/progresjon/unlock/kart-logikk ble ikke endret
