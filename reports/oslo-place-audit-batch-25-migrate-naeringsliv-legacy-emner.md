# Oslo place-audit batch 25 — migrer næringsliv legacy-emne_ids

**Dato:** 2026-05-31

## Formål

Batch 25 migrerer de siste gjenværende `em_naering_*` legacy/place-variantene i den aktive Oslo-place-filen for næringsliv til eksisterende fullverdige canonical næringsliv-emner. Dette er en place-migreringsbatch; ingen canonical-filer, manifest, UI-filer eller alias-/placeholder-struktur er endret.

## Kommandoer kjørt

- `npm run places:emner:check` før endring
- `rg -n "em_naering_(logistikk_handel_flyt|lager_terminal_infrastruktur|havn_sjofart|telekom_infrastruktur|modernisering_teknologi|transport_infrastruktur)" data/places/naeringsliv/oslo/places_naeringsliv.json reports data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json`
- `python3 - <<'PY' ...` for å bekrefte aktiv place-fil i manifest, lese berørte places og kontrollere canonical mål
- `npm run places:emner:check` etter endring
- `npm run places:index:check`
- `npm run health:places`
- `git status --short`

## Filer undersøkt

- `reports/oslo-place-audit-batch-20-naeringsliv-remaining-emner.md`
- `reports/oslo-place-audit-batch-24-kunst-remaining-emner.md`
- `tools/check_place_emne_ids.mjs`
- `data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json`
- `data/places/naeringsliv/oslo/places_naeringsliv.json`
- `data/places/manifest.json` — bekreftet at `places/naeringsliv/oslo/places_naeringsliv.json` er aktiv place-fil.

## Missing `em_naering_*` før batchen

Baseline `npm run places:emner:check` rapporterte 7 missing `emne_ids`, alle i `data/places/naeringsliv/oslo/places_naeringsliv.json`:

| emne_id | Forekomster | Place-id-er |
| --- | ---: | --- |
| `em_naering_logistikk_handel_flyt` | 2 | `havnelageret`, `tollbukaia` |
| `em_naering_lager_terminal_infrastruktur` | 1 | `havnelageret` |
| `em_naering_havn_sjofart` | 1 | `tollbukaia` |
| `em_naering_telekom_infrastruktur` | 1 | `telegrafbygningen` |
| `em_naering_modernisering_teknologi` | 1 | `telegrafbygningen` |
| `em_naering_transport_infrastruktur` | 1 | `jernbaneverkstedet_lodalen` |

Baseline hadde også:

- `Duplicate emne_ids within same place: 0`
- `Duplicate place ids across active files: 0`
- `Duplicate canonical emne_ids across canonical files: 0`

## Berørte places og migreringer

| Place-id | Gammel legacy-ID | Ny canonical ID | Begrunnelse |
| --- | --- | --- | --- |
| `havnelageret` | `em_naering_logistikk_handel_flyt` | `em_naering_logistikk_verdikjeder` | Place-teksten vektlegger vareflyt mellom skip, kai, lager og videre distribusjon. Det passer best med canonical logistikk/verdikjede-dekning. |
| `havnelageret` | `em_naering_lager_terminal_infrastruktur` | `em_naer_geografi_infrastruktur` | Teksten handler om storskala lagring, omlasting og havneinfrastruktur som del av byøkonomien. Batch 20 pekte på dette som en smal lager-/terminalvariant av økonomiens geografi og infrastruktur. |
| `tollbukaia` | `em_naering_havn_sjofart` | `em_naering_havn_transport` | Place-teksten beskriver kai, havn, sjøfart, import/eksport og maritime forbindelser. Canonical `em_naering_havn_transport` dekker den eldre/smalere havn/sjøfart-varianten. |
| `tollbukaia` | `em_naering_logistikk_handel_flyt` | `em_naering_logistikk_verdikjeder` | Teksten vektlegger toll, kontroll, handel og vareflyt mellom skip, havn og by. Dette passer med logistikk og verdikjeder. |
| `telegrafbygningen` | `em_naering_telekom_infrastruktur` | `em_naering_teknologi_infrastruktur` | Place-teksten vektlegger telegrafi, telefoni, kommunikasjonsnett og teknologisk infrastruktur. Canonical teknologi/infrastruktur dekker telekom som underkategori. |
| `telegrafbygningen` | `em_naering_modernisering_teknologi` | `em_naering_innovasjon_teknologisk_skift` | Teksten knytter kommunikasjonsnett til moderne handel, styring og medieutvikling. Dette er en teknologisk moderniserings-/skift-vinkel, ikke en egen legacy-ID. |
| `jernbaneverkstedet_lodalen` | `em_naering_transport_infrastruktur` | `em_naer_geografi_infrastruktur` | Place-teksten handler om jernbaneverksted, drift, vedlikehold og teknisk ryggmarg for togtrafikken. Økonomiens geografi og infrastruktur passer bedre enn havn/transport fordi stedet er jernbane- og verkstedsinfrastruktur, ikke havn. |

## Canonical- og duplikatkontroll

Følgende nye canonical mål ble kontrollert mot `data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json` og finnes der:

- `em_naering_logistikk_verdikjeder`
- `em_naer_geografi_infrastruktur`
- `em_naering_havn_transport`
- `em_naering_teknologi_infrastruktur`
- `em_naering_innovasjon_teknologisk_skift`

Duplikatkontroll etter migreringen:

- `havnelageret`: `em_naering_logistikk_verdikjeder`, `em_naer_geografi_infrastruktur` — ingen duplikater.
- `tollbukaia`: `em_naering_havn_transport`, `em_naering_logistikk_verdikjeder` — ingen duplikater.
- `telegrafbygningen`: `em_naering_teknologi_infrastruktur`, `em_naering_innovasjon_teknologisk_skift` — ingen duplikater.
- `jernbaneverkstedet_lodalen`: `em_naer_geografi_infrastruktur`, `em_naering_industri_og_mekanisering` — ingen duplikater.

## Endringskontroll

Endret fil:

- `data/places/naeringsliv/oslo/places_naeringsliv.json`

Bekreftelser:

- Kun `emne_ids` for de seks konkrete legacy-ID-ene ble endret.
- Ingen tekst, bilder, koordinater, titler, `popupDesc`, quizprofiler eller annen place-struktur ble endret.
- Ingen `data/fag/**`-filer ble endret.
- Ingen canonical emne-filer ble endret.
- `data/places/manifest.json` ble ikke endret.
- `data/places/places_index.json` ble ikke endret, fordi index-sjekken var OK.
- Ingen alias-schema, `canonical_alias`, `alias_of` eller placeholder-emner ble innført.
- Søk i `data/places/naeringsliv/oslo/places_naeringsliv.json` etter de seks gamle legacy-ID-ene ga 0 treff etter migreringen.

## Valideringsresultater

### Før: `npm run places:emner:check`

- Exit code: 1, som forventet før migrering.
- Active place files: 40
- Canonical emne files scanned: 15
- Canonical emne ids loaded: 995
- Missing emne_ids: 7
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

### Etter: `npm run places:emner:check`

- Exit code: 0
- Active place files: 40
- Canonical emne files scanned: 15
- Canonical emne ids loaded: 995
- Missing emne_ids: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

### `npm run places:index:check`

- Exit code: 0
- `places_index.json is in sync with source place files.`

### `npm run health:places`

- Exit code: 0
- Files checked: 40
- Places checked: 470
- Hidden places: 0
- Stub places: 0
- Canonical emne files checked: 16
- emne_ids checked: 1051
- Canonical emne_ids: 1051
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 304
- Errors: 0
- Warnings: 1321

## Resultat

- `Missing emne_ids` gikk fra 7 til 0.
- Gjenværende `em_naering_*` legacy-ID-er i aktiv næringsliv place-fil er 0.
- `places:index:check` er OK.
- `health:places` har `Errors: 0`.
- Ingen canonical-filer er endret.
- Ingen alias-mini-schema er innført.

## Anbefalt neste steg

Når emne-id-oppryddingen nå er ferdig på tvers av aktive place-filer, bør neste batch flytte fokus fra missing-ID-gate til kvalitetskontroll: redusere kjente `health:places` warnings, særlig manglende bilder/frontImage og bevisste wrong-prefix-koblinger, uten å blande dette med canonical-emneendringer.
