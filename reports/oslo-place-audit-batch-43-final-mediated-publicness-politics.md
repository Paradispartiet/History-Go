# Batch 43: avsluttende politikkspor for `em_pol_mediert_offentlighet`

Dato: 2026-06-01

## Formål

Denne batchen fullfører det smale politikksporet for `em_pol_mediert_offentlighet` etter Batch 37–42. Målet var å gjøre en siste manuell vurdering av gjenværende Oslo-politikksteder som ikke allerede hadde emnet, legge til emnet bare der place-teksten faktisk dokumenterer et mediert politisk offentlighetslag, og avslutte emneoppryddingssporet.

## Konfliktløsning

PR-branchen hadde mergekonflikt mot `main` fordi `data/places/politikk/oslo/places_politikk.json` allerede var videreutviklet etter at PR-en ble laget. Konflikten ble løst ved å bruke gjeldende `main` som base og legge de smale Batch 43-endringene på nytt:

- Beholdt nyere `oslo_radhus`-tekst fra `main`.
- La til `em_pol_mediert_offentlighet` på `oslo_radhus`.
- La til `em_pol_mediert_offentlighet` på `regjeringskvartalet`.
- La til et smalt mediert offentlighetslag i `regjeringskvartalet` sin `popupDesc` og relevante `quiz_profile`-felt.
- Lot `tinghuset` stå uendret uten `em_pol_mediert_offentlighet`.
- Endret ikke `desc` for `oslo_radhus` eller `regjeringskvartalet` fra gjeldende `main`, slik at `places_index.json` ikke måtte sync-es i konfliktfiksen.

## Kommandoer/validering dokumentert fra opprinnelig PR

Opprinnelig Batch 43-kjøring dokumenterte:

```bash
npm run places:emner:check
npm run places:index:check
npm run health:places
```

Resultat fra opprinnelig validering:

- `places:emner:check`: exit code 0
- Missing emne_ids: 0
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 0
- Duplicate emne_ids within same place: 0
- Duplicate place ids across active files: 0
- Duplicate canonical emne_ids across canonical files: 0
- `places:index:check`: OK
- `health:places` Errors: 0
- `health:places` Warnings: 1109
- Allowlisted cross-disciplinary emne_ids: 217

Etter konfliktfiksen ble scope bevart, men `places_index.json` ble ikke endret fordi `desc`-feltene som ligger i index ble beholdt fra `main`.

## Filer undersøkt

- `reports/oslo-place-audit-batch-42-stortinget-mediated-publicness-emne.md`
- `reports/oslo-place-audit-batch-41-stortinget-mediated-publicness-text.md`
- `reports/oslo-place-audit-batch-40-eidsvolls-plass-mediated-publicness-emne.md`
- `reports/oslo-place-audit-batch-38-politikk-mediert-offentlighet-audit.md`
- `reports/oslo-place-audit-batch-37-youngstorget-mediated-publicness.md`
- `data/places/politikk/oslo/places_politikk.json`
- `data/fag/politikk/emner_politikk_canonical_v4_5.json`
- `data/places/places_index.json`
- `data/places/manifest.json`

`data/fag/politikk/emner_politikk_canonical_v4_5.json` ble kun lest for canonical-terskelen og ble ikke endret.

## Baseline før Batch 43

| Kontrollpunkt | Resultat før Batch 43 |
| --- | ---: |
| Missing emne_ids | 0 |
| Unknown emne_ids | 0 |
| Wrong-prefix emne_ids | 0 |
| Errors | 0 |
| Warnings | 1109 |
| Allowlisted cross-disciplinary emne_ids | 217 |
| `health:places` emne_ids checked | 1043 |

## Canonical-terskel brukt

`em_pol_mediert_offentlighet` beskriver politisk offentlighet slik den formes gjennom medier, direkteoverføring, nyhetslogikk, TV, digitale flater, breaking news, pressebilder, live-intervjuer og offentlig representasjon. Emnet skal bare brukes når et politisk sted, en institusjon, demonstrasjon, valgkontekst, konflikt eller offentlig debatt dokumenteres som mediert, direktesendt, nyhetsformidlet, digitalt delt eller offentlig representert.

Bruksterskelen i denne avsluttende vurderingen var derfor:

- Stedet må ha et konkret politisk anker.
- Place-teksten må dokumentere et eksplisitt mediert offentlighetslag, for eksempel pressebilder, TV-/nyhetsdekning, direktesending, digital deling, nyhetsformidling eller offentlig representasjon gjennom medier.
- Emnet skal ikke brukes for generell symbolikk, kjent bygning, turistverdi, løst medielag, generell offentlighet uten dokumentert mediering eller kultur-/seremonilag uten politisk forankring.

## Steder som allerede hadde `em_pol_mediert_offentlighet`

Følgende steder var ferdig vurdert før Batch 43 og ble ikke endret i denne batchen:

- `youngstorget`
- `eidsvolls_plass`
- `stortinget`

Disse tre fungerer som allerede avsluttede deler av politikksporet etter Batch 37, Batch 40 og Batch 42.

## Manuell vurdering av gjenværende kandidater

### `oslo_radhus`

**Vurdering:** Ja.

Gjeldende tekstgrunnlag i `main` dokumenterer allerede lokaldemokratisk institusjon, bystyre/byråd, kommunale beslutninger, kommunale markeringer, offentlig representasjon og synlighet gjennom presse-, TV- og nyhetsdekning.

Lagt til `emne_ids`:

- `em_pol_mediert_offentlighet`

Begrunnelse: Stedet har et konkret politisk anker gjennom lokaldemokratiet, bystyre/byråd og kommunal beslutning. Det medierte laget er dokumentert i tekstgrunnlaget gjennom pressebilder, TV- og nyhetsdekning av lokalpolitikk og kommunal offentlig representasjon. Nobel/fredspris og generelle kulturarrangementer er ikke brukt som hovedgrunnlag.

### `regjeringskvartalet`

**Vurdering:** Ja, etter smal tekstpresisering.

Eksisterende tekstgrunnlag dokumenterte regjeringsmakt, departementer, utøvende statsmakt, sikkerhet, byutvikling og 22. juli-etterhistorie. Det manglet et eksplisitt mediert lag. Siden regjeringsmakt, kriser, sikkerhetstiltak og debatter om kvartalets framtid er et nøkternt og konkret grunnlag for presse-, TV- og nyhetsformidlet politisk offentlighet, ble `popupDesc` og relevante `quiz_profile`-felt styrket smalt.

Lagt til `emne_ids`:

- `em_pol_mediert_offentlighet`

Begrunnelse: Etter endringen dokumenterer place-teksten både et konkret politisk anker (`departementer`, `utøvende makt`, regjeringsbeslutninger, kriser og sikkerhetsdebatter) og et eksplisitt mediert offentlighetslag (`pressebilder`, `TV- og nyhetsdekning`). Medielaget er knyttet til regjeringsmakt og politisk/sikkerhetspolitisk offentlighet, ikke til generell bygningssymbolikk.

### `tinghuset`

**Vurdering:** Nei.

`tinghuset` har et tydelig institusjonelt grunnlag som domstol og rettsstatlig offentlighet, men place-teksten dokumenterer ikke mediert politisk offentlighet. Juridisk offentlighet, rettsstat og domstol er ikke automatisk det samme som politisk mediert offentlighet. Det ble derfor ikke lagt til `em_pol_mediert_offentlighet`, og teksten ble ikke endret.

Eksisterende emner dekker stedet presist:

- `em_pol_domstoler_rettspraksis`
- `em_pol_rettsstat_rettssikkerhet`

## Endringer oppsummert

Tekstfelt endret:

- `regjeringskvartalet`: `popupDesc`, relevante `quiz_profile`-felt.
- `oslo_radhus`: ingen tekstendring i konfliktfiksen; gjeldende `main`-tekst ble beholdt.
- `tinghuset`: ingen endringer.

`emne_ids` lagt til:

- `oslo_radhus`: `em_pol_mediert_offentlighet`
- `regjeringskvartalet`: `em_pol_mediert_offentlighet`

Steder som bevisst ikke fikk emnet:

- `tinghuset`

Eksisterende `emne_ids` ble ikke fjernet fra noen steder.

## Forventet sluttstatus etter Batch 43

| Kontrollpunkt | Forventet etter Batch 43 |
| --- | ---: |
| Missing emne_ids | 0 |
| Unknown emne_ids | 0 |
| Wrong-prefix emne_ids | 0 |
| Errors | 0 |
| Warnings | 1109 |
| Allowlisted cross-disciplinary emne_ids | 217 |
| `health:places` emne_ids checked | 1045 |

`emne_ids checked` forventes å øke fra 1043 til 1045 fordi to gyldige emne-id-koblinger er lagt til.

## Avgrensningsbekreftelser

- Ingen canonical-filer ble endret.
- Ingen filer i `data/fag/**` ble endret.
- Ingen nye emner ble opprettet.
- Ingen scripts/tools ble endret.
- `tools/placeHealthReport.mjs` ble ikke endret.
- `tools/check_place_emne_ids.mjs` ble ikke endret.
- Ingen health-allowlists ble endret.
- `data/places/manifest.json` ble ikke endret.
- Ingen UI-, CSS-, HTML- eller JS-filer ble endret.
- Ingen bilder/assets ble endret.
- Ingen `category`-verdier ble endret.
- Ingen automatisk rewrite ble gjort.
- `em_pol_mediert_offentlighet` ble ikke lagt bredt på alle politikksteder.
- Ingen andre kategorier ble endret.

## Sluttkonklusjon

Emneoppryddingen er ferdig.

Sluttstatus etter Batch 43 skal være:

- Missing emne_ids: 0
- Unknown emne_ids: 0
- Wrong-prefix emne_ids: 0
- Errors: 0
- Allowlisted cross-disciplinary emne_ids: 217
- Warnings: 1109

Videre arbeid bør ikke være emneopprydding. Eventuelt videre arbeid bør organiseres som egne warnings-/datakvalitets-spor eller bilde-/asset-spor, ikke som fortsettelse av missing/unknown/wrong-prefix-oppryddingen.
