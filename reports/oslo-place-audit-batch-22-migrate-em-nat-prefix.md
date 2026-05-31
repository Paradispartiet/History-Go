# Oslo place-audit batch 22 — migrer `em_nat_*` place-referanser til `em_natur_*`

**Dato:** 2026-05-31
**Branch:** `claude/batch-22-em-nat-migration-DzBZA`

## Formål

Batch 22 migrerer de gjenværende legacy `em_nat_*`-referansene i natur-place-data til eksisterende canonical `em_natur_*`-mål. Dette er en **place-migreringsbatch**, ikke en canonical-batch. Det er ikke opprettet nye canonical-emner, ikke innført alias-schema, og `em_nat_*` er ikke gjort canonical. Hver migrering peker til et `em_natur_*`-mål som allerede finnes i `data/fag/natur/emner_natur_canonical_v4_5.json`.

Bakgrunn: Batch 21 bekreftet at natur-canonical bruker prefikset `em_natur_*` (ikke `em_nat_*`), og opprettet bl.a. `em_natur_kyst_okosystemer` og `em_natur_friluftsliv_helse`. De gjenværende `em_nat_*`-ID-ene ble der utsatt til eksplisitt place-migrering — som utføres her.

## Kommandoer kjørt

- `npm run places:emner:check` — før endring (baseline)
- `grep`/Node-søk etter `em_nat_by_natur_motepunkt` og `em_nat_okologi_grenser` i `data/places/**`
- Lesing av place-tekst (`desc`/`popupDesc`) for de berørte stedene
- Kontroll av at valgte `em_natur_*`-mål finnes i `data/fag/natur/emner_natur_canonical_v4_5.json`
- Surgical edits i de to berørte place-filene (kun de aktuelle `emne_id`-linjene)
- `npm run places:emner:check` — etter endring
- `npm run places:index:check`
- `npm run health:places`

## Filer undersøkt

- `reports/oslo-place-audit-batch-21-natur-remaining-emner.md`
- `tools/check_place_emne_ids.mjs`
- `data/fag/natur/emner_natur_canonical_v4_5.json` (kun lesing, for å bekrefte canonical-mål)
- `data/places/natur/oslo/places_oslo_alna.json`
- `data/places/natur/oslo/places_oslo_natur_hovedsteder.json`
- `data/places/manifest.json` (kun for å bekrefte aktive place-filer)

## Manglende `em_nat_*` før batchen

`npm run places:emner:check` rapporterte **14** missing `emne_ids` totalt. Av disse var natur-/nat-klyngen **4 forekomster / 2 unike** legacy `em_nat_*`-IDs:

| emne_id | Forekomster | Place-id-er | Place-fil |
| --- | ---: | --- | --- |
| `em_nat_by_natur_motepunkt` | 3 | `alnaelva`, `gressholmen`, `maerradalen` | `places_oslo_alna.json`, `places_oslo_natur_hovedsteder.json` |
| `em_nat_okologi_grenser` | 1 | `gressholmen` | `places_oslo_natur_hovedsteder.json` |

Merk: `maerradalen` hadde **kun** `em_nat_by_natur_motepunkt`, ikke `em_nat_okologi_grenser`. Totalt antall legacy `em_nat_*`-forekomster var derfor **4**, ikke 5. Dette stemmer med oppgavebeskrivelsen og med den autoritative JSON-parsingen samt `places:emner:check`-rapporten.

De resterende 10 missing `emne_ids` tilhører andre fagfamilier (`em_naering_*`, `em_pol_*`, `em_kunst_*`) og er utenfor scope for denne batchen.

## Berørte place-id-er

- `alnaelva` (`data/places/natur/oslo/places_oslo_alna.json`)
- `gressholmen` (`data/places/natur/oslo/places_oslo_natur_hovedsteder.json`)
- `maerradalen` (`data/places/natur/oslo/places_oslo_natur_hovedsteder.json`)

## Migrering — gamle ID-er → nye `em_natur_*`-mål

| Place | Gammel `em_nat_*` | Ny `em_natur_*` |
| --- | --- | --- |
| `alnaelva` | `em_nat_by_natur_motepunkt` | `em_natur_urban_okologi_byrom` |
| `gressholmen` | `em_nat_by_natur_motepunkt` | `em_natur_kyst_okosystemer` |
| `gressholmen` | `em_nat_okologi_grenser` | `em_natur_arter_habitat_mangfold` |
| `maerradalen` | `em_nat_by_natur_motepunkt` | `em_natur_gronnstruktur_korridorer` |

Totalt **4 erstatninger** i 2 place-filer. Ingen andre `emne_ids`, tekst, bilder, koordinater, titler eller struktur ble endret.

### Begrunnelse per place

- **`alnaelva` → `em_natur_urban_okologi_byrom`**
  Place-teksten beskriver Oslos lengste byelv gjennom «tung industrihistorie, tett bebyggelse og nyere restaurering av blågrønne korridorer», fra industriåre/forurensning til miljøopprydding og gjenåpning «for ferdsel og økologisk sammenheng». Den distinktive vinkelen er urban økologi og byrom — natur som gjenåpnes og kobles på i den tette byen. `em_natur_urban_okologi_byrom` fanger dette bedre enn et rent korridor-mål.

- **`gressholmen` → `em_natur_kyst_okosystemer`** (for `em_nat_by_natur_motepunkt`)
  Gressholmen er en «fjordøy med tydelige naturkvaliteter og et rikt fugleliv i indre Oslofjord», del av «fjordens grønne belte». Naturmøtepunktet på øya er først og fremst et kyst-/fjordøkosystem. `em_natur_kyst_okosystemer` (etablert i Batch 21) er det presise målet.

- **`gressholmen` → `em_natur_arter_habitat_mangfold`** (for `em_nat_okologi_grenser`)
  Øya har «rikt fugle- og planteliv og fredede naturkvaliteter». De økologiske grensene/randsonene på en fredet fjordøy handler konkret om habitat og artsmangfold. `em_natur_arter_habitat_mangfold` dekker dette uten å duplisere kyst-økosystem-vinkelen.

- **`maerradalen` → `em_natur_gronnstruktur_korridorer`**
  Mærradalen er en fredet bekkekløft/skogdal med «sammenhengende grønnstruktur på Oslos vestside», som «korridor mellom høyere skogsområder og lavere bebyggelse». Dette er en typisk grønnstruktur-/korridorfunksjon, og `em_natur_gronnstruktur_korridorer` er det mest direkte målet.

## Bekreftelser

- **Alle nye `em_natur_*`-mål finnes i canonical natur-fil.** Bekreftet mot `data/fag/natur/emner_natur_canonical_v4_5.json` (canonical emne ids loaded: 993). Følgende mål er verifisert til stede: `em_natur_urban_okologi_byrom`, `em_natur_kyst_okosystemer`, `em_natur_arter_habitat_mangfold`, `em_natur_gronnstruktur_korridorer`.
- **Ingen duplicate `emne_ids` ble laget.** Ingen av de tre stedene hadde målet fra før; `places:emner:check` rapporterer «Duplicate emne_ids within same place: 0».
- **Ingen `data/fag/**` ble endret.** Kun place-data ble migrert.
- **Ingen canonical emne-filer ble endret.**
- **Alias-schema (eller alias-mini-schema) ble ikke innført.**
- **Manifest ble ikke endret.**
- **`data/places/places_index.json` ble ikke endret** (ingen index-drift; checker rapporterer in sync).
- **Ingen UI, CSS, HTML eller JS ble endret.**
- **Ingen placeholder-emner ble opprettet, og ingen `em_nat_*` ble gjort canonical.**

## Før/etter — `npm run places:emner:check`

### Før
- Active place files: 40
- Canonical emne ids loaded: 993
- Missing emne_ids: **14** (herav 4 legacy `em_nat_*`-forekomster / 2 unike)
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

### Etter
- Active place files: 40
- Canonical emne ids loaded: 993
- Missing emne_ids: **10**
- Gjenværende `em_nat_*`-forekomster: **0**
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

Kommandoen returnerer fortsatt non-zero fordi 10 known missing `emne_ids` fra andre fagfamilier gjenstår.

## Resultat — `npm run places:index:check`

`places_index.json is in sync with source place files.` — **OK**. Ingen index-endring var nødvendig.

## Resultat — `npm run health:places`

- Files checked: 40
- Places checked: 470
- Unknown emne_ids: 10
- **Errors: 0**
- Warnings: 1329 (alle forhåndseksisterende; uendret av denne batchen)

## Anbefalt Batch 23

Fortsett med de gjenværende 10 missing `emne_ids` i andre fagfamilier — én fagfamilie per batch for å unngå sammenblanding:

- `em_naering_*` (7 forekomster i `data/places/naeringsliv/oslo/places_naeringsliv.json`: `havnelageret`, `tollbukaia`, `telegrafbygningen`, `jernbaneverkstedet_lodalen`)
- `em_pol_*` (`em_pol_makt_institusjoner` i Lisboa-politikk-place-data)
- `em_kunst_*` (`em_kunst_materialitet_teknikk_handverk` i Lisboa-kunst-place-data)

Vurder per cluster om riktig håndtering er place-migrering til eksisterende canonical mål eller oppretting av fullverdige canonical-emner, etter samme konservative prinsipp som Batch 21/22.
