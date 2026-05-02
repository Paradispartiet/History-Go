# Civication mailsystem og roleModels

Dette dokumentet forklarer hvordan Civication-mailsystemet henger sammen med `badges.json`, `roleModels`, `mailPlans`, `mailFamilies`, runtime-lagene, state og UI. Målet er å gjøre videre arbeid presist: først forstå stillingen, deretter bygge simuleringer av stillingens faktiske utfordringer.

## Kort prinsipp

Civication-mailer skal ikke bare være tilfeldige hendelser med valg. De skal være rollebaserte simuleringer. Spilleren skal lære en stilling gjennom arbeidsoppgaver, faglige problemer, miljø, personer, kunnskap, press, risiko og konsekvenser.

Den riktige arbeidsrekkefølgen er:

1. `data/badges.json` definerer kategorier og tier-labels.
2. `data/Civication/roleModels/` gir hver stilling en faglig og narrativ modell.
3. `data/Civication/mailPlans/` definerer stillingens dramaturgiske progresjon.
4. `data/Civication/mailFamilies/` inneholder konkrete mail-simuleringer.
5. Runtime-lagene velger, dekorerer, viser og besvarer mailer.
6. State/localStorage lagrer progresjon, aktive roller, brukte mailer og konsekvenser.

Kort sagt:

```text
badge tier -> roleModel -> mailPlan -> mailFamily -> MailRuntime/EventEngine -> MailEngine/inbox -> UI -> answer/state
```

## 1. badges.json: kilden til stillingene

`data/badges.json` er øverste kilde for kategorier og stillingsstiger. Hver badge-kategori har `tiers`, og hver tier-label representerer en mulig stilling eller statusrolle i Civication.

Eksempel fra Næringsliv:

```text
Ekspeditør / butikkmedarbeider
Lager- og driftsmedarbeider
Fagarbeider
Controller
Finansanalytiker
Mellomleder
...
```

Disse tier-labelene ble brukt til å generere `roleModels`.

## 2. roleModels: stillingens faglige og narrative grunnmodell

RoleModels ligger her:

```text
data/Civication/roleModels/{category}/{role_scope}.json
```

Manifestet ligger her:

```text
data/Civication/roleModels/manifest.json
```

Strukturen ble opprettet fra `badges.json` med ett roleModel-dokument per tier-label. Det finnes 244 rollefiler + manifest.

Hver roleModel følger schema:

```text
civication_role_model_v1
```

En roleModel skal forklare hva en stilling er før vi lager mailene. Den skal normalt inneholde:

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

### Hva roleModel skal brukes til

RoleModel er ikke en mail. Den er grunnmodellen som mailene skal bygge på.

Den skal svare på:

- Hva gjør denne stillingen i hverdagen?
- Hvilket fagfelt og hvilke begreper må spilleren lære?
- Hvilke miljøer, institusjoner og arbeidsformer finnes rundt rollen?
- Hvilke typiske konflikter oppstår?
- Hvilke dilemmaer definerer stillingen?
- Hvilke karriereveier finnes videre?
- Hvilke mailtyper bør rollen mate: `job`, `conflict`, `story`, `event`, `people`, `brand`, `faction_choice`?

Eksempel:

```text
Controller skal ikke bare ha mailer om tall.
RoleModel må forklare controllerens verden:
- avviksanalyse
- internkontroll
- periodisering
- lagerverdi
- revisjonsspor
- budsjett/prognose
- tall som sosial makt
- kontroll som støtte vs overvåking
```

```text
Finansanalytiker skal ikke bare ha mailer om penger.
RoleModel må forklare analytikerens verden:
- datakvalitet
- historiske tall vs estimater
- modellrisiko
- EBITDA/marginer
- multipler og peer group
- scenarioanalyse
- investeringsnotat
- kapitalfortelling
- analyse som ansvar
```

## 3. civicationRoleModelRuntime.js

Filen:

```text
js/Civication/systems/civicationRoleModelRuntime.js
```

kobler mailer til roleModels.

Viktig prinsipp i filen:

```text
MailRuntime/EventEngine eier fortsatt mailflyten.
RoleModelRuntime legger bare faglig metadata på mailene som allerede velges.
Ingen økonomi, NAV, job offers eller UI endres her.
```

RoleModelRuntime gjør dette:

1. Leser aktiv rolle fra `CivicationState.getActivePosition()`.
2. Prøver å finne riktig roleModel-fil.
3. Leser `data/Civication/roleModels/manifest.json`.
4. Dekorerer mail-pakken med roleModel-metadata.
5. Legger `role_model_meta` og `role_model_refs` på mailene når relevant.
6. Patcher `CivicationEventEngine.prototype.buildMailPool`, men endrer ikke selve mailflyten.

RoleModelRuntime har blant annet:

```text
resolveRoleModelPath(active)
loadRoleModel(active)
decorateMail(mail, active, roleModel)
decoratePack(pack, active)
inspect()
```

### Viktig begrensning

RoleModels ble først generert automatisk. Mange av dem er derfor generiske. De må forbedres manuelt før de brukes som kvalitetskilde for avanserte mailer.

Derfor er standarden fremover:

```text
1. Forbedre roleModel-filen for stillingen.
2. Deretter forbedre mailPlans og mailFamilies.
3. Ikke skriv avanserte mailer uten at roleModel finnes eller oppdateres.
```

## 4. mailPlans: stillingens dramaturgiske plan

MailPlans ligger her:

```text
data/Civication/mailPlans/{category}/{role_scope}_plan.json
```

Eksempel:

```text
data/Civication/mailPlans/naeringsliv/controller_plan.json
data/Civication/mailPlans/naeringsliv/finansanalytiker_plan.json
```

En mailPlan definerer hvilken type simulering spilleren skal møte over tid. Den inneholder en `sequence` med steg.

Typiske stegtyper:

```text
job
conflict
story
event
people
brand
faction_choice
```

Hvert steg peker på `allowed_families`.

Eksempel:

```json
{
  "step": 1,
  "type": "job",
  "phase": "intro",
  "allowed_families": ["controller_intro_v2"],
  "fallback_types": ["job", "conflict", "story"]
}
```

MailPlan skal ikke inneholde selve mailteksten. Den skal forklare progresjonen:

- Hva skal spilleren lære først?
- Når kommer konflikt?
- Når kommer story/rolleidentitet?
- Når kommer event/krise/frister?
- Hvilke familier kan brukes på hvert steg?

## 5. mailFamilies: konkrete simuleringer

MailFamilies ligger her:

```text
data/Civication/mailFamilies/{category}/{mail_type}/{role_scope}_{mail_type}.json
```

Eksempel:

```text
data/Civication/mailFamilies/naeringsliv/job/controller_intro_v2.json
data/Civication/mailFamilies/naeringsliv/job/controller_job.json
data/Civication/mailFamilies/naeringsliv/conflict/controller_conflict.json
data/Civication/mailFamilies/naeringsliv/story/controller_story.json
data/Civication/mailFamilies/naeringsliv/event/controller_event.json
```

MailFamilies inneholder konkrete mailer. Disse skal være simuleringer, ikke bare meldinger.

En god mail bør ha:

```text
id
mail_type
mail_family
role_scope
subject
summary
purpose
stakes
situation
task_domain
competency
pressure
choice_axis
consequence_axis
narrative_arc
learning_focus
choices
```

### Standard for gode Civication-mails

Hver mail skal helst inneholde:

1. En konkret avsender eller institusjon.
2. En konkret arbeidsoppgave.
3. Et faglig problem.
4. Et miljø eller en organisasjon rundt problemet.
5. En reell beslutning under press.
6. To eller flere valg som ikke bare er rett/galt.
7. Konsekvenser for tillit, status, risiko, læring, kapital eller kontroll.
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

## 6. CivicationMailRuntime: autoritativ jobbmailflyt

Filen:

```text
js/Civication/systems/civicationMailRuntime.js
```

har ansvar for den autoritative jobbmailflyten.

Den gjør typisk dette:

1. Leser aktiv rolle.
2. Resolver `career_id` og `role_scope`.
3. Bygger path til mailPlan:

```text
data/Civication/mailPlans/${category}/${roleScope}_plan.json
```

4. Bygger path til intro-family:

```text
data/Civication/mailFamilies/${category}/job/${roleScope}_intro_v2.json
```

5. Laster øvrige mailFamilies etter type.
6. Filtrerer bort brukte mailer.
7. Velger kandidat basert på plansteg, familie og scoring.
8. Oppdaterer progresjon og consumed IDs.
9. Håndterer eventuelle thread-mails via `triggers_on_choice`.

MailRuntime er altså laget som hovedsystemet for jobbmailer.

## 7. CiviMailPlanBridge: eldre bro og scoringlag

Filen:

```text
js/Civication/mailPlanBridge.js
```

finnes fortsatt som bro mellom aktiv rolle, planfiler og mailfamilier. Den har også scoring- og fallbacklogikk.

Den bør ikke utvides ukritisk med nye sannheter hvis `CivicationMailRuntime` allerede gjør jobben. På sikt bør den brukes som kompatibilitetslag eller ryddes slik at én runtime eier jobbmailflyten.

Regel:

```text
Ikke legg ny hardkodet rollelogikk i mailPlanBridge hvis resolver/runtime kan eie den.
```

## 8. CivicationCareerRoleResolver: autoritativ rolle-resolusjon

Filen:

```text
js/Civication/systems/civicationCareerRoleResolver.js
```

skal være autoritativ for:

```text
role_scope
role_id
role_key
```

Eksempel:

```text
Controller
-> role_scope: controller
-> role_id: naer_controller
-> role_key: controller
```

```text
Finansanalytiker
-> role_scope: finansanalytiker
-> role_id: naer_finansanalytiker
-> role_key: finansanalytiker
```

Regel:

```text
Ikke lag lokale ROLE_ID_BY_TITLE-mappinger i EventEngine, UI eller andre systemer.
Bruk resolveren.
```

## 9. CivicationRoleStarter og ActivePositionRecovery

`CivicationRoleStarter` ligger her:

```text
js/Civication/systems/civicationRoleStarter.js
```

Den kan starte en rolle direkte, for eksempel:

```js
CivicationRoleStarter.startRole("controller")
CivicationRoleStarter.startRole("finansanalytiker")
```

Den setter aktiv posisjon, mail runtime-state, mail system-state og progresjon.

`CivicationActivePositionRecovery` ligger her:

```text
js/Civication/systems/civicationActivePositionRecovery.js
```

Den gjenoppretter aktiv rolle etter refresh/appstart ved hjelp av:

```text
active_role_key
mail_runtime_v1.role_plan_id
mail_system.role_plan_id
mail_plan_progress.role_plan_id
backup i localStorage
```

Disse filene må oppdateres hvis nye roller skal kunne startes eller recoveres direkte.

## 10. CivicationMailEngine: innboks og lagring

Filen:

```text
js/Civication/systems/civicationMailEngine.js
```

har ansvar for mailstore/innboks. Den håndterer blant annet:

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

## 11. CivicationEventEngine: generisk hendelsesmotor

Filen:

```text
js/Civication/core/civicationEventEngine.js
```

er eldre/generisk hendelsesmotor. Den brukes fortsatt for:

```text
generisk enqueue
answer/resolution
fallback-events
warning/fired/NAV-mails
gamle packs
state-overganger
```

MailRuntime og RoleModelRuntime patcher/bruker deler av EventEngine, men EventEngine skal ikke eie den nye rollemodellen alene.

Regel:

```text
EventEngine skal ikke ha egne utdaterte rolle-mappings som overstyrer resolveren.
```

## 12. Life mails

Life-mails ligger her:

```text
data/Civication/lifeMails/
```

og kjøres av:

```text
js/Civication/systems/civicationLifeMailRuntime.js
```

Life-mails er ikke bundet til én jobbrolle på samme måte som jobbmailer. De handler om livssituasjoner, for eksempel:

```text
arbeidsledig
alkohol/risk
subkultur/skurk/kantliv
```

Disse skal fortsatt holdes adskilt fra roleModel-baserte jobbmailer.

## 13. Day/choice/faction/alliance-lag

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

Disse lagene bør ikke definere stillingen fra bunnen. De skal bruke roleModel/mailPlan/mailFamily som grunnlag.

## 14. State og localStorage

Viktige state-nøkler:

```text
hg_civi_state_v1
hg_civi_mail_v1
hg_civi_inbox_v1
hg_civi_forced_role_key_v1
hg_civi_last_active_position_v1
mail_runtime_v1
mail_system
mail_plan_progress
```

Prinsipp:

```text
State skal lagre hva spilleren har gjort.
Datafilene skal definere hva rollen og mailene er.
Runtime skal binde dem sammen.
```

Ikke hardkod progresjon i UI hvis den egentlig hører hjemme i `mailPlans` eller `roleModels`.

## 15. Anbefalt arbeidsflyt for nye stillinger

Når en ny stilling skal få ordentlig mailspor:

### Steg 1: Les badge og roleModel

Finn rollefil:

```text
data/Civication/roleModels/{category}/{role_scope}.json
```

Les den. Hvis den er generisk, forbedre den først.

### Steg 2: Forbedre roleModel

Fyll ut:

```text
core_narrative
work_life.daily_work
work_life.responsibilities
work_life.work_environment
career_path
required_knowledge
challenges
dilemmas
mail_integration.recommended_mail_families
competence_axes
ideal_type_problems
```

### Steg 3: Lag eller oppdater mailPlan

Path:

```text
data/Civication/mailPlans/{category}/{role_scope}_plan.json
```

Planen skal ha en dramaturgisk bue:

```text
intro -> job -> conflict -> story -> event -> advanced job -> mastery conflict -> identity/story
```

### Steg 4: Lag mailFamilies

Minimum:

```text
job/{role_scope}_intro_v2.json
job/{role_scope}_job.json
conflict/{role_scope}_conflict.json
story/{role_scope}_story.json
event/{role_scope}_event.json
```

Eventuelt:

```text
people/{role_scope}_people.json
brand/{role_scope}_{brand}.json
faction_choice/{role_scope}_faction_choice.json
```

### Steg 5: Koble rolle teknisk

Sjekk:

```text
CivicationCareerRoleResolver
CivicationRoleStarter
CivicationActivePositionRecovery
CivicationMailRuntime path-resolving
```

Hvis runtime allerede bruker dynamisk path basert på `role_scope`, skal det normalt ikke trengs nye hardkodede paths.

### Steg 6: Valider

Lag eller bruk validator:

```text
scripts/validate-civication-mails.js
scripts/validate-civication-finance-mails.js
```

Sjekk minst:

```text
JSON parse
allowed_families finnes som family.id
alle mailer har påkrevde felt
choices har minst to valg
role_scope matcher fil og plan
role_id/role_key matcher resolver/starter/recovery
```

### Steg 7: Test i app

Eksempel:

```js
CivicationRoleStarter.startRole("controller")
```

```js
CivicationRoleModelRuntime.inspect()
```

```js
CivicationMailRuntime.inspect()
```

Sjekk at:

```text
aktiv rolle er riktig
roleModel-path finnes
plan-path finnes
første mail kommer fra riktig intro_v2
svar oppdaterer progresjon
mail gjentas ikke feil
```

## 16. Nåværende kvalitetstilstand

RoleModels-strukturen finnes og dekker hele badge-systemet, men mange rollemodeller er automatisk generert og må forbedres manuelt.

Næringsliv har kommet lengst, spesielt:

```text
Ekspeditør / butikkmedarbeider
Controller
Finansanalytiker
```

Controller og Finansanalytiker har nå egne:

```text
role_scope
role_id
mailPlan
intro/job/conflict/story/event mailFamilies
validator
```

Neste kvalitetsløft bør skje roleModel-først:

```text
1. Forbedre data/Civication/roleModels/naeringsliv/controller.json
2. Forbedre data/Civication/roleModels/naeringsliv/finansanalytiker.json
3. Kontrollere at mailFamilies bruker samme begreper, dilemmaer og læringsmål
```

## 17. Viktige regler fremover

1. Les kildefilene før endring.
2. Ikke gjett schema.
3. Ikke lag quick-fix i UI for dataproblemer.
4. RoleModel først, mailFamily etterpå.
5. Resolveren eier rolleidentitet.
6. MailPlan eier dramaturgisk progresjon.
7. MailFamily eier konkrete situasjoner.
8. MailRuntime eier valg av neste jobbmail.
9. MailEngine eier innboks/lagring.
10. EventEngine eier generisk hendelsesflyt/fallback.
11. LifeMailRuntime eier livshendelser utenfor jobbspor.
12. Valider JSON og family-koblinger etter hver strukturelle endring.

## 18. Kort arkitekturdiagram

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
CivicationMailRuntime / CivicationEventEngine
  ↓
CivicationMailEngine
  ↓
Civication UI inbox / arbeidsdag
  ↓
player choice
  ↓
state, progression, consumed mails, consequences
```
