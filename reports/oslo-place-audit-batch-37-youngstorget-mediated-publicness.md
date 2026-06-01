# Batch 37 — Youngstorget og mediert politisk offentlighet

Dato: 2026-06-01

## Formål

Batch 37 vurderer den siste gjenværende wrong-prefix-warningen etter Batch 36:

- `data/places/politikk/oslo/places_politikk.json`
- place id: `youngstorget`
- category: `politikk`
- wrong-prefix emne_id: `em_pop_digital_offentlighet`

Målet var å løse warningen faglig presist uten ny health-allowlist, uten blind prefix-rewrite og uten å endre script-, manifest-, UI-, asset- eller andre fagfamiliefiler.

## Kommandoer kjørt

Baseline før endring:

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
npm run health:places 2>&1 | rg 'Wrong-prefix|Allowlisted|Warnings:|Errors:|Unknown|does not match category'
```

Validering etter endring:

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
npm run health:places 2>&1 | rg 'Wrong-prefix|Allowlisted|Warnings:|Errors:|Unknown|does not match category'
git diff --check
```

Merk: Det ble også kjørt én feilstavet kommando, `npm run places:emners:check`, som feilet fordi scriptet ikke finnes. Den inngår ikke som valideringsgrunnlag; korrekt kommando `npm run places:emner:check` ble kjørt både før og etter endringen.

## Filer undersøkt

- `reports/oslo-place-audit-batch-36-final-wrong-prefix-review.md`
- `reports/oslo-place-audit-batch-35-by-popkultur-allowlist.md`
- `tools/placeHealthReport.mjs`
- `tools/check_place_emne_ids.mjs`
- `data/places/politikk/oslo/places_politikk.json`
- `data/fag/politikk/emner_politikk_canonical_v4_5.json`
- `data/fag/politikk/methods_politikk_canonical_v4_5.json` som støtte for politikk-metoder og offentlighetsanalyse
- `data/fag/politikk/fagkart_politikk_canonical_v4_5.json` som støtte for politikk-domener og offentlighetsbegrep
- `data/places/manifest.json` for å bekrefte at `places/politikk/oslo/places_politikk.json` er aktiv place-fil

`data/places/places_index.json` ble ikke endret fordi index-check fortsatt var grønn etter dataendringen.

## Baseline før endring

`npm run places:emner:check`:

- Exit code: 0
- Missing emne_ids: 0
- Unknown emne_ids: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

`npm run places:index:check`:

- Exit code: 0
- `places_index.json is in sync with source place files.`

`npm run health:places`:

- Exit code: 0
- Errors: 0
- Warnings: 1110
- Wrong-prefix emne_ids: 1
- Allowlisted cross-disciplinary emne_ids: 217
- Unknown emne_ids: 0

Filtrert baseline viste den eneste wrong-prefix-warningen:

```text
- data/places/politikk/oslo/places_politikk.json #youngstorget: emne_id "em_pop_digital_offentlighet" does not match category "politikk" expected prefix "em_pol_"
```

## Vurdering av `youngstorget`

`youngstorget` er kategorisert som `politikk`. Place-dataene beskriver torget som arbeiderbevegelsens og fagorganiseringens mobiliseringsrom, med demonstrasjoner, appeller, folkelig politisk deltakelse og politisk offentlighet i praksis. Samtidig dokumenterer `tags` og `layers.populaerkultur` et medielag: `breaking_news`, `tv`, `offentlighet`, direktesendt offentlighet, reportere på stedet, live-intervjuer, valg, store nyhetshendelser og mediescene.

`em_pop_digital_offentlighet` traff derfor et reelt lag i dataene, men feil fagfamilie for dette stedet. Innholdet handler ikke primært om generell popkultur, sosial medie-trend, influencerlogikk eller underholdningskultur. Det handler om politisk handling som blir gjort synlig, sendt, tolket og delt i offentligheten.

## Søk etter eksisterende politikk-emne

Politikk-canonical ble søkt for emner om:

- politisk offentlighet
- mediert offentlighet
- digital offentlighet
- politisk mobilisering
- demonstrasjoner og medier
- nyhetshendelser
- offentlighet og kommunikasjon

Relevante eksisterende politikk-emner fantes, særlig:

- `em_pol_offentlighet_debatt`
- `em_pol_demonstrasjoner_protest`
- `em_pol_valg_deltakelse`
- `em_pol_symbolsk_makt`
- `em_pol_sivilsamfunn_organisering`

Vurderingen var at ingen av disse dekket det presise medierte/digitale offentlighetslaget godt nok alene. `youngstorget` hadde allerede `em_pol_demonstrasjoner_protest`, og `em_pol_offentlighet_debatt` dekker offentlighet og debatt bredt, men manglet eksplisitt avgrensning mot direkteoverføring, nyhetslogikk, TV, digitale flater, breaking news, pressebilder, live-intervjuer og mediescene. Å bruke bare et bredt eksisterende offentlighetsemne ville derfor skjule den faglige grunnen til at Batch 36 lot `em_pop_digital_offentlighet` stå igjen.

## Nytt politikk-canonical emne

Det ble opprettet ett fullverdig politikk-canonical emne:

- `emne_id`: `em_pol_mediert_offentlighet`
- Tittel: `Mediert politisk offentlighet`
- Domene: `demokrati_representasjon_offentlighet`
- Status: `active`

### Faglig avgrensning

Emnet dekker politisk offentlighet slik den formes gjennom medier, direkteoverføring, nyhetslogikk, TV, digitale flater, breaking news, pressebilder, live-intervjuer og offentlig representasjon. Det skal brukes når politisk handling på et sted ikke bare skjer fysisk, men også blir sendt, delt, tolket og gjort synlig i offentligheten.

### Hvorfor det ikke er et placeholder-emne

Emnet er ikke en kort placeholder fordi det følger eksisterende politikk-canonical schema og har fullstendig emnemodellering: `definition`, `why_it_matters`, `keywords`, `key_concepts`, `core_concepts`, `sub_concepts`, metoder, relaterte emner, stedstyper, scope guard, generatornotat, teori-hooks, Oslo-caser, overlap-avgrensning, anti-patterns og generator constraints. Det er plassert i samme domene og stil som øvrige offentlighets- og demokratitema i politikk-canonical.

### Hvorfor det hører hjemme i politikk

Emnet handler om demokratisk offentlighet, representasjon, protest, valg, nyhetslogikk og politiske rom. Det krever et konkret politisk sted, en institusjon, demonstrasjon, valgkontekst, konflikt eller offentlig debatt som dokumenteres som mediert, direktesendt, nyhetsformidlet, digitalt delt eller offentlig representert. Det er dermed et politikk-emne, ikke et generelt popkultur-emne.

## Dataendring på `youngstorget`

Fjernet fra `youngstorget`:

- `em_pop_digital_offentlighet`

Lagt til på `youngstorget`:

- `em_pol_mediert_offentlighet`

Det ble ikke gjort andre tekstendringer i place-dataene, og `emne_ids` fikk ingen duplikater.

## Før/etter-resultat

| Kontrollpunkt | Før Batch 37 | Etter Batch 37 | Endring |
| --- | ---: | ---: | ---: |
| `places:emner:check` exit code | 0 | 0 | 0 |
| Missing emne_ids | 0 | 0 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |
| Duplicate emne_ids within same place | 0 | 0 | 0 |
| Duplicate canonical emne_ids | 0 | 0 | 0 |
| `places:index:check` | OK | OK | OK |
| `health:places` Errors | 0 | 0 | 0 |
| `health:places` Warnings | 1110 | 1109 | -1 |
| Wrong-prefix emne_ids | 1 | 0 | -1 |
| Allowlisted cross-disciplinary emne_ids | 217 | 217 | 0 |

Etter endring rapporterte `npm run health:places`:

- Errors: 0
- Warnings: 1109
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 0
- Allowlisted cross-disciplinary emne_ids: 217

Etter endring rapporterte `npm run places:emner:check`:

- Exit code: 0
- Missing emne_ids: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0

Etter endring rapporterte `npm run places:index:check`:

- `places_index.json is in sync with source place files.`

## Index og manifest

- `data/places/manifest.json` ble kun lest for å bekrefte aktiv place-fil.
- `data/places/places_index.json` måtte ikke sync-es og ble ikke endret.

## Bekreftelser

- `tools/placeHealthReport.mjs` ble ikke endret.
- `tools/check_place_emne_ids.mjs` ble ikke endret.
- Ingen ny health-allowlist ble innført.
- Ingen `politikk → populaerkultur` allowlist ble innført.
- Ingen eksisterende allowlists ble endret.
- Ingen blind prefix-rewrite ble gjort.
- Ingen `category`-verdier ble endret.
- Ingen manifest-, UI-, CSS-, HTML-, JS-, bilde- eller asset-filer ble endret.
- Ingen andre place-filer enn `data/places/politikk/oslo/places_politikk.json` ble endret.
- Ingen andre fagfamilier enn politikk ble endret.
- Det ble ikke opprettet alias.

## Anbefalt Batch 38

Batch 38 bør gå videre fra wrong-prefix-opprydding til en smal politikk-canonical konsistenssjekk: vurder om andre politiske Oslo-steder med dokumentert presse-, TV-, valgkveld-, demonstrasjons- eller direkteoffentlighetslag bør få `em_pol_mediert_offentlighet`. Det bør gjøres manuelt og place-for-place, ikke som automatisk prefix- eller tekstsøk-rewrite.
