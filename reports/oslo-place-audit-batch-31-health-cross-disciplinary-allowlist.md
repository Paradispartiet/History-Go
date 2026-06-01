# Batch 31 — eksplisitt health-allowlist for tverrfaglige `emne_ids`

Dato: 2026-06-01

## Formål

Batch 31 innfører en eksplisitt, dokumentert allowlist i `tools/placeHealthReport.mjs` for redaksjonelt godkjente tverrfaglige `category→canonical fagfamilie`-par. Målet er at godkjente tverrfaglige emne-koblinger fortsatt telles synlig, men ikke lenger rapporteres som wrong-prefix warnings.

Dette er en script-/policybatch. Det er ikke gjort endringer i place-data, canonical emne-filer, manifest, index, UI, CSS, HTML, JS eller assets.

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

## Filer og scripts undersøkt

- `reports/oslo-place-audit-batch-30-cross-disciplinary-editorial-approval.md`
- `reports/oslo-place-audit-batch-29-post-policy-wrong-prefix-audit.md`
- `reports/oslo-place-audit-batch-28-health-prefixpolicy-legacy-prefixes.md`
- `tools/placeHealthReport.mjs`
- `tools/check_place_emne_ids.mjs`
- `package.json`
- `data/places/manifest.json`

Place- og canonical-filer ble kun brukt indirekte/read-only gjennom eksisterende valideringsscripts og health-scriptet.

## Baseline før endring

`npm run places:emner:check`:

- Exit code: 0
- Missing emne_ids: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

`npm run places:index:check`:

- `places_index.json is in sync with source place files.`

`npm run health:places` før allowlist:

- Errors: 0
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 234
- Warnings: 1251

## Allowlistede category→canonical-fagfamilie-par

Første tekniske allowlist er konservativ og dekker de 191 forekomstene Batch 30 godkjente som tydelige `godkjenn_som_tverrfaglig`-mønstre:

| Place category | Allowlisted canonical fagfamilier | Begrunnelse |
| --- | --- | --- |
| `natur` | `by`, `historie` | Blågrønn urban struktur, parker, vannrom, kulturminner og institusjonshistoriske natursteder. |
| `litteratur` | `by` | Litterære steder som bibliotek, bokhandel, minnespor, torg/plasser og offentlig minnekultur. |
| `naeringsliv` | `by`, `historie` | Handel, havn, logistikk, industri, transformasjon og produksjons-/institusjonshistorie. |
| `historie` | `by`, `kunst` | Historiske steder med byroms-, infrastruktur-, materialitets-, samlings- eller kunsthistoriske lag. |
| `politikk` | `historie`, `by` | Politiske institusjoner, plasser, monumenter og demokratihistoriske/stedlige maktlag. |
| `by` | `kunst`, `historie` | Byrom med offentlig kunst, monumenter, arkitektur/materialitet, kulturminne- og minnebrukslag. |
| `kunst` | `by`, `historie` | Kunstinstitusjoner i havne-/transformasjonsområder og samlinger med kulturminne-/minnebrukslag. |
| `subkultur` | `by`, `musikk`, `historie`, `kunst` | Scener, klubber, transformerte bygg, natteliv, musikk- og kunstinstitusjonslag. |

## Bevisst ikke allowlistet i Batch 31

Disse Batch 29-/Batch 30-parene holdes fortsatt som wrong-prefix warnings:

| Par | Forekomster | Hvorfor ikke allowlistet nå |
| --- | ---: | --- |
| `by→populaerkultur` | 24 | Godkjent med forbehold i Batch 30, men bør få egen film-/populærkultur-policy med strengere kriterier for ikonstatus, trend, publikumsbruk og digital offentlighet. |
| `by→film_tv` | 10 | Godkjent med forbehold i Batch 30, men ligger nær kategori-policy for location-/representasjonslag og bør vurderes sammen med film-/TV-kategori. |
| `populaerkultur→film_tv` | 5 | Batch 29 anbefalte kategori-policy, ikke første allowlist. |
| `politikk→populaerkultur` | 2 | Batch 29 markerte som manuell/usikker redaksjonell vurdering. |
| `natur→kunst` | 1 | Batch 29 markerte som usikker manuell/emnevalg-vurdering. |
| `subkultur→naeringsliv` | 1 | Batch 29 markerte som usikker manuell/emnevalg-vurdering. |

`by→populaerkultur` og `by→film_tv` er altså holdt utenfor denne første tekniske allowlisten. Dette er standard/konservativ variant for å unngå å dempe kategori-policy-spørsmål for tidlig.

## Hvordan canonical fagfamilie utledes

Health-scriptets canonical registry lagrer nå per `emne_id`:

- `sourcePath`: relativ sti til canonical kildefil.
- `family`: canonical fagfamilie utledet konservativt fra første mappenavn under `data/fag/`.

Eksempler:

- `data/fag/by/emner_by_canonical_v4_5.json` → `by`
- `data/fag/popkultur/emner_populaerkultur_canonical_v4_5.json` → `populaerkultur`
- `data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json` → `film_tv`

Denne løsningen endrer ikke canonical data. Allowlist-sjekken skjer bare når `emne_id` allerede finnes i canonical registry, slik at unknown/missing fortsatt valideres og rapporteres.

## Scriptendring

`tools/placeHealthReport.mjs` er oppdatert med:

1. Ny dokumentert `ALLOWED_CROSS_DISCIPLINARY_EMNE_FAMILIES` for category→canonical-fagfamilie-par.
2. Ny konservativ mapping fra `data/fag/<mappe>` til canonical fagfamilie.
3. Canonical registry entries som objekt med `sourcePath` og `family`.
4. Wrong-prefix-logikk som:
   - først sjekker canonical registry,
   - teller unknown emne_ids uendret,
   - demper wrong-prefix-warning bare når `category→canonical family` finnes i allowlist,
   - teller slike treff i `allowlistedCrossDisciplinaryEmneIds`,
   - beholder ordinær wrong-prefix-warning for alle andre feilprefixer.
5. Health summary viser nå separat `Allowlisted cross-disciplinary emne_ids`.

## Ny health-summary etter endring

`npm run health:places` etter allowlist:

- Files checked: 40
- Places checked: 470
- Canonical emne files checked: 16
- emne_ids checked: 1051
- Canonical emne_ids: 1051
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 43
- Allowlisted cross-disciplinary emne_ids: 191
- Errors: 0
- Warnings: 1060

## Før/etter

| Måltall | Før Batch 31 | Etter Batch 31 | Endring |
| --- | ---: | ---: | ---: |
| Errors | 0 | 0 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |
| Wrong-prefix emne_ids | 234 | 43 | -191 |
| Allowlisted cross-disciplinary emne_ids | 0 | 191 | +191 |
| Warnings | 1251 | 1060 | -191 |

Nedgangen på 191 matcher den konservative første allowlisten: bare `godkjenn_som_tverrfaglig`-parene er dempet. De 34 `godkjenn_med_forbehold`-forekomstene (`by→populaerkultur`, `by→film_tv`) og de 9 usikre/kategori-policy-forekomstene ligger fortsatt igjen som wrong-prefix warnings, totalt 43.

## Bekreftelser

- Unknown/missing valideres fortsatt: allowlist brukes bare etter canonical registry-hit, og `Unknown emne_ids` er fortsatt 0.
- `npm run places:emner:check` er grønn med exit code 0.
- `npm run places:index:check` er grønn og index er i sync.
- `npm run health:places` har Errors: 0.
- Ingen filer under `data/places/**` er endret.
- Ingen filer under `data/fag/**` er endret.
- Ingen canonical emne-filer er endret.
- Ingen `emne_ids` er endret.
- Ingen category-verdier er endret.
- Ingen alias-schema, blind prefix-rewrite eller data-rewrite er innført.

## Anbefalt Batch 32

Batch 32 bør være en egen film-/populærkultur- og kategori-policybatch som vurderer:

1. Om `by→populaerkultur` kan allowlistes med strengere kriterier for ikoniske byrom, felleskultur, trend-/publikumsbruk og digital offentlighet.
2. Om `by→film_tv` kan allowlistes for bysteder med eksplisitt location-/representasjonslag, eller om enkelte steder bør få annen kategori-/emnepolicy.
3. Om `populaerkultur→film_tv` bør håndteres som kategori-policy, sekundærlag eller datafix.
4. Manuell vurdering av de tre øvrige Batch 29-usikre parene: `politikk→populaerkultur`, `natur→kunst` og `subkultur→naeringsliv`.
