# Civication By Saksbehandler Role World rollout — source first

Dato: **2026-08-28**

## Canonical inngang

Fersk rollout-readiness etter By-prosjektleder peker på `by/by_saksbehandler` som neste kontrollerte Role World-PR.

- classification: `rollout_ready`
- authored work required: **kun** `situated_reputation`
- cross-role: `candidate_when_shared_work_is_real`
- broad rollout-policy er grønn
- eksisterende Scene Pipeline forblir canonical

Denne PR-en skal ikke relable eksisterende `persistent_work_object` eller `rhythm_waiting_handoff_rework` som nytt arbeid. Saksbehandlerrollen har allerede komplette saksbehandlings- og kvalitetssløyfer, dokumentasjons-/skjønnsarbeid, journalspor og en canonical delayed continuity fra nytt faktum til senere klage.

## Eksisterende pakke som skal bevares

- canonical career role model: `data/Civication/roleModels/by/saksbehandler_plan_bygg.json`
- compatibility/shared model: `data/Civication/roleModels/by/by_saksbehandler.json`
- work grammar: `data/Civication/workGrammars/by/by_saksbehandler.json`
- mail plan: `data/Civication/mailPlans/by/by_saksbehandler_plan.json`
- eksisterende 8-stegs plan bevares uendret
- alle ni canonical mailtyper finnes allerede som authored By-saksbehandler-scener

Canonical myndighetsgrense skal forbli uendret:

- saksbehandleren kan kontrollere dokumentasjon, planstatus og faktisk grunnlag innen tildelt sak;
- rollen kan be om manglende opplysninger og forklare hvorfor de er nødvendige;
- rollen kan anvende regler og utøve delegert faglig skjønn der hjemmel og mandat åpner for det;
- rollen kan forberede vedtaksgrunnlag, vilkår, journal og faglig begrunnelse for riktig beslutningseier;
- rollen kan ikke forskjellsbehandle like saker uten saklig og dokumentert grunn;
- rollen kan ikke hoppe over lovpålagte prosesser eller skjule vesentlige opplysninger for å holde frist;
- rollen kan ikke love tillatelse, dispensasjon eller bestemt vedtaksutfall før riktig avgjørelse er tatt;
- rollen kan ikke tolke bort klare plan- eller lovkrav fordi tiltaket virker praktisk eller rimelig.

Badge-status eller standing kan aldri skape tillatelse, dispensasjon, vedtaksmyndighet eller rett til å omgå lovpålagt saksprosess.

## Eksakt provenance

Role World-en skal gjenbruke nøyaktig disse ni eksisterende scenene:

1. `data/Civication/mailFamilies/by/job/by_saksbehandler_job.json#by_saks_job_dok_001`
2. `data/Civication/mailFamilies/by/people/by_saksbehandler_people.json#by_saksbehandler_people_anne_001`
3. `data/Civication/mailFamilies/by/conflict/by_saksbehandler_conflict.json#by_saksbehandler_conflict_likebehandling_001`
4. `data/Civication/mailFamilies/by/event/by_saksbehandler_event.json#by_saksbehandler_event_befaring_001`
5. `data/Civication/mailFamilies/by/micro/by_saksbehandler_micro.json#by_saksbehandler_micro_kildespor_001`
6. `data/Civication/mailFamilies/by/story/by_saksbehandler_story.json#by_saksbehandler_story_vedtaksgrunnlag_001`
7. `data/Civication/mailFamilies/by/knowledge/by_saksbehandler_knowledge.json#by_saksbehandler_knowledge_likebehandling_001`
8. `data/Civication/mailFamilies/by/followup/by_saksbehandler_followup.json#by_saksbehandler_followup_hoyde_001`
9. `data/Civication/mailFamilies/by/consequence/by_saksbehandler_consequence.json#by_saksbehandler_consequence_klage_001`

Canonical delayed continuity finnes allerede som `thread_key: by_saksbehandler.case.hoyde_nabovirkning_og_klage` i followup + consequence. Den gjenbrukes som bevis på at faktum, skjønn, journal og senere klage allerede har et vedvarende beslutningsspor. Ingen ny runtime-thread introduseres.

## Eksisterende rhythm/persistent proof — ikke authored debt

Work grammar har allerede:

- `saksbehandling`: `registrer → kontroller_kompletthet → utred → kommuniser → forbered_beslutning`
- `kvalitetssikring`: `kontroller_hjemmel → sammenlign_like_saker → synliggjor_skjonn → fagkontroller → journalfor`

Mailpakken beviser i tillegg:

- nesten komplett søknad som likevel mangler avgjørende høydegrunnlag;
- juridisk kontroll av likebehandling når relevante stedlige forskjeller finnes;
- befaring når tre merknader kan beskrive samme faktiske passasje;
- eksplisitt kildespor mellom vurderingsnotat og tegningsversjon;
- samlet vedtaksgrunnlag der hjemmel, faktum, stedlig virkning, merknader og skjønn blir lesbare sammen;
- nytt høydesnitt som endrer faktumgrunnlaget;
- senere klage som tester om begrunnelsen faktisk kan etterprøves.

Role World-seasonen kan bruke denne rytmen, men `materialization.authored_dimensions` skal **ikke** inneholde persistent work eller rhythm.

## Eneste gap — `situated_reputation`

Standing skal være audience-spesifikk og aldri global. Minst disse gruppene materialiseres:

1. **Plan-/byggesaksseksjonen og faglig ledelse** — bryr seg om vurderbarhet, saksflyt, frist, tydelige mangler og om revisjoner er faglig begrunnet i stedet for skjult som administrativt ekstraarbeid.
2. **Juridisk rådgivning / fagkontroll** — bryr seg om hjemmel, relevant faktum, likebehandling, eksplisitt skjønn og om begrunnelsen tåler etterprøving.
3. **Søker / tiltakshaver** — bryr seg om forutsigbar prosess, tydelige dokumentasjonskrav, forståelig kommunikasjon og at saken ikke holdes tilbake av uklare eller skiftende kriterier.
4. **Naboer og berørte innbyggere** — bryr seg om at relevante virkninger som lys, innsyn, trygghet og trafikk faktisk blir lest saklig selv når merknaden er følelsesladet eller lite juridisk formulert.
5. **Formell beslutningseier** — bryr seg om at vedtaksgrunnlaget skiller hjemmel, faktum, skjønn og merknader og ikke forskutterer utfallet før riktig avgjørelse er tatt.
6. **Klageinstans / senere kontroll** — bryr seg om at journalen viser hvilket faktum og hvilken begrunnelse som bar avgjørelsen da saken ble vurdert, ikke en rekonstruksjon skrevet først etter at konflikten oppsto.
7. **Kollegaer som overtar eller sammenligner saker** — bryr seg om kildespor, presedensbruk, relevante forskjeller og om saken kan forstås uten taus kunnskap hos én saksbehandler.
8. **Private relasjoner** — bryr seg om at fristpress, konflikt og offentlig kritikk ikke blir hele personens identitet utenfor arbeidet.

Standing kan divergere. Et mangelbrev kan svekke kortsiktig standing hos en utålmodig søker og hos et miljø som teller gjennomstrømning, samtidig som juridisk fagkontroll og senere klageinstans får større tillit til vurderingsgrunnlaget. En stedlig befaring kan forsinke saken, men styrke tillit hos naboer og kolleger dersom den gjør flere løse merknader til ett presist vurderingstema. Å endre vurderingen når nytt høydesnitt kommer inn kan oppleves som ustabilitet for søker eller ledelse, men styrke tillit til at saken faktisk følger bedre faktum fremfor å beskytte den første konklusjonen.

Ingen audience kan gjennom standing gi saksbehandleren rett til å forskjellsbehandle uten saklig grunn, omgå lovpålagt prosess, skjule vesentlige opplysninger, love tillatelse/dispensasjon eller forskuttere formelt vedtaksutfall.

## Cross-role

Readiness sier `candidate_when_shared_work_is_real`, ikke at en cross-role-link er obligatorisk i denne rollouten. Denne PR-en materialiserer derfor **ingen cross-role-link**.

Anne, Maria og Erik er allerede operative relasjoner i Saksbehandlerens canonicale arbeidsverden. Samarbeid, fagkontroll eller klagebehandling er ikke i seg selv bevis for et nytt delt runtime-objekt. Cross-role kan materialiseres senere dersom et genuint shared canonical work-object får eksplisitt runtime-eier.

## Role World-kontrakt

Materialiseringen skal:

- bruke schema `civication_role_world_v1` og status `role_world_complete`;
- ha 14 dager × fire faser = 56 unike beats;
- ha `materialization.authored_dimensions` lik nøyaktig `['situated_reputation']`;
- gjenbruke nøyaktig de ni canonical source refs over;
- bevare 8-stegs mailplan, canonical role model, compatibility/shared model, work grammar og Scene Pipeline;
- gjenbruke `by_saksbehandler.case.hoyde_nabovirkning_og_klage` som continuity proof;
- ha minst seks recurring archetypes, åtte slow axes, fem primary threads, fem private aftermath og seks delayed consequences;
- ikke introdusere global reputation, ny saksbehandlings-/klage-/vedtaksmotor eller parallelt sceneformat;
- ikke materialisere cross-role-link.

## Fail-closed proof

Permanent state kan først skrives etter:

1. TEMP materialisering;
2. scene-registry regeneration/check;
3. Career Gameplay Matrix regeneration/check;
4. rollout readiness regeneration/check;
5. ny strict By-saksbehandler Role World-test;
6. eksisterende By-saksbehandler playability/career gates;
7. By-prosjektleder + By-assistent + Arkitekt precedent-gates;
8. generic Role World contract + broad rollout-policy;
9. full `npm run test:civication`;
10. TEMP workflow/materializer fjernet før permanent commit.

Etter materialisering skal readiness vise minst **30 complete/pilot**, maks **55 igjen**, By-saksbehandler skal være fjernet fra køen, og testen skal ikke hardkode hvilket køhode som kommer etterpå.

Rollouten er ikke ferdig før exact-head PR-CI, SHA-låst merge og post-merge Main integrity + Pages er grønne på composed `main`.
