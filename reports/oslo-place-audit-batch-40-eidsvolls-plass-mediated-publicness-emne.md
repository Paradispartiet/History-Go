# Batch 40: manuell emne-id-vurdering av `eidsvolls_plass` for mediert offentlighet

Dato: 2026-06-01

## Formål

Denne batchen gjør en smal, manuell vurdering av om `eidsvolls_plass` etter Batch 39 oppfyller canonical-kravene for politikk-emnet `em_pol_mediert_offentlighet`.

Batchen endrer ikke tekstgrunnlaget, canonical-filer, scripts/tools, manifest, health-allowlists, UI, assets eller andre steder.

## Kommandoer kjørt

- `npm run places:emner:check`
- `npm run places:index:check`
- `npm run health:places`
- `npm run places:index:check` etter emne-id-endring
- `npm run places:emner:check` etter emne-id-endring
- `npm run health:places` etter emne-id-endring

Merk: En innledende feilstavet kommando, `npm run places:emners:check`, ble avvist av npm som manglende script og ga ingen dataendring. Riktig kommando ble deretter kjørt.

## Filer undersøkt

- `reports/oslo-place-audit-batch-39-eidsvolls-plass-mediated-publicness-text.md`
- `reports/oslo-place-audit-batch-38-politikk-mediert-offentlighet-audit.md`
- `reports/oslo-place-audit-batch-37-youngstorget-mediated-publicness.md`
- `data/places/politikk/oslo/places_politikk.json`
- `data/fag/politikk/emner_politikk_canonical_v4_5.json`
- `data/places/manifest.json`

`data/places/places_index.json` ble ikke endret fordi index-check var OK både før og etter emne-id-endringen.

## Baseline før vurdering

| Kontrollpunkt | Resultat før vurdering |
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

Politikk-canonical beskriver `em_pol_mediert_offentlighet` som et emne for politisk offentlighet formet gjennom medier, direkteoverføring, nyhetslogikk, TV, digitale flater, breaking news, pressebilder, live-intervjuer og offentlig representasjon.

Manuell bruksterskel i denne batchen:

- Stedet må ha et konkret politisk anker, for eksempel politisk sted, demonstrasjon, valgkontekst, institusjon, konflikt eller offentlig debatt.
- Det politiske ankeret må være dokumentert som mediert, direktesendt, nyhetsformidlet, digitalt delt eller offentlig representert.
- Emnet skal ikke brukes for generell symbolikk, popkultur, trendlogikk eller løs medieassosiasjon.

## Vurdering av `eidsvolls_plass`

### Tekstgrunnlag etter Batch 39

`eidsvolls_plass` beskrives nå som:

- plassen foran Stortinget
- historisk samlingssted for folkemøter, demonstrasjoner og taler
- politisk nøkkelrom der institusjonell makt og folkelig ytring møtes
- sted brukt til demonstrasjoner, markeringer og offentlige appeller
- nasjonalt offentlig rom der politiske konflikter blir synlige
- sted der krav rettes mot lovgivende makt
- sted der protester og markeringer ofte blir synlige gjennom pressebilder, TV- og nyhetsdekning
- fysisk byrom og del av en mediert politisk offentlighet

### Manuell konklusjon

Vurderingen er **ja**: Tekstgrunnlaget oppfyller nå canonical-kravene for `em_pol_mediert_offentlighet`.

Begrunnelse:

- Det konkrete politikkankeret er sterkt: Eidsvolls plass er plassert foran Stortinget og beskrives som et demonstrasjons- og offentlighetsrom rettet mot lovgivende makt.
- Demonstrasjoner, markeringer og offentlige appeller er eksplisitt dokumentert.
- Det medierte laget er nå eksplisitt dokumentert gjennom pressebilder, TV- og nyhetsdekning.
- Teksten knytter medieoffentligheten til politiske krav og offentlig representasjon, ikke til generell popkultur, trend eller løs medieassosiasjon.

## Endring gjort

`em_pol_mediert_offentlighet` ble lagt til i `emne_ids` for `eidsvolls_plass`.

Eksisterende `emne_ids` ble beholdt:

- `em_pol_demokrati_representasjon`
- `em_pol_offentlighet_debatt`

Ny samlet `emne_ids`-liste for `eidsvolls_plass`:

- `em_pol_demokrati_representasjon`
- `em_pol_offentlighet_debatt`
- `em_pol_mediert_offentlighet`

Bekreftelse: Det ble ikke laget duplikater, og `places:emner:check` rapporterer fortsatt `Duplicate emne_ids within same place: 0`.

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
| Unknown emne_ids | 0 | 0 | 0 |
| Wrong-prefix emne_ids | 0 | 0 | 0 |
| Allowlisted cross-disciplinary emne_ids | 217 | 217 | 0 |
| Errors | 0 | 0 | 0 |
| Warnings | 1109 | 1109 | 0 |

`emne_ids checked` økte fra 1041 til 1042 fordi én gyldig emne-id ble lagt til på `eidsvolls_plass`.

## Avgrensningsbekreftelser

- Ingen canonical-filer ble endret.
- Ingen filer under `data/fag/**` ble endret.
- Ingen scripts/tools ble endret.
- Ingen health-allowlists ble endret.
- `data/places/manifest.json` ble ikke endret.
- `data/places/places_index.json` ble ikke endret.
- Ingen UI-, CSS-, HTML- eller JS-filer ble endret.
- Ingen bilder/assets ble endret.
- Ingen category-verdier ble endret.
- Ingen andre steder enn `eidsvolls_plass` ble endret.
- Emnet ble ikke lagt til på `stortinget`, `oslo_radhus` eller `regjeringskvartalet`.
- Ingen nye canonical-emner ble lagt til.

## Anbefalt Batch 41

Batch 41 bør følge anbefalingen fra Batch 38 og gå videre med neste tekstgrunnlagskandidat blant de plausible politikkstedene som fortsatt mangler eksplisitt mediert lag. Anbefalt kandidat er `stortinget`, fordi stedet har det sterkeste institusjonelle politikkankeret og canonical-emnet selv peker mot politiske institusjoner/offentlig representasjon, men dagens stedstekst må først dokumentere et konkret presse-, TV-, direktesendt, nyhetsformidlet eller offentlig representert lag før eventuell emne-id-vurdering.
