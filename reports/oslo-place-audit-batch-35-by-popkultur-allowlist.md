# Batch 35 — smal allowlist for `by→populaerkultur`

Dato: 2026-06-01

## Formål

Batch 35 er en smal script-/policybatch som legger til ett eksplisitt
cross-disciplinary allowlist-par i `tools/placeHealthReport.mjs`:

- `by → populaerkultur`

Allowlisten gjelder bare byrom der place-teksten eksplisitt dokumenterer et
populærkulturelt sekundærlag, for eksempel ikonstatus, felleskultur,
publikumsrytmer, sosial tilhørighet, representasjon eller mediert offentlighet.
Paret ble først allowlistet etter Batch 34, der feilkategoriserte popkultursteder
og svake/udokumenterte popkulturkoblinger ble ryddet før policyendringen.

Dette er ikke en dataendringsbatch. Ingen place-data, canonical-filer,
manifest, index, `emne_ids` eller `category`-verdier er endret.

## Kommandoer kjørt

Baseline før endring:

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
```

Validering etter scriptendring:

```bash
node --check tools/placeHealthReport.mjs
npm run health:places
npm run health:places 2>&1 | rg 'does not match category'
npm run places:emner:check
npm run places:index:check
```

## Filer/scripts undersøkt

- `reports/oslo-place-audit-batch-34-by-popkultur-datafix.md`
- `reports/oslo-place-audit-batch-33-film-tv-cross-disciplinary-allowlist.md`
- `reports/oslo-place-audit-batch-32-film-popkultur-policy-audit.md`
- `tools/placeHealthReport.mjs`
- `tools/check_place_emne_ids.mjs`
- `package.json`
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
- Warnings: 1032
- Wrong-prefix emne_ids: 15
- Allowlisted cross-disciplinary emne_ids: 206
- Unknown emne_ids: 0

## Allowlist-endring

I `ALLOWED_CROSS_DISCIPLINARY_EMNE_FAMILIES` ble kun dette paret lagt til:

- `by → populaerkultur`

`by`-listen er dermed:

```js
by: ["kunst", "historie", "film_tv", "populaerkultur"]
```

Scriptkommentaren ble samtidig oppdatert med policytekst som presiserer at
`by → populaerkultur` bare gjelder byrom med eksplisitt dokumentert
populærkulturelt sekundærlag i place-teksten, og at allowlisten først ble lagt
til etter Batch 34-datafixen.

Unknown/missing-validering, canonical registry-loading og
`CATEGORY_EMNE_PREFIXES` er ikke endret.

## Bevisst ikke allowlistet

Følgende gjenværende wrong-prefix-par ble bevisst holdt utenfor allowlisten:

- `politikk → populaerkultur`
- `natur → kunst`
- `subkultur → naeringsliv`

Kontrollen av gjenværende wrong-prefix warnings etter endring viser fire
forekomster:

- `politikk → populaerkultur`: 2 (`youngstorget`)
- `natur → kunst`: 1 (`lisbon_jardim_botanico`)
- `subkultur → naeringsliv`: 1 (`lisbon_fabrica_braco_de_prata`)

## Ny health-summary etter endring

`npm run health:places`:

- Errors: 0
- Warnings: 1021
- Wrong-prefix emne_ids: 4
- Allowlisted cross-disciplinary emne_ids: 217
- Unknown emne_ids: 0
- Files checked: 40
- Places checked: 470
- emne_ids checked: 1044
- Canonical emne_ids: 1044

## Før/etter-resultat

| Målepunkt | Før Batch 35 | Etter Batch 35 | Endring |
| --- | ---: | ---: | ---: |
| Wrong-prefix emne_ids | 15 | 4 | -11 |
| Warnings | 1032 | 1021 | -11 |
| Allowlisted cross-disciplinary emne_ids | 206 | 217 | +11 |
| Errors | 0 | 0 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |

## Bekreftelser

- Unknown/missing-validering kjører fortsatt: `places:emner:check` rapporterer
  `Missing emne_ids: 0`, og `health:places` rapporterer `Unknown emne_ids: 0`.
- `places:emner:check` er fortsatt grønn med exit code 0.
- `places:index:check` er fortsatt grønn og rapporterer at
  `places_index.json is in sync with source place files.`
- Ingen `data/places/**`-filer ble endret.
- Ingen `data/fag/**`-filer ble endret.
- Ingen `emne_ids` ble endret.
- Ingen `category`-verdier ble endret.

## Anbefalt Batch 36

Anbefalt Batch 36 er en egen vurdering av de fire gjenværende wrong-prefix
warningene uten å gjenbruke Batch 35-allowlisten bredt. Den bør eksplisitt
avgjøre om `politikk → populaerkultur`, `natur → kunst` og
`subkultur → naeringsliv` skal forbli warnings, datafikses eller eventuelt få
separate og smale policybeslutninger etter dokumentert faglig gjennomgang.
