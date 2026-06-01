# Batch 41: tekstgrunnlag for `stortinget` og mediert politisk offentlighet

Dato: 2026-06-01

## Formål

Denne batchen gjør en smal tekstgrunnlagsendring for `stortinget` i `data/places/politikk/oslo/places_politikk.json`.

Målet er å dokumentere et nøkternt mediert parlamentarisk offentlighetslag i eksisterende place-tekst, slik at `em_pol_mediert_offentlighet` eventuelt kan vurderes manuelt i en senere batch. Batchen legger ikke til nye `emne_ids`.

## Kommandoer kjørt

- `npm run places:emner:check`
- `npm run places:index:check`
- `npm run health:places`
- `npm run places:index:check` etter tekstendring
- `npm run places:emner:check` etter tekstendring
- `npm run health:places` etter tekstendring
- `npm run places:index:build` fordi tekstendringen gjorde `places_index.json` midlertidig ute av sync
- `npm run places:index:check` etter index-build
- `npm run places:emner:check` etter index-build
- `npm run health:places` etter index-build

Merk: En utilsiktet feilstavet kontrollkommando, `npm run places:emners:check`, ble avvist av npm som manglende script og ga ingen dataendring. Riktig kommando, `npm run places:emner:check`, ble kjørt umiddelbart etterpå.

## Filer undersøkt

- `reports/oslo-place-audit-batch-40-eidsvolls-plass-mediated-publicness-emne.md`
- `reports/oslo-place-audit-batch-38-politikk-mediert-offentlighet-audit.md`
- `reports/oslo-place-audit-batch-37-youngstorget-mediated-publicness.md`
- `data/places/politikk/oslo/places_politikk.json`
- `data/fag/politikk/emner_politikk_canonical_v4_5.json`
- `data/places/manifest.json`
- `data/places/places_index.json` etter at index-check krevde sync

`data/places/manifest.json` bekrefter at `places/politikk/oslo/places_politikk.json` er en aktiv place-fil.

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

## Canonical-krav for `em_pol_mediert_offentlighet`

Politikk-canonical beskriver `em_pol_mediert_offentlighet` som politisk offentlighet formet gjennom medier, direkteoverføring, nyhetslogikk, TV, digitale flater, breaking news, pressebilder, live-intervjuer og offentlig representasjon.

Bruksterskelen som ble lagt til grunn i denne tekstbatchen:

- Stedet må ha et konkret politisk anker, for eksempel politisk sted, demonstrasjon, valgkontekst, institusjon, konflikt eller offentlig debatt.
- Det politiske ankeret må være dokumentert som mediert, direktesendt, nyhetsformidlet, digitalt delt eller offentlig representert.
- Emnet skal ikke brukes for generell symbolikk, popkultur, trendlogikk eller løs medieassosiasjon.

## `stortinget` før endring

Før endringen var `stortinget` tydelig forankret i:

- nasjonalforsamling
- parlamentarisk system
- lovgivende makt
- debatt, komitéarbeid og vedtak
- folkevalgt representasjon
- demokrati og maktbalanse
- nasjonalt symbolbygg

Batch 38 vurderte derfor stedet som faglig plausibelt, men med status `mulig_men_mangler_tekstgrunnlag`, fordi place-teksten ikke dokumenterte pressepunkt, TV-/direktesendt parlamentarisk offentlighet, pressebilder, nyhetslogikk eller annet eksplisitt mediert offentlighetslag.

## Endrede tekstfelt på `stortinget`

Følgende felt ble endret:

- `desc`
- `popupDesc`
- `quiz_profile.signature_features`
- `quiz_profile.primary_angles`
- `quiz_profile.question_families`
- `quiz_profile.must_include`
- `quiz_profile.notes`

Det ble ikke lagt til `tags`, `layers`, `knagger` eller andre nye schema-felt på `stortinget`.

## Kort før/etter-beskrivelse av tekstgrunnlaget

Før: Teksten beskrev Stortinget som nasjonalforsamling, lovgivende makt, folkevalgt institusjon, symbolbygg og demokratisk kjerneinstitusjon.

Etter: Teksten beholder samme primæridentitet, men legger til at parlamentariske debatter, voteringer, vedtak og politiske konflikter kan bli synlige for en nasjonal offentlighet gjennom pressebilder, TV- og nyhetsdekning. Formuleringen er avgrenset til parlamentarisk offentlighet og gjør eksplisitt at Stortinget ikke reduseres til en generell mediescene.

## Bekreftelse om `emne_ids`

Ingen `emne_ids` ble lagt til, fjernet eller sortert om på `stortinget`.

`stortinget` har fortsatt bare:

- `em_pol_demokrati_representasjon`
- `em_pol_parlamentarisme_maktbalanse`

`em_pol_mediert_offentlighet` ble ikke lagt til i denne batchen.

## Hvorfor tekstgrunnlaget kan vurderes senere

Etter tekstendringen har `stortinget` et mer eksplisitt tekstgrunnlag for et mulig senere emne-id-spørsmål, fordi teksten nå kobler:

- et konkret politisk sted og institusjon: Stortinget
- parlamentariske handlinger: debatter, voteringer, vedtak og politiske konflikter
- offentlig representasjon: nasjonal parlamentarisk offentlighet
- mediert synlighet: pressebilder, TV- og nyhetsdekning

Dette gjør at en senere batch kan vurdere `em_pol_mediert_offentlighet` manuelt uten å basere seg på løs medieassosiasjon. Denne batchen tar likevel ikke den emne-id-beslutningen.

## Før/etter-resultat fra `npm run places:emner:check`

| Kontrollpunkt | Før | Etter | Endring |
| --- | ---: | ---: | ---: |
| Exit code | 0 | 0 | 0 |
| Missing emne_ids | 0 | 0 | 0 |
| Duplicate emne_ids within same place | 0 | 0 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |

## Resultat fra `npm run places:index:check`

| Tidspunkt | Resultat |
| --- | --- |
| Før tekstendring | `places_index.json is in sync with source place files.` |
| Etter tekstendring, før index-build | Ikke OK: `stortinget` hadde `desc`-mismatch i `places_index.json` |
| Etter `npm run places:index:build` | `places_index.json is in sync with source place files.` |

`places_index.json` måtte sync-es fordi `desc` for `stortinget` ble endret. Sync ble gjort med repoets eksisterende generator, `npm run places:index:build`, ikke manuelt.

## Før/etter-resultat fra `npm run health:places`

| Kontrollpunkt | Før | Etter | Endring |
| --- | ---: | ---: | ---: |
| Files checked | 40 | 40 | 0 |
| Places checked | 470 | 470 | 0 |
| Hidden places | 0 | 0 | 0 |
| Stub places | 0 | 0 | 0 |
| emne_ids checked | 1042 | 1042 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |
| Wrong-prefix emne_ids | 0 | 0 | 0 |
| Allowlisted cross-disciplinary emne_ids | 217 | 217 | 0 |
| Errors | 0 | 0 | 0 |
| Warnings | 1109 | 1109 | 0 |

## Avgrensningsbekreftelser

- Ingen canonical-filer ble endret.
- Ingen filer under `data/fag/**` ble endret.
- Ingen scripts/tools ble endret.
- `tools/placeHealthReport.mjs` ble ikke endret.
- `tools/check_place_emne_ids.mjs` ble ikke endret.
- Ingen health-allowlists ble endret.
- `data/places/manifest.json` ble ikke endret.
- Ingen UI-, CSS-, HTML- eller JS-filer ble endret.
- Ingen bilder/assets ble endret.
- Ingen `category`-verdier ble endret.
- Ingen andre steder enn `stortinget` ble endret i place-kilden.
- `data/places/places_index.json` ble kun generator-syncet for endret `desc`.

## Anbefalt Batch 42

Batch 42 bør være en smal, manuell emne-id-vurdering av `stortinget` mot `em_pol_mediert_offentlighet` basert på tekstgrunnlaget fra Batch 41. Den bør ikke gjøre automatisk politikk-opprydding og bør ikke legge emnet til andre steder uten separat tekstgrunnlag.
