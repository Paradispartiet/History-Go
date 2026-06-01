# Batch 42: manuell emne-id-vurdering av `stortinget` for mediert offentlighet

Dato: 2026-06-01

## Formål

Denne batchen gjør en smal, manuell vurdering av om `stortinget` etter Batch 41 oppfyller canonical-kravene for politikk-emnet `em_pol_mediert_offentlighet`.

Batchen endrer ikke tekstgrunnlaget videre. Den vurderer bare om det allerede styrkede tekstgrunnlaget er nok til å legge til emne-id-en på `stortinget`.

## Kommandoer kjørt

Baseline før vurdering:

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
```

Etter emne-id-endring:

```bash
npm run places:index:check
npm run places:emner:check
npm run health:places
npm run health:places 2>&1 | rg 'Unknown emne_ids|Wrong-prefix emne_ids|Allowlisted cross-disciplinary emne_ids|Errors:|Warnings:|emne_ids checked'
```

## Filer undersøkt

- `reports/oslo-place-audit-batch-41-stortinget-mediated-publicness-text.md`
- `reports/oslo-place-audit-batch-40-eidsvolls-plass-mediated-publicness-emne.md`
- `reports/oslo-place-audit-batch-38-politikk-mediert-offentlighet-audit.md`
- `reports/oslo-place-audit-batch-37-youngstorget-mediated-publicness.md`
- `data/places/politikk/oslo/places_politikk.json`
- `data/fag/politikk/emner_politikk_canonical_v4_5.json`
- `data/places/manifest.json`

`data/places/manifest.json` ble kun brukt for å bekrefte at `places/politikk/oslo/places_politikk.json` er en aktiv place-fil.

## Baseline før vurdering

| Kontrollpunkt | Resultat før vurdering |
| --- | ---: |
| `places:emner:check` exit code | 0 |
| Missing emne_ids | 0 |
| Duplicate emne_ids within same place | 0 |
| Duplicate place ids across active files | 0 |
| Duplicate canonical emne_ids across canonical files | 0 |
| `places:index:check` | OK / in sync |
| `health:places` Errors | 0 |
| `health:places` Warnings | 1109 |
| Unknown emne_ids | 0 |
| Wrong-prefix emne_ids | 0 |
| Allowlisted cross-disciplinary emne_ids | 217 |
| `health:places` emne_ids checked | 1042 |

## Canonical-krav for `em_pol_mediert_offentlighet`

Politikk-canonical beskriver `em_pol_mediert_offentlighet` som politisk offentlighet formet gjennom medier, direkteoverføring, nyhetslogikk, TV, digitale flater, breaking news, pressebilder, live-intervjuer og offentlig representasjon.

Bruksterskelen som ble lagt til grunn i denne vurderingen:

- Stedet må ha et konkret politisk anker, for eksempel politisk sted, institusjon, demonstrasjon, valgkontekst, konflikt eller offentlig debatt.
- Dette ankeret må være dokumentert som mediert, direktesendt, nyhetsformidlet, digitalt delt eller offentlig representert.
- Emnet skal ikke brukes for generell symbolikk, popkultur, trend eller løs medieassosiasjon.

## Vurdering av `stortinget`

Vurderingen er **ja**: Tekstgrunnlaget etter Batch 41 oppfyller canonical-kravene for `em_pol_mediert_offentlighet`.

Begrunnelse:

- Det konkrete politikkankeret er svært sterkt: `stortinget` beskrives som Norges nasjonalforsamling, kjernen i det parlamentariske systemet og stedet der lovgivende makt utøves.
- Teksten dokumenterer politiske handlinger i institusjonen: parlamentariske debatter, komitéarbeid, voteringer, vedtak, lover, budsjett, politiske prioriteringer og politiske konflikter innen parlamentariske former.
- Det medierte laget er nå eksplisitt dokumentert: `desc`, `popupDesc` og `quiz_profile` omtaler presse- og nyhetsdekning, pressebilder, TV- og nyhetsdekning, nyhetsformidlet parlamentarisk offentlighet og hvordan debatter og vedtak blir synlige for en nasjonal offentlighet.
- Medielaget er nøkternt knyttet til politiske beslutninger, representasjon og parlamentarisk offentlighet, ikke til generell popkultur, underholdning, trendlogikk eller løs medieassosiasjon.
- Batch 41 presiserte også at Stortingets institusjonsrolle ikke skal reduseres til en generell mediescene. Det støtter en avgrenset bruk av `em_pol_mediert_offentlighet` ved siden av institusjons- og representasjonsemnene.

## Endring gjort

`em_pol_mediert_offentlighet` ble lagt til i `emne_ids` for `stortinget`.

Eksisterende `emne_ids` ble beholdt:

- `em_pol_demokrati_representasjon`
- `em_pol_parlamentarisme_maktbalanse`

Ny samlet `emne_ids`-liste for `stortinget`:

- `em_pol_demokrati_representasjon`
- `em_pol_parlamentarisme_maktbalanse`
- `em_pol_mediert_offentlighet`

Bekreftelse: Det ble ikke laget duplikater, og `places:emner:check` rapporterer fortsatt `Duplicate emne_ids within same place: 0`.

## Før/etter-resultat fra `npm run places:emner:check`

| Kontrollpunkt | Før | Etter | Endring |
| --- | ---: | ---: | ---: |
| Exit code | 0 | 0 | 0 |
| Missing emne_ids | 0 | 0 | 0 |
| Duplicate emne_ids within same place | 0 | 0 | 0 |
| Duplicate place ids across active files | 0 | 0 | 0 |
| Duplicate canonical emne_ids across canonical files | 0 | 0 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |

## Resultat fra `npm run places:index:check`

| Tidspunkt | Resultat |
| --- | --- |
| Før vurdering | `places_index.json is in sync with source place files.` |
| Etter emne-id-endring | `places_index.json is in sync with source place files.` |

`places_index.json` måtte ikke sync-es, og `npm run places:index:build` ble derfor ikke kjørt.

## Før/etter-resultat fra `npm run health:places`

| Kontrollpunkt | Før | Etter | Endring |
| --- | ---: | ---: | ---: |
| Files checked | 40 | 40 | 0 |
| Places checked | 470 | 470 | 0 |
| Hidden places | 0 | 0 | 0 |
| Stub places | 0 | 0 | 0 |
| `emne_ids checked` | 1042 | 1043 | +1 |
| Unknown emne_ids | 0 | 0 | 0 |
| Wrong-prefix emne_ids | 0 | 0 | 0 |
| Allowlisted cross-disciplinary emne_ids | 217 | 217 | 0 |
| Errors | 0 | 0 | 0 |
| Warnings | 1109 | 1109 | 0 |

Warnings økte ikke. Økningen i `emne_ids checked` skyldes én ny gyldig emne-id på `stortinget`.

## Avgrensningsbekreftelser

- Ingen canonical-filer ble endret.
- Ingen filer under `data/fag/**` ble endret.
- Ingen scripts/tools ble endret.
- `tools/placeHealthReport.mjs` ble ikke endret.
- `tools/check_place_emne_ids.mjs` ble ikke endret.
- Ingen health-allowlists ble endret.
- `data/places/manifest.json` ble ikke endret.
- `data/places/places_index.json` ble ikke endret.
- Ingen UI-, CSS-, HTML- eller JS-filer ble endret.
- Ingen bilder/assets ble endret.
- Ingen category-verdier ble endret.
- Ingen andre steder enn `stortinget` ble endret.
- Emnet ble ikke lagt til på `oslo_radhus` eller `regjeringskvartalet`.
- Ingen eksisterende `emne_ids` ble fjernet.
- Ingen nye canonical-emner ble lagt til.
- Ingen automatisk rewrite ble gjort.

## Anbefalt Batch 43

Batch 43 bør følge Batch 38s gjenstående kandidatspor med en smal tekstgrunnlagsvurdering av `oslo_radhus` eller `regjeringskvartalet`, ikke en automatisk emne-id-opprydding. Anbefalt neste kandidat er `oslo_radhus`, fordi stedet allerede har et institusjons- og offentlig representasjonsanker, men fortsatt mangler eksplisitt tekstgrunnlag for presse-, TV-, direktesendt, nyhetsformidlet eller digitalt delt politisk offentlighet.
