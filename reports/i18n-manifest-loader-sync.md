# i18n Manifest Loader Sync Report

## Oppdaterte scripts
- `scripts/i18n-worklist-places.js`
- `scripts/i18n-audit-places.js`
- `scripts/i18n-stamp-places.js`
- `scripts/i18n-quality-places.js`
- Ny delt helper: `scripts/i18n-place-manifest-loader.js`

## Hvordan manifest-path løses
- Hvert script leser `data/places/manifest.json`.
- Scriptet bruker kun `manifest.files`.
- Hver entry (f.eks. `places/by/oslo/places_by.json`) resolves til faktisk fil som `data/` + manifestPath, dvs. `data/places/by/oslo/places_by.json`.
- Hver resolved fil valideres med `existsSync` før bruk.
- Loader feiler tydelig ved:
  - manglende manifest
  - feil manifest-format (ikke `files: string[]`)
  - tom/ugyldig path
  - path som forsøker å gå ut av `data/`
  - path som peker på manglende fil

## Arkivfiler
- Arkivfiler leses ikke.
- Det gjøres ingen rekursiv scanning av `data/places`.
- Kun filer eksplisitt listet i `manifest.files` leses.

## Tellinger etter endring
- Antall manifest-filer funnet: **30**
- Antall master places funnet: **264**
- Duplicate master place IDs: **6**
  - `sagene_film`
  - `kampen_film`
  - `frysja_industriomrade`
  - `alnaelva`
  - `tronsmo_bokhandel`
  - `eldorado_esport`

## Audit-resultat (`en`)
- OK: **60**
- Missing: **202**
- Stale: **2**
- Missing `_sourceHash`: **0**
- Extra translation IDs: **1**
- Duplicate master place IDs: **6**

## Quality-resultat (`en`)
- Entries checked: **63**
- Entries with issues: **3**
- Errors: **3**
- Warnings: **0**

## Worklist-resultat
- Emitted items: **20**
- Første 20 IDs:
  1. `sagene_film`
  2. `kampen_film`
  3. `damstredet_telthusbakken`
  4. `slottet`
  5. `sofienberg_kirke`
  6. `gamlebyen_gravlund`
  7. `akerhus_slott`
  8. `gamle_aker_kirke`
  9. `var_frelsers_gravlund`
  10. `hovedoya_kloster`
  11. `eidsvollsbygningen`
  12. `oscarsborg_festning`
  13. `grini_fangeleir`
  14. `villa_grande`
  15. `bogstad_gard`
  16. `mollergata_19`
  17. `nasjonalmuseet`
  18. `munch_museet`
  19. `astrup_fearnley`
  20. `ekebergparken`

## Uendret data/runtime bekreftelse
- `data/i18n/content/places/en.json` ble ikke endret.
- Ingen `data/places`-filer ble endret.
- Ingen runtime-/CSS-filer ble endret.
