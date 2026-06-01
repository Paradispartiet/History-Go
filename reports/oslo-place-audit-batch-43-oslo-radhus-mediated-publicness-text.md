# Batch 43: tekstgrunnlag for mediert politisk offentlighet på `oslo_radhus`

Dato: 2026-06-01

## Formål

Denne batchen gjør en smal tekstgrunnlagsendring for `oslo_radhus` i `data/places/politikk/oslo/places_politikk.json`.

Målet er å dokumentere et nøkternt, stedlig forankret lag av mediert politisk offentlighet uten å gjøre dette til en emne-id-batch. `em_pol_mediert_offentlighet` er derfor **ikke** lagt til i denne PR-en.

## Kommandoer kjørt

Baseline før tekstendring:

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

`npm run places:index:build` ble bare kjørt fordi første index-check etter tekstendringen viste at `places_index.json` hadde gammel `desc` for `oslo_radhus`.

## Filer undersøkt

- `reports/oslo-place-audit-batch-42-stortinget-mediated-publicness-emne.md`
- `reports/oslo-place-audit-batch-41-stortinget-mediated-publicness-text.md`
- `reports/oslo-place-audit-batch-38-politikk-mediert-offentlighet-audit.md`
- `reports/oslo-place-audit-batch-37-youngstorget-mediated-publicness.md`
- `data/places/politikk/oslo/places_politikk.json`
- `data/fag/politikk/emner_politikk_canonical_v4_5.json`
- `data/places/manifest.json`
- `data/places/places_index.json` etter at index-check krevde sync

`data/places/manifest.json` ble kun brukt for å bekrefte at `places/politikk/oslo/places_politikk.json` er en aktiv place-fil.

## Baseline før endring

| Kontrollpunkt | Resultat før endring |
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
| `health:places` emne_ids checked | 1043 |

## Canonical-krav lest for `em_pol_mediert_offentlighet`

Politikk-canonical beskriver `em_pol_mediert_offentlighet` som politisk offentlighet formet gjennom medier, direkteoverføring, nyhetslogikk, TV, digitale flater, breaking news, pressebilder, live-intervjuer og offentlig representasjon.

Bruksterskelen som ble lagt til grunn for tekstarbeidet:

- Stedet må ha et konkret politisk anker, for eksempel politisk sted, institusjon, demonstrasjon, valgkontekst, konflikt eller offentlig debatt.
- Dette ankeret må være dokumentert som mediert, direktesendt, nyhetsformidlet, digitalt delt eller offentlig representert.
- Emnet skal ikke brukes for generell symbolikk, popkultur, trend eller løs medieassosiasjon.

## Eksisterende `oslo_radhus`-kontekst

Før endringen hadde `oslo_radhus` allerede et tydelig politikkanker:

- `category`: `politikk`
- `emne_ids`: `em_pol_lokaldemokrati`, `em_pol_byrakrati_forvaltning`
- `popupDesc`: kommunal styring, lokalpolitisk makt, byutvikling, tjenester, prioriteringer, representasjonsarena og offentlig symbolikk
- `quiz_profile`: hovedsete for bystyre og byråd, kommunal makt, bysymbol, seremonirom og offentlig representasjon

Det manglet likevel en eksplisitt tekstlig kobling mellom dette institusjons-/representasjonsankeret og presse-, TV- eller nyhetsformidlet offentlighet.

## Endrede tekstfelt på `oslo_radhus`

Endringen er avgrenset til eksisterende tekstfelt i `oslo_radhus`:

- `desc`
- `popupDesc`
- `quiz_profile.signature_features`
- `quiz_profile.primary_angles`
- `quiz_profile.question_families`
- `quiz_profile.must_include`
- `quiz_profile.notes`

Det ble ikke lagt til `tags`, `layers` eller nye schemafelt.

## Kort før/etter-beskrivelse

Før:

- Teksten beskrev Oslo rådhus som lokaldemokratisk institusjon, kommunal styring, representasjonsarena, symbolbygg og seremonirom.
- `desc` la stor vekt på nasjonalt demokratisymbol og Nobels fredsprisutdeling.
- Mediert politisk offentlighet var ikke eksplisitt dokumentert.

Etter:

- `desc` og `popupDesc` holder hovedidentiteten på Oslo kommune, rådhus, lokaldemokrati, bystyre/byråd, forvaltning og representasjon.
- Teksten dokumenterer nøkternt at kommunale beslutninger, markeringer og offentlig representasjon ved rådhuset kan bli synlige gjennom pressebilder, TV- og nyhetsdekning.
- `quiz_profile` styrker samme avgrensning med `nyhetsformidlet_offentlighet`, `mediert_lokalpolitikk` og en note som presiserer at rådhuset ikke skal behandles som en generell mediescene.

## Emne-id-avgrensning

- Ingen `emne_ids` ble lagt til.
- Ingen `emne_ids` ble fjernet.
- `em_pol_mediert_offentlighet` ble **ikke** lagt til.
- Eksisterende `emne_ids` på `oslo_radhus` er fortsatt:
  - `em_pol_lokaldemokrati`
  - `em_pol_byrakrati_forvaltning`

## Hvorfor tekstgrunnlaget kan vurderes i senere batch

Tekstgrunnlaget har nå et konkret, men forsiktig, mediert offentlighetslag knyttet til stedet som kommunal institusjon og representasjonsbygg. Det relevante ankeret er ikke generell mediesynlighet, popkultur eller Nobel-/kulturarrangementer, men lokalpolitisk beslutning, offentlig representasjon og kommunale markeringer som kan bli gjort synlige gjennom pressebilder, TV- og nyhetsdekning.

Dette kan gjøre `oslo_radhus` egnet for en senere, separat og manuell vurdering av `em_pol_mediert_offentlighet`, men denne batchen tar ikke den emne-id-beslutningen.

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
| Før tekstendring | `places_index.json is in sync with source place files.` |
| Første sjekk etter tekstendring | Ikke OK: `oslo_radhus` hadde gammel `desc` i `places_index.json` |
| Etter `npm run places:index:build` | `places_index.json is in sync with source place files.` |

`places_index.json` måtte sync-es fordi `desc` for `oslo_radhus` ble endret. Sync ble gjort med repoets eksisterende generator, `npm run places:index:build`; det ble ikke gjort manuelle brede index-endringer.

## Før/etter-resultat fra `npm run health:places`

| Kontrollpunkt | Før | Etter | Endring |
| --- | ---: | ---: | ---: |
| Files checked | 40 | 40 | 0 |
| Places checked | 470 | 470 | 0 |
| Hidden places | 0 | 0 | 0 |
| Stub places | 0 | 0 | 0 |
| `emne_ids checked` | 1043 | 1043 | 0 |
| Unknown emne_ids | 0 | 0 | 0 |
| Wrong-prefix emne_ids | 0 | 0 | 0 |
| Allowlisted cross-disciplinary emne_ids | 217 | 217 | 0 |
| Errors | 0 | 0 | 0 |
| Warnings | 1109 | 1109 | 0 |

Warnings økte ikke.

## Avgrensningsbekreftelser

- Ingen canonical-filer ble endret.
- Ingen filer under `data/fag/**` ble endret.
- Ingen scripts/tools ble endret.
- `tools/placeHealthReport.mjs` ble ikke endret.
- `tools/check_place_emne_ids.mjs` ble ikke endret.
- Ingen health-allowlists ble endret.
- Ingen manifestendring ble gjort.
- Ingen UI-, CSS-, HTML- eller JS-filer ble endret.
- Ingen bilder/assets ble endret.
- Ingen `category`-verdier ble endret.
- Ingen andre steder enn `oslo_radhus` ble endret i source place-filen.
- `places_index.json` ble kun generator-syncet for endret `desc` på `oslo_radhus`.

## Anbefalt Batch 44

Batch 44 bør være en separat, manuell emne-id-vurdering av `oslo_radhus` opp mot `em_pol_mediert_offentlighet`, basert på det nye tekstgrunnlaget. Den bør fortsatt være smal: vurder bare om rådhusets lokaldemokratiske beslutnings-, representasjons- og markeringstekst nå tilfredsstiller canonical-kravet om dokumentert mediert, nyhetsformidlet eller offentlig representert politisk offentlighet. Ikke gjør automatisk opprydding eller bred politikk-rewrite.
