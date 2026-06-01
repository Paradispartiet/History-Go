# Batch 39: tekstgrunnlag for mediert offentlighet på `eidsvolls_plass`

Dato: 2026-06-01

## Formål

Denne batchen gjør en smal tekstgrunnlagsendring for `eidsvolls_plass` i `data/places/politikk/oslo/places_politikk.json`. Målet er å dokumentere et konkret mediert politisk offentlighetslag i eksisterende stedskontekst, uten å legge til eller fjerne `emne_ids`.

Batchen legger ikke til `em_pol_mediert_offentlighet`; den styrker bare tekstgrunnlaget slik at emnet eventuelt kan vurderes manuelt i en senere batch.

## Kommandoer kjørt

Før endring:

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
```

Etter tekstendring:

```bash
npm run places:index:check
npm run places:index:build
npm run places:index:check
npm run places:emner:check
npm run health:places
```

## Filer undersøkt

- `reports/oslo-place-audit-batch-38-politikk-mediert-offentlighet-audit.md`
- `reports/oslo-place-audit-batch-37-youngstorget-mediated-publicness.md`
- `data/places/politikk/oslo/places_politikk.json`
- `data/fag/politikk/emner_politikk_canonical_v4_5.json`
- `data/places/manifest.json`
- `data/places/places_index.json` etter at index-check krevde sync

## Baseline før endring

Baseline ble bekreftet før tekstendringen:

- `places:emner:check`: exit code 0
- Missing emne_ids: 0
- Unknown emne_ids: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids: 0
- `places:index:check`: OK (`places_index.json is in sync with source place files.`)
- `health:places` Errors: 0
- `health:places` Warnings: 1109
- Wrong-prefix emne_ids: 0
- Allowlisted cross-disciplinary emne_ids: 217

## Krav fra `em_pol_mediert_offentlighet`

Politikk-canonical beskriver `em_pol_mediert_offentlighet` som et emne for politisk offentlighet formet gjennom medier, direkteoverføring, nyhetslogikk, TV, digitale flater, pressebilder, live-intervjuer og offentlig representasjon.

Kravet er at stedet må ha et konkret politisk anker, for eksempel institusjon, demonstrasjon, valgkontekst, konflikt eller offentlig debatt, og at dette må være dokumentert som mediert, direktesendt, nyhetsformidlet, digitalt delt eller offentlig representert. Emnet skal ikke brukes for generell symbolikk, popkultur eller løs medieassosiasjon.

## `eidsvolls_plass` før endring

Før endring beskrev teksten Eidsvolls plass som:

- plass foran Stortinget
- historisk samlingssted for folkemøter, demonstrasjoner og taler
- politisk nøkkelrom der institusjonell makt og folkelig ytring møtes
- nasjonalt offentlig rom der konflikter blir synlige
- sted der borgere kan rette krav direkte mot lovgivende makt

Batch 38 vurderte dette som et sterkt mulig kandidatgrunnlag, men tekstgrunnlaget manglet eksplisitt presse-, TV-, nyhets- eller annet mediert lag.

## Tekstfelt endret

Følgende tekstfelt på `eidsvolls_plass` ble endret:

- `desc`
- `popupDesc`
- `quiz_profile.signature_features`
- `quiz_profile.primary_angles`
- `quiz_profile.question_families`
- `quiz_profile.must_include`
- `quiz_profile.notes`

Det fantes ikke egne `tags` eller `layers` på `eidsvolls_plass` i dagens schema, så ingen slike felt ble lagt til.

## Før/etter-beskrivelse av tekstgrunnlaget

Før endring dokumenterte stedet et fysisk og demokratisk offentlighetsrom foran Stortinget: demonstrasjoner, markeringer, taler, appeller, synlige konflikter og krav rettet mot lovgivende makt.

Etter endring dokumenterer teksten fortsatt samme hovedidentitet, men legger smalt til at demonstrasjoner og markeringer på plassen ofte også blir synlige gjennom pressebilder, TV- og nyhetsdekning. Teksten knytter dermed krav foran Stortinget til både fysisk protestrom og mediert politisk offentlighet, uten å påstå konkrete enkelthendelser eller gjøre stedet til en generell mediescene.

## Emne-id-bekreftelser

- Ingen `emne_ids` ble lagt til.
- Ingen `emne_ids` ble fjernet.
- `em_pol_mediert_offentlighet` ble ikke lagt til på `eidsvolls_plass`.
- Eksisterende `emne_ids` står uendret: `em_pol_demokrati_representasjon` og `em_pol_offentlighet_debatt`.

## Hvorfor tekstgrunnlaget kan vurderes senere

Teksten gir nå et mer eksplisitt, stedlig forankret grunnlag for å vurdere `em_pol_mediert_offentlighet` senere: Eidsvolls plass er fortsatt beskrevet som demonstrasjonsrom foran Stortinget, men politiske krav derfra er nå også beskrevet som synlige gjennom pressebilder, TV- og nyhetsdekning. Dette svarer på mangelen Batch 38 pekte på, men uten å gjøre denne batchen til en emne-id-endring.

## Før/etter-resultat fra `npm run health:places`

| Kontrollpunkt | Før endring | Etter endring | Endring |
| --- | ---: | ---: | ---: |
| Errors | 0 | 0 | 0 |
| Warnings | 1109 | 1109 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |
| Wrong-prefix emne_ids | 0 | 0 | 0 |
| Allowlisted cross-disciplinary emne_ids | 217 | 217 | 0 |

## Før/etter-resultat fra `npm run places:emner:check`

| Kontrollpunkt | Før endring | Etter endring | Endring |
| --- | ---: | ---: | ---: |
| Exit code | 0 | 0 | 0 |
| Missing emne_ids | 0 | 0 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |
| Duplicate emne_ids within same place | 0 | 0 | 0 |
| Duplicate place ids across active files | 0 | 0 | 0 |
| Duplicate canonical emne_ids across canonical files | 0 | 0 | 0 |

## Resultat fra `npm run places:index:check`

- Før endring: OK (`places_index.json is in sync with source place files.`)
- Etter tekstendring: feilet som forventet fordi `desc` i `places_index.json` ikke var synkronisert for `eidsvolls_plass`.
- Etter `npm run places:index:build`: OK (`places_index.json is in sync with source place files.`)

## Index og manifest

- `data/places/manifest.json` ble kun lest for å bekrefte at `places/politikk/oslo/places_politikk.json` er aktiv place-fil.
- `data/places/places_index.json` måtte sync-es fordi `desc` ble endret.
- Sync ble gjort med repoets eksisterende index-generator: `npm run places:index:build`.
- Det ble ikke gjort manuelle brede index-endringer.

## Bekreftelser

- Ingen canonical-filer ble endret.
- Ingen filer under `data/fag/**` ble endret.
- Ingen scripts eller tools ble endret.
- `tools/placeHealthReport.mjs` ble ikke endret.
- `tools/check_place_emne_ids.mjs` ble ikke endret.
- Ingen health-allowlists ble endret.
- Ingen manifest-endring ble gjort.
- Ingen UI-, CSS-, HTML- eller JS-filer ble endret.
- Ingen bilder eller assets ble endret.
- Ingen `category`-verdier ble endret.
- Ingen andre steder enn `eidsvolls_plass` ble endret i place-kilden.

## Anbefalt Batch 40

Batch 40 bør være en manuell emne-id-vurdering av `eidsvolls_plass` etter denne tekstgrunnlagsendringen. Hvis vurderingen konkluderer med at teksten nå oppfyller canonical-kravene, kan `em_pol_mediert_offentlighet` vurderes lagt til i en egen smal batch. Hvis ikke, bør stedet fortsatt stå med `em_pol_demokrati_representasjon` og `em_pol_offentlighet_debatt`, og neste tekstgrunnlagskandidat fra Batch 38 kan vurderes separat.
