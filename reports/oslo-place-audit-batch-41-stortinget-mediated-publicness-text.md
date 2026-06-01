# Batch 41: tekstgrunnlag for mediert politisk offentlighet på `stortinget`

Dato: 2026-06-01

## Formål

Denne batchen gjør en smal tekstgrunnlagsendring for `stortinget` i `data/places/politikk/oslo/places_politikk.json`.

Målet er å dokumentere et konkret, men avgrenset, mediert politisk offentlighetslag i place-teksten slik at `em_pol_mediert_offentlighet` eventuelt kan vurderes i en senere batch. Dette er ikke en emne-id-batch.

## Kommandoer kjørt

- `npm run places:emner:check`
- `npm run places:index:check`
- `npm run health:places`
- `npm run places:index:check` etter tekstendring
- `npm run places:index:build` fordi `places_index.json` var ute av sync etter endret `desc`
- `npm run places:index:check` etter index-build
- `npm run places:emner:check` etter tekstendring
- `npm run health:places` etter tekstendring

## Filer undersøkt

- `reports/oslo-place-audit-batch-40-eidsvolls-plass-mediated-publicness-emne.md`
- `reports/oslo-place-audit-batch-38-politikk-mediert-offentlighet-audit.md`
- `reports/oslo-place-audit-batch-37-youngstorget-mediated-publicness.md`
- `data/places/politikk/oslo/places_politikk.json`
- `data/fag/politikk/emner_politikk_canonical_v4_5.json`
- `data/places/manifest.json`
- `data/places/places_index.json` etter at index-check krevde sync

`data/places/manifest.json` ble kun brukt til å bekrefte at `places/politikk/oslo/places_politikk.json` er en aktiv place-fil.

## Baseline før endring

| Kontrollpunkt | Resultat før endring |
| --- | ---: |
| `places:emner:check` exit code | 0 |
| Missing emne_ids | 0 |
| Duplicate emne_ids within same place | 0 |
| Unknown emne_ids | 0 |
| Wrong-prefix emne_ids | 0 |
| Allowlisted cross-disciplinary emne_ids | 217 |
| `places:index:check` | OK / in sync |
| `health:places` Errors | 0 |
| `health:places` Warnings | 1109 |

## Canonical-krav notert for `em_pol_mediert_offentlighet`

Politikk-canonical beskriver `em_pol_mediert_offentlighet` som politisk offentlighet formet gjennom medier, direkteoverføring, nyhetslogikk, TV, digitale flater, breaking news, pressebilder, live-intervjuer og offentlig representasjon.

Manuell terskel for senere vurdering:

- Stedet må ha et konkret politisk anker, for eksempel politisk sted, demonstrasjon, valgkontekst, institusjon, konflikt eller offentlig debatt.
- Det politiske ankeret må være dokumentert som mediert, direktesendt, nyhetsformidlet, digitalt delt eller offentlig representert.
- Emnet skal ikke brukes for generell symbolikk, popkultur, trendlogikk eller løs medieassosiasjon.

## Tekstfelt endret på `stortinget`

Følgende eksisterende tekstfelt ble endret:

- `desc`
- `popupDesc`
- `quiz_profile.signature_features`
- `quiz_profile.must_include`
- `quiz_profile.notes`

Det ble ikke lagt til `tags`, `layers` eller nye schemafelter.

## Før/etter-beskrivelse av tekstgrunnlaget

Før endringen beskrev `stortinget` primært:

- nasjonalforsamling
- parlamentarisk system
- lovgivende makt gjennom debatt, komitéarbeid og vedtak
- folkevalgte representanter
- nasjonalt symbolbygg
- demokrati, representasjon og maktbalanse

Etter endringen beskriver teksten fortsatt Stortinget primært som parlamentarisk institusjon, lovgivende makt og nasjonalt symbolbygg, men med et smalt tillegg: parlamentariske debatter, vedtak og politiske konflikter blir også synlige i nasjonal offentlighet gjennom direktesendte møter, pressebilder og TV- og nyhetsdekning.

## Emne-id-avgrensning

- Ingen eksisterende `emne_ids` ble fjernet.
- Ingen nye `emne_ids` ble lagt til.
- `em_pol_mediert_offentlighet` ble ikke lagt til på `stortinget`.
- Dette er kun en tekstgrunnlagsbatch.

Eksisterende `emne_ids` for `stortinget` står uendret:

- `em_pol_demokrati_representasjon`
- `em_pol_parlamentarisme_maktbalanse`

## Begrunnelse for mulig senere vurdering

Tekstgrunnlaget kan nå eventuelt vurderes i en senere batch fordi `stortinget` allerede har et svært sterkt institusjonelt politikkanker, og den oppdaterte teksten dokumenterer et avgrenset mediert offentlighetslag knyttet til parlamentarisk offentlighet, direktesendte møter, pressebilder og TV-/nyhetsdekning.

Dette er formulert som et tillegg til institusjons- og representasjonsidentiteten, ikke som en bred påstand om at Stortinget generelt er en mediescene.

## Før/etter-resultat fra `npm run places:emner:check`

| Kontrollpunkt | Før | Etter | Endring |
| --- | ---: | ---: | ---: |
| Exit code | 0 | 0 | 0 |
| Missing emne_ids | 0 | 0 | 0 |
| Duplicate emne_ids within same place | 0 | 0 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |
| Duplicate place ids across active files | 0 | 0 | 0 |
| Duplicate canonical emne_ids across canonical files | 0 | 0 | 0 |

## Resultat fra `npm run places:index:check`

| Tidspunkt | Resultat |
| --- | --- |
| Før tekstendring | `places_index.json is in sync with source place files.` |
| Etter tekstendring, før sync | Feilet med `value_mismatch field=desc` for `stortinget` |
| Etter `npm run places:index:build` | `places_index.json is in sync with source place files.` |

`places_index.json` måtte sync-es fordi `desc` inngår i indexen. Sync ble gjort med repoets eksisterende generator, `npm run places:index:build`, ikke med manuell bred index-redigering.

## Før/etter-resultat fra `npm run health:places`

| Kontrollpunkt | Før | Etter | Endring |
| --- | ---: | ---: | ---: |
| Files checked | 40 | 40 | 0 |
| Places checked | 470 | 470 | 0 |
| Hidden places | 0 | 0 | 0 |
| Stub places | 0 | 0 | 0 |
| emne_ids checked | 1042 | 1042 | 0 |
| Canonical emne_ids | 1042 | 1042 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |
| Wrong-prefix emne_ids | 0 | 0 | 0 |
| Allowlisted cross-disciplinary emne_ids | 217 | 217 | 0 |
| Errors | 0 | 0 | 0 |
| Warnings | 1109 | 1109 | 0 |

## Avgrensningsbekreftelser

- Ingen canonical-filer ble endret.
- Ingen filer under `data/fag/**` ble endret.
- Ingen scripts/tools ble endret.
- Ingen health-allowlists ble endret.
- `data/places/manifest.json` ble ikke endret.
- Ingen UI-, CSS-, HTML- eller JS-filer ble endret.
- Ingen bilder/assets ble endret.
- Ingen category-verdier ble endret.
- Ingen andre steder enn `stortinget` ble endret i place-filen.
- Ingen automatisk rewrite ble gjort.

## Anbefalt Batch 42

Batch 42 bør være en smal, manuell emne-id-vurdering av `stortinget` opp mot `em_pol_mediert_offentlighet`, basert på tekstgrunnlaget fra denne batchen. Den bør fortsatt ikke gjøre bred politikk-opprydding eller automatisk rewrite, og den bør bare legge til emnet dersom teksten anses å oppfylle canonical-kravene om konkret institusjonelt politikkanker og dokumentert mediert offentlighet.
