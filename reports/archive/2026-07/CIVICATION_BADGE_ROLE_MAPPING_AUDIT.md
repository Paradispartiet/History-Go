# Civication badge → role_scope mapping audit

Statussnapshot etter at `by` og `sport` er lukket som implementerte Civication-karrierekategorier.

## Modell

- **Badge** er tittelen/progresjonen spilleren ser i karrierestigen.
- **role_scope** er intern spillbar jobbtype som resolveren og mailruntime bruker for å laste riktig innhold.
- **mailPlan** og **mailFamilies** er spillinnholdet som gir jobbmailflyt for en role_scope.
- **jobLearningProfile** beskriver hvilken læring role_id gir.

Dette betyr at flere badge-titler kan dele samme `role_scope` når de bruker samme mailhverdag og læringsprofil. Audit-kontrollen skal derfor se på sammenhengen `badge title → role_scope → role_id → mailPlan/mailFamilies → jobLearningProfile` uten å lage én tung jobbtype per badge-tittel.

## Sammendrag

| kategori | badge source | implementation status | vurdering |
| --- | --- | --- | --- |
| naeringsliv | `data/badges/naeringsliv.json` | delvis splittet / har accepted fallbacks | OK med warnings |
| by | `data/badges/by.json` | implemented | OK |
| sport | `data/badges/sport.json` | implemented | OK |

## Næringsliv badge-titler

| threshold | badge title | mapped role_scope | role_id | mailPlan status | mailFamilies status | jobLearningProfile status | vurdering |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 5 | Ekspeditør / butikkmedarbeider | ekspeditor | naer_ekspeditor | OK | OK | OK | OK |
| 10 | Lager- og driftsmedarbeider | lager_og_driftsmedarbeider | naer_lager_og_driftsmedarbeider | OK (`data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json`) | OK (`job` + `people`) | OK | OK |
| 15 | Økonomi- og administrasjonsmedarbeider | administrasjonsmedarbeider | naer_administrasjonsmedarbeider | OK | OK (`job`) | OK | WARNING — role_scope har smalere mailFamily-dekning enn de fleste andre næringslivsroller |
| 25 | Fagarbeider | fagarbeider | naer_fagarbeider | OK | OK | OK | OK |
| 40 | Skiftleder | formann | naer_formann | OK | OK | OK | OK |
| 60 | Formann / arbeidsleder | formann | naer_formann | OK | OK | OK | OK |
| 85 | Controller | controller | naer_controller | OK | OK | OK | OK |
| 115 | Avdelingsleder | avdelingsleder | naer_avdelingsleder | OK | OK | OK | OK |
| 150 | Driftsleder | avdelingsleder | naer_avdelingsleder | OK | OK | OK | OK |
| 190 | Finansanalytiker | controller | naer_controller | OK | OK | OK | OK |
| 240 | Produksjonsleder | avdelingsleder | naer_avdelingsleder | OK | OK | OK | OK |
| 300 | Butikksjef / enhetsleder | avdelingsleder | naer_avdelingsleder | OK | OK | OK | OK |
| 380 | Økonomi- og finanssjef | controller | naer_controller | OK | OK | OK | OK |
| 500 | Daglig leder | avdelingsleder | naer_avdelingsleder | OK | OK | OK | OK |
| 650 | Finansdirektør | controller | naer_controller | OK | OK | OK | OK |
| 800 | Gründer | mellomleder | naer_mellomleder | OK | OK | OK | WARNING — accepted fallback |
| 1000 | Bedriftseier | mellomleder | naer_mellomleder | OK | OK | OK | WARNING — accepted fallback |
| 1250 | Konserndirektør | mellomleder | naer_mellomleder | OK | OK | OK | WARNING — accepted fallback |
| 1550 | Konsernsjef | mellomleder | naer_mellomleder | OK | OK | OK | WARNING — accepted fallback |
| 1900 | Investor | mellomleder | naer_mellomleder | OK | OK | OK | WARNING — accepted fallback |
| 2300 | Kapitalforvalter | mellomleder | naer_mellomleder | OK | OK | OK | WARNING — accepted fallback |
| 2750 | Industribygger | mellomleder | naer_mellomleder | OK | OK | OK | WARNING — accepted fallback |
| 3250 | Industrieier | mellomleder | naer_mellomleder | OK | OK | OK | WARNING — accepted fallback |

## By badge-titler

`by` er markert `implemented` i `data/Civication/badgeRoleMappings.json`. Hele dagens by-badge-stige er dekket av fem spillbare jobbtyper.

| threshold | badge title | mapped role_scope | role_id | mailPlan status | mailFamilies status | jobLearningProfile status | vurdering |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 5 | Studentassistent | by_assistent | by_assistent | OK | OK (`job`) | OK | OK |
| 10 | Praktikant (arkitektur/plan) | by_assistent | by_assistent | OK | OK (`job`) | OK | OK |
| 15 | Prosjektmedarbeider | by_assistent | by_assistent | OK | OK (`job`) | OK | OK |
| 25 | Saksbehandler (plan/bygg) | by_saksbehandler | by_saksbehandler | OK | OK (`job`) | OK | OK |
| 40 | Førstekonsulent | by_saksbehandler | by_saksbehandler | OK | OK (`job`) | OK | OK |
| 60 | Rådgiver (byutvikling) | by_radgiver_plan | by_radgiver_plan | OK | OK (`job`) | OK | OK |
| 85 | Seniorrådgiver (byutvikling) | by_radgiver_plan | by_radgiver_plan | OK | OK (`job`) | OK | OK |
| 115 | Arealplanlegger | by_radgiver_plan | by_radgiver_plan | OK | OK (`job`) | OK | OK |
| 150 | Byplanlegger | by_radgiver_plan | by_radgiver_plan | OK | OK (`job`) | OK | OK |
| 190 | Prosjektleder (byutvikling) | by_prosjektleder | by_prosjektleder | OK | OK (`job`) | OK | OK |
| 240 | Seksjonsleder | by_prosjektleder | by_prosjektleder | OK | OK (`job`) | OK | OK |
| 300 | Arkitekt | by_arkitekt | by_arkitekt | OK | OK (`job`) | OK | OK |
| 380 | Seniorarkitekt | by_arkitekt | by_arkitekt | OK | OK (`job`) | OK | OK |
| 500 | Fagsjef (plan/bygg) | by_prosjektleder | by_prosjektleder | OK | OK (`job`) | OK | OK |
| 650 | Byarkitekt | by_arkitekt | by_arkitekt | OK | OK (`job`) | OK | OK |
| 800 | Direktør (byutvikling) | by_prosjektleder | by_prosjektleder | OK | OK (`job`) | OK | OK |

### By role scopes

- `by_assistent`: Studentassistent, Praktikant (arkitektur/plan), Prosjektmedarbeider.
- `by_saksbehandler`: Saksbehandler (plan/bygg), Førstekonsulent.
- `by_radgiver_plan`: Rådgiver (byutvikling), Seniorrådgiver (byutvikling), Arealplanlegger, Byplanlegger.
- `by_prosjektleder`: Prosjektleder (byutvikling), Seksjonsleder, Fagsjef (plan/bygg), Direktør (byutvikling).
- `by_arkitekt`: Arkitekt, Seniorarkitekt, Byarkitekt.

## Sport badge-titler

`sport` er markert `implemented` i `data/Civication/badgeRoleMappings.json`. Hele dagens sport-badge-stige er dekket av fem spillbare jobbtyper.

| threshold | badge title | mapped role_scope | role_id | mailPlan status | mailFamilies status | jobLearningProfile status | vurdering |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 5 | Mosjonist | sport_utover | sport_utover | OK | OK (`job`) | OK | OK |
| 10 | Aktiv utøver | sport_utover | sport_utover | OK | OK (`job`) | OK | OK |
| 15 | Konkurranseutøver | sport_utover | sport_utover | OK | OK (`job`) | OK | OK |
| 25 | Klubbspiller | sport_utover | sport_utover | OK | OK (`job`) | OK | OK |
| 40 | Eliteseriespiller | sport_utover | sport_utover | OK | OK (`job`) | OK | OK |
| 60 | Profesjonell utøver | sport_utover | sport_utover | OK | OK (`job`) | OK | OK |
| 85 | Landslagsutøver | sport_utover | sport_utover | OK | OK (`job`) | OK | OK |
| 115 | Kaptein | sport_kaptein | sport_kaptein | OK | OK (`job`) | OK | OK |
| 150 | Trener | sport_trener | sport_trener | OK | OK (`job`) | OK | OK |
| 190 | Hovedtrener | sport_trener | sport_trener | OK | OK (`job`) | OK | OK |
| 240 | Sportssjef | sport_sportsledelse | sport_sportsledelse | OK | OK (`job`) | OK | OK |
| 300 | Olympisk Mester | sport_legende | sport_legende | OK | OK (`job`) | OK | OK |
| 380 | Idrettsstjerne | sport_legende | sport_legende | OK | OK (`job`) | OK | OK |
| 500 | Idrettslegende | sport_legende | sport_legende | OK | OK (`job`) | OK | OK |

### Sport role scopes

- `sport_utover`: Mosjonist, Aktiv utøver, Konkurranseutøver, Klubbspiller, Eliteseriespiller, Profesjonell utøver, Landslagsutøver.
- `sport_kaptein`: Kaptein.
- `sport_trener`: Trener, Hovedtrener.
- `sport_sportsledelse`: Sportssjef.
- `sport_legende`: Olympisk Mester, Idrettsstjerne, Idrettslegende.

## Accepted fallbacks

Disse høyere eier-/kapitaltitlene i `naeringsliv` mapper fortsatt til `mellomleder` som midlertidig fallback og er dokumentert i `badgeRoleMappings.future_split_candidates`:

- Gründer → mellomleder (naer_mellomleder)
- Bedriftseier → mellomleder (naer_mellomleder)
- Konserndirektør → mellomleder (naer_mellomleder)
- Konsernsjef → mellomleder (naer_mellomleder)
- Investor → mellomleder (naer_mellomleder)
- Kapitalforvalter → mellomleder (naer_mellomleder)
- Industribygger → mellomleder (naer_mellomleder)
- Industrieier → mellomleder (naer_mellomleder)

## Errors

Ingen faktiske hull funnet i dagens låste `by`- og `sport`-mapping.

## Warnings / oppfølgingspunkter

- `naeringsliv`: Økonomi- og administrasjonsmedarbeider har smalere mailFamily-dekning enn de fleste andre næringslivsroller.
- `naeringsliv`: Gründer, Bedriftseier, Konserndirektør, Konsernsjef, Investor, Kapitalforvalter, Industribygger og Industrieier bruker fortsatt accepted fallback til `mellomleder`.
- Neste naturlige split er `kapital_og_eierskap` for Gründer, Bedriftseier, Investor, Kapitalforvalter, Industribygger og Industrieier.
- Mulig senere split: `konsernledelse` for Konserndirektør og Konsernsjef.

## Kilder kontrollert

- `data/badges/naeringsliv.json`
- `data/badges/by.json`
- `data/badges/sport.json`
- `data/Civication/badgeRoleMappings.json`
- `data/Civication/jobLearningProfiles.json`
- `data/Civication/roles/`
- `data/Civication/mailPlans/`
- `data/Civication/mailFamilies/`
- `js/Civication/systems/civicationCareerRoleResolver.js`

## Neste anbefalte arbeid

1. Test én by-jobb og én sport-jobb i faktisk spillflyt.
2. Kjør `npm run civication:badge-role-audit` i repoet når lokal/CI-kjøring er tilgjengelig, slik at script-generert audit kan sammenlignes med dette låste snapshotet.
3. Start `kapital_og_eierskap` som neste næringsliv-split.
