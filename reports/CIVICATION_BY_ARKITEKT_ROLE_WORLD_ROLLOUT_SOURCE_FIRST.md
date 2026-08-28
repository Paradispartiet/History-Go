# Civication By Arkitekt Role World rollout — source first

Dato: **2026-08-28**

## Canonical inngang

`data/Civication/roleWorldRolloutReadiness.json` velger eksplisitt `by/by_arkitekt` som neste kontrollerte Role World-PR.

- classification: `rollout_ready`
- authored work required: `rhythm_waiting_handoff_rework` + `situated_reputation`
- cross-role: `not_required_for_rollout`
- broad rollout-policy er grønn og eksisterende Scene Pipeline forblir canonical.

Denne PR-en skal lukke **kun** de to readiness-gapene. Den skal ikke bygge ny prosjekt-, BIM-, byggesaks-, godkjennings-, habilitets- eller omdømmemotor.

## Eksisterende pakke som skal bevares

- role model: `data/Civication/roleModels/by/by_arkitekt.json`
- work grammar: `data/Civication/workGrammars/by/by_arkitekt.json`
- mail plan: `data/Civication/mailPlans/by/by_arkitekt_plan.json`
- eksisterende 8-stegs arkitektplan bevares uendret
- alle ni canonical mailtyper finnes allerede som authored Arkitekt-scener.

Canonical myndighetsgrense skal forbli uendret:

- arkitekten kan analysere, prosjektere, koordinere, revidere og dokumentere faglige valg innen faktisk rolle og mandat;
- rollen kan ikke signere eller godkjenne uten rett mandat eller kompetanse;
- rollen kan ikke sette sikkerhet eller tilgjengelighet til side for estetikk;
- rollen kan ikke love plan- eller byggesaksutfall;
- rollen kan ikke skjule interessekonflikter eller vesentlige faglige forbehold;
- Badge-status eller standing kan aldri skape offentlig myndighet, dispensasjon eller formell godkjenning.

## Eksakt provenance

Role World-en skal gjenbruke disse ni eksisterende scenene som canonical provenance:

1. `data/Civication/mailFamilies/by/job/by_arkitekt_job.json#by_arkitekt_job_forste_001`
2. `data/Civication/mailFamilies/by/people/by_arkitekt_people.json#by_arkitekt_people_sara_001`
3. `data/Civication/mailFamilies/by/conflict/by_arkitekt_conflict.json#by_arkitekt_conflict_nora_001`
4. `data/Civication/mailFamilies/by/event/by_arkitekt_event.json#by_arkitekt_event_modell_001`
5. `data/Civication/mailFamilies/by/micro/by_arkitekt_micro.json#by_arkitekt_micro_dor_001`
6. `data/Civication/mailFamilies/by/story/by_arkitekt_story.json#by_arkitekt_story_mikkel_001`
7. `data/Civication/mailFamilies/by/knowledge/by_arkitekt_knowledge.json#by_arkitekt_knowledge_gateplan_001`
8. `data/Civication/mailFamilies/by/followup/by_arkitekt_followup.json#by_arkitekt_followup_inngang_001`
9. `data/Civication/mailFamilies/by/consequence/by_arkitekt_consequence.json#by_arkitekt_consequence_gateplan_001`

Arkitekt-mailene har ikke en egen canonical runtime `thread_key` for denne kjeden. Role World-en skal derfor bruke den eksisterende scenen `by_arkitekt_people_sara_001` som **editorial continuity anchor**. Det skaper ikke ny runtime-state og endrer ingen mailfiler.

## Gap 1 — `rhythm_waiting_handoff_rework`

Arbeidsrytmen skal følge den eksisterende gateplans-/inngangsrevisjonen gjennom waiting, handoff, rework, interruption og delayed consequence.

### Waiting

Legitim venting finnes når:

- en modellgjennomgang må samle flere fag før et grensesnitt kan låses;
- tilgjengelighets-, sikkerhets- eller brukskrav må avklares før signaturgrep kan revideres;
- materialprøve eller fysisk test må gi faktisk evidens før detaljen låses;
- en befaring eller etterkontroll må vise om forrige revisjon faktisk virket.

Venting skal ha tydelig grunn, eier og hva som må bli sant før neste steg.

### Handoff

Handoff skal bevare siste bekreftede status, faglig forbehold og faktisk mandat mellom:

- arkitekt ↔ atelierleder for hovedgrep, kvalitet og prioritering;
- arkitekt ↔ bylivsansvarlig for gateplan, bevegelse, opphold og stedlig evidens;
- arkitekt ↔ prosjekterende team for detalj, materialitet og tverrfaglige grensesnitt;
- arkitekt ↔ prosjekt-/oppdragsledelse når fremdrift, kostnad eller beslutningseierskap må avklares;
- arkitekt ↔ relevant myndighets-/fagansvar når godkjenning, sikkerhet eller tilgjengelighet ligger utenfor arkitektens egen myndighet.

### Rework

Rework brukes når:

- inngang eller ganglinje ikke fungerer etter befaring eller modelltest;
- signaturgrep kolliderer med tilgjengelighet eller robust bruk;
- hjørne, førsteetasje eller overgang til gaten fortsatt er passiv etter første revisjon;
- materialprøve viser svakhet i slitasje, sokkel eller detalj;
- en lokal fiks flytter problemet til et annet grensesnitt.

Rework skal bevare tidligere premiss, test og beslutningsspor i stedet for å omskrive historien for å beskytte standing.

### Interruption

Leveransefrist, ny bruksevidens, sikkerhets-/tilgjengelighetsproblem eller uventet tverrfaglig konflikt kan endre rekkefølgen. Hastegrad kan aldri skape godkjenningsmyndighet eller rett til å sette krav til side.

## Gap 2 — `situated_reputation`

Standing skal være audience-spesifikk og aldri global. Minst disse gruppene materialiseres:

1. **Atelierledelse** — bryr seg om arkitektonisk sammenheng, faglig kvalitet, tydelige prioriteringer og om revisjon styrker prosjektet i stedet for å skjule problemer.
2. **Bylivs-/stedsfaglig miljø** — bryr seg om ganglinjer, førsteetasje, opphold, lesbarhet og om stedlig evidens faktisk endrer prosjektet.
3. **Prosjekterende/tverrfaglig team** — bryr seg om avklarte grensesnitt, sporbare revisjoner, detaljkvalitet og realistiske handoffs.
4. **Prosjekt-/oppdragsledelse** — bryr seg om fremdrift, beslutningsklarhet, risiko og om faglige forbehold er synlige før kostbare låsninger.
5. **Brukere/offentlighet** — bryr seg om brukbarhet, tilgjengelighet, byliv og faktisk stedskvalitet, men kan ikke gi arkitekten formell godkjenningsmyndighet.
6. **Private relasjoner** — bryr seg om at prestisje, kritikk og uferdige revisjoner ikke blir hele personens identitet utenfor arbeidet.

Standing kan divergere. En sen, ærlig revisjon kan svekke kortsiktig status hos et fremdriftspresset prosjektmiljø samtidig som atelier, bylivsfag og brukssiden får større tillit til faglig ansvar. Å bevare et sterkt signaturgrep kan gi prestisje i ett miljø, men svekke standing hos dem som møter tilgjengelighets- eller gateplanskonsekvensen.

Ingen audience kan gjennom standing gi arkitekten rett til å signere, godkjenne, love plan-/byggesaksutfall, fravike sikkerhet/tilgjengelighet eller skjule habilitets-/faglige konflikter.

## Cross-role

Readiness markerer `not_required_for_rollout`. Denne rollouten materialiserer derfor **ingen** cross-role-link.

Tverrfaglig samarbeid finnes allerede i mail- og work-grammar-pakken, men det er ikke i seg selv bevis for at en ny delt runtime-state skal innføres.

## Role World-kontrakt

Materialiseringen skal:

- bruke schema `civication_role_world_v1` og status `role_world_complete`;
- ha 14 dager × fire faser = 56 unike beats;
- ha `materialization.authored_dimensions` lik nøyaktig `['rhythm_waiting_handoff_rework','situated_reputation']`;
- gjenbruke nøyaktig de ni canonical source refs over;
- bevare 8-stegs mailplan, role model, work grammar og Scene Pipeline;
- ha minst seks recurring archetypes, åtte slow axes, fem primary threads, fem private aftermath og seks delayed consequences;
- bruke `by_arkitekt_people_sara_001` som editorial continuity anchor uten ny runtime state;
- ikke introdusere global reputation, ny godkjenningsmotor eller parallelt sceneformat;
- ikke materialisere cross-role-link.

## Fail-closed proof

Permanent state kan først skrives etter:

1. TEMP materialisering;
2. scene-registry regeneration/check;
3. Career Gameplay Matrix regeneration/check;
4. rollout readiness regeneration/check;
5. ny strict Arkitekt Role World-test;
6. eksisterende Arkitekt playability/career gates;
7. Sportsledelse og de nyeste Role World precedent-portene;
8. generic Role World contract + broad rollout-policy;
9. full `npm run test:civication`;
10. TEMP workflow/materializer fjernet før permanent commit.

Etter materialisering skal readiness vise minst **27 complete/pilot**, maks **58 igjen**, Arkitekt skal være fjernet fra køen, og testen skal ikke hardkode hvilket køhode som kommer etterpå.

Rollouten er ikke ferdig før exact-head PR-CI, SHA-låst merge og post-merge Main integrity + Pages er grønne på composed `main`.
