# Civication – hovedatlas for roller, People, synopsiser og Symposium

**Status:** Redaksjonelt produksjonsatlas, per 12. oktober 2026. Ikke et nytt spillregister, ingen egen motor, og ikke en godkjenning for simulerte realpersoner.

## Start her – én oversikt, fem kilder

| Hva du trenger | Autoritativ kilde / redaksjonell inngang | Status |
| --- | --- | --- |
| Spillerens faktiske jobb eller livsposisjon | `data/Civication/lifestory/manifest.json`, career/life-position/Role World | Canonicales egne gater gjelder |
| Hvilke People som finnes | `data/people/manifest.json` via `historyPeople_index.json` | Canonical historie, låsing etter History Go |
| Seks individtilpassede People-ruter | [People-casting og relasjonsmatrise](CIVICATION_PEOPLE_CASTING_MATRIX_V1.md), [maskinlesbare kandidater](../data/Civication/lifestory/editorial/peopleScenarioCandidatesV1.json) | Konkret manusgrunnlag, ennå ikke interaktive NPC-er |
| Hvilken historie som passer | [24 rolle- og People-synopsiser](CIVICATION_STORY_SYNOPSES_V1.md), [matrise](CIVICATION_ROLE_PEOPLE_STORY_MATRIX_V1.md) | Redaksjonell plan, ikke spillbarhetsbevis |
| Hvor eksisterende scener og kapittel-ID-er ligger | [45-filers migreringsoversikt](CIVICATION_PEOPLE_STORY_MIGRATION_V1.md), [maskinlesbart ledger](../data/Civication/lifestory/editorial/storyProductionLedgerV1.json) | Eksisterende authored materiale, People-migrering ikke startet |
| Hva Symposium kan dokumentere | [arkitektur og kontinuitetskrav](CIVICATION_PEOPLE_STORY_ARCHITECTURE_V1.md) | Designkrav, ikke ny state-eier |

**Grunnsynopsiser:** [ti kapittel-synopsiser for dag 8–13](CIVICATION_FOUNDATION_SYNOPSES_V1.md). **Første migreringspilot:** [musikk dag 8–16, kontinuitets- og akseptmatrise](CIVICATION_MUSIC_PILOT_ACCEPTANCE_V1.md), kontrollert mot tre faktiske scene-filer. De tilhørende regresjonstestene ligger i `tests/civication-people-music-pilot-contract.test.js`; dette er en testkontrakt, ikke People-runtime. **Litterært kart:** `data/Civication/lifestory/editorial/narrativeCrosswalkV1.json` med 24 L-spor, sju Booker-modeller, 24 C-typer og 35 senere kapittelreferanser.

## Status – hva tallene betyr

| Produksjonsnivå | Dokumentert omfang | Hva det ikke beviser |
| --- | ---: | --- |
| Samtidsfortellinger C01–C24 | 24 redaksjonelle synopsiser | At 24 historier er integrert/spillbare |
| Grunnkapitler dag 8–13 | 10 eksisterende scene-filer + 10 redaksjonelle synopsiser | At de er People-spesifikke |
| Videreføring dag 14–34 | 35 eksisterende filer i litterært kryssregister | At de er person-uavhengige |
| Hele eksisterende kapittelrekken | 45 filer i 9 × 5 trinn | At alle path-gater er testet i nytt system |
| People-eksempler | 6 canonical IDs med sted | At disse er fiktive NPC-er eller venner |
| People-migrerte kapittelpakker | **0** | Ingen People-migrering er implementert i denne dokument-PR-en |

**Viktig skille:** «authored scene pack» i tidligere kryssregister betyr at en gammel scenepakke finnes; «People-basert ferdig» krever egen aktørvariant, rolle-/relasjonsgate, faktisk sceneutføring og arkivtest.

## Kapittelmatrise – ni trinn med fem pakker

| Trinn | Dager | Redaksjonell funksjon | Pakker | Eksisterende `role_scope` |
| --- | --- | --- | ---: | --- |
| 1 | 8–10 | Første fortsettelse | 5 | `musikk_frilansmusiker`, `naeringsliv_sideprosjektbygger`, `naeringsliv_frilanser`, `naeringsliv_grunderdrommer`, `subkultur_gangster` |
| 2 | 11–13 | Ny beslutning | 5 | `naeringsliv_sideprosjektbygger`, `naeringsliv_frilanser`, `naeringsliv_grunderdrommer`, `musikk_frilansmusiker`, `subkultur_gangster` |
| 3 | 14–16 | Forsinket virkning | 5 | `musikk_frilansmusiker`, `naeringsliv_sideprosjektbygger`, `naeringsliv_frilanser`, `naeringsliv_grunderdrommer`, `subkultur_gangster` |
| 4 | 17–19 | Kryssende tråder | 5 | `naeringsliv_sideprosjektbygger`, `subkultur_gangster` ×2, `musikk_frilansmusiker` ×2 |
| 5 | 20–22 | Flerpersonkapittel | 5 | `subkultur_gangster` ×2, `musikk_frilansmusiker`, `naeringsliv_frilanser` ×2 |
| 6 | 23–25 | Relasjonelle valg | 5 | `naeringsliv_sideprosjektbygger`, `musikk_frilansmusiker` ×2, `subkultur_gangster` ×2 |
| 7 | 26–28 | Relasjonelle konsekvenser | 5 | `subkultur_gangster`, `naeringsliv_sideprosjektbygger`, `naeringsliv_frilanser` ×2, `musikk_frilansmusiker` |
| 8 | 29–31 | Langsiktig spor | 5 | `subkultur_gangster`, `naeringsliv_sideprosjektbygger`, `naeringsliv_frilanser` ×2, `musikk_frilansmusiker` |
| 9 | 32–34 | Nytt livskapittel | 5 | `subkultur_gangster`, `naeringsliv_sideprosjektbygger`, `naeringsliv_frilanser` ×2, `musikk_frilansmusiker` |

Nøyaktig `etterDag`, `role_scope`, `path` og ID kommer fra `data/Civication/lifestory/roles/arbeidsledig/role.json`. For de 35 senere filene er L-/C-tilhørighet hentet fra eksisterende `narrativeCrosswalkV1.json`. Dette atlaset oppretter ingen ny runtime-registrering.

## Komplett kapitteloversikt (45/45)

| Dager | Fil / kapittel-ID | Rolle | Redaksjonelt nivå |
| --- | --- | --- | --- |
| 8–10 | [`musikk_med_mira`](../data/Civication/lifestory/continuations/musikk_med_mira.json) | `musikk_frilansmusiker` | Grunnkapittel |
| 8–10 | [`sideprosjekt_med_lea`](../data/Civication/lifestory/continuations/sideprosjekt_med_lea.json) | `naeringsliv_sideprosjektbygger` | Grunnkapittel |
| 8–10 | [`frilans_med_lea`](../data/Civication/lifestory/continuations/frilans_med_lea.json) | `naeringsliv_frilanser` | Grunnkapittel |
| 8–10 | [`grunder_med_lea`](../data/Civication/lifestory/continuations/grunder_med_lea.json) | `naeringsliv_grunderdrommer` | Grunnkapittel |
| 11–13 | [`sideprosjekt_neste_steg`](../data/Civication/lifestory/continuations/sideprosjekt_neste_steg.json) | `naeringsliv_sideprosjektbygger` | Grunnkapittel |
| 11–13 | [`frilans_neste_steg`](../data/Civication/lifestory/continuations/frilans_neste_steg.json) | `naeringsliv_frilanser` | Grunnkapittel |
| 11–13 | [`grunder_neste_steg`](../data/Civication/lifestory/continuations/grunder_neste_steg.json) | `naeringsliv_grunderdrommer` | Grunnkapittel |
| 11–13 | [`musikk_foresporselen`](../data/Civication/lifestory/continuations/musikk_foresporselen.json) | `musikk_frilansmusiker` | Grunnkapittel |
| 8–10 | [`miljo_med_arvid`](../data/Civication/lifestory/continuations/miljo_med_arvid.json) | `subkultur_gangster` | Grunnkapittel |
| 11–13 | [`miljo_navnet_ditt`](../data/Civication/lifestory/continuations/miljo_navnet_ditt.json) | `subkultur_gangster` | Grunnkapittel |
| 14–16 | [`musikk_etter_foresporselen`](../data/Civication/lifestory/continuations/musikk_etter_foresporselen.json) | `musikk_frilansmusiker` | Litterær kobling: `continuationProduction` |
| 14–16 | [`sideprosjekt_etter_neste_steg`](../data/Civication/lifestory/continuations/sideprosjekt_etter_neste_steg.json) | `naeringsliv_sideprosjektbygger` | Litterær kobling: `continuationProduction` |
| 14–16 | [`frilans_etter_neste_steg`](../data/Civication/lifestory/continuations/frilans_etter_neste_steg.json) | `naeringsliv_frilanser` | Litterær kobling: `continuationProduction` |
| 14–16 | [`grunder_etter_neste_steg`](../data/Civication/lifestory/continuations/grunder_etter_neste_steg.json) | `naeringsliv_grunderdrommer` | Litterær kobling: `continuationProduction` |
| 14–16 | [`miljo_etter_invitasjonen`](../data/Civication/lifestory/continuations/miljo_etter_invitasjonen.json) | `subkultur_gangster` | Litterær kobling: `continuationProduction` |
| 17–19 | [`sideprosjekt_kryss_med_mira`](../data/Civication/lifestory/continuations/sideprosjekt_kryss_med_mira.json) | `naeringsliv_sideprosjektbygger` | Litterær kobling: `crossCharacterProduction` |
| 17–19 | [`miljo_kryss_med_lea`](../data/Civication/lifestory/continuations/miljo_kryss_med_lea.json) | `subkultur_gangster` | Litterær kobling: `crossCharacterProduction` |
| 17–19 | [`musikk_kryss_med_arvid`](../data/Civication/lifestory/continuations/musikk_kryss_med_arvid.json) | `musikk_frilansmusiker` | Litterær kobling: `crossCharacterProduction` |
| 17–19 | [`miljo_kryss_med_frilans`](../data/Civication/lifestory/continuations/miljo_kryss_med_frilans.json) | `subkultur_gangster` | Litterær kobling: `crossCharacterProduction` |
| 17–19 | [`musikk_kryss_med_grunder`](../data/Civication/lifestory/continuations/musikk_kryss_med_grunder.json) | `musikk_frilansmusiker` | Litterær kobling: `crossCharacterProduction` |
| 20–22 | [`miljo_etter_leas_program`](../data/Civication/lifestory/continuations/miljo_etter_leas_program.json) | `subkultur_gangster` | Litterær kobling: `ensembleProduction` |
| 20–22 | [`musikk_etter_arvids_tekst`](../data/Civication/lifestory/continuations/musikk_etter_arvids_tekst.json) | `musikk_frilansmusiker` | Litterær kobling: `ensembleProduction` |
| 20–22 | [`frilans_etter_miras_navn`](../data/Civication/lifestory/continuations/frilans_etter_miras_navn.json) | `naeringsliv_frilanser` | Litterær kobling: `ensembleProduction` |
| 20–22 | [`frilans_etter_arvids_kreditering`](../data/Civication/lifestory/continuations/frilans_etter_arvids_kreditering.json) | `naeringsliv_frilanser` | Litterær kobling: `ensembleProduction` |
| 20–22 | [`miljo_etter_miras_lyd`](../data/Civication/lifestory/continuations/miljo_etter_miras_lyd.json) | `subkultur_gangster` | Litterær kobling: `ensembleProduction` |
| 23–25 | [`lea_etter_arvids_ansvar`](../data/Civication/lifestory/continuations/lea_etter_arvids_ansvar.json) | `naeringsliv_sideprosjektbygger` | Litterær kobling: `relationshipProduction` |
| 23–25 | [`mira_etter_samtalen_med_lea`](../data/Civication/lifestory/continuations/mira_etter_samtalen_med_lea.json) | `musikk_frilansmusiker` | Litterær kobling: `relationshipProduction` |
| 23–25 | [`arvid_etter_leas_notat`](../data/Civication/lifestory/continuations/arvid_etter_leas_notat.json) | `subkultur_gangster` | Litterær kobling: `relationshipProduction` |
| 23–25 | [`arvid_etter_leas_grense`](../data/Civication/lifestory/continuations/arvid_etter_leas_grense.json) | `subkultur_gangster` | Litterær kobling: `relationshipProduction` |
| 23–25 | [`mira_etter_lydfilens_rykte`](../data/Civication/lifestory/continuations/mira_etter_lydfilens_rykte.json) | `musikk_frilansmusiker` | Litterær kobling: `relationshipProduction` |
| 26–28 | [`arvid_etter_leas_tillit`](../data/Civication/lifestory/continuations/arvid_etter_leas_tillit.json) | `subkultur_gangster` | Litterær kobling: `consequenceProduction` |
| 26–28 | [`lea_etter_miras_vennskap`](../data/Civication/lifestory/continuations/lea_etter_miras_vennskap.json) | `naeringsliv_sideprosjektbygger` | Litterær kobling: `consequenceProduction` |
| 26–28 | [`lea_etter_arvids_fortelling`](../data/Civication/lifestory/continuations/lea_etter_arvids_fortelling.json) | `naeringsliv_frilanser` | Litterær kobling: `consequenceProduction` |
| 26–28 | [`lea_etter_arvids_avstand`](../data/Civication/lifestory/continuations/lea_etter_arvids_avstand.json) | `naeringsliv_frilanser` | Litterær kobling: `consequenceProduction` |
| 26–28 | [`mira_etter_nye_takter`](../data/Civication/lifestory/continuations/mira_etter_nye_takter.json) | `musikk_frilansmusiker` | Litterær kobling: `consequenceProduction` |
| 29–31 | [`arvid_og_det_aapne_lokalet`](../data/Civication/lifestory/continuations/arvid_og_det_aapne_lokalet.json) | `subkultur_gangster` | Litterær kobling: `longTermProduction` |
| 29–31 | [`lea_og_sporsmaalene_som_gjenstaar`](../data/Civication/lifestory/continuations/lea_og_sporsmaalene_som_gjenstaar.json) | `naeringsliv_sideprosjektbygger` | Litterær kobling: `longTermProduction` |
| 29–31 | [`lea_og_kildene_i_skrivearbeidet`](../data/Civication/lifestory/continuations/lea_og_kildene_i_skrivearbeidet.json) | `naeringsliv_frilanser` | Litterær kobling: `longTermProduction` |
| 29–31 | [`lea_og_fellesskapet_uten_plikt`](../data/Civication/lifestory/continuations/lea_og_fellesskapet_uten_plikt.json) | `naeringsliv_frilanser` | Litterær kobling: `longTermProduction` |
| 29–31 | [`mira_og_musikken_i_hverdagen`](../data/Civication/lifestory/continuations/mira_og_musikken_i_hverdagen.json) | `musikk_frilansmusiker` | Litterær kobling: `longTermProduction` |
| 32–34 | [`arvid_og_nokkelen_til_lokalet`](../data/Civication/lifestory/continuations/arvid_og_nokkelen_til_lokalet.json) | `subkultur_gangster` | Litterær kobling: `lifeConsequencesProduction` |
| 32–34 | [`lea_og_den_foerste_hypotesen`](../data/Civication/lifestory/continuations/lea_og_den_foerste_hypotesen.json) | `naeringsliv_sideprosjektbygger` | Litterær kobling: `lifeConsequencesProduction` |
| 32–34 | [`lea_og_foresporselen_om_honorar`](../data/Civication/lifestory/continuations/lea_og_foresporselen_om_honorar.json) | `naeringsliv_frilanser` | Litterær kobling: `lifeConsequencesProduction` |
| 32–34 | [`lea_og_elins_vanskelige_uke`](../data/Civication/lifestory/continuations/lea_og_elins_vanskelige_uke.json) | `naeringsliv_frilanser` | Litterær kobling: `lifeConsequencesProduction` |
| 32–34 | [`mira_og_invitasjonen_fra_musikeren`](../data/Civication/lifestory/continuations/mira_og_invitasjonen_fra_musikeren.json) | `musikk_frilansmusiker` | Litterær kobling: `lifeConsequencesProduction` |

## Felles Symposium-kontinuitet

En historielinje går gjennom **faktisk valgt rolle → eventuell People-oppdagelse → eksplisitt kontakt/valgt scenemodus → hendelse → lagret valg → forsinket konsekvens → kapitlets arkivbevis**.

| Data | Må komme fra | Kontroll |
| --- | --- | --- |
| People-ID, sted og historiske fakta | Canonical History Go People | Faktakilde adskilt fra oppdiktede scener |
| Aktiv rollebane og jobbrettigheter | Career / Life Position | Ingen automatisk jobb eller lønn |
| Relasjonens utvikling | Relationship Engine og hendelser | Ingen automatisk venn ved People-unlock |
| Spilt scene/valg | Life Story / Scene Pipeline | Ingen alternativ gren i historien |
| «Skjedde dette?» | Faktisk gjennomført/avlyst møte | Ingen implisitte møter/kontrakter |
| Forsinket virkning | Et senere faktisk utløst kapittel | Bevarer gren, varighet, avstand og tidligere avtale |
| Arkivtekst | Egen snapshot med kildegrenser | Aldri etterpå døpe om gamle aktører |

**Policyport:** `docs/FACTUALITY_CONTRACT.md` og `docs/CIVICATION_SCENARIO_PEOPLE.md` setter fortsatt grenser for reelle People. Vi kan planlegge eksempler med historiske personer, men ikke skrive løse meldinger, private motiv eller relasjoner i deres navn uten en godkjent kontrakt for særskilt merket simulering.

## Oppgaveliste med klare ferdigkriterier

| Prioritet | Arbeid | Ferdig når |
| --- | --- | --- |
| 1 | Sammenhengende oversikt, inkludert ti tidlige kapitler | Alle 45 paths, 9 trinn og 24 synopsiser er sammenkoblet og testet |
| 2 | Simulerings- og realpersonkontrakt | Policy fastsetter levende/avdøde, merking, offentlig/privat, samtykke og arkiv |
| 3 | Prototype: musikk med to virkelig forskjellige profiler | Samme rolle gir ulik scene, årsakskjede og senere konsekvens for to ulike People |
| 4 | Prototype: prosjekt og miljø | Rolle, historisk fagkontekst, stedsproveniens og relasjonsgate består |
| 5 | Symposium-kontinuitet | Nye og gamle saves beholder aktører, valg, avlysninger og faktagrense |
| 6 | Resten av C01–C24 | Hvert spor har egen scenebevisført gren og kvalitetskontroll |

**Scope for denne PR-en:** Ferdigstille punkt 1 som en redaksjonell og maskinlesbar atlasleveranse. 2–6 er fremtidige produksjonstrinn, ikke godkjent runtime.
