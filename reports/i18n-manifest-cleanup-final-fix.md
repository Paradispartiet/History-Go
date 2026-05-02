# i18n manifest cleanup – final fix

## 1) Hva som ble rettet
- Duplicate master place IDs før: **6**
- Duplicate master place IDs etter: **0**
- Stale før: **2**
- Stale etter: **0**
- Extra translation IDs før: **1**
- Extra translation IDs etter: **0**
- Quality errors før: **3**
- Quality errors etter: **0**

## 2) Dataendringer per duplicate ID

### sagene_film
- Canonical fil: `data/places/film/oslo/places_oslo_film.json`
- Fjernet fra sekundærfil: `data/places/media/oslo/places_oslo_media.json`
- Fletting: Nei (entries var identiske)
- Ikke flettet: N/A

### kampen_film
- Canonical fil: `data/places/film/oslo/places_oslo_film.json`
- Fjernet fra sekundærfil: `data/places/media/oslo/places_oslo_media.json`
- Fletting: Nei (entries var identiske)
- Ikke flettet: N/A

### eldorado_esport
- Canonical fil: `data/places/media/oslo/places_oslo_media.json`
- Fjernet fra sekundærfil: `data/places/popkultur/oslo/places_oslo_populaerkultur.json`
- Fletting: Nei (entries var identiske)
- Ikke flettet: N/A

### tronsmo_bokhandel
- Canonical fil: `data/places/litteratur/oslo/places_litteratur.json`
- Fjernet fra sekundærfil: `data/places/popkultur/oslo/places_oslo_populaerkultur.json`
- Fletting: Nei
- Ikke flettet: Popkultur-varianten var en smal duplicate uten unike strukturfelt (manglet popupDesc/emne_ids/quiz_profile); litteratur-master dekker tegneserie/perspektiv allerede i desc.

### frysja_industriomrade
- Canonical fil: `data/places/naeringsliv/oslo/places_naeringsliv.json`
- Fjernet fra sekundærfil: `data/places/natur/oslo/places_oslo_natur_akerselvarute.json`
- Fletting: Nei
- Ikke flettet: Canonical hadde allerede full popupDesc + emne_ids + quiz_profile for industri/arbeid; natur-rutevarianten var alternativ vinkling og ville gjeninnføre duplicate-perspektiv på samme ID.

### alnaelva
- Canonical fil: `data/places/natur/oslo/places_oslo_alna.json`
- Fjernet fra sekundærfil: `data/places/natur/oslo/places_oslo_natur_hovedsteder.json`
- Fletting: Ja
- Flettet inn: `anchors`, `coordNote`, `coordPrecisionM`, semantisk koordinatstatus, `popupDesc`, `emne_ids`, `quiz_profile`, og ruteforankret kildehint fra hovedsteder-varianten inn i canonical Alna-fil.

## 3) i18n-endringer
- `damstredet_telthusbakken` oppdatert mot gjeldende norsk mastertekst (desc + popupDesc) og restemplet hash.
- `var_frelsers_gravlund` oppdatert mot gjeldende norsk mastertekst (desc + popupDesc) og restemplet hash.
- `botanisk_hage` fjernet fra `en.json` (extra translation ID uten aktiv master).
- Antall entries i `en.json` før/etter: **63 → 62**.

## 4) Kontrollresultater

### audit (en)
- OK: **62**
- Missing: **202** (forventet/akseptabelt)
- Stale: **0**
- Missing _sourceHash: **0**
- Extra translation IDs: **0**
- Duplicate master place IDs: **0**

### quality (en)
- Entries checked: **62**
- Entries with issues: **0**
- Errors: **0**
- Warnings: **0**

## 5) Scope
Bekreftet:
- `data/places/manifest.json` ikke endret.
- Runtime JS ikke endret.
- CSS ikke endret.
- `js/boot.js` ikke endret.
- quiz/progresjon/unlock/kart ikke endret.
- service worker ikke endret.
