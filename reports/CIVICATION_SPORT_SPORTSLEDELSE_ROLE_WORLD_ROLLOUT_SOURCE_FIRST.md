# Civication Sport Sportsledelse Role World rollout — source first

Dato: **2026-08-28**

## Canonical inngang

`data/Civication/roleWorldRolloutReadiness.json` på base `80948e39af158b1bfe7e0a10560633baac4c574e` velger eksplisitt `sport/sport_sportsledelse` som neste kontrollerte Role World-PR.

- classification: `rollout_ready`
- authored work required: `persistent_work_object` + `rhythm_waiting_handoff_rework` + `situated_reputation`
- cross-role: `candidate_when_shared_work_is_real`
- broad rollout-policy er grønn og eksisterende Scene Pipeline forblir canonical.

Denne PR-en skal lukke **kun** de tre readiness-gapene. Den skal ikke bygge ny kontraktsmotor, ny budsjettmotor, ny trener-/spillerlogistikkmotor eller utvide sportssjefens arbeidsgiverfullmakt.

## Eksisterende pakke som skal bevares

- role model: `data/Civication/roleModels/sport/sportssjef.json`
- work grammar: `data/Civication/workGrammars/sport/sport_sportsledelse.json`
- mail plan: `data/Civication/mailPlans/sport/sport_sportsledelse_plan.json`
- playability proof: `tests/civication-sport-sportsledelse-rollout-playability.test.js`
- eksisterende 8-stegs sportslig plan bevares uendret
- alle ni canonical mailtyper finnes allerede som authored sportssjef-scener.

Canonical myndighetsgrense skal forbli uendret:

- sportssjefen kan lede sportslig strategi og koordinering innen delegert mandat;
- sportssjefen kan forberede og gjennomføre rekrutterings-/bemanningsvalg når faktisk fullmakt dekker det;
- rollen kan ikke inngå eller avslutte kontrakter uten nødvendig arbeidsgiverfullmakt;
- rollen kan ikke utvide eget budsjett eller mandat;
- rollen kan ikke overstyre medisinsk fagansvar eller andre styringsrollers myndighet;
- Badge-status kan aldri skape stilling, signaturrett eller arbeidsgiverfullmakt.

## Eksakt provenance

Role World-en skal gjenbruke disse ni eksisterende scenene som canonical provenance:

1. `data/Civication/mailFamilies/sport/job/sport_sportsledelse_job.json#sport_sports_job_log_001`
2. `data/Civication/mailFamilies/sport/people/sport_sportsledelse_people.json#sport_sports_people_karin_001`
3. `data/Civication/mailFamilies/sport/conflict/sport_sportsledelse_conflict.json#sport_sports_conflict_trener_001`
4. `data/Civication/mailFamilies/sport/event/sport_sportsledelse_event.json#sport_sports_event_vindu_001`
5. `data/Civication/mailFamilies/sport/micro/sport_sportsledelse_micro.json#sport_sports_micro_fullmakt_001`
6. `data/Civication/mailFamilies/sport/story/sport_sportsledelse_story.json#sport_sports_story_halvaar_001`
7. `data/Civication/mailFamilies/sport/knowledge/sport_sportsledelse_knowledge.json#sport_sports_knowledge_alternativkostnad_001`
8. `data/Civication/mailFamilies/sport/followup/sport_sportsledelse_followup.json#sport_sports_followup_profil_001`
9. `data/Civication/mailFamilies/sport/consequence/sport_sportsledelse_consequence.json#sport_sports_consequence_profil_001`

Followup og consequence deler allerede continuity key `sport_sportsledelse.case.profilrekruttering_og_klubbmodell`; dette er den primære delayed anchor-en.

## Gap 1 — `persistent_work_object`

Det vedvarende arbeidsobjektet skal være **det sportslige beslutningssporet** gjennom et halvår og videre inn i neste overgangsvindu.

Arbeidsobjektet binder sammen:

- vedtatt klubbstrategi og faktisk sportslig modell;
- trener-/stabsevaluering med åpne kriterier og ansvarseier;
- spillerlogistikk og rekrutteringscase;
- budsjett-/lønnsrom og alternativkostnad;
- akademi- og utviklingsvei;
- eksplisitt fullmakt/signaturrett før bindende løfter;
- ventende evidens og neste beslutningspunkt;
- senere effekt av tidligere rekrutterings- og styringsvalg.

Arbeidsobjektet er editorial-only over eksisterende Scene Pipeline. Det er **ikke** en ny økonomi-, kontrakt-, CRM- eller spillerregistreringsruntime.

### Invarianter

- sportslig anbefaling og bindende klubbvedtak holdes adskilt;
- tidligere valg beholder synlig premiss, alternativkostnad og beslutningseier når konsekvensen kommer tilbake;
- stall, budsjett, akademi og trenerapparat kan ikke evalueres som helt isolerte systemer når samme valg påvirker dem sammen;
- rework skal bevare historikken og gjøre modellen mer presis, ikke omskrive tidligere valg for å beskytte standing;
- medisinsk, arbeidsgiver- og styremyndighet forblir hos faktisk rolle/eier.

## Gap 2 — `rhythm_waiting_handoff_rework`

Arbeidsrytmen skal materialisere waiting, handoff, rework, interruption og delayed consequence uten ny runtime state.

### Waiting

Legitim venting finnes når:

- trener-evaluering mangler avtalte kriterier/data;
- fullmakt eller signaturrett må bekreftes før tilbud;
- markedet er åpent, men rekrutteringscaset må sammenstilles med budsjett og akademivei;
- en utviklingsplan trenger faktisk spilletid eller et nytt observasjonsvindu før effekt kan vurderes.

Venting skal ha grunn, eier og hva som må bli sant før beslutningen kan gå videre.

### Handoff

Handoff skal bevare siste bekreftede status og faktisk myndighet mellom:

- sportssjef ↔ styreleder for større sportslige/styringsmessige valg;
- sportssjef ↔ daglig leder for arbeidsgiverfullmakt, budsjett og signaturrett;
- sportssjef ↔ speidersjef for rekrutteringsalternativer og scouting-evidens;
- sportssjef ↔ hovedtrener/stab for rolle, kampmetode og sportslig gjennomføring;
- sportssjef ↔ akademimiljø for utviklingsvei og overgang til seniornivå.

### Rework

Rework brukes når:

- rekrutteringsprofilen ikke lenger passer klubbmodellen;
- trener-/stabsrollen er sosialt rolig, men faglig uklar;
- stall- og utviklingsplan må rebalanseres etter tidligere signering;
- budsjett-/lønnsrom eller fullmakt endrer hva som faktisk kan gjennomføres;
- halvårsevalueringen viser avvik mellom uttalt strategi og faktiske valg.

### Interruption

Resultatkrise, markedsfrist, skade-/kapasitetsendring eller styrepress kan endre rekkefølgen, men hastegrad kan aldri skape kontraktsfullmakt, budsjett eller klinisk/medisinsk myndighet.

## Gap 3 — `situated_reputation`

Standing skal være audience-spesifikk og aldri global. Minst disse gruppene materialiseres:

1. **Styreleder/styre** — bryr seg om retning, beslutningsklarhet, risiko og om sportssjefen respekterer styrets beslutningsnivå.
2. **Daglig leder/arbeidsgiverlinje** — bryr seg om fullmakt, budsjett, arbeidsgiveransvar og om sportslige anbefalinger er gjennomførbare.
3. **Hovedtrener og stab** — bryr seg om arbeidsro, tydelige evalueringskriterier, rolleavklaring og om sportssjefen skiller støtte fra symbolsk inngrep.
4. **Speider-/rekrutteringsmiljø** — bryr seg om beslutningskvalitet, tydelig profil, alternativkostnad og om scouting brukes som evidens fremfor bekreftelse.
5. **Akademi/utviklingsmiljø** — bryr seg om reell utviklingsvei, spilletid og om kortsiktige kjøp faktisk beskytter eller blokkerer klubbmodellen.
6. **Spillere/stall** — bryr seg om rolleforutsigbarhet, sportslig rettferdighet og om rekruttering/evaluering gir sammenhengende forventninger.
7. **Supportere/offentlighet** — bryr seg om retning, resultat og troverdig forklaring, men kan ikke gi sportssjefen mandat til å bryte styringslinjer.
8. **Private relasjoner** — bryr seg om at resultatpress og prestisje ikke blir total privat identitet eller grunn til å bære klubbens konflikter hjem.

Standing kan divergere. Å fullføre en trener-evaluering før et dramatisk grep kan redusere kortsiktig standing hos supportere eller et utålmodig styremiljø, samtidig som trener/stab og daglig leder får større tillit til styringskvaliteten. Å avstå en profilspiller kan svekke kortsiktig markedssignal, men styrke akademi- og budsjettstanding.

Ingen audience kan gjennom standing gi sportssjefen signaturrett, budsjettfullmakt, arbeidsgiverkompetanse, medisinsk myndighet, kontraktsrett eller rett til å overta andre roller.

## Cross-role

Readiness markerer `candidate_when_shared_work_is_real`. Denne rollouten **materialiserer ikke** en ny cross-role-link.

Begrunnelse: trener, spiller, akademi og andre sport-roller finnes som reelle samarbeidsflater, men denne Role World-en trenger ikke en ny canonical delt runtime-state for å lukke de tre readiness-gapene. Cross-role kan materialiseres senere dersom et konkret shared work-object allerede er canonicalt delt mellom to Role Worlds.

## Role World-kontrakt

Materialiseringen skal:

- bruke schema `civication_role_world_v1` og status `role_world_complete`;
- ha 14 dager × fire faser = 56 unike beats;
- ha `materialization.authored_dimensions` lik nøyaktig `['persistent_work_object','rhythm_waiting_handoff_rework','situated_reputation']`;
- gjenbruke nøyaktig de ni canonical source refs over;
- bevare 8-stegs mailplan, role model, work grammar og Scene Pipeline;
- ha minst seks recurring archetypes, åtte slow axes, fem primary threads, fem private aftermath og seks delayed consequences;
- bruke `sport_sportsledelse.case.profilrekruttering_og_klubbmodell` som continuity anchor for delayed rekrutteringskonsekvens;
- ikke introdusere ny runtime, ny fullmaktsmotor, global reputation eller parallell sceneformat;
- ikke materialisere cross-role-link.

## Fail-closed proof

Permanent state kan først skrives etter:

1. TEMP materialisering;
2. scene-registry regeneration/check;
3. Career Gameplay Matrix regeneration/check;
4. rollout readiness regeneration/check;
5. `tests/civication-sport-sportsledelse-rollout-playability.test.js`;
6. ny strict Sportsledelse Role World-test;
7. Sport-utøver Role World precedent gate og de nyeste Psykologi Role World-portene;
8. generic Role World contract + broad rollout-policy;
9. full `npm run test:civication`;
10. TEMP workflow/materializer fjernet før permanent commit.

Etter materialisering skal readiness vise minst **26 complete/pilot**, maks **59 igjen**, Sportsledelse skal være fjernet fra køen, og testen skal ikke hardkode hvilket køhode som kommer etterpå.

Rollouten er ikke ferdig før exact-head PR-CI, SHA-låst merge og post-merge Main integrity + Pages er grønne på composed `main`.
