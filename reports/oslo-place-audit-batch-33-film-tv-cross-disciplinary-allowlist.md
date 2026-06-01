# Batch 33 — film/TV cross-disciplinary health-allowlist

Dato: 2026-06-01

## Formål

Batch 33 er en smal script-/policybatch som utvider health-scriptets eksplisitte
`tverrfaglig category → canonical fagfamilie`-allowlist med to dokumenterte
film/TV-par fra Batch 32:

- `by → film_tv`
- `populaerkultur → film_tv`

Batchen endrer ikke place-data, canonical emne-filer, manifest, index, UI, CSS,
HTML, JS, assets, `emne_ids` eller `category`-verdier. Den gjør heller ingen
blind prefix-rewrite og innfører ikke alias-schema.

## Kommandoer kjørt

Baseline før endring:

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
```

Validering etter endring:

```bash
node --check tools/placeHealthReport.mjs
npm run health:places
npm run places:emner:check
npm run places:index:check
```

## Filer/scripts undersøkt

- `reports/oslo-place-audit-batch-32-film-popkultur-policy-audit.md`
- `reports/oslo-place-audit-batch-31-health-cross-disciplinary-allowlist.md`
- `tools/placeHealthReport.mjs`
- `tools/check_place_emne_ids.mjs`
- `package.json`
- `data/places/manifest.json`

Read-only kontekst brukt fra Batch 32s dokumenterte policygrunnlag:

- `data/places/by/oslo/places_by.json`
- `data/places/film/oslo/places_oslo_film.json`
- `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json`
- `data/fag/popkultur/emner_populaerkultur_canonical_v4_5.json`

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
- Wrong-prefix emne_ids: 43
- Allowlisted cross-disciplinary emne_ids: 191
- Warnings: 1060

## Allowlist-par lagt til

### `by → film_tv`

Begrunnelse: Batch 32 klassifiserte dette som et Tier A-par med 10 forekomster.
Koblingen gjelder byrom der film/TV er et sekundært, eksplisitt dokumentert
location- eller representasjonslag, ikke stedets primærkategori. Byrommene skal
derfor fortsatt være `category: "by"`, mens film/TV-emnene kan dempes som
redaksjonelt godkjente tverrfaglige emner i health-scriptet.

### `populaerkultur → film_tv`

Begrunnelse: Batch 32 klassifiserte dette som et Tier A-par med 5 forekomster
for kinoer og film-/TV-steder. Siden film/TV foreløpig ligger under
populærkultur i place-data, er dette riktig sekundærlag uten å endre data eller
innføre en ny place category i denne batchen.

## Par bevisst ikke allowlistet

- `by → populaerkultur` — holdes utenfor til etter datafix av feilkategoriserte
  popkultursteder og svake trend-/digital-/influencer-koblinger.
- `politikk → populaerkultur` — for tynt grunnlag; fortsatt manuell vurdering.
- `natur → kunst` — vurdert som datafix/emnevalg, ikke allowlist.
- `subkultur → naeringsliv` — ett tynt dokumentert sted; holdes som warning eller
  senere datafix.

## Scriptendring

`tools/placeHealthReport.mjs` er endret i `ALLOWED_CROSS_DISCIPLINARY_EMNE_FAMILIES`:

- `by` er utvidet fra `["kunst", "historie"]` til `["kunst", "historie", "film_tv"]`.
- `populaerkultur: ["film_tv"]` er lagt til.
- En kort Batch 33-kommentar forklarer policyen for `by → film_tv`,
  `populaerkultur → film_tv`, og at `by → populaerkultur` holdes utenfor til
  etter datafix.

Det er ikke lagt til:

- `by: ["populaerkultur"]`
- `politikk: ["populaerkultur"]`
- `natur: ["kunst"]`
- `subkultur: ["naeringsliv"]`

## Ny health-summary etter endring

`npm run health:places` etter endring:

- Errors: 0
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 28
- Allowlisted cross-disciplinary emne_ids: 206
- Warnings: 1045

## Før/etter

| Målepunkt | Før Batch 33 | Etter Batch 33 | Endring |
| --- | ---: | ---: | ---: |
| Wrong-prefix emne_ids | 43 | 28 | -15 |
| Warnings | 1060 | 1045 | -15 |
| Allowlisted cross-disciplinary emne_ids | 191 | 206 | +15 |
| Errors | 0 | 0 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |

Effekten matcher forventningen fra Batch 32: de 15 Tier A film/TV-forekomstene
flyttes fra wrong-prefix warnings til eksplisitt allowlistet tverrfaglighet.

## Valideringsbekreftelser

- Unknown/missing valideres fortsatt: allowlisten brukes bare etter canonical
  registry-hit, og `places:emner:check` bekrefter fortsatt Missing 0 og alle
  duplikattellinger 0.
- `places:emner:check` er fortsatt grønn med exit code 0.
- `places:index:check` er fortsatt grønn og bekrefter at `places_index.json` er
  i sync med kildefilene.
- `node --check tools/placeHealthReport.mjs` passerer uten syntaksfeil.
- `health:places` har fortsatt Errors 0 og Unknown emne_ids 0.

## Dataintegritetsbekreftelser

- Ingen filer under `data/places/**` ble endret.
- Ingen filer under `data/fag/**` ble endret.
- Ingen canonical emne-filer ble endret.
- `data/places/places_index.json` ble ikke endret.
- `data/places/manifest.json` ble ikke endret.
- Ingen `emne_ids` ble endret.
- Ingen `category`-verdier ble endret.
- Ingen UI, CSS, HTML, JS eller assets ble endret.
- Ingen alias-schema eller blind prefix-rewrite ble innført.
- Ingen tverrfaglige koblinger ble fjernet.

## Anbefalt Batch 34

Batch 34 bør være en kategori-/datafixbatch som følger opp Batch 32s Tier B og
hold/datafix-funn:

1. Vurder og rydd `by → populaerkultur` før eventuell allowlist:
   - korriger feilkategoriserte popkultursteder som ligger i popkultur-fil, men
     har `category: "by"`,
   - fjern, bytt eller dokumenter svake trend-/digital-/influencer-/remix-emner.
2. Ta eksplisitt stilling til om `film_tv` skal bli egen place category på sikt,
   eller om film/TV fortsatt skal ligge under `populaerkultur` i place-data.
3. Hold `politikk → populaerkultur`, `natur → kunst` og
   `subkultur → naeringsliv` utenfor allowlist inntil de er manuelt vurdert eller
   datafikset.
