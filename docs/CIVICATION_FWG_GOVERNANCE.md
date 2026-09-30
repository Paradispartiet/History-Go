# Civication FWG Governance Audit

Generert av `node scripts/audit-civication-fwg-governance.mjs`. Rapporten er report-only: den endrer ikke runtime eller UI og feiler ikke bygget. Den viser om stillingsgrammatikken (FWG) faktisk styrer mailFamilies.

Dimensjoner: `minimum_counts`, `required_axes`, `place_grammar`, `actor_grammar`, `conflict_grammar`, `solution_patterns`, `failure_patterns`. `n/a` betyr at FWG-fila ikke deklarerer den dimensjonen.

## Sammendrag

- FWG-filer auditert: 87
- Totalt antall avvik: 21

## Statusmatrise

| rolle | category | minimum_counts | required_axes | place_grammar | actor_grammar | conflict_grammar | solution_patterns | failure_patterns |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| by_arkitekt | by | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| by_assistent | by | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| by_prosjektleder | by | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| by_radgiver_plan | by | ✅ | ✅ | n/a | n/a | n/a | n/a | n/a |
| by_saksbehandler | by | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| kurator_film_tv | film_tv | n/a | ✅ | n/a | n/a | n/a | n/a | n/a |
| manusmedarbeider | film_tv | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| produksjonsassistent | film_tv | n/a | ✅ | n/a | n/a | n/a | n/a | n/a |
| programleder | film_tv | n/a | n/a | ✅ | ✅ | ✅ | n/a | n/a |
| regissor | film_tv | n/a | n/a | ✅ | ✅ | ✅ | n/a | n/a |
| serieskaper | film_tv | n/a | n/a | ✅ | ✅ | ✅ | n/a | n/a |
| filosofi_forskning_og_formidling | filosofi | n/a | n/a | ✅ | ✅ | ⚠️ 1 | n/a | n/a |
| filosofi_undervisning_og_akademia | filosofi | n/a | n/a | ✅ | ✅ | ⚠️ 1 | n/a | n/a |
| historie_arkiv_og_dokumentasjon | historie | n/a | n/a | ✅ | ✅ | ⚠️ 1 | n/a | n/a |
| historie_fagledelse | historie | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| historie_forskning_og_akademia | historie | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| historie_forvaltning_og_radgivning | historie | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| historie_institusjonsledelse | historie | n/a | n/a | ✅ | ⚠️ 3 | n/a | n/a | n/a |
| historie_museum_og_samling | historie | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| kunst_konservering_og_samling | kunst | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| kunst_kunstnerisk_ledelse | kunst | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| kunst_kuratering_og_program | kunst | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| kunst_museumsledelse | kunst | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| kunst_publikum_og_formidling | kunst | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| kunst_utstillingsproduksjon | kunst | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| redaksjonsmedarbeider | litteratur | n/a | ✅ | ✅ | ✅ | n/a | n/a | n/a |
| redaktor_bok | litteratur | n/a | ✅ | ✅ | ⚠️ 1 | n/a | n/a | n/a |
| media_redaksjon | media | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| media_redaksjonell_ledelse | media | n/a | n/a | ✅ | ⚠️ 1 | n/a | n/a | n/a |
| musikk_scene_og_produksjon | musikk | n/a | ✅ | ✅ | ✅ | n/a | n/a | n/a |
| musikk_utoving_og_ensemble | musikk | n/a | ✅ | ✅ | ✅ | n/a | n/a | n/a |
| finansanalytiker | naeringsliv | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| finansdirektor | naeringsliv | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| naeringsliv_administrasjon_og_okonomistyring | naeringsliv | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| naeringsliv_fag_og_produksjon | naeringsliv | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| naeringsliv_finans_og_kapitalforvaltning | naeringsliv | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| naeringsliv_finansiell_ledelse | naeringsliv | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| naeringsliv_handel_og_kundeservice | naeringsliv | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| naeringsliv_logistikk_og_drift | naeringsliv | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| naeringsliv_operativ_ledelse | naeringsliv | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| naeringsliv_renhold_og_hygiene | naeringsliv | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| naeringsliv_virksomhetsledelse | naeringsliv | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| okonomi_og_finanssjef | naeringsliv | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| renholder | naeringsliv | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| natur_biologi_og_forskning | natur | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| natur_felt_og_formidling | natur | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| natur_forvaltning_og_radgivning | natur | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| natur_miljoledelse | natur | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| natur_politisk_myndighet | natur | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| politikk_kommunal_ledelse | politikk | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| politikk_organisasjonsarbeid | politikk | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| politikk_parlamentarisk_arbeid | politikk | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| politikk_politisk_radgivning | politikk | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| politikk_regjeringsledelse | politikk | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| fagansvarlig | psykologi | n/a | ✅ | ✅ | ⚠️ 1 | n/a | n/a | n/a |
| forsker_psykologi | psykologi | n/a | ✅ | ✅ | ✅ | n/a | n/a | n/a |
| klinikkleder | psykologi | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| professor_psykologi | psykologi | n/a | ✅ | ✅ | ✅ | n/a | n/a | n/a |
| psykolog | psykologi | ✅ | ✅ | ✅ | ✅ | ✅ | n/a | n/a |
| psykologi_arbeids_og_karriereveiledning | psykologi | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| psykologi_miljoarbeid | psykologi | n/a | ✅ | ✅ | n/a | n/a | n/a | n/a |
| spesialistpsykolog | psykologi | n/a | n/a | ⚠️ 1 | ✅ | n/a | n/a | n/a |
| religion_fagledelse | religion | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| religion_formidling_og_kulturarv | religion | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| religion_forskning | religion | n/a | ✅ | n/a | n/a | n/a | n/a | n/a |
| religion_utredning_og_radgivning | religion | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| scenekunst_dramaturgi_og_utvikling | scenekunst | n/a | n/a | ⚠️ 1 | ✅ | n/a | n/a | n/a |
| scenekunst_institusjonsledelse | scenekunst | n/a | n/a | ⚠️ 1 | ✅ | n/a | n/a | n/a |
| scenekunst_program_og_kuratering | scenekunst | n/a | n/a | ⚠️ 1 | ✅ | n/a | n/a | n/a |
| scenekunst_regi_og_koreografi | scenekunst | n/a | n/a | ⚠️ 1 | ✅ | n/a | n/a | n/a |
| scenekunst_scene_og_produksjon | scenekunst | n/a | n/a | ⚠️ 1 | ✅ | n/a | n/a | n/a |
| scenekunst_utoving_og_ensemble | scenekunst | n/a | n/a | ⚠️ 1 | ✅ | n/a | n/a | n/a |
| barnehageassistent | sosial_laering | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| sport_sportsledelse | sport | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| sport_trener | sport | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| sport_utover | sport | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| subkultur_arrangementsdrift | subkultur | n/a | ✅ | n/a | n/a | n/a | n/a | n/a |
| subkultur_kulturarena_ledelse | subkultur | n/a | n/a | ⚠️ 1 | ✅ | n/a | n/a | n/a |
| subkultur_produksjon_og_prosjekt | subkultur | n/a | n/a | ⚠️ 1 | ✅ | n/a | n/a | n/a |
| subkultur_produksjonsledelse | subkultur | n/a | n/a | ⚠️ 1 | ✅ | n/a | n/a | n/a |
| subkultur_program_og_koordinering | subkultur | n/a | n/a | ⚠️ 2 | ✅ | n/a | n/a | n/a |
| vitenskap_assistent_og_laboratorium | vitenskap | n/a | n/a | ✅ | ✅ | n/a | n/a | n/a |
| vitenskap_doktorlop_og_postdoktor | vitenskap | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| vitenskap_forskning | vitenskap | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| vitenskap_forskningsledelse | vitenskap | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| vitenskap_institusjonsledelse | vitenskap | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| vitenskap_undervisning_og_forskning | vitenskap | n/a | n/a | n/a | n/a | n/a | n/a | n/a |

## Detaljer

### by_arkitekt (`by/by_arkitekt`)

Kilde: `data/Civication/workGrammars/by/by_arkitekt.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### by_assistent (`by/by_assistent`)

Kilde: `data/Civication/workGrammars/by/by_assistent.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### by_prosjektleder (`by/by_prosjektleder`)

Kilde: `data/Civication/workGrammars/by/by_prosjektleder.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Byutvikling og arealplanlegging (`by/by_radgiver_plan`)

Kilde: `data/Civication/workGrammars/by/by_radgiver_plan.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### by_saksbehandler (`by/by_saksbehandler`)

Kilde: `data/Civication/workGrammars/by/by_saksbehandler.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### kurator_film_tv (`film_tv/kurator_film_tv`)

Kilde: `data/Civication/workGrammars/film_tv/kurator_film_tv.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### manusmedarbeider (`film_tv/manusmedarbeider`)

Kilde: `data/Civication/workGrammars/film_tv/manusmedarbeider.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### produksjonsassistent (`film_tv/produksjonsassistent`)

Kilde: `data/Civication/workGrammars/film_tv/produksjonsassistent.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### programleder (`film_tv/programleder`)

Kilde: `data/Civication/workGrammars/film_tv/programleder.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### regissor (`film_tv/regissor`)

Kilde: `data/Civication/workGrammars/film_tv/regissor.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### serieskaper (`film_tv/serieskaper`)

Kilde: `data/Civication/workGrammars/film_tv/serieskaper.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### filosofi_forskning_og_formidling (`filosofi/filosofi_forskning_og_formidling`)

Kilde: `data/Civication/workGrammars/filosofi/filosofi_forskning_og_formidling.json`

- **conflict_grammar** (1):
  - konflikt-mail filosofi_forskning_conflict_fasit_001 har pressure 'bestillerklarhet_vs_premissapenhet' uten forankring i conflict_grammar

### filosofi_undervisning_og_akademia (`filosofi/filosofi_undervisning_og_akademia`)

Kilde: `data/Civication/workGrammars/filosofi/filosofi_undervisning_og_akademia.json`

- **conflict_grammar** (1):
  - konflikt-mail filosofi_undervisning_conflict_sensorgrunnlag_001 har pressure 'faglig_skjonn_vs_forhandskjente_kriterier' uten forankring i conflict_grammar

### historie_arkiv_og_dokumentasjon (`historie/historie_arkiv_og_dokumentasjon`)

Kilde: `data/Civication/workGrammars/historie/historie_arkiv_og_dokumentasjon.json`

- **conflict_grammar** (1):
  - konflikt-mail historie_arkiv_conflict_innsyn_001 har pressure 'rask_tilgang_vs_minimering_og_myndighet' uten forankring i conflict_grammar

### historie_fagledelse (`historie/historie_fagledelse`)

Kilde: `data/Civication/workGrammars/historie/historie_fagledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### historie_forskning_og_akademia (`historie/historie_forskning_og_akademia`)

Kilde: `data/Civication/workGrammars/historie/historie_forskning_og_akademia.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### historie_forvaltning_og_radgivning (`historie/historie_forvaltning_og_radgivning`)

Kilde: `data/Civication/workGrammars/historie/historie_forvaltning_og_radgivning.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### historie_institusjonsledelse (`historie/historie_institusjonsledelse`)

Kilde: `data/Civication/workGrammars/historie/historie_institusjonsledelse.json`

- **actor_grammar** (3):
  - ubrukt aktør-eksempel: karin_styreleder_historie_institusjonsledelse (styreleder og mandatgrensesnitt) dukker ikke opp som avsender
  - ubrukt aktør-eksempel: selma_okonomisjef_historie_institusjonsledelse (økonomisjef og ressursgrensesnitt) dukker ikke opp som avsender
  - ubrukt aktør-eksempel: jon_beredskapsleder_historie_institusjonsledelse (beredskaps- og kommunikasjonsleder) dukker ikke opp som avsender

### historie_museum_og_samling (`historie/historie_museum_og_samling`)

Kilde: `data/Civication/workGrammars/historie/historie_museum_og_samling.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### kunst_konservering_og_samling (`kunst/kunst_konservering_og_samling`)

Kilde: `data/Civication/workGrammars/kunst/kunst_konservering_og_samling.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### kunst_kunstnerisk_ledelse (`kunst/kunst_kunstnerisk_ledelse`)

Kilde: `data/Civication/workGrammars/kunst/kunst_kunstnerisk_ledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### kunst_kuratering_og_program (`kunst/kunst_kuratering_og_program`)

Kilde: `data/Civication/workGrammars/kunst/kunst_kuratering_og_program.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### kunst_museumsledelse (`kunst/kunst_museumsledelse`)

Kilde: `data/Civication/workGrammars/kunst/kunst_museumsledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### kunst_publikum_og_formidling (`kunst/kunst_publikum_og_formidling`)

Kilde: `data/Civication/workGrammars/kunst/kunst_publikum_og_formidling.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### kunst_utstillingsproduksjon (`kunst/kunst_utstillingsproduksjon`)

Kilde: `data/Civication/workGrammars/kunst/kunst_utstillingsproduksjon.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### redaksjonsmedarbeider (`litteratur/redaksjonsmedarbeider`)

Kilde: `data/Civication/workGrammars/litteratur/redaksjonsmedarbeider.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### redaktor_bok (`litteratur/redaktor_bok`)

Kilde: `data/Civication/workGrammars/litteratur/redaktor_bok.json`

- **actor_grammar** (1):
  - ubrukt aktør-eksempel: litteratur_produksjonsansvarlig (produksjonsansvarlig) dukker ikke opp som avsender

### media_redaksjon (`media/media_redaksjon`)

Kilde: `data/Civication/workGrammars/media/media_redaksjon.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### media_redaksjonell_ledelse (`media/media_redaksjonell_ledelse`)

Kilde: `data/Civication/workGrammars/media/media_redaksjonell_ledelse.json`

- **actor_grammar** (1):
  - ubrukt aktør-eksempel: media_kilde (kilde) dukker ikke opp som avsender

### musikk_scene_og_produksjon (`musikk/musikk_scene_og_produksjon`)

Kilde: `data/Civication/workGrammars/musikk/musikk_scene_og_produksjon.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### musikk_utoving_og_ensemble (`musikk/musikk_utoving_og_ensemble`)

Kilde: `data/Civication/workGrammars/musikk/musikk_utoving_og_ensemble.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### finansanalytiker (`naeringsliv/finansanalytiker`)

Kilde: `data/Civication/workGrammars/naeringsliv/finansanalytiker.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### finansdirektor (`naeringsliv/finansdirektor`)

Kilde: `data/Civication/workGrammars/naeringsliv/finansdirektor.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### naeringsliv_administrasjon_og_okonomistyring (`naeringsliv/naeringsliv_administrasjon_og_okonomistyring`)

Kilde: `data/Civication/workGrammars/naeringsliv/naeringsliv_administrasjon_og_okonomistyring.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### naeringsliv_fag_og_produksjon (`naeringsliv/naeringsliv_fag_og_produksjon`)

Kilde: `data/Civication/workGrammars/naeringsliv/naeringsliv_fag_og_produksjon.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### naeringsliv_finans_og_kapitalforvaltning (`naeringsliv/naeringsliv_finans_og_kapitalforvaltning`)

Kilde: `data/Civication/workGrammars/naeringsliv/naeringsliv_finans_og_kapitalforvaltning.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### naeringsliv_finansiell_ledelse (`naeringsliv/naeringsliv_finansiell_ledelse`)

Kilde: `data/Civication/workGrammars/naeringsliv/naeringsliv_finansiell_ledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### naeringsliv_handel_og_kundeservice (`naeringsliv/naeringsliv_handel_og_kundeservice`)

Kilde: `data/Civication/workGrammars/naeringsliv/naeringsliv_handel_og_kundeservice.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### naeringsliv_logistikk_og_drift (`naeringsliv/naeringsliv_logistikk_og_drift`)

Kilde: `data/Civication/workGrammars/naeringsliv/naeringsliv_logistikk_og_drift.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### naeringsliv_operativ_ledelse (`naeringsliv/naeringsliv_operativ_ledelse`)

Kilde: `data/Civication/workGrammars/naeringsliv/naeringsliv_operativ_ledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### naeringsliv_renhold_og_hygiene (`naeringsliv/naeringsliv_renhold_og_hygiene`)

Kilde: `data/Civication/workGrammars/naeringsliv/naeringsliv_renhold_og_hygiene.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### naeringsliv_virksomhetsledelse (`naeringsliv/naeringsliv_virksomhetsledelse`)

Kilde: `data/Civication/workGrammars/naeringsliv/naeringsliv_virksomhetsledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### okonomi_og_finanssjef (`naeringsliv/okonomi_og_finanssjef`)

Kilde: `data/Civication/workGrammars/naeringsliv/okonomi_og_finanssjef.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Renholder (`naeringsliv/renholder`)

Kilde: `data/Civication/workGrammars/naeringsliv/renholder.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### natur_biologi_og_forskning (`natur/natur_biologi_og_forskning`)

Kilde: `data/Civication/workGrammars/natur/natur_biologi_og_forskning.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### natur_felt_og_formidling (`natur/natur_felt_og_formidling`)

Kilde: `data/Civication/workGrammars/natur/natur_felt_og_formidling.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### natur_forvaltning_og_radgivning (`natur/natur_forvaltning_og_radgivning`)

Kilde: `data/Civication/workGrammars/natur/natur_forvaltning_og_radgivning.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### natur_miljoledelse (`natur/natur_miljoledelse`)

Kilde: `data/Civication/workGrammars/natur/natur_miljoledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### natur_politisk_myndighet (`natur/natur_politisk_myndighet`)

Kilde: `data/Civication/workGrammars/natur/natur_politisk_myndighet.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### politikk_kommunal_ledelse (`politikk/politikk_kommunal_ledelse`)

Kilde: `data/Civication/workGrammars/politikk/politikk_kommunal_ledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### politikk_organisasjonsarbeid (`politikk/politikk_organisasjonsarbeid`)

Kilde: `data/Civication/workGrammars/politikk/politikk_organisasjonsarbeid.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### politikk_parlamentarisk_arbeid (`politikk/politikk_parlamentarisk_arbeid`)

Kilde: `data/Civication/workGrammars/politikk/politikk_parlamentarisk_arbeid.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### politikk_politisk_radgivning (`politikk/politikk_politisk_radgivning`)

Kilde: `data/Civication/workGrammars/politikk/politikk_politisk_radgivning.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### politikk_regjeringsledelse (`politikk/politikk_regjeringsledelse`)

Kilde: `data/Civication/workGrammars/politikk/politikk_regjeringsledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Fagansvarlig (`psykologi/fagansvarlig`)

Kilde: `data/Civication/workGrammars/psykologi/fagansvarlig.json`

- **actor_grammar** (1):
  - ubrukt aktør-eksempel: psykologi_fagansvarlig_veileder (veileder) dukker ikke opp som avsender

### Forsker (psykologi) (`psykologi/forsker_psykologi`)

Kilde: `data/Civication/workGrammars/psykologi/forsker_psykologi.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Klinikkleder (`psykologi/klinikkleder`)

Kilde: `data/Civication/workGrammars/psykologi/klinikkleder.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Professor (psykologi) (`psykologi/professor_psykologi`)

Kilde: `data/Civication/workGrammars/psykologi/professor_psykologi.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Psykolog (`psykologi/psykolog`)

Kilde: `data/Civication/workGrammars/psykologi/psykolog.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Arbeids- og karriereveiledning (`psykologi/psykologi_arbeids_og_karriereveiledning`)

Kilde: `data/Civication/workGrammars/psykologi/psykologi_arbeids_og_karriereveiledning.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Miljøarbeider (`psykologi/psykologi_miljoarbeid`)

Kilde: `data/Civication/workGrammars/psykologi/psykologi_miljoarbeid.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### Spesialistpsykolog (`psykologi/spesialistpsykolog`)

Kilde: `data/Civication/workGrammars/psykologi/spesialistpsykolog.json`

- **place_grammar** (1):
  - udeklarert sted i mail: psykologisk_institutt_uio (ikke i place_grammar)

### religion_fagledelse (`religion/religion_fagledelse`)

Kilde: `data/Civication/workGrammars/religion/religion_fagledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### religion_formidling_og_kulturarv (`religion/religion_formidling_og_kulturarv`)

Kilde: `data/Civication/workGrammars/religion/religion_formidling_og_kulturarv.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### religion_forskning (`religion/religion_forskning`)

Kilde: `data/Civication/workGrammars/religion/religion_forskning.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### religion_utredning_og_radgivning (`religion/religion_utredning_og_radgivning`)

Kilde: `data/Civication/workGrammars/religion/religion_utredning_og_radgivning.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### scenekunst_dramaturgi_og_utvikling (`scenekunst/scenekunst_dramaturgi_og_utvikling`)

Kilde: `data/Civication/workGrammars/scenekunst/scenekunst_dramaturgi_og_utvikling.json`

- **place_grammar** (1):
  - udeklarert sted i mail: nationaltheatret (ikke i place_grammar)

### scenekunst_institusjonsledelse (`scenekunst/scenekunst_institusjonsledelse`)

Kilde: `data/Civication/workGrammars/scenekunst/scenekunst_institusjonsledelse.json`

- **place_grammar** (1):
  - udeklarert sted i mail: black_box_teater (ikke i place_grammar)

### scenekunst_program_og_kuratering (`scenekunst/scenekunst_program_og_kuratering`)

Kilde: `data/Civication/workGrammars/scenekunst/scenekunst_program_og_kuratering.json`

- **place_grammar** (1):
  - udeklarert sted i mail: black_box_teater (ikke i place_grammar)

### scenekunst_regi_og_koreografi (`scenekunst/scenekunst_regi_og_koreografi`)

Kilde: `data/Civication/workGrammars/scenekunst/scenekunst_regi_og_koreografi.json`

- **place_grammar** (1):
  - udeklarert sted i mail: nationaltheatret (ikke i place_grammar)

### scenekunst_scene_og_produksjon (`scenekunst/scenekunst_scene_og_produksjon`)

Kilde: `data/Civication/workGrammars/scenekunst/scenekunst_scene_og_produksjon.json`

- **place_grammar** (1):
  - udeklarert sted i mail: nationaltheatret (ikke i place_grammar)

### scenekunst_utoving_og_ensemble (`scenekunst/scenekunst_utoving_og_ensemble`)

Kilde: `data/Civication/workGrammars/scenekunst/scenekunst_utoving_og_ensemble.json`

- **place_grammar** (1):
  - udeklarert sted i mail: nationaltheatret (ikke i place_grammar)

### Barnehageassistent / pedagogisk medarbeider (`sosial_laering/barnehageassistent`)

Kilde: `data/Civication/workGrammars/sosial_laering/barnehageassistent.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### sport_sportsledelse (`sport/sport_sportsledelse`)

Kilde: `data/Civication/workGrammars/sport/sport_sportsledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### sport_trener (`sport/sport_trener`)

Kilde: `data/Civication/workGrammars/sport/sport_trener.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### sport_utover (`sport/sport_utover`)

Kilde: `data/Civication/workGrammars/sport/sport_utover.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### subkultur_arrangementsdrift (`subkultur/subkultur_arrangementsdrift`)

Kilde: `data/Civication/workGrammars/subkultur/subkultur_arrangementsdrift.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### subkultur_kulturarena_ledelse (`subkultur/subkultur_kulturarena_ledelse`)

Kilde: `data/Civication/workGrammars/subkultur/subkultur_kulturarena_ledelse.json`

- **place_grammar** (1):
  - udeklarert sted i mail: club_7_vika (ikke i place_grammar)

### subkultur_produksjon_og_prosjekt (`subkultur/subkultur_produksjon_og_prosjekt`)

Kilde: `data/Civication/workGrammars/subkultur/subkultur_produksjon_og_prosjekt.json`

- **place_grammar** (1):
  - udeklarert sted i mail: club_7_vika (ikke i place_grammar)

### subkultur_produksjonsledelse (`subkultur/subkultur_produksjonsledelse`)

Kilde: `data/Civication/workGrammars/subkultur/subkultur_produksjonsledelse.json`

- **place_grammar** (1):
  - udeklarert sted i mail: club_7_vika (ikke i place_grammar)

### subkultur_program_og_koordinering (`subkultur/subkultur_program_og_koordinering`)

Kilde: `data/Civication/workGrammars/subkultur/subkultur_program_og_koordinering.json`

- **place_grammar** (2):
  - ubrukt sted i grammatikken: programbord_prioritering_og_kriterielogg (ingen mail forankret her)
  - udeklarert sted i mail: club_7_vika (ikke i place_grammar)

### vitenskap_assistent_og_laboratorium (`vitenskap/vitenskap_assistent_og_laboratorium`)

Kilde: `data/Civication/workGrammars/vitenskap/vitenskap_assistent_og_laboratorium.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### vitenskap_doktorlop_og_postdoktor (`vitenskap/vitenskap_doktorlop_og_postdoktor`)

Kilde: `data/Civication/workGrammars/vitenskap/vitenskap_doktorlop_og_postdoktor.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### vitenskap_forskning (`vitenskap/vitenskap_forskning`)

Kilde: `data/Civication/workGrammars/vitenskap/vitenskap_forskning.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### vitenskap_forskningsledelse (`vitenskap/vitenskap_forskningsledelse`)

Kilde: `data/Civication/workGrammars/vitenskap/vitenskap_forskningsledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### vitenskap_institusjonsledelse (`vitenskap/vitenskap_institusjonsledelse`)

Kilde: `data/Civication/workGrammars/vitenskap/vitenskap_institusjonsledelse.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

### vitenskap_undervisning_og_forskning (`vitenskap/vitenskap_undervisning_og_forskning`)

Kilde: `data/Civication/workGrammars/vitenskap/vitenskap_undervisning_og_forskning.json`

Ingen avvik. FWG styrer mailFamilies på alle deklarerte dimensjoner. ✅

