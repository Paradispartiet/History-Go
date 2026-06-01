# Batch 38: politikk-audit for `em_pol_mediert_offentlighet`

Dato: 2026-06-01

## Formål

Denne batchen er en read-only, manuell konsistenssjekk av Oslo-steder i `politikk` for å vurdere om det nye politikk-canonical-emnet `em_pol_mediert_offentlighet` bør brukes på flere steder i en senere batch.

Dette er ikke en datafix-batch. Ingen place-data, canonical-filer, manifest, index, scripts, UI-filer eller assets er endret.

## Kommandoer kjørt

Før audit:

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
```

Etter audit:

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
```

## Filer undersøkt

- `reports/oslo-place-audit-batch-37-youngstorget-mediated-publicness.md`
- `data/fag/politikk/emner_politikk_canonical_v4_5.json`
- `data/places/politikk/oslo/places_politikk.json`
- `data/places/manifest.json`
- `tools/placeHealthReport.mjs`
- `tools/check_place_emne_ids.mjs`

## Baseline etter Batch 37

Baseline ble bekreftet med valideringskommandoene før audit:

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

## Kort oppsummering av `em_pol_mediert_offentlighet`

`em_pol_mediert_offentlighet` dekker politisk offentlighet slik den formes gjennom medier, direkteoverføring, nyhetslogikk, TV, digitale flater, breaking news, pressebilder, live-intervjuer og offentlig representasjon.

Brukskriteriet er strengt: stedet må ha et konkret politikkanker, for eksempel institusjon, demonstrasjon, valgkontekst, konflikt eller offentlig debatt, og dette må faktisk være dokumentert som mediert, direktesendt, nyhetsformidlet, digitalt delt eller offentlig representert.

Emnet skal ikke brukes for generell popkultur, trendlogikk, influencerlogikk eller underholdning. Det skal heller ikke legges til bare fordi tekst inneholder ord som `breaking_news`, `tv`, `presse`, `media` eller `valg`; tekstgrunnlaget må vise et politisk medielag.

## Antall politikksteder vurdert

Alle 6 aktive steder i `data/places/politikk/oslo/places_politikk.json` ble vurdert manuelt:

1. `stortinget`
2. `youngstorget`
3. `oslo_radhus`
4. `eidsvolls_plass`
5. `tinghuset`
6. `regjeringskvartalet`

## Beslutningstabell

| Place id | Place title/name | Eksisterende `emne_ids` | Relevant tekstgrunnlag | Vurdering | Anbefalt handling | Begrunnelse |
| --- | --- | --- | --- | --- | --- | --- |
| `stortinget` | Stortinget | `em_pol_demokrati_representasjon`, `em_pol_parlamentarisme_maktbalanse` | `popupDesc` omtaler nasjonalforsamling, lovgivende makt, offentlig synlighet, folkevalgte, lover, budsjett, politiske prioriteringer og symbolbygg. `quiz_profile` vektlegger institusjon, representasjon og demokrati. | `mulig_men_mangler_tekstgrunnlag` | `trenger_tekstgrunnlag_før_emne` | Stortinget er et sterkt politikkanker og canonical-emnet har Stortinget som anbefalt Oslo-case, men dagens place-tekst dokumenterer ikke pressepunkt, direktesending, TV, nyhetslogikk, pressebilder, valgkveld eller annen mediert offentlighet. Nåværende emner dekker parlamentarisk institusjon og representasjon bedre enn et mediert lag uten tekstgrunnlag. |
| `youngstorget` | Youngstorget | `em_pol_arbeidsliv_kollektiv_kamp`, `em_pol_demonstrasjoner_protest`, `em_pol_mediert_offentlighet` | `popupDesc` beskriver demonstrasjoner, appeller, folkelig politisk deltakelse og politisk offentlighet i praksis. I tillegg har stedet tags `breaking_news`, `tv`, `offentlighet`, knagger `mediesentrum`, `direkteoffentlighet`, og et `populaerkultur`-lag som beskriver breaking news, valgkvelder, direktesendt politisk populærkultur, reportere på stedet og live-intervjuer. | `klart_relevant` | `allerede_dekket` | Dette er referansecaset fra Batch 37 og er allerede koblet til `em_pol_mediert_offentlighet`. Det finnes både politisk stedskontekst og eksplisitt dokumentert direktesendt/mediert offentlighetslag. Ingen ny handling i Batch 38. |
| `oslo_radhus` | Oslo rådhus | `em_pol_lokaldemokrati`, `em_pol_byrakrati_forvaltning` | `popupDesc` omtaler kommunal styring, lokalpolitisk makt, representasjonsarena, seremonier, mottakelser, internasjonale markeringer og at byen iscenesetter seg selv. `quiz_profile` nevner offentlig representasjon. | `mulig_men_mangler_tekstgrunnlag` | `trenger_tekstgrunnlag_før_emne` | Rådhuset har institusjon og offentlig representasjon, men teksten dokumenterer ikke at politiske handlinger her blir mediert, direktesendt, pressefotografert, nyhetsformidlet eller brukt som mediescene. Begrepet offentlig representasjon alene er ikke nok; dagens emner dekker lokalpolitikk og forvaltning. |
| `eidsvolls_plass` | Eidsvolls plass | `em_pol_demokrati_representasjon`, `em_pol_offentlighet_debatt` | `desc` og `popupDesc` beskriver plassen foran Stortinget, folkemøter, demonstrasjoner, taler, markeringer, offentlige appeller, synlige politiske konflikter og direkte krav mot lovgivende makt. | `mulig_men_mangler_tekstgrunnlag` | `trenger_tekstgrunnlag_før_emne` | Eidsvolls plass er det sterkeste mulige tilleggsstedet fordi demonstrasjoner og nasjonal offentlighet er tydelig dokumentert. Likevel omtaler nåværende tekst ikke pressebilder, TV, direktesending, nyhetslogikk eller annen konkret mediering. `em_pol_offentlighet_debatt` dekker dagens tekst bedre inntil et eksplisitt medielag eventuelt legges inn. |
| `tinghuset` | Oslo tinghus | `em_pol_domstoler_rettspraksis`, `em_pol_rettsstat_rettssikkerhet` | `popupDesc` omtaler rettsstatens praksis, lovtolkning, tvisteløsning, straffesaker, åpne/formelle rammer, dømmende makt og offentlighet i rettspleien. | `allerede_dekket_av_andre_emner` | `allerede_dekket` | Åpen rettspleie og offentlig institusjon er relevant for offentlighet, men teksten dokumenterer ikke mediert politisk offentlighet. Dagens domstol- og rettsstatsemner dekker stedet presist; `em_pol_mediert_offentlighet` ville kreve tekst om konkret mediert rettspolitisk konflikt, pressepunkt eller nyhetsformidlet sak. |
| `regjeringskvartalet` | Regjeringskvartalet | `em_pol_byrakrati_forvaltning`, `em_pol_politi_sikkerhet_makt` | `popupDesc` omtaler utøvende statsmakt, departementer, styringsfunksjoner, arkitektur, sikkerhetstiltak, byutvikling og 22. juli 2011 som nyere politisk historie med balanse mellom åpenhet, minne og sikkerhet. | `mulig_men_mangler_tekstgrunnlag` | `trenger_tekstgrunnlag_før_emne` | Regjeringskvartalet har et sterkt politisk konflikt-, sikkerhets- og offentlighetsanker, men dagens tekst dokumenterer ikke mediert offentlighet, pressebilder, TV, breaking-news-ramme eller direkteoverføring. Mediert 22. juli-offentlighet kan ikke utledes uten at place-teksten faktisk sier det. |

## Steder der emnet bør legges til senere

Ingen nye steder bør få `em_pol_mediert_offentlighet` direkte i en Batch 39-datafix basert på dagens tekstgrunnlag.

`youngstorget` er klart relevant, men emnet er allerede lagt til der. Ingen ytterligere handling er nødvendig for dette stedet i Batch 38.

## Steder der emnet ikke bør legges til

Ingen av de vurderte stedene er helt irrelevante som politikksteder, men følgende skal ikke få `em_pol_mediert_offentlighet` uten nytt tekstgrunnlag:

- `stortinget`
- `oslo_radhus`
- `eidsvolls_plass`
- `tinghuset`
- `regjeringskvartalet`

## Steder som trenger mer tekstgrunnlag før emnet kan brukes

Følgende steder kan vurderes på nytt dersom place-teksten senere dokumenterer et konkret mediert politisk lag:

- `stortinget` — trenger eksplisitt tekst om Stortinget som pressepunkt, TV-/direktesendt parlamentarisk offentlighet, pressebilder eller nyhetslogikk knyttet til politisk handling på stedet.
- `oslo_radhus` — trenger eksplisitt tekst om mediert politisk representasjon, TV-sendte markeringer, pressebilder eller direktesendte politiske/seremonielle offentligheter.
- `eidsvolls_plass` — trenger eksplisitt tekst om presse-/TV-dekning, direktesendte demonstrasjoner, nyhetsbilder eller mediert konflikt knyttet til plassen foran Stortinget.
- `regjeringskvartalet` — trenger eksplisitt tekst om mediert politisk konflikt, pressebilder, breaking-news-ramme, sikkerhetspolitisk mediescene eller offentlig representasjon knyttet til 22. juli/utøvende makt.

## Steder der eksisterende emner dekker behovet

- `youngstorget` — allerede dekket av `em_pol_mediert_offentlighet` sammen med arbeid-/protestemner.
- `tinghuset` — dagens rettsstat- og domstolsemner dekker teksten best; eventuell mediert rettspolitisk offentlighet må dokumenteres før emnet kan vurderes.
- `eidsvolls_plass` — `em_pol_offentlighet_debatt` dekker dagens tekst om offentlighet, demonstrasjoner, appeller og konflikt foran Stortinget bedre enn `em_pol_mediert_offentlighet` uten eksplisitt medielag.
- `stortinget` — `em_pol_demokrati_representasjon` og `em_pol_parlamentarisme_maktbalanse` dekker dagens institusjons- og representasjonstekst.
- `oslo_radhus` — `em_pol_lokaldemokrati` og `em_pol_byrakrati_forvaltning` dekker dagens lokaldemokrati-/forvaltningstekst.
- `regjeringskvartalet` — `em_pol_byrakrati_forvaltning` og `em_pol_politi_sikkerhet_makt` dekker dagens forvaltnings-, sikkerhets- og styringstekst.

## Anbefalt Batch 39

Anbefalingen er ikke en blind datafix som legger til `em_pol_mediert_offentlighet` på flere steder nå.

Foreslått Batch 39:

1. Gjør en smal tekstgrunnlags-batch for de fire mest plausible kandidatene: `eidsvolls_plass`, `stortinget`, `oslo_radhus` og `regjeringskvartalet`.
2. Legg bare inn nytt tekstgrunnlag dersom det kan dokumenteres place-for-place som politisk mediert offentlighet, ikke som generisk offentlighet eller symbolikk.
3. Etter eventuell tekstforbedring kan `em_pol_mediert_offentlighet` vurderes manuelt på nytt.
4. `eidsvolls_plass` bør prioriteres først fordi dagens tekst allerede dokumenterer demonstrasjoner, appeller, nasjonal offentlighet og konflikt rett foran Stortinget; det mangler primært eksplisitt mediert/presse-/TV-lag.

## Validering etter audit

Etter at rapportfilen ble opprettet, ble validering kjørt på nytt:

- `npm run places:emner:check`: exit code 0
- Missing emne_ids: 0
- Unknown emne_ids: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids: 0
- `npm run places:index:check`: OK (`places_index.json is in sync with source place files.`)
- `npm run health:places`: exit code 0
- Errors: 0
- Warnings: 1109
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 0
- Allowlisted cross-disciplinary emne_ids: 217

## Bekreftelser

- Ingen filer i `data/places/**` ble endret.
- `data/places/places_index.json` ble ikke endret.
- `data/places/manifest.json` ble ikke endret.
- Ingen filer i `data/fag/**` ble endret.
- Ingen canonical-filer ble endret.
- Ingen scripts/tools ble endret.
- `tools/placeHealthReport.mjs` ble ikke endret.
- `tools/check_place_emne_ids.mjs` ble ikke endret.
- Ingen UI-, CSS-, HTML- eller JS-filer ble endret.
- Ingen bilder/assets ble endret.
- Ingen `category`-verdier ble endret.
- Ingen allowlists ble endret eller innført.
- `em_pol_mediert_offentlighet` ble ikke lagt til automatisk på noen steder.
- Kun rapportfilen `reports/oslo-place-audit-batch-38-politikk-mediert-offentlighet-audit.md` ble opprettet.
