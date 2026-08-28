# Civication By Assistent Role World rollout — source first

Dato: **2026-08-28**

## Canonical inngang

Fersk rollout-readiness etter Arkitekt peker på `by/by_assistent` som neste kontrollerte Role World-PR.

- classification: `rollout_ready`
- authored work required: **kun** `situated_reputation`
- cross-role: `candidate_when_shared_work_is_real`
- broad rollout-policy er grønn
- eksisterende Scene Pipeline forblir canonical

Denne PR-en skal ikke late som `persistent_work_object` eller `rhythm_waiting_handoff_rework` mangler. By-assistenten har allerede eksplisitte arbeids- og kvalitetssløyfer, dokumentert handoff/rework og en delayed continuity-tråd i canonical mailpakken.

## Eksisterende pakke som skal bevares

- canonical career role model: `data/Civication/roleModels/by/studentassistent.json`
- work grammar: `data/Civication/workGrammars/by/by_assistent.json`
- mail plan: `data/Civication/mailPlans/by/by_assistent_plan.json`
- eksisterende 8-stegs plan bevares uendret
- alle ni canonical mailtyper finnes allerede som authored By-assistent-scener

Canonical myndighetsgrense skal forbli uendret:

- assistenten kan samle, kontrollere, observere, registrere, sammenstille og overlevere innen tildelt oppgave;
- assistenten kan ikke fatte formelle plan- eller byggesaksvedtak;
- assistenten kan ikke gi bindende lovtolkning eller love utbyggingsutfall uten mandat;
- assistenten kan ikke skjule kildemotstrid eller endre faglige konklusjoner for tempo;
- egne observasjoner kan ikke fremstilles som endelig faglig vurdering når ansvarlig planlegger/arkitekt må eie konklusjonen;
- standing kan aldri utvide disse grensene.

## Eksakt provenance

Role World-en skal gjenbruke nøyaktig disse ni eksisterende scenene:

1. `data/Civication/mailFamilies/by/job/by_assistent_job.json#by_assistent_job_kart_001`
2. `data/Civication/mailFamilies/by/people/by_assistent_people.json#by_assistent_people_ingrid_001`
3. `data/Civication/mailFamilies/by/conflict/by_assistent_conflict.json#by_assistent_conflict_kart_befaring_001`
4. `data/Civication/mailFamilies/by/event/by_assistent_event.json#by_assistent_event_kveldsbefaring_001`
5. `data/Civication/mailFamilies/by/micro/by_assistent_micro.json#by_assistent_micro_kildespor_001`
6. `data/Civication/mailFamilies/by/story/by_assistent_story.json#by_assistent_story_stedsnotat_001`
7. `data/Civication/mailFamilies/by/knowledge/by_assistent_knowledge.json#by_assistent_knowledge_kart_sted_001`
8. `data/Civication/mailFamilies/by/followup/by_assistent_followup.json#by_assistent_followup_kartavvik_001`
9. `data/Civication/mailFamilies/by/consequence/by_assistent_consequence.json#by_assistent_consequence_grunnlag_001`

Canonical delayed continuity finnes allerede som `thread_key: by_assistent.case.kartavvik_og_stedsbruk` i followup + consequence. Den skal **gjenbrukes**, ikke erstattes av ny runtime-state.

## Eksisterende rhythm/persistent proof — ikke authored debt

Work grammar har allerede:

- `sak_eller_prosjekt`: `avklar_mandat → innhent_grunnlag → analyser → samhandle → dokumenter_og_overlever`
- `kvalitetssikring`: `kontroller_regel_og_planstatus → test_forutsetninger → synliggjor_risiko → innhent_faglig_kontroll → logg_endring`
- praksisfortellinger for uklart mandat, konkurrerende dokumentversjoner, befaring som motsier grunnlag, medvirkning uten løfter og habilitetsusikkerhet

Mailpakken beviser i tillegg kartavvik → dokumentert overlevering → senere followup → designkonsekvens. Role World-seasonen kan bruke denne rytmen, men `materialization.authored_dimensions` skal **ikke** inneholde rhythm eller persistent work.

## Eneste gap — `situated_reputation`

Standing skal være audience-spesifikk og aldri global. Minst disse gruppene materialiseres:

1. **Ansvarlig byplanlegger / Ingrid-miljøet** — bryr seg om presis usikkerhet, kildespor, gode spørsmål og om støttearbeidet gjør ansvarlig vurdering lettere i stedet for å foregripe den.
2. **Arkitekt-/prosjekteringsmiljøet / Jonas** — bryr seg om at befaring og grunnlagskritikk gir brukbar evidens, tydelige grensesnitt og materiale som kan revideres uten rekonstruksjon.
3. **Medvirkningsmiljøet / Maria** — bryr seg om at stemmer registreres presist, mønstre ikke glattes bort, enkelthistorier ikke overtolkes og ingen loves resultat.
4. **Prosjekt-/arbeidsmiljøet** — bryr seg om pålitelig levering, versjonskontroll, sporbarhet og at risiko eskaleres før små feil blir store.
5. **Berørte brukere/innbyggere** — bryr seg om at faktisk bruk, trygghet og innspill blir representert nøkternt og ikke brukt som dekor eller falsk støtte for et allerede valgt utfall.
6. **Medstudenter/private relasjoner** — bryr seg om at en lavt rangert støttejobb ikke blir personlig mindreverd, og at ros/kritikk i prosjektet ikke blir hele identiteten.

Standing kan divergere. Å markere usikkerhet kan svekke kortsiktig status hos et fremdriftspresset team, men styrke tilliten hos Ingrid og senere hos Jonas når revisjonen blir presis. Et glanset sammendrag kan oppleves effektivt internt samtidig som Maria eller innbyggere opplever at viktige forskjeller er glattet bort.

Ingen audience kan gjennom standing gi assistenten plan-/byggesaksmyndighet, bindende lovtolkning, rett til å love utfall eller rett til å erstatte ansvarlig fagpersons konklusjon.

## Cross-role

Readiness sier `candidate_when_shared_work_is_real`, ikke at en link er obligatorisk nå. Denne PR-en materialiserer derfor **ingen cross-role-link**.

Ingrid, Jonas og Maria er allerede mennesker i By-assistentens canonicale arbeidsverden. Det er ikke i seg selv bevis for et nytt delt runtime-objekt. Cross-role kan først materialiseres når en separat, genuinely shared canonical work object med reell runtime-eier er bevist.

## Role World-kontrakt

Materialiseringen skal:

- bruke schema `civication_role_world_v1` og status `role_world_complete`;
- ha 14 dager × fire faser = 56 unike beats;
- ha `materialization.authored_dimensions` lik nøyaktig `['situated_reputation']`;
- gjenbruke nøyaktig de ni canonical source refs over;
- bevare 8-stegs mailplan, canonical role model, work grammar og Scene Pipeline;
- gjenbruke den eksisterende `by_assistent.case.kartavvik_og_stedsbruk`-tråden som continuity proof;
- ha minst seks recurring archetypes, åtte slow axes, fem primary threads, fem private aftermath og seks delayed consequences;
- ikke introdusere global reputation, ny plan-/byggesaksmotor, ny dokumentmotor eller parallelt sceneformat;
- ikke materialisere cross-role-link.

## Fail-closed proof

Permanent state kan først skrives etter:

1. TEMP materialisering;
2. scene-registry regeneration/check;
3. Career Gameplay Matrix regeneration/check;
4. rollout readiness regeneration/check;
5. ny strict By-assistent Role World-test;
6. eksisterende By-assistent playability/career gates;
7. Arkitekt + Sportsledelse precedent-gates;
8. generic Role World contract + broad rollout-policy;
9. full `npm run test:civication`;
10. TEMP workflow/materializer fjernet før permanent commit.

Etter materialisering skal readiness vise minst **28 complete/pilot**, maks **57 igjen**, By-assistent skal være fjernet fra køen, og testen skal ikke hardkode hvilket køhode som kommer etterpå.

Rollouten er ikke ferdig før exact-head PR-CI, SHA-låst merge og post-merge Main integrity + Pages er grønne på composed `main`.
