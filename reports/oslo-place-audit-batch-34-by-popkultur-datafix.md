# Batch 34 — datafix for `by→populaerkultur` prefix warnings

Dato: 2026-06-01

## Formål

Batch 34 er en smal datafix-batch for `by→populaerkultur` før eventuell
senere allowlist. Batchen korrigerer feilkategoriserte popkultur-steder som
allerede ligger i popkultur-filen, og fjerner bare konkrete `em_pop_*`-emner i
byrom der place-teksten ikke dokumenterer emnelaget.

Dette er ikke en script-/policybatch. Det er ikke innført ny allowlist, alias-
schema, blind prefix-rewrite eller film/TV-policyendring.

## Kommandoer kjørt

Baseline før endring:

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
```

Index-sync etter source-endring:

```bash
npm run places:index:check
npm run places:index:build
```

Validering etter endring:

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
```

Kontroll av gjenværende wrong-prefix warnings:

```bash
npm run health:places 2>&1 | rg 'does not match category'
```

## Filer undersøkt

- `reports/oslo-place-audit-batch-33-film-tv-cross-disciplinary-allowlist.md`
- `reports/oslo-place-audit-batch-32-film-popkultur-policy-audit.md`
- `tools/placeHealthReport.mjs`
- `tools/check_place_emne_ids.mjs`
- `data/places/by/oslo/places_by.json`
- `data/places/popkultur/oslo/places_oslo_populaerkultur.json`
- `data/places/places_index.json`
- `data/places/manifest.json`

## Baseline før endring

`npm run places:emner:check`:

- Exit code: 0
- Missing emne_ids: 0
- Unknown emne_ids: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

`npm run places:index:check`:

- `places_index.json is in sync with source place files.`

`npm run health:places`:

- Errors: 0
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 28
- Allowlisted cross-disciplinary emne_ids: 206
- Warnings: 1045

## Category-verdier endret

Alle tre ligger i `data/places/popkultur/oslo/places_oslo_populaerkultur.json`,
har bare `em_pop_*`-emner og mangler reelle `em_by_*`-hovedemner. Batch 32
klassifiserte derfor disse som feil kategori, ikke som reell tverrfaglighet.

| Place id | Endring | Begrunnelse |
| --- | --- | --- |
| `frognerstranda` | `category: "by"` → `category: "populaerkultur"` | Ligger i popkultur-filen; tekst og tags beskriver kjendissone, sladder-/sommermedia og mediert byliv; emne_ids er `em_pop_fellesskap_tilhorighet` og `em_pop_aktualitet_trend`. |
| `grand_hotel` | `category: "by"` → `category: "populaerkultur"` | Ligger i popkultur-filen; tekst og tags beskriver prisutdelinger, pressebilder, kjendisbesøk og kjendiskulturell kapital; emne_ids er `em_pop_ikonisk_persona` og `em_pop_kjendis_kulturell_kapital`. |
| `slottsplassen` | `category: "by"` → `category: "populaerkultur"` | Ligger i popkultur-filen; tekst og tags beskriver TV-ritualer, kongelige hendelser og nasjonale medieøyeblikk; emne_ids er `em_pop_ikonisk_persona` og `em_pop_ikoniske_oyeblikk`. |

## `emne_ids` fjernet fra ekte byrom

| Place id | Fjernet `emne_ids` | Begrunnelse |
| --- | --- | --- |
| `majorstuen_krysset` | `em_pop_aktualitet_trend`, `em_pop_digital_offentlighet` | Place-teksten beskriver trafikkryss, kollektivknutepunkt, flaskehals, gangstrømmer og snarveier. Trend- og digital-offentlighet er ikke dokumentert i `desc` eller `popupDesc`. |
| `barcode` | `em_pop_influencer_personlig_merkevare` | Place-teksten beskriver byform, eiendomsutvikling, skyline, romlig orden og gateliv. Influencer/personlig merkevare er ikke dokumentert. |
| `toyen_torg` | `em_pop_deltakelse_remix` | Place-teksten beskriver lokalt torg, lavterskel møteplass, venting, samvær og sosial miks. Remix-/deltakelseslogikken er ikke dokumentert. |
| `bjorvika` | `em_pop_film_tv_format` | Teksten dokumenterer fjordbytransformasjon, kulturinstitusjoner, offentlighet og et visuelt/filmatisk byrom, men ikke film-/TV-format som konkret emnelag. `em_pop_kino_populaer_offentlighet` ble beholdt fordi kulturoffentlighet er dokumentert. |
| `vaterland` | `em_pop_fellesskap_tilhorighet`, `em_pop_aktualitet_trend` | Place-teksten er et byromsnotat om overgang mellom Akerselva, Jernbanetorget, Grønland og kollektivknutepunkter. Den dokumenterer ikke popkulturelt fellesskap eller trend. Det ble ikke gjort bred omskriving eller kategoriendring i denne batchen. |

## Bevisst beholdt som warnings

Følgende forekomster ble beholdt fordi de enten er belagt nok for senere smal
`by→populaerkultur`-policy, eller fordi Batch 32 eksplisitt anbefalte å holde
dem som warnings inntil en senere avgjørelse:

- `radhusplassen`: `em_pop_ikoniske_oyeblikk`, `em_pop_digital_offentlighet`
- `bjorvika`: `em_pop_kino_populaer_offentlighet`
- `toyen_torg`: `em_pop_fellesskap_tilhorighet`
- `oslo_s`: `em_pop_publikum_rytme_vaner`, `em_pop_aktualitet_trend`
- `aker_brygge`: `em_pop_kulturell_distinksjon`, `em_pop_fellesskap_tilhorighet`
- `gronlandsleiret`: `em_pop_fellesskap_tilhorighet`, `em_pop_ekskludering_representasjon`
- `barcode`: `em_pop_digital_offentlighet`
- `youngstorget`: `em_pop_digital_offentlighet`, `em_pop_deltakelse_remix`
- `lisbon_jardim_botanico`: `em_kunst_institusjoner_kanon`
- `lisbon_fabrica_braco_de_prata`: `em_naer_felt_arbeid_verdiskaping`

`politikk→populaerkultur`, `natur→kunst` og `subkultur→naeringsliv` er ikke
endret i denne batchen.

## Før/etter-resultat

### `npm run health:places`

| Målepunkt | Før Batch 34 | Etter Batch 34 | Endring |
| --- | ---: | ---: | ---: |
| Errors | 0 | 0 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |
| Wrong-prefix emne_ids | 28 | 15 | -13 |
| Allowlisted cross-disciplinary emne_ids | 206 | 206 | 0 |
| Warnings | 1045 | 1032 | -13 |
| emne_ids checked / Canonical emne_ids | 1051 | 1044 | -7 |

### `npm run places:emner:check`

| Målepunkt | Før Batch 34 | Etter Batch 34 |
| --- | ---: | ---: |
| Exit code | 0 | 0 |
| Missing emne_ids | 0 | 0 |
| Unknown emne_ids | 0 | 0 |
| Duplicate emne_ids within same place | 0 | 0 |
| Duplicate place ids across active files | 0 | 0 |
| Duplicate canonical emne_ids across canonical files | 0 | 0 |

### `npm run places:index:check`

- Før endring: `places_index.json is in sync with source place files.`
- Etter source-endring, før sync: check feilet på tre category-mismatcher for
  `frognerstranda`, `grand_hotel` og `slottsplassen`.
- `places_index.json` ble sync-et med repoets eksisterende generator:
  `npm run places:index:build`.
- Etter sync: `places_index.json is in sync with source place files.`

## Dataintegritetsbekreftelser

- `tools/placeHealthReport.mjs` ble ikke endret.
- `tools/check_place_emne_ids.mjs` ble ikke endret.
- Ingen filer under `data/fag/**` ble endret.
- Ingen canonical emne-filer ble endret.
- `data/places/manifest.json` ble ikke endret; manifesten bekrefter at både
  `places/by/oslo/places_by.json` og
  `places/popkultur/oslo/places_oslo_populaerkultur.json` er aktive filer.
- Ingen UI-, CSS-, HTML-, JS- eller asset-filer ble endret.
- Ingen ny allowlist ble innført; `by→populaerkultur` er fortsatt ikke allowlistet.
- Film/TV-policyen fra Batch 33 ble ikke endret.

## Anbefalt Batch 35

Batch 35 bør være en smal policy-/allowlistbatch for gjenværende
`by→populaerkultur`, basert på de 11 bevisst beholdte `by→populaerkultur`-
warningene etter denne datafixen. Anbefalt scope:

1. Allowlist `by → populaerkultur` bare dersom policyteksten krever eksplisitt
   dokumentert populærkulturelt sekundærlag i place-teksten.
2. Hold `oslo_s` `em_pop_aktualitet_trend` og `barcode`
   `em_pop_digital_offentlighet` synlige i vurderingen, siden Batch 32 markerte
   dem som `hold_som_warning` / tynt dokumentert.
3. Ikke inkluder `politikk→populaerkultur`, `natur→kunst` eller
   `subkultur→naeringsliv` i samme batch; de bør få egne manuelle vurderinger.
