# Batch 28 — health-prefixpolicy for legacy canonical prefixes

**Dato:** 2026-06-01

## Formål og avgrensning

Batch 28 retter root cause i `health:places` prefixpolicy slik at canonical legacy-prefixer ikke flagges som wrong-prefix når de faktisk tilhører riktig fagfamilie.

Dette er en script-/policy-batch. Det er ikke gjort dataendringer i `data/places/**`, `data/fag/**`, canonical emne-filer, `data/places/places_index.json`, manifest, UI, CSS, HTML, JS eller bilder. Ingen `emne_id`-verdier er endret, og ingen alias-schema er innført.

## Kommandoer kjørt

- `npm run places:emner:check`
- `npm run places:index:check`
- `npm run health:places`
- `node --check tools/placeHealthReport.mjs`
- `node - <<'NODE' ... NODE` — read-only telling av canonical prefixer i næringsliv og psykologi.
- `rg -n 'em_naer_|em_psy_' data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json data/fag/psykologi/emner_psykologi_canonical_v4_5.json`
- `git status --short`
- `git diff --stat`

NPM skrev `npm warn Unknown env config "http-proxy"...` før scriptkjøringene. Varslet påvirket ikke exit code.

## Filer undersøkt

- `reports/oslo-place-audit-batch-27-wrong-prefix-decision-audit.md`
- `reports/oslo-place-audit-batch-26-health-warnings-audit.md`
- `tools/placeHealthReport.mjs`
- `tools/check_place_emne_ids.mjs`
- `package.json`
- `data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json`
- `data/fag/psykologi/emner_psykologi_canonical_v4_5.json`
- Read-only place-kontekst:
  - `data/places/naeringsliv/oslo/places_naeringsliv.json`
  - `data/places/naeringsliv/europe/portugal/lisbon/places_lisbon_naeringsliv.json`
  - `data/places/psykologi/oslo/places_psykologi.json`

## Baseline før endring

### `npm run places:emner:check`

Exit code: 0.

```text
=== Place emne_id validation ===
Active place files: 40
Canonical emne files scanned: 15
Canonical emne ids loaded: 995

Missing emne_ids: 0

Duplicate emne_ids within same place: 0

Duplicate place ids across active files: 0

Duplicate canonical emne_ids across canonical files: 0
```

### `npm run places:index:check`

Exit code: 0.

```text
places_index.json is in sync with source place files.
```

### `npm run health:places`

Exit code: 0.

```text
History Go PlaceHealthReport
Files checked: 40
Places checked: 470
Hidden places: 0
Stub places: 0
Canonical emne files checked: 16
emne_ids checked: 1051
Canonical emne_ids: 1051
Unknown emne_ids: 0
Wrong-prefix emne_ids: 304
Errors: 0
Warnings: 1321
```

## Dagens health-prefixpolicy før endring

`tools/placeHealthReport.mjs` hadde én hardkodet prefix per kategori i `CATEGORY_EMNE_PREFIX`:

- `naeringsliv` → `em_naering_`
- `psykologi` → `em_psykologi_`

Dette gjorde at canonical næringsliv-ID-er med legacy-prefix `em_naer_*` og canonical psykologi-ID-er med legacy-prefix `em_psy_*` ble telt som wrong-prefix, selv om ID-ene finnes i canonical registry.

Valideringen skjedde ved at `validateEmneIds` hentet forventet prefix fra map-et og sjekket `emneId.startsWith(expectedPrefix)`. Unknown/missing-validering og canonical registry-loading var separat og er ikke endret i denne batchen.

## Canonical legacy-prefixer verifisert

Read-only telling av canonical-filene viste:

```text
data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json 38 { em_naering_: 36, em_naer_: 2 }
data/fag/psykologi/emner_psykologi_canonical_v4_5.json 58 { em_psy_: 58 }
```

Konkrete canonical næringsliv-ID-er med `em_naer_*`:

- `em_naer_felt_arbeid_verdiskaping`
- `em_naer_geografi_infrastruktur`

Konkrete canonical psykologi-ID-er med `em_psy_*`:

- `em_psy_affektregulering`
- `em_psy_atferd_laring`
- `em_psy_barn_ungdom`
- `em_psy_behandling_omsorg`

Konklusjon: `em_naer_*` og `em_psy_*` er canonical legacy-prefixer i de relevante fagfamiliene, ikke ukjente place-datafeil.

## Policyendring utført

`tools/placeHealthReport.mjs` er oppdatert fra single-prefix policy til allowed-prefixes policy:

- `CATEGORY_EMNE_PREFIX` er erstattet med `CATEGORY_EMNE_PREFIXES`.
- Alle eksisterende kategorier har fortsatt samme godkjente prefix som før.
- `naeringsliv` tillater nå både:
  - `em_naering_`
  - `em_naer_`
- `psykologi` tillater nå både:
  - `em_psykologi_`
  - `em_psy_`
- Wrong-prefix-sjekken bruker nå `expectedPrefixes.some((prefix) => emneId.startsWith(prefix))`.
- Warning-teksten beholder lesbar expected-prefix output ved å skrive tillatte prefixer som `prefix A or prefix B`.

Dette skjuler ikke wrong-prefix generelt: ID-er som ikke starter med en godkjent prefix for aktuell kategori flagges fortsatt. Tverrfaglige koblinger og manuelle vurderinger blir derfor fortsatt synlige i `health:places`.

## Før/etter-resultat for `health:places`

| Målepunkt | Før | Etter | Endring |
|---|---:|---:|---:|
| Errors | 0 | 0 | 0 |
| Warnings | 1321 | 1251 | -70 |
| Wrong-prefix emne_ids | 304 | 234 | -70 |
| Unknown emne_ids | 0 | 0 | 0 |
| Canonical emne_ids | 1051 | 1051 | 0 |

Etter endring:

```text
History Go PlaceHealthReport
Files checked: 40
Places checked: 470
Hidden places: 0
Stub places: 0
Canonical emne files checked: 16
emne_ids checked: 1051
Canonical emne_ids: 1051
Unknown emne_ids: 0
Wrong-prefix emne_ids: 234
Errors: 0
Warnings: 1251
```

Nedgangen på 70 matcher Batch 27-forventningen: 67 næringsliv-forekomster med `em_naer_*` og 3 psykologi-forekomster med `em_psy_*` er ikke lenger feilflagget når de brukes i riktig fagfamilie.

## Ettervalidering

### `npm run places:emner:check`

Exit code: 0.

```text
=== Place emne_id validation ===
Active place files: 40
Canonical emne files scanned: 15
Canonical emne ids loaded: 995

Missing emne_ids: 0

Duplicate emne_ids within same place: 0

Duplicate place ids across active files: 0

Duplicate canonical emne_ids across canonical files: 0
```

Konklusjon: `places:emner:check` er fortsatt grønn.

### `npm run places:index:check`

Exit code: 0.

```text
places_index.json is in sync with source place files.
```

Konklusjon: `places:index:check` er fortsatt grønn.

### `npm run health:places`

Exit code: 0.

```text
Wrong-prefix emne_ids: 234
Errors: 0
Warnings: 1251
```

Konklusjon: `health:places` er fortsatt grønn på errors, og wrong-prefix/warnings er redusert kun gjennom policyharmonisering for canonical legacy-prefixer.

## Bekreftelser

- Ingen `data/places/**`-filer ble endret.
- Ingen `data/fag/**`-filer ble endret.
- Ingen canonical emne-filer ble endret.
- Ingen `emne_id`-verdier ble endret.
- `data/places/places_index.json` ble ikke endret.
- Manifest ble ikke endret.
- UI, CSS, HTML, JS og bilder ble ikke endret.
- Kun `tools/placeHealthReport.mjs` og denne rapporten er endret.

## Anbefalt Batch 29

Batch 29 bør behandle de gjenværende 234 wrong-prefix-forekomstene som reelle tverrfaglige/manuelle vurderinger, ikke som legacy-prefixpolicy. Anbefalt avgrensning:

1. Behold `health:places` policyen fra Batch 28 som baseline.
2. Bruk Batch 27-klassifiseringen til å prioritere `behold_tverrfaglig` versus `usikker_manuell`.
3. Lag en read-only rapport som grupperer gjenværende wrong-prefix etter place-kategori, actual canonical fagfamilie og place-id.
4. Ikke gjør dataendringer før hver gruppe har eksplisitt redaksjonell beslutning.
