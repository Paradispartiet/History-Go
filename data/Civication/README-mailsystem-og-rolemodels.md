# Civication mailsystem og roleModels

Oppdatert: 2026-06-30

Dette dokumentet forklarer hvordan Civication-mailsystemet henger sammen med `badges.json`, `roleModels`, `mailPlans`, `mailFamilies`, runtime-lagene, state, UI, dagmotoren og History Go-koblingene.

Målet er å gjøre videre arbeid presist:

1. Forstå stillingen.
2. Definere stillingens historie.
3. Lage personer, arbeidsoppgaver, konflikter og faglige begreper.
4. Lage en dramaturgisk mailPlan.
5. Skrive konkrete mailFamilies som faktisk simulerer jobben.
6. La runtime, dagmotor, innboks, svar, psyke og konsekvenser spille sammen.

## Kort prinsipp

**Civication simulerer ikke CV-titler. Civication simulerer arbeidshverdager.**

**Hver rolle skal være en liten fortelling om hva arbeidet krever i praksis.**

Civication-mailer skal ikke bare være tilfeldige hendelser med valg. De skal være rollebaserte simuleringer.

Spilleren skal lære en stilling gjennom:

- arbeidsoppgaver
- faglige problemer
- miljø og institusjoner
- personer og relasjoner
- kunnskap
- press
- risiko
- konsekvenser
- identitet
- kollaps eller mestring

Hver jobb må derfor behandles som en liten fortelling.

En stilling er ikke bare en tittel. Den er et rom med folk, rutiner, makt, frister, konflikter, fagbegreper og personlige kostnader.

## Kort systemkjede

```text
badge tier
  -> roleModel
  -> mailPlan
  -> mailFamily
  -> MailRuntime / DailyMailBuilder / EventEngine
  -> MailEngine / inbox
  -> UI
  -> answer / state / psyche / capital / followup / outcome
```

Mer presist:

```text
data/badges.json
  -> data/Civication/roleModels/{category}/{role_scope}.json
  -> data/Civication/mailPlans/{category}/{role_scope}_plan.json
  -> data/Civication/mailFamilies/{category}/{mail_type}/{role_scope}_{mail_type}.json
  -> js/Civication/systems/civicationMailRuntime.js
  -> js/Civication/systems/civicationDailyMailBuilder.js
  -> js/Civication/systems/civicationMailEngine.js
  -> js/Civication/core/civicationEventEngine.js
  -> Civication UI / WorkdayPanel / inbox
  -> hg_civi_state_v1 / hg_civi_mail_v1 / hg_psyche_v1
```

## 1. badges.json: kilden til stillingene

`data/badges.json` og/eller badge-kategorifilene definerer kategorier og tier-labels.

Hver badge-kategori har `tiers`, og hver tier-label representerer en mulig stilling eller statusrolle i Civication.

Eksempel:

```text
By & arkitektur
  -> Beboer
  -> Nabolagsobservatør
  -> Byvandrer
  -> Rådgiver plan
  -> Arealplanlegger
  -> Byplanlegger
  -> Prosjektleder byutvikling
```

Disse tier-labelene brukes til å generere eller knytte `roleModels`, men genererte rollemodeller er bare startpunkt. De må forbedres manuelt før de brukes som kvalitetskilde for avanserte mailer.

## 2. roleModels: stillingens faglige og narrative grunnmodell

RoleModels ligger her:

```text
data/Civication/roleModels/{category}/{role_scope}.json
```

Manifestet ligger her:

```text
data/Civication/roleModels/manifest.json
```

Hver roleModel følger schema:

```text
civication_role_model_v1
```

En roleModel skal forklare hva stillingen er før vi lager mailene.

Den skal normalt inneholde:

```text
source
category
role_scope
role_id
title
core_narrative
work_life
career_path
required_knowledge
challenges
dilemmas
related_people
related_places
mail_integration
competence_axes
ideal_type_problems
notes
```

### Hva roleModel skal svare på

RoleModel er ikke en mail. Den er rollebibelen.

Den skal svare på:

- Hva gjør denne stillingen i hverdagen?
- Hvilke stereotype arbeidsoppgaver finnes i rollen?
- Hvilket fagfelt og hvilke begreper må spilleren lære?
- Hvilke miljøer, institusjoner og arbeidsformer finnes rundt rollen?
- Hvilke personer møter spilleren?
- Hvem hjelper, presser, manipulerer, forsinker eller utfordrer spilleren?
- Hvilke typiske konflikter oppstår?
- Hvilke dilemmaer definerer stillingen?
- Hva er rollens hovedplot?
- Hvilke karriereveier finnes videre?
- Hvilke mailtyper bør rollen mate: `job`, `micro`, `people`, `conflict`, `story`, `event`, `followup`, `knowledge`, `consequence`, `brand`, `faction_choice`?

### Regel

```text
Ikke skriv avanserte mailFamilies før roleModel finnes og er god nok.
```

Arbeidsrekkefølge:

```text
1. Forbedre roleModel-filen for stillingen.
2. Definer jobbens historie og hovedcase.
3. Definer personkart, konfliktkart og kompetanseakser.
4. Lag mailPlan.
5. Lag mailFamilies.
6. Valider at runtime finner alt.
```

## 3. mailPlans: stillingens dramaturgiske plan

MailPlans ligger her:

```text
data/Civication/mailPlans/{category}/{role_scope}_plan.json
```

En mailPlan definerer hvilken type simulering spilleren skal møte over tid. Den inneholder en `sequence` med steg.

Typiske stegtyper:

```text
job
people
conflict
story
event
faction_choice
brand
```

Hvert steg peker på `allowed_families`.

Eksempel:

```json
{
  "step": 1,
  "type": "job",
  "phase": "intro",
  "step_goal": "Lær hva som faktisk står på spill i rollen",
  "allowed_families": ["plankart_og_bestemmelser"],
  "fallback_types": ["job", "story"]
}
```

MailPlan skal ikke inneholde selve mailteksten. Den skal forklare progresjonen:

- Hva skal spilleren lære først?
- Når kommer faglig arbeid?
- Når kommer menneskene?
- Når kommer konflikt?
- Når kommer story/rolleidentitet?
- Når kommer event/krise/frister?
- Når kommer konsekvens?
- Hvilke familier kan brukes på hvert steg?

### MailPlan er plottet

MailPlan skal leses som en sesongplan.

Dårlig:

```text
step 1: job
step 2: conflict
step 3: event
```

Godt:

```text
step 1: Spilleren ser et tilsynelatende ryddig fagproblem.
step 2: Det viser seg at fagproblemet skjuler en målkonflikt.
step 3: En person presser saken fra én side.
step 4: En annen person avslører hva kartet ikke viser.
step 5: Konflikten må formuleres slik at den kan behandles politisk.
step 6: Frist eller krise tvinger spilleren til å velge presisjon eller tempo.
step 7: Juridisk/faglig etterprøving viser konsekvensen av tidligere valg.
step 8: Spilleren sender saken videre med et tydelig eller utydelig faglig spor.
```

## 4. mailFamilies: konkrete simuleringer

MailFamilies ligger her:

```text
data/Civication/mailFamilies/{category}/{mail_type}/{role_scope}_{mail_type}.json
```

Eksempel:

```text
data/Civication/mailFamilies/by/job/by_radgiver_plan_job.json
data/Civication/mailFamilies/by/people/by_radgiver_plan_people.json
data/Civication/mailFamilies/by/conflict/by_radgiver_plan_conflict.json
data/Civication/mailFamilies/by/story/by_radgiver_plan_story.json
data/Civication/mailFamilies/by/event/by_radgiver_plan_event.json
```

MailFamilies inneholder konkrete mailer. Disse skal være simuleringer, ikke bare meldinger.

En god mail bør ha:

```text
id
mail_type
mail_family
role_scope
phase
priority
from / sender / person_id
place_id
subject
summary
purpose
stakes
situation
task_domain
task_kind
competency
pressure
choice_axis
consequence_axis
narrative_arc
learning_focus
choices
next_bias
triggers_on_choice
```

### Standard for gode Civication-mails

Hver mail skal helst inneholde:

1. En konkret avsender eller institusjon.
2. En konkret arbeidsoppgave.
3. Et faglig problem.
4. Et miljø eller en organisasjon rundt problemet.
5. En reell beslutning under press.
6. To eller flere valg som ikke bare er rett/galt.
7. Konsekvenser for tillit, status, risiko, læring, kapital, kontroll eller psyke.
8. Et lite stykke kunnskap om stillingen.
9. En kobling til stillingens større narrative bue.

Dårlig standard:

```text
Du har et avvik. Velg om du vil være nøye eller rask.
```

God standard:

```text
Varekostnaden ligger 4,8 prosentpoeng over budsjett.
I driftssystemet finnes spor av kampanjer, feilplukk, svinn og innkjøp før prisendring.
Kommentarfeltet fra drift er tomt.
Rapporten kan sendes nå, men da blir tallet stående som forklaring i seg selv.
```

## 5. Mailtypene

Mailtypene bør forstås som dramatiske funksjoner, ikke bare tekniske kategorier.

| Mailtype | Funksjon i historien | Eksempel |
|---|---|---|
| `job` | Faglig hovedarbeid | Les plankart, vurder regnskap, skriv notat, analyser avvik |
| `micro` / `job_micro` | Små operative avklaringer | En rapportlinje, en frist, et vedlegg, et spørsmål |
| `people` | Personer som presser, hjelper eller manipulerer | Kollega, sjef, kunde, beboer, utbygger, jurist |
| `conflict` | Åpen målkonflikt | Tempo vs presisjon, boliger vs grøntdrag, salg vs kvalitet |
| `story` | Rolleidentitet og indre narrativ | “Du skjønner hva jobben egentlig gjør med deg” |
| `event` | Frist, møte, krise, behandling, deadline | Utvalgsmøte fredag, revisjonsfrist, presseoppslag |
| `followup` | Konsekvens av tidligere valg | Du valgte tempo; nå kommer klagen |
| `knowledge` | Læring eller History Go-kobling | Lær fagbegrep, sted, person, quiz, konflikt eller institusjon |
| `consequence` | Ettervirkning | Tillit opp/ned, juridisk risiko, autonomi, burnout |
| `faction_choice` | Retning/allianse | Bli faglig hard, politisk smidig, utbygger-nær, kontrollorientert |
| `brand` | Arbeidsgiver-/institusjonsspesifikk variant | Samme rolle i annen organisasjon får annen kultur |
| `lifeMails` | Privatliv/livssituasjon utenfor jobben | Kveld, økonomi, familie, slitasje, sosialt rom |

## 6. Runtime-lagene

### 6.1 CivicationRoleModelRuntime

Fil:

```text
js/Civication/systems/civicationRoleModelRuntime.js
```

Kobler mailer til roleModels.

Prinsipp:

```text
MailRuntime/EventEngine eier fortsatt mailflyten.
RoleModelRuntime legger faglig metadata på mailene som allerede velges.
Ingen økonomi, NAV, job offers eller UI endres her.
```

RoleModelRuntime gjør typisk dette:

1. Leser aktiv rolle fra `CivicationState.getActivePosition()`.
2. Prøver å finne riktig roleModel-fil.
3. Leser `data/Civication/roleModels/manifest.json`.
4. Dekorerer mail-pakken med roleModel-metadata.
5. Legger `role_model_meta` og `role_model_refs` på mailene når relevant.
6. Patcher `CivicationEventEngine.prototype.buildMailPool`, men endrer ikke selve mailflyten.

### 6.2 CivicationMailRuntime

Fil:

```text
js/Civication/systems/civicationMailRuntime.js
```

Dette er autoritativ jobbmailflyt.

Den gjør typisk dette:

1. Leser aktiv rolle.
2. Resolver `career_id` og `role_scope`.
3. Bygger path til mailPlan:

```text
data/Civication/mailPlans/${category}/${roleScope}_plan.json
```

4. Bygger paths til mailFamilies.
5. Laster mailFamilies etter type.
6. Filtrerer bort brukte mailer.
7. Velger kandidat basert på plansteg, familie og scoring.
8. Oppdaterer progresjon og consumed IDs.
9. Håndterer eventuelle thread-mails via `triggers_on_choice`.

MailRuntime velger hvilken jobbmail som skal komme.

### 6.3 CivicationDailyMailBuilder

Fil:

```text
js/Civication/systems/civicationDailyMailBuilder.js
```

Bygger én faktisk Civication-arbeidsdag fra:

```text
data/Civication/mailDayProgram.json
```

Prinsipp:

```text
MailRuntime = langsiktig rolleprogresjon
DailyMailBuilder = dagens spillbare rytme
mailDayProgram = dagsstruktur og volum
```

DailyMailBuilder eier dagsbunke og rytme. MailRuntime eier fortsatt langsiktig rolleprogresjon.

Bare dagens primære planmail skal normalt få `source_type: "planned"` og flytte rolePlan videre.

Micro-, followup-, knowledge-, consequence- og day_end-mails er dagsinnhold og skal ikke flytte rolePlan alene.

### 6.4 mailDayProgram

Fil:

```text
data/Civication/mailDayProgram.json
```

Definerer dagsrytmen.

Dagen er delt i faser og slots:

```text
morning
forenoon
workday
lunch
afternoon
dinner
evening
day_end
```

Eksempler på slots:

```text
morning_brief
first_message
preparation
day_goal_choice
primary_work_mail
operational_mail
people_ping
main_delivery
task_gate
conflict_or_event
analysis_followup
phase_lunch
informal_people_mail
phase_evening
learning_or_hobby
consequence_mail
relationship_or_status
plan_tomorrow
day_summary
score_summary
role_progress_summary
carryover
```

Målet er at en Civication-dag skal føles som en hel arbeidsdag: hovedoppgave, små driftsavklaringer, personer, konflikt, kunnskap, konsekvens og dagsoppsummering.

### 6.5 CivicationMailEngine

Fil:

```text
js/Civication/systems/civicationMailEngine.js
```

MailEngine eier mailstore/innboks.

Den håndterer:

```text
mail envelopes
pending/resolved/read/archive/delete
legacy mirror til hg_civi_inbox_v1
dedupe
answer-kobling mot EventEngine
maks antall lagrede mailer
```

MailEngine er ikke det samme som MailRuntime.

```text
MailRuntime velger hvilken mail som skal komme.
MailEngine lagrer og viser mailen som innboksobjekt.
```

### 6.6 CivicationEventEngine

Fil:

```text
js/Civication/core/civicationEventEngine.js
```

EventEngine er generisk hendelsesmotor.

Den brukes fortsatt for:

```text
generisk enqueue
answer/resolution
fallback-events
warning/fired/NAV-mails
gamle packs
state-overganger
choice effects
followup
obligation response
task completion
capital/psyche effects
```

Regel:

```text
EventEngine skal ikke ha egne utdaterte rolle-mappings som overstyrer resolveren.
```

### 6.7 CiviMailPlanBridge

Fil:

```text
js/Civication/mailPlanBridge.js
```

Dette er eldre bro og scoringlag mellom aktiv rolle, planfiler og mailfamilier.

Den bør ikke utvides ukritisk med nye sannheter hvis `CivicationMailRuntime` allerede gjør jobben.

Regel:

```text
Ikke legg ny hardkodet rollelogikk i mailPlanBridge hvis resolver/runtime kan eie den.
```

### 6.8 CivicationCareerRoleResolver

Fil:

```text
js/Civication/systems/civicationCareerRoleResolver.js
```

Skal være autoritativ for:

```text
role_scope
role_id
role_key
```

Regel:

```text
Ikke lag lokale ROLE_ID_BY_TITLE-mappinger i EventEngine, UI eller andre systemer.
Bruk resolveren.
```

### 6.9 CivicationRoleStarter og ActivePositionRecovery

Filer:

```text
js/Civication/systems/civicationRoleStarter.js
js/Civication/systems/civicationActivePositionRecovery.js
```

Disse må oppdateres hvis nye roller skal kunne startes eller recoveres direkte.

Starter setter aktiv posisjon, mail runtime-state, mail system-state og progresjon.

Recovery gjenoppretter aktiv rolle etter refresh/appstart ved hjelp av blant annet:

```text
active_role_key
mail_runtime_v1.role_plan_id
mail_system.role_plan_id
mail_plan_progress.role_plan_id
backup i localStorage
```

### 6.10 Life mails

Life-mails ligger her:

```text
data/Civication/lifeMails/
```

Runtime:

```text
js/Civication/systems/civicationLifeMailRuntime.js
```

Life-mails er ikke bundet til én jobbrolle på samme måte som jobbmailer. De handler om livssituasjoner, for eksempel:

```text
arbeidsledig
alkohol/risk
subkultur/skurk/kantliv
økonomi
familie
kveld
sosialt rom
slitasje
```

De skal fortsatt holdes adskilt fra roleModel-baserte jobbmailer.

## 7. Day/choice/faction/alliance-lag

Det finnes tilleggslag som kan påvirke valg, scoring og videre mailflyt:

```text
js/Civication/systems/day/dayChoiceDirector.js
js/Civication/systems/day/dayAllianceMailScoring.js
js/Civication/systems/day/dayFactionMailScoring.js
```

Disse brukes til å gjøre mailsystemet mer dynamisk:

- valg kan sette fraksjon eller retning
- mailer kan scores etter allianser/fiender
- mailer kan vekte bestemte konflikter eller identiteter
- personer kan få mer betydning basert på tidligere valg
- konfliktfamilier kan bli mer sannsynlige hvis spilleren har skapt press

Viktig:

```text
Disse lagene skal ikke definere stillingen fra bunnen.
De skal bruke roleModel, mailPlan og mailFamily som grunnlag.
```

## 8. State og localStorage

Viktige state-nøkler:

```text
hg_civi_state_v1
hg_civi_mail_v1
hg_civi_inbox_v1
hg_active_position_v1
hg_job_history_v1
hg_civi_calendar_v1
hg_civi_tasks_v1
hg_civi_task_results_v1
hg_psyche_v1
hg_capital_v1
mail_runtime_v1
mail_day_runtime_v1
life_mail_runtime_v1
mail_system
mail_plan_progress
narrative_state_v1
```

Prinsipp:

```text
State skal lagre hva spilleren har gjort.
Datafilene skal definere hva rollen og mailene er.
Runtime skal binde dem sammen.
UI skal vise state, ikke eie progresjonen.
```

Ikke hardkod progresjon i UI hvis den egentlig hører hjemme i `mailPlans`, `roleModels`, `mailFamilies` eller runtime.

## 9. Svar, konsekvens og progresjon

Når spilleren svarer på en mail:

1. UI svarer via `CivicationMailEngine.answerMail(mailId, choiceId)` når mulig.
2. MailEngine finner mailen.
3. MailEngine kaller `HG_CiviEngine.answer(eventId, choiceId)`.
4. EventEngine beregner choice-effect.
5. EventEngine kan endre score, strikes, stability, consumed events, identity tags, tracks, capital, task completion, obligation response, autonomy, lifestyle og psyche.
6. Mail markeres resolved hvis svaret lykkes.
7. Eventuelle followups, warnings eller fired-events kan enqueues.

Konsekvenssystemet er viktigere enn moral.

```text
Civication er ikke et moralsystem.
Det er et konsekvenssystem.
```

## 10. Standard arbeidsflyt for nye stillinger

Når en ny stilling skal få ordentlig mailspor:

### Steg 1: Finn badge og roleModel

Finn rollefil:

```text
data/Civication/roleModels/{category}/{role_scope}.json
```

Les den. Hvis den er generisk, forbedre den først.

### Steg 2: Skriv rollehistorien

Hver stilling skal ha en liten historie.

Minimum:

```text
Tittel
Hovedcase
Kjernefortelling
Daglige arbeidsoppgaver
Stereotype oppgaver
Faglige begreper
Arbeidsmiljø
Personkart
Konfliktkart
Dilemmaer
Kompetanseakser
Mulige utfall
```

### Steg 3: Definer personkart

Personer skal ikke bare være pynt. De skal ha funksjon.

For hver person:

```text
id
navn
rolle
relasjon til spilleren
hva personen vil
hva personen presser på
hva personen vet som andre ikke vet
hvilke mailtyper personen kan sende
hvilken konflikt personen aktiverer
```

### Steg 4: Definer konfliktkart

For hver rolle bør man skrive 4-8 konfliktakser.

Eksempel:

```text
tempo_vs_presisjon
fag_vs_politikk
lokal_kunnskap_vs_formell_prosess
økonomi_vs_kvalitet
kontroll_vs_tillit
synlighet_vs_integritet
```

### Steg 5: Lag mailPlan

Path:

```text
data/Civication/mailPlans/{category}/{role_scope}_plan.json
```

Planen skal ha en dramaturgisk bue.

Standardbue:

```text
intro
  -> første faglige oppgave
  -> første personpress
  -> åpen konflikt
  -> rolleidentitet/story
  -> frist eller event
  -> juridisk/faglig etterprøving
  -> konsekvens
  -> faglig spor videre / stagnasjon / fired / promotion
```

### Steg 6: Lag mailFamilies

Minimum for en spillbar rolle:

```text
job/{role_scope}_job.json
people/{role_scope}_people.json
conflict/{role_scope}_conflict.json
story/{role_scope}_story.json
event/{role_scope}_event.json
```

Anbefalt for en god rolle:

```text
micro/{role_scope}_micro.json
followup/{role_scope}_followup.json
knowledge/{role_scope}_knowledge.json
consequence/{role_scope}_consequence.json
faction_choice/{role_scope}_faction_choice.json
brand/{role_scope}_{brand}.json
```

### Steg 7: Koble History Go

Civication skal skape behovet. History Go skal være kunnskaps- og handlingsrommet.

Hovedregel:

```text
Civication skaper problemet.
History Go gir stedet, personen, kunnskapen, debatten eller oppgaven.
Civication mottar resultatet som task/progresjon/konsekvens.
```

Civication-task bør kunne peke til:

```text
placeId / place_id
personId / person_id
quizId
categoryId
emneId
debateId
conflictId
unlockId
storyId
```

### Steg 8: Valider

Sjekk minst:

```text
JSON parse
roleModel finnes
mailPlan finnes
allowed_families finnes som family.id
alle mailer har påkrevde felt
choices har minst to valg
role_scope matcher fil og plan
role_id/role_key matcher resolver/starter/recovery
mail_type matcher folder
people-mails har person_id der relevant
place-koblede mailer har place_id der relevant
```

## 11. Minimumsvolum per rolle

En rolle skal ikke bare ha 8 store mailer. Den skal kunne fylle en arbeidsdag og helst flere dager.

Anbefalt førsteversjon:

```text
job: 12-16
people: 8-12
conflict: 6-8
story: 6-8
event: 4-6
micro: 16-24
followup: 8-12
knowledge: 6-8
consequence: 6-8
```

For en 8-12 dagers rolle:

```text
long_role_mails: 24-36
medium_followups_or_conflicts: 32-48
micro_operational_mails: 64-96
people_or_status_mails: 24-36
phase_or_dayend_generated: true
```

Målet er ikke 20 store mailer hver dag. Målet er:

```text
3-5 store/medium mailer
mange små operative mailer
noen people/status-mails
noen followups/consequences
fase- og dagsluttinnhold
```

## 12. Hvordan en jobb blir en liten historie

For hver rolle skal vi planlegge på tre nivåer:

### 12.1 Rollefortelling

Dette er stillingens store historie.

Eksempel:

```text
Arealplanleggeren står mellom kartet, lovverket, bydelen, utbyggeren, naboene og politikerne.
Et område skal utvikles, men ingen er enige om hva byen egentlig trenger.
En linje på plankartet kan bety flere boliger, mindre sol, tryggere skolevei, høyere tomteverdi, mer trafikk, tapt grøntdrag eller juridisk risiko.
```

### 12.2 Saksfortelling

Dette er caset spilleren står i.

Eksempel:

```text
Lillebekk kvartal skal fortettes.
På papiret er det en ryddig reguleringssak.
I praksis kolliderer grøntdrag, skolevei, støy, overvann, parkering, utbyggerpress, naboprotester og politisk behandling.
```

### 12.3 Mailfortelling

Dette er scenene.

Hver mail er en liten scene:

```text
Noen vil noe.
Noe haster.
Et faglig problem ligger under.
Valget har en kostnad.
Konsekvensen kan komme senere.
```

Scenene trenger ikke oppfinnes fra bunnen for hver mail. FWG-laget `practice_stories` (se `docs/CIVICATION_WORK_GRAMMAR_STANDARD.md` → *FWG as Story Simulation*) inneholder ferdige, spillbare arbeidsscener med personer, sted, fagbegreper, konfliktakser og mulige followups. Nye `complete_reference_v2`-mails bør koble seg til en slik scene med et valgfritt felt:

```text
practice_story_id: barnet_slipper_ikke_handen
```

Dette er ikke påkrevd for legacy-mails, men gjør at thread-mailer, followups og konsekvenser kan spores tilbake til samme arbeidsscene — og at MailThreads-arbeidet senere kan skrive trådmailer som faktisk henger sammen.

## 13. Arealplanlegger: anbefalt plan

Dette er første tydelige modell for hvordan en rolle bør bygges som en liten historie.

### 13.1 Eksisterende filer

Arealplanlegger finnes allerede i følgende retning:

```text
data/Civication/roleModels/by/arealplanlegger.json
data/Civication/mailPlans/by/by_radgiver_plan_plan.json
data/Civication/mailFamilies/by/job/by_radgiver_plan_job.json
data/Civication/mailFamilies/by/people/by_radgiver_plan_people.json
data/Civication/mailFamilies/by/conflict/by_radgiver_plan_conflict.json
data/Civication/mailFamilies/by/story/by_radgiver_plan_story.json
data/Civication/mailFamilies/by/event/by_radgiver_plan_event.json
tests/civication-arealplanlegger-mail-plan.test.js
```

### 13.2 Viktig teknisk avklaring

Det finnes en navneforskyvning:

```text
roleModel:
  role_scope: arealplanlegger
  role_id: by_arealplanlegger
  role_key: by_radgiver_plan

mailPlan/mailFamilies/test:
  role_scope: by_radgiver_plan
```

Dette må enten standardiseres eller resolveren må eksplisitt eie koblingen.

Foreløpig bør `by_radgiver_plan` behandles som runtime-scope for mailPlan/mailFamilies, fordi eksisterende plan, familier og test bruker dette.

Regel:

```text
Ikke lag enda en lokal mapping for dette.
Avklar i CivicationCareerRoleResolver og hold roleModel/mailPlan/mailFamilies konsistente.
```

### 13.3 Tittel

```text
Linjen på kartet
```

### 13.4 Premiss

Du får ansvar for å ferdigstille planfaglig vurdering av Lillebekk kvartal.

På papiret er det en ryddig fortettingssak.

I praksis er det en kamp om hvem byen er til for.

### 13.5 Hovedplot

```text
Dag 1: Kartet ser ryddig ut.
Dag 2: Stedet motsier målbildet.
Dag 3: Utbyggeren vil ha signaler.
Dag 4: Naboene virker vanskelige, men har rett i én ting.
Dag 5: Grøntdrag, skolevei og støy krasjer.
Dag 6: Juristen finner svak hjemmel.
Dag 7: Politikerne vil ha enkel sak.
Dag 8: Du må formulere det faglige sporet.
Dag 9-12: Konsekvenser, klage, omkamp, tillit, stagnasjon eller opprykk.
```

### 13.6 Kjernefortelling

```text
Arealplanleggeren står mellom kartet, lovverket, bydelen, utbyggeren, naboene og politikerne.
Et område skal utvikles, men ingen er enige om hva byen egentlig trenger.
En linje på plankartet kan bety flere boliger, mindre sol, tryggere skolevei, høyere tomteverdi, mer trafikk, tapt grøntdrag eller juridisk risiko.
```

### 13.7 Daglige arbeidsoppgaver

Arealplanlegger-mailer bør simulere:

```text
lese plankart
lese planbestemmelser
vurdere arealformål
vurdere hensynssoner
vurdere rekkefølgekrav
lese ROS-tema
lese støy-/solstudier
vurdere overvann
vurdere grønnstruktur
vurdere skolevei
vurdere parkering og mobilitet
oppsummere høringsinnspill
skrive fagnotat
skrive saksframlegg
forberede medvirkningsmøte
svare utbygger
svare naboer
avklare med jurist
avklare med vei/vann/drift
forklare saken politisk
```

### 13.8 Personkart

| Person | Funksjon | Press |
|---|---|---|
| Plansjef | Vil ha saken ferdig og politisk lesbar | Tempo / styring |
| Utbygger | Vil ha signaler om høyde, parkering og volum | Framdrift / verdi |
| Beboerrepresentant | Skriver langt og sint, men har lokal kunnskap | Legitimitet / medvirkning |
| Byøkolog | Ser grøntdrag, jorddybde, flomvei og opphold | Langsiktig bykvalitet |
| Trafikk/skolevei | Ser barns faktiske ruter | Hverdagsrisiko |
| Planjurist | Ser svake bestemmelser og klagerisiko | Juridisk presisjon |
| Utvalgssekretær | Trenger politisk lesbar sak | Demokratisk formidling |
| Plankonsulent | Vil selge plankartet som ryddig | Profesjonelt press |
| Vei/vann/drift | Ser praktiske følgefeil | Gjennomførbarhet |

### 13.9 Konfliktkart

Arealplanlegger bør ha minst disse konfliktaksene:

```text
kart_vs_levd_nabolag
boligbehov_vs_grontstruktur
utbyggerpress_vs_offentlig_integritet
medvirkning_vs_framdrift
juridisk_presisjon_vs_politisk_tempo
teknisk_losning_vs_hverdagsrisiko
faglig_risiko_vs_politisk_valg
fortetting_vs_hverdagskvalitet
```

### 13.10 Kompetanseakser

```text
plankartforståelse
juridisk_presisjon
arealavveiing
medvirkning
tverrfaglig_koordinering
politisk_lesbarhet
stedsanalyse
overvann_og_gronnstruktur
mobilitet_og_skolevei
```

## 14. Arealplanlegger: narrative mailbuer

### 14.1 “Kartet lyver ikke, men det tier”

Introfortelling.

Spilleren lærer at plankartet kan være formelt korrekt og likevel skjule hverdagskonsekvenser.

Mailtyper:

```text
job
story
knowledge
micro
```

Eksempel:

```text
Fra: Plansjef
Emne: Målbildet sier aktivt byliv, men stedet viser gjennomfart

Bestillingen ber om aktivt byliv.
Kart, tellinger og befaring viser først og fremst folk i bevegelse gjennom området.
Du kan skrive dette positivt, men da mister saken det stedet faktisk gjør i dag.

A: Skriv tydelig at stedet primært fungerer som gjennomfart.
B: Vinkle analysen mot potensial for byliv.
```

### 14.2 “Alle gode formål får ikke plass”

Arealavveiingsfortelling.

Boliger, grøntdrag, varelevering, skolevei, støy, overvann og byliv er alle legitime. Men arealet er begrenset.

Mailtyper:

```text
job
conflict
followup
consequence
```

Eksempel:

```text
Fra: Byøkolog
Emne: Bolig, grøntdrag og varelevering vil bruke samme kant

Boligprosjektet trenger inngangssone.
Grøntgrepet trenger jorddybde og sammenheng.
Driften trenger varelevering uten å blokkere fortauet.
Alle tre formålene er legitime. De får bare ikke plass samtidig.

A: Beskriv konflikten tydelig og anbefal prioritet.
B: Foreslå fleksibelt kompromiss.
```

### 14.3 “Den irriterende nabomailen har ett sant punkt”

Medvirkningsfortelling.

Spilleren må lære at medvirkning ikke bare er folk som klager. Det er ofte støyende, langt, emosjonelt og upresist, men kan inneholde lokal kunnskap som kartet mangler.

Mailtyper:

```text
people
knowledge
conflict
followup
```

Eksempel:

```text
Fra: Hanne Mo, beboerrepresentant
Emne: Den lange nabomailen har faktisk ett avgjørende poeng

Mailen er for lang.
Den blander parkering, sol, barnevogner, renovasjon og mistillit til kommunen.
Men midt i teksten ligger en faktisk skolevei som ikke vises i plankartet.

A: Løft skoleveien inn i saksgrunnlaget.
B: Svar formelt på høringsinnspillet og gå videre.
```

### 14.4 “Utbyggeren spør ikke om lov, han spør om signal”

Integritetsfortelling.

Utbyggeren vil ha tidlige signaler. Ikke nødvendigvis korrupt, men tempoet forsøker å gjøre offentlig planbehandling til en servicefunksjon for prosjektet.

Mailtyper:

```text
people
conflict
faction_choice
consequence
```

Eksempel:

```text
Fra: Ivar Kranstad
Emne: Kan vi få et signal før nabomøtet?

Vi trenger bare å vite om høyde og parkering er innenfor.
Ikke et formelt ja.
Bare et signal, så vi ikke bruker tid på feil alternativ.

A: Si at kommunen ikke gir forhåndssignal før fagnotatet er ferdig.
B: Gi et uformelt signal med forbehold.
```

### 14.5 “Støyskjermen løser én ting og ødelegger en annen”

Tverrfaglig konflikt.

En teknisk løsning kan gjøre saken verre sosialt. Støyskjerm kan hjelpe fasadeverdier, men gjøre skoleveien mørkere, smalere og mer utrygg.

Mailtyper:

```text
conflict
event
followup
knowledge
```

Eksempel:

```text
Fra: Trafikk/skolevei
Emne: Støyskjermen løser én ting og ødelegger en annen

Støyskjermen demper fasadestøy.
Men den gjør barnas snarvei mørkere og smalere.
Teknisk sett er ett krav bedre.
Hverdagsmessig kan området bli dårligere.

A: Krev ny samlet vurdering av støy, trygghet og skolevei.
B: Godta støygrepet og legg inn avbøtende tiltak.
```

### 14.6 “Politisk lesbarhet uten å skjule faglig risiko”

Sluttfortelling.

Utvalget trenger et saksframlegg som kan forstås. Men forenkling må ikke gjøre risiko usynlig.

Spilleren må skille:

```text
hva er faglig risiko?
hva er juridisk risiko?
hva er politisk valg?
hva er administrasjonens anbefaling?
hva er reelt alternativ?
```

Mailtyper:

```text
event
story
consequence
job
```

Eksempel:

```text
Fra: Utvalgssekretær
Emne: Hva er egentlig det politiske valget her?

Politikerne forstår at saken er komplisert.
Men de trenger ikke alle fagdetaljer.
De trenger å vite hva de faktisk velger bort.

A: Lag en tydelig tabell: bolig, grøntdrag, skolevei, støy, juridisk risiko.
B: Skriv en kort anbefaling med mer teknisk vedlegg.
```

## 15. Arealplanlegger: anbefalt mailPlan

Eksisterende plan har 8 hovedsteg. Den bør leses slik:

```text
1. Plankart og bestemmelser
   -> spilleren lærer at kartet ser ryddigere ut enn virkeligheten

2. Arealbruk og prioritering
   -> spilleren lærer at alle gode formål ikke får plass

3. Aktører og press
   -> utbygger, naboer og interne fagfolk vil ulike ting

4. Grøntdrag, skolevei og støy
   -> den åpne arealkonflikten blir synlig

5. Linjen på kartet
   -> rolleidentiteten oppstår: en linje er et politisk/faglig valg

6. Frist for utvalg
   -> saken må gjøres lesbar under tidspress

7. Rekkefølgekrav og juss
   -> intensjoner må bli håndhevbare bestemmelser

8. Faglig spor videre
   -> spilleren sender saken videre, men konsekvensene følger med
```

## 16. Arealplanlegger: anbefalt mailfamilie-struktur

Minimum:

```text
job:
  stedsanalyse_og_malbildet
  arealbruk_og_prioritering
  medvirkning_og_planfag
  rekkefolgekrav_og_juss

people:
  aktorer_og_press
  interne_fagmiljoer
  politisk_lesbarhet

conflict:
  grontdrag_skolevei_stoy
  utbyggerpress_og_integritet
  kart_vs_levd_nabolag

story:
  linjen_pa_kartet
  planleggerens_integritet
  kartet_er_ikke_noytralt

event:
  frist_for_utvalg
  nabomote
  politisk_behandling
  klage_eller_omkamp

micro:
  plankart_avklaringer
  vedlegg_og_figurer
  korte_interne_svar
  kalender_og_moter

followup:
  tempo_ble_risiko
  presisjon_ble_friksjon
  lokal_kunnskap_endret_saken
  utbygger_signal_kommer_tilbake

knowledge:
  reguleringsplan
  hensynssone
  rekkefolgekrav
  medvirkning
  overvann
  stoy
  skolevei

consequence:
  tillit_i_planavdeling
  juridisk_risiko
  politisk_uro
  faglig_integritet
  burnout_eller_autonomi
```

## 17. Arealplanlegger: History Go-koblinger

Arealplanlegger bør kobles til History Go gjennom steder, begreper, personer og debatter.

Mulige place targets:

```text
radhuset_planavdeling
oslo_planomrade_indre_by
grontdrag_lillebekk
skolevei_lillebekk
kollektivknutepunkt_bryn
politisk_utvalg_moterom
gis_plankart_arbeidsflate
```

Mulige knowledge targets:

```text
reguleringsplan
arealformål
hensynssone
rekkefølgekrav
planbestemmelser
ROS-analyse
medvirkning
støy
sol/skygge
overvann
grønnstruktur
parkering
kollektivdekning
skolevei
```

Mulige History Go-oppgaver:

```text
Åpne stedet i History Go.
Les stedskontekst.
Ta quiz om reguleringsplan.
Lås opp begrep om hensynssone.
Les person-/institusjonskort om planavdeling.
Delta i debatt om fortetting vs grøntdrag.
Fullfør task før bedre svaralternativ gir full effekt.
```

## 18. Arealplanlegger: konsekvensmodell

Typiske valg og konsekvenser:

| Valgstil | Kort effekt | Senere risiko | Psyke/rolle |
|---|---|---|---|
| Faglig presisjon | Øker tillit hos fagmiljø | Mer friksjon med utbygger/politikk | Mer integritet, mer synlighet |
| Tempo og smidighet | Saken går raskere | Klage, svak juss, svakere tillit | Mindre integritet, mer risiko |
| Politisk forenkling | Lettere behandling | Reell konflikt skjules | Mer synlighet, mindre autonomi |
| Medvirkning tas alvorlig | Bedre lokalkunnskap | Forsinkelse og irritasjon | Mer tillit, lavere tempo |
| Utbyggerdialog blir for tett | Kortvarig framdrift | Integritets- og habilitetsfølelse | Lavere autonomy / høyere burnout |

## 19. Arealplanlegger: validator-krav

Testen bør sikre:

```text
roleModel finnes
mailPlan finnes
mailFamilies finnes for job, people, story, conflict, event
allowed_families finnes som family.id
people-mails har bred cast
DailyMailBuilder kan bygge full dag
runtime dekker morning, forenoon, workday, lunch, afternoon, dinner, evening, day_end
runtime inkluderer flere mail_type
ingen debug gaps for people/story/conflict/event/lunsj/kveld
```

Dette finnes allerede delvis i:

```text
tests/civication-arealplanlegger-mail-plan.test.js
```

## 20. Generelle regler fremover

1. Les kildefilene før endring.
2. Ikke gjett schema.
3. Ikke lag quick-fix i UI for dataproblemer.
4. RoleModel først, mailFamily etterpå.
5. Hver jobb skal ha en historie.
6. Hver rolle skal ha et personkart.
7. Hver rolle skal ha et konfliktkart.
8. Hver rolle skal ha et hovedcase.
9. Resolveren eier rolleidentitet.
10. MailPlan eier dramaturgisk progresjon.
11. MailFamily eier konkrete situasjoner.
12. MailRuntime eier valg av neste jobbmail.
13. DailyMailBuilder eier dagens rytme.
14. MailEngine eier innboks/lagring.
15. EventEngine eier generisk hendelsesflyt/fallback/svar.
16. LifeMailRuntime eier livshendelser utenfor jobbspor.
17. Day/faction/alliance-lag scorer og vekter. De skal ikke definere rollen fra bunnen.
18. History Go skal være kunnskaps- og handlingsrommet.
19. Valider JSON og family-koblinger etter hver strukturelle endring.
20. Ikke bygg ny motor hvis eksisterende runtime kan løse problemet med bedre data.

## 21. Kort arkitekturdiagram

```text
badges.json
  ↓
roleModels/manifest.json
  ↓
roleModels/{category}/{role_scope}.json
  ↓
CivicationRoleModelRuntime
  ↓
mailPlans/{category}/{role_scope}_plan.json
  ↓
mailFamilies/{category}/{type}/{role_scope}_{type}.json
  ↓
CivicationMailRuntime
  ↓
CivicationDailyMailBuilder + mailDayProgram.json
  ↓
CivicationIncomingFlow / CivicationMailEngine
  ↓
Civication UI inbox + WorkdayPanel + dayphase HUD
  ↓
player choice
  ↓
CivicationEventEngine answer/resolution
  ↓
dayChoiceDirector / dayConsequences / task/capital/psyche effects
  ↓
CivicationCareerOutcomeRuntime
  ↓
promotion / stagnation / fired / next-day carryover
```

## 22. Hurtigsjekk i konsoll

Bruk disse før nye endringer hvis problemet gjelder dagflyt, mailrekkefølge, kanalblanding, progresjon, outcome eller manglende dagslutt.

```js
CivicationDailyMailBuilder.inspect()
```

```js
CivicationDailyMailBuilder.inspectNarratives()
```

```js
CivicationMailRuntime.inspect()
```

```js
CivicationRoleModelRuntime.inspect()
```

```js
CivicationIncomingFlow.inspect()
```

```js
CivicationCareerOutcomeRuntime?.inspect?.()
```

## 23. Arbeidsregel for neste rolle

Når neste rolle skal bygges, start med denne korte malen:

```text
Rolle:
Hovedcase:
Tittel på minifortelling:
Kjernefortelling:
Daglige arbeidsoppgaver:
Personkart:
Konfliktkart:
Kompetanseakser:
MailPlan 8-12 steg:
MailFamilies:
History Go targets:
Konsekvensmodell:
Validator:
```

Hvis dette ikke kan fylles ut, er rollen ikke klar for avanserte mailer.

- Rollepakker skal ikke kopiere valgpar på tvers av ulike people-mails uten at begge mailene eksplisitt har `shared_choice_pair: true`.
