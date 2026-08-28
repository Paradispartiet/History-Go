# Civication Psykologi Professor Role World rollout — source first

Dato: **2026-08-28**

## Canonical inngang

`data/Civication/roleWorldRolloutReadiness.json` på base `ca98245195010ccb1a199c35fdfb2e6d669cda11` velger eksplisitt `psykologi/professor_psykologi` som neste kontrollerte Role World-PR.

- classification: `rollout_ready`
- authored debt: `rhythm_waiting_handoff_rework`, `situated_reputation`
- cross-role: `not_required_for_rollout`
- broad rollout-policy og eksisterende Scene Pipeline beholdes uendret.

## Eksisterende canonical pakke som ikke skal omskrives

Professorrollen er allerede playable og har komplett roleModel, work grammar, åtte-trinns mailplan, alle ni mailtyper, tre fictionalized work surfaces og akademisk kvalifikasjons-/ansettelsesgate. Rollouten skal derfor ikke lage ny karrierestige, ny motor eller parallell mailflyt.

Autoritetsgrenser som skal bestå:

- professortittel er ikke psykologautorisasjon;
- professorrollen gir ikke diagnose- eller behandlingsmyndighet;
- senioritet kan ikke erstatte argument eller data;
- veiledning/prosjektledelse gir ikke automatisk eierskap til studenters eller yngre forskeres ideer;
- større ressursprioritering tilhører formell institusjonsbeslutning, ikke professortittelen alene.

Den separate `tests/civication-psychology-academic-career-ladder.test.js` skal fortsatt bevise at forsker og professor er ulike canonical scopes med eksplisitt akademisk kvalifikasjons-/ansettelsesport.

## Eksakt mailprovenans

Rollouten materialiserer ingen nye mailfamilier. Den bruker disse ni eksisterende scenene som provenance:

1. job — `kreditering_for_soknad` — `psykologi_professor_psykologi_job_kreditering_001`
2. people — `veiledning_og_selvstendighet` — `psykologi_professor_psykologi_people_veiledning_001`
3. conflict — `kritikk_av_eget_program` — `psykologi_professor_psykologi_conflict_programkritikk_001`
4. knowledge — `akademisk_makt_og_kreditering` — `psykologi_professor_psykologi_knowledge_makt_001`
5. event — `soknadsfrist_og_utdanningskvalitet` — `psykologi_professor_psykologi_event_undervisning_001`
6. micro — `gjennomsnitt_og_skjult_laeringsgap` — `psykologi_professor_psykologi_micro_laeringsgap_001`
7. followup — `reanalyse_og_programendring` — `psykologi_professor_psykologi_followup_programkritikk_001`
8. story — `etterprovbar_fagmiljoprioritering` — `psykologi_professor_psykologi_story_prioritering_001`
9. consequence — `kritikkultur_som_senere_konsekvens` — `psykologi_professor_psykologi_consequence_programkritikk_001`

`conflict`, `followup` og `consequence` deler allerede `thread_key = psykologi_professor_psykologi_programkritikk_001`. Denne eksisterende tråden er continuity anchor for venting → reproduksjon → programrework → senere kritikkultur.

## Rhythm: waiting / handoff / rework

Dette er editorial world-state i eksisterende Scene Pipeline, ikke ny runtime state.

- **waiting**: reanalysen venter på reproduksjon; undervisningstiltak venter på læringsdata; større kapasitetsvalg venter på instituttleder; kandidaten får tid til å gjøre eget metodevalg. Venting gir aldri professoren rett til å overta andres beslutninger.
- **handoff**: metodevalget leveres tilbake til kandidaten med spørsmål og kriterier; reanalyse sendes til uavhengig reproduksjon; ressurskonflikt sendes til instituttleder; krediteringsspørsmål kan eskaleres til uavhengig kanal ved habilitet/maktasymmetri.
- **rework**: forskningsprogrammet revideres når kritikken holder; søknadsrolle/kreditering avklares på nytt; undervisningsdesign avgrenses rundt dokumentert læringsgap; fagmiljøprioritering oppdateres når evidens eller kapasitet endrer premissene.
- **interruption**: søknadsfrist, undervisningsproblem eller ny kritikk kan endre rekkefølgen uten å skape ny autoritet.
- **delayed consequence**: reanalyse, læringsdata og senere kritikkultur kommer tilbake etter at det opprinnelige valget er gjort.

## Situated reputation

Ingen global reputation-score tillates. Standing er audience-spesifikk og kan divergere.

Planlagte audience-akser:

- `doctoral_candidate_standing` — ph.d.-kandidater og andre veiledede
- `junior_researcher_standing` — yngre forskere og tidlig-karriere-kolleger
- `teaching_environment_standing` — studenter/undervisningsmiljø
- `department_leadership_standing` — institutt-/organisasjonsledelse
- `academic_peer_standing` — fagfeller og forskningssamarbeid
- `private_relationship_standing` — privat nærmiljø

Eksempel på legitim divergens: å utsette en sterk programkonklusjon til reanalysen er reprodusert kan svekke kortsiktig standing hos ledelse eller samarbeidspartnere som ønsker framdrift, samtidig som yngre forskere og fagfeller får større tillit til professorens korrigerbarhet. Ingen av disse standing-aksene kan gi klinisk myndighet, ide-eierskap, evidensstatus eller ressursmandat.

## Materialiseringskontrakt

Role World-en skal:

- være `civication_role_world_v1`, status `role_world_complete`;
- ha 14 dager × 4 faser = 56 unike beats;
- materialisere nøyaktig de to readiness-dimensjonene `rhythm_waiting_handoff_rework` og `situated_reputation`;
- ha minst seks recurring people archetypes, åtte slow axes, fem primary threads, fem private aftermath og seks delayed consequences;
- bruke nøyaktig de ni canonical mailrefs over;
- bevare eksisterende åtte-trinns mailplan og work grammar;
- ikke materialisere cross-role;
- ikke introdusere ny runtime, ny autoritetsmodell eller ny reputation-motor.

## Fail-closed proof

Permanent materialisering tillates først etter:

1. TEMP materializer;
2. scene-registry regeneration/check;
3. Career Gameplay Matrix regeneration/check;
4. Role World readiness regeneration/check;
5. Professor playability-test;
6. akademisk karrierestige-test;
7. ny strict Professor Role World-test;
8. eksisterende Forsker Role World-test;
9. generic Role World contract + broad rollout-policy;
10. full `npm run test:civication`;
11. TEMP workflow/materializer fjernet før permanent commit.

Rollouten er ikke ferdig før PR-CI, merge, Main integrity og Pages er grønne på composed `main`.
