# Civication Psykologi / Miljøarbeid — Role World rollout, source-first

Dato: **2026-08-28**

## Scope

Denne rollouten materialiserer den canonicale rollen `psykologi/psykologi_miljoarbeid` som en komplett 14-dagers Role World i eksisterende Scene Pipeline.

Readiness før arbeidet:

- classification: `rollout_ready`
- authored work required: `persistent_work_object` + `situated_reputation`
- cross-role: `candidate_when_shared_work_is_real`
- existing career runtime gate: grønn

Denne PR-en skal derfor forfatte **nøyaktig de to manglende realisme-dimensjonene**. Den skal ikke utvide motoren, gi miljøarbeideren klinisk myndighet eller omskrive den eksisterende menneskearbeidspiloten til et annet mailforløp.

## Canonicale fundament som skal bevares

- `data/Civication/roleModels/psykologi/psykologi_miljoarbeid.json`
- `data/Civication/workGrammars/psykologi/psykologi_miljoarbeid.json`
- `data/Civication/mailPlans/psykologi/psykologi_miljoarbeid_plan.json`

Mailplanen forblir den eksisterende firetrinnspiloten:

1. `job` → `psykologi_miljoarbeid_vaktstart`
2. `people` → `psykologi_miljoarbeid_autonomi`
3. `conflict` → `psykologi_miljoarbeid_fortrolighet`
4. `event` → `psykologi_miljoarbeid_eskalering`

Role World-en skal ikke late som planen allerede er en ni-trinns karrierebue. Den lengre kontinuiteten bindes redaksjonelt rundt de canonicale scenene som allerede finnes etter pilotsekvensen.

## Canonicale source refs

Nøyaktig sju eksisterende Miljøarbeid-scener brukes som materialiseringsprovenance:

1. `data/Civication/mailFamilies/psykologi/job/psykologi_miljoarbeid_job.json#psykologi_miljoarbeid_job_vaktstart`
2. `data/Civication/mailFamilies/psykologi/people/psykologi_miljoarbeid_people.json#psykologi_miljoarbeid_people_autonomi`
3. `data/Civication/mailFamilies/psykologi/conflict/psykologi_miljoarbeid_conflict.json#psykologi_miljoarbeid_conflict_fortrolighet`
4. `data/Civication/mailFamilies/psykologi/event/psykologi_miljoarbeid_event.json#psykologi_miljoarbeid_event_eskalering`
5. `data/Civication/mailFamilies/psykologi/knowledge/psykologi_miljoarbeid_knowledge.json#psykologi_miljoarbeid_knowledge_dokumentasjon`
6. `data/Civication/mailFamilies/psykologi/followup/psykologi_miljoarbeid_followup.json#psykologi_miljoarbeid_followup_fagkontakt`
7. `data/Civication/mailFamilies/psykologi/consequence/psykologi_miljoarbeid_consequence.json#psykologi_miljoarbeid_consequence_neste_vakt`

Det opprettes ingen fiktiv `story`- eller `micro`-kilde bare for å fylle en typekvote.

## Authored dimension 1: persistent work object

Det vedvarende arbeidsobjektet er **Elias-sporet i overlevering og oppfølging**: én redaksjonell arbeidsflate som bæres mellom vakter uten ny runtime-state.

Arbeidsobjektet skal holde disse delene eksplisitt adskilt:

- `observable_facts` — hva miljøarbeideren faktisk så/hørte
- `person_voice` — Elias sine egne ord, valg og prioriteringer
- `support_action` — hvilken støtte/deeskalering/tilrettelegging som faktisk ble prøvd
- `uncertainty` — hva rollen ikke vet og ikke kan diagnostisere
- `escalation_owner` — hvem som faktisk eier neste sikkerhetsmessige eller kliniske vurdering
- `next_shift_watch` — hva neste vakt konkret skal følge med på
- `repair_trace` — hvordan stigmatiserende språk eller dårlig overlevering korrigeres uten å late som konsekvensen forsvinner straks

Livsløpet gjennom Role World-en er:

**presis vaktstart → autonomistøtte → fortrolighetsgrense → deeskalering/eskalering → nøytral dokumentasjon → faglig overlevering → neste-vakt-konsekvens → reparasjon → ny observasjon.**

Ansvar skal forbli fordelt:

- miljøarbeideren eier observasjon, støtte, grensesetting, deeskalering og konkret dokumentasjon innen egen rolle
- Elias eier egne valg, opplevelser og personlige mål
- teamleder eier lokal drift/sikkerhetskoordinering der dette faktisk ligger i lederrollen
- psykologfaglig kontakt eller annen riktig fagperson eier klinisk vurdering når saken krever det
- neste vakt eier sin nye observasjon og skal ikke arve tidligere merkelapper som sikre fakta

## Authored dimension 2: situated reputation

Standing skal være audience-spesifikk, aldri én global prestisjescore.

Minst disse publikumsflatene skal skilles:

- `service_user` — Elias: autonomi, respekt, åpenhet om grenser og hva som deles
- `experienced_colleague` — erfaren kollega: praktisk nytte uten at erfaring blir diagnosefasit
- `team_lead` — teamleder: trygg drift, presise observasjoner og riktig eskalering
- `psychologist_contact` — psykologfaglig kontakt: nyttig situasjonskunnskap uten pseudo-klinisk overstyring
- `next_shift` — neste vakt: etterprøvbar overlevering som ikke stempler personen
- `relatives` — pårørende/nærstående: respektfullt samarbeid uten at standing gir tilgang til informasjon eller beslutningsmyndighet

Standing kan aldri gi miljøarbeideren rett til å:

- stille diagnose
- drive psykoterapi på eget ansvar
- endre behandling
- framstille antakelser som kliniske vurderinger
- love hemmelighold når sikkerhetsplikt eller arbeidsrutiner krever eskalering
- dele opplysninger fordi en kollega, leder eller pårørende har høy status eller tillit

## Cross-role

Readiness sier `candidate_when_shared_work_is_real`, ikke `required_for_rollout`.

Psykologfaglig kontakt finnes allerede som en intern, fiktiv samarbeidsaktør i canonical Miljøarbeid-kildene. Denne PR-en materialiserer derfor **ikke** en ny cross-role runtime-kobling. En senere canonical cross-role-link skal bare opprettes dersom et genuint delt arbeidsobjekt mellom to canonicale karrierer faktisk skal leve i runtime.

## Completion proof

Før permanent commit skal fail-closed-gaten bevise:

- 14 dager × 4 faser = 56 unike beats
- substansiell tekst og canonical provenance på hvert beat
- persistent work object med eksplisitt feltmodell, livsløp og ansvarseiere
- minst fem primærtråder med 5–10 beats hver
- minst fem private aftermath-beats og seks forsinkede konsekvenser
- situert standing hos minst seks separate audiences, uten global reputation-score
- nøyaktig de sju canonicale mail-refene over
- eksisterende firetrinns mailplan uendret
- Psychology entry career ladder fortsatt grønn
- authority-boundary mot diagnose, terapi, behandlingsendring og ubegrunnet hemmelighold fortsatt intakt
- Role World-kontrakt og controlled broad-rollout-policy fortsatt grønne
- scene registry, career gameplay matrix og rollout readiness regenerert uten drift
- full Civication-suite grønn
- TEMP-materializer og TEMP-workflow fjernet før permanent commit
