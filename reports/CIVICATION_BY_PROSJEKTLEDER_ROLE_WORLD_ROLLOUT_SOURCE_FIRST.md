# Civication By Prosjektleder Role World rollout — source first

Dato: **2026-08-28**

## Canonical inngang

Fersk rollout-readiness etter By-assistent peker på `by/by_prosjektleder` som neste kontrollerte Role World-PR.

- classification: `rollout_ready`
- authored work required: **kun** `situated_reputation`
- cross-role: `candidate_when_shared_work_is_real`
- broad rollout-policy er grønn
- eksisterende Scene Pipeline forblir canonical

Denne PR-en skal ikke late som `persistent_work_object` eller `rhythm_waiting_handoff_rework` mangler. Prosjektlederrollen har allerede eksplisitte styrings- og kvalitetssløyfer, mandat-/avhengighets-handoffs, beslutningsspor og en canonical delayed continuity-tråd for kostnadsrisiko og kvalitet.

## Eksisterende pakke som skal bevares

- canonical career role model: `data/Civication/roleModels/by/prosjektleder_byutvikling.json`
- compatibility/shared model: `data/Civication/roleModels/by/by_prosjektleder.json`
- work grammar: `data/Civication/workGrammars/by/by_prosjektleder.json`
- mail plan: `data/Civication/mailPlans/by/by_prosjektleder_plan.json`
- eksisterende 8-stegs plan bevares uendret
- alle ni canonical mailtyper finnes allerede som authored By-prosjektleder-scener

Canonical myndighetsgrense skal forbli uendret:

- prosjektlederen kan prioritere og koordinere arbeid innen delegert prosjektmandat;
- prosjektlederen kan plassere eierskap til avhengigheter, frister og leveranser og eskalere når ansvar mangler;
- prosjektlederen kan varsle risiko og foreslå replanlegging av tid, omfang eller ressurs;
- rollen kan ikke overstyre lov, planmyndighet eller politiske/administrative vedtaksorgan;
- rollen kan ikke skjule vesentlig risiko for å bevare framdrift eller rapportro;
- rollen kan ikke binde kommunen økonomisk eller politisk uten delegert fullmakt;
- fagansatte, medvirkning eller standing kan aldri brukes som legitimering for et forhåndsbestemt resultat eller som erstatning for riktig beslutningseier.

## Eksakt provenance

Role World-en skal gjenbruke nøyaktig disse ni eksisterende scenene:

1. `data/Civication/mailFamilies/by/job/by_prosjektleder_job.json#by_prosjekt_job_risiko_001`
2. `data/Civication/mailFamilies/by/people/by_prosjektleder_people.json#by_prosjektleder_people_lena_001`
3. `data/Civication/mailFamilies/by/conflict/by_prosjektleder_conflict.json#by_prosjektleder_conflict_ansvar_001`
4. `data/Civication/mailFamilies/by/event/by_prosjektleder_event.json#by_prosjektleder_event_avhengighetsmote_001`
5. `data/Civication/mailFamilies/by/micro/by_prosjektleder_micro.json#by_prosjektleder_micro_beslutningslogg_001`
6. `data/Civication/mailFamilies/by/story/by_prosjektleder_story.json#by_prosjektleder_story_styringssak_001`
7. `data/Civication/mailFamilies/by/knowledge/by_prosjektleder_knowledge.json#by_prosjektleder_knowledge_risiko_001`
8. `data/Civication/mailFamilies/by/followup/by_prosjektleder_followup.json#by_prosjektleder_followup_kostnad_001`
9. `data/Civication/mailFamilies/by/consequence/by_prosjektleder_consequence.json#by_prosjektleder_consequence_kostnad_001`

Canonical delayed continuity finnes allerede som `thread_key: by_prosjektleder.case.kostnadsrisiko_og_kvalitet` i followup + consequence. Den skal **gjenbrukes**, ikke erstattes av ny runtime-state.

## Eksisterende rhythm/persistent proof — ikke authored debt

Work grammar har allerede:

- `styring`: `avklar_mandat → prioriter_portefolje → koordiner_avhengigheter → eskaler_risiko → folg_opp_beslutninger`
- `kvalitetssikring`: `kontroller_vedtaksmyndighet → test_realistisk_fremdrift → synliggjor_kostnad_og_risiko → fagkontroller → rapporter_avvik`
- praksisfortellinger for ressurskollisjon, mandatglidning, tid/kostnad mot krav og kvalitet, tverretatlige låser og lederpress for falsk sikkerhet

Mailpakken beviser i tillegg tidlig kostnadsrisiko → scenario/rapportering → beslutningslogg → senere risikooppfølging → forsinket styringskonsekvens. Role World-seasonen kan bruke denne rytmen, men `materialization.authored_dimensions` skal **ikke** inneholde rhythm eller persistent work.

## Eneste gap — `situated_reputation`

Standing skal være audience-spesifikk og aldri global. Minst disse gruppene materialiseres:

1. **Kommunalsjef / overordnet ledelse** — bryr seg om styringsklarhet, realistiske scenarioer, tidlig risikosynlighet og om prosjektlederen skiller anbefaling fra beslutning som tilhører ledelse eller annet organ.
2. **Prosjektkoordinering / tverrfaglig team** — bryr seg om navngitte eiere, klare handoffs, prioriterte avhengigheter, sporbar rework og at møteaktivitet faktisk fører til beslutningspunkter.
3. **Økonomi- og risikomiljøet** — bryr seg om sannsynlighet, konsekvens, forutsetninger, alternativkostnad og om budsjettpress synliggjøres før kvalitet blir stille reserve.
4. **Medvirkningsmiljøet** — bryr seg om at innbyggerdialog holdes adskilt fra utbyggerforhandling, at innspill ikke brukes som legitimering for ferdige svar og at kvalitetskonsekvenser blir synlige.
5. **Formelle beslutningseiere / myndighetsmiljø** — bryr seg om mandatklarhet, korrekt eskalering og at prosjektgruppen ikke forskutterer plan-, vedtaks- eller myndighetsbeslutninger den ikke eier.
6. **Utbygger og eksterne prosjektaktører** — bryr seg om forutsigbare avklaringer, realistiske milepæler og at prosjektlederen ikke lover framdrift eller utfall uten kontroll over premissene.
7. **Berørte innbyggere / brukere** — bryr seg om at bykvalitet, trygghet og medvirkning ikke blir skjulte spareposter når budsjett og dato presses.
8. **Private relasjoner** — bryr seg om at rapportpress, ansvar og prestisje ikke blir hele personens identitet når prosjektet fortsatt er uavklart.

Standing kan divergere. Å varsle en usikker kostnadsrisiko tidlig kan svekke kortsiktig standing hos dem som ønsker ro og én dato, samtidig som økonomi, fagmiljø og senere ledelse får større tillit til styringskvaliteten. Å stoppe mandatglidning kan irritere et fremdriftspresset prosjektteam eller en ekstern aktør, men styrke standing hos formelle beslutningseiere og de som senere må stå ansvarlig for vedtaket. Et kvalitetskutt kan gi kortsiktig rapportro, men svekke tillit hos medvirkningsmiljø og berørte brukere.

Ingen audience kan gjennom standing gi prosjektlederen rett til å overstyre lov eller vedtaksorgan, binde kommunen uten fullmakt, love plan-/utbyggingsutfall eller skjule vesentlig risiko og faglig uenighet.

## Cross-role

Readiness sier `candidate_when_shared_work_is_real`, ikke at en link er obligatorisk nå. Denne PR-en materialiserer derfor **ingen cross-role-link**.

Lena, Amin, Maria og Sigrid er allerede mennesker i Prosjektlederens canonicale arbeidsverden. Tverrfaglig arbeid og avhengigheter er ikke i seg selv bevis for et nytt delt runtime-objekt. Cross-role kan først materialiseres når et separat genuinely shared canonical work object med tydelig runtime-eier er bevist.

## Role World-kontrakt

Materialiseringen skal:

- bruke schema `civication_role_world_v1` og status `role_world_complete`;
- ha 14 dager × fire faser = 56 unike beats;
- ha `materialization.authored_dimensions` lik nøyaktig `['situated_reputation']`;
- gjenbruke nøyaktig de ni canonical source refs over;
- bevare 8-stegs mailplan, canonical role model, compatibility/shared model, work grammar og Scene Pipeline;
- gjenbruke `by_prosjektleder.case.kostnadsrisiko_og_kvalitet` som continuity proof;
- ha minst seks recurring archetypes, åtte slow axes, fem primary threads, fem private aftermath og seks delayed consequences;
- ikke introdusere global reputation, ny prosjekt-/porteføljemotor, ny myndighetsmotor eller parallelt sceneformat;
- ikke materialisere cross-role-link.

## Fail-closed proof

Permanent state kan først skrives etter:

1. TEMP materialisering;
2. scene-registry regeneration/check;
3. Career Gameplay Matrix regeneration/check;
4. rollout readiness regeneration/check;
5. ny strict By-prosjektleder Role World-test;
6. eksisterende By-prosjektleder playability/career gates;
7. By-assistent + Arkitekt + Sportsledelse precedent-gates;
8. generic Role World contract + broad rollout-policy;
9. full `npm run test:civication`;
10. TEMP workflow/materializer fjernet før permanent commit.

Etter materialisering skal readiness vise minst **29 complete/pilot**, maks **56 igjen**, By-prosjektleder skal være fjernet fra køen, og testen skal ikke hardkode hvilket køhode som kommer etterpå.

Rollouten er ikke ferdig før exact-head PR-CI, SHA-låst merge og post-merge Main integrity + Pages er grønne på composed `main`.
