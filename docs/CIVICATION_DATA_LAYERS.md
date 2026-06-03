# Civication data layers

## 1. Formål

Civication har flere datalag fordi de løser ulike oppgaver. Poenget er ikke å samle alt i én fil, men å holde klart skille mellom:

- statisk katalogdata
- rolleinnhold
- spillhendelser
- arbeidsforholdsutfall
- læringsmetadata
- spillerens lagrede progresjon
- UI/view models

Dette dokumentet beskriver dagens repo-kontrakt for disse lagene, særlig hvordan `data/Civication/jobLearningProfiles.json` henger sammen med `role_id`, aktiv rolle og `state.job_learning_progress`.

## 2. Hovedmodell

- `data/Civication/hg_careers.json`
  - eier: karriere-/jobbregisteret som `CivicationBoot.js` laster til `window.HG_CAREERS` og `window.CIVI_CAREER_RULES`
  - svarer på: hvilke karrierer/jobber finnes, hvilke globale jobbregler gjelder, og hvilket kataloggrunnlag kan andre systemer lese?
  - skal ikke eie: storylets, læringsprogresjon, unlocked skills

- `data/Civication/roles/naer_*.json`
  - eier: rolleinnhold, scenariofamilier, storylets og læringsråstoff for næringslivsrollene
  - eksisterende filer: `data/Civication/roles/naer_arbeider.json`, `data/Civication/roles/naer_fagarbeider.json`, `data/Civication/roles/naer_mellomleder.json`
  - svarer på: hva er rollen, hva gjør spilleren, hvilke konflikter og situasjoner finnes?
  - skal ikke eie: spillerens progresjon, career outcome-state, runtime unlocks

- `data/Civication/jobLearningProfiles.json`
  - eier: redaksjonell læringskontrakt per rolle
  - svarer på: hva lærer rollen deg, hvor mange læringssteg før mastery, hvilke transferable skills tar du med videre?
  - skal ikke eie: storylets, mailvalg, faktisk spillerprogresjon

- `data/Civication/mailPlans/`
  - eier: planlagt jobbmail-/rolleplanflyt
  - eksisterende næringslivsplaner ligger i `data/Civication/mailPlans/naeringsliv/`, blant annet `arbeider_plan.json`, `fagarbeider_plan.json` og `mellomleder_plan.json`
  - svarer på: hvilke jobbmail-steg driver rollen videre, hvilken dramaturgisk plan har rollen, og hvilke planregler kan terminalt career outcome bruke?
  - skal ikke eie: mastery eller unlocked skills direkte

- `data/Civication/jobbmails/`
  - eier: legacy/generelle mail packs og eldre jobbmailinnhold
  - eksisterende næringslivsinnhold ligger blant annet i `data/Civication/jobbmails/naeringsliv/naeringslivCivic.json`, med manifest i `data/Civication/jobbmails/naeringsliv/naer_manifest.json`
  - svarer på: fallback/eldre mailinnhold og generelle jobbmailer som ikke nødvendigvis er del av en rolleplan
  - skal ikke eie: job learning state

- `state.job_learning_progress`
  - eier: spillerens faktiske læringsprogresjon per rolle
  - skrives av `CivicationJobLearningRuntime` når en kvalifiserende jobbmail er besvart
  - svarer på: hvor langt har spilleren kommet i å lære denne rollen?
  - skal ikke eie: statisk rollebeskrivelse

- `state.career_outcome_state`
  - eier: arbeidsforholdsutfall
  - skrives og tolkes av `CivicationCareerOutcomeRuntime`
  - svarer på: `PROMOTED` / `STAGNATED` / `FIRED`
  - skal ikke eie: `jobMastered` eller unlocked skills

- `hg_active_position_v1`
  - eier: aktiv stilling/rolle
  - svarer på: hvilken rolle spiller spilleren nå?
  - brukes av runtime for å finne aktiv `role_id`, `role_key`, tittel eller karriere når læringsprofil og rolleplan skal slås opp

- `hg_civi_state_v1`
  - eier: Civication hovedstate
  - svarer på: samlet runtime-state for Civication, inkludert slices som `job_learning_progress`, `career_outcome_state`, `mail_runtime_v1`, `mail_branch_state` og andre Civication-nære felt

- `js/Civication/core/civicationTaskEngine.js` og History Go task bridge-kontrakten
  - eier: normalisering og klassifisering av Civication-oppgaver som peker tilbake til History Go
  - dokumentert i `docs/CIVICATION_HISTORY_GO_TASK_SCHEMA.md`
  - svarer på: hva slags place/person/knowledge/debate/unlock-oppgave er dette, og hvilket History Go-mål peker den på?
  - skal ikke eie: job learning mastery, career outcome eller role storylets

- UI/view models
  - eier: presentasjon av state, ikke autoritativ spilllogikk
  - `CivicationJobLearningRuntime.getJobLearningViewModel(...)` lager læringsstatus, unlock-linjer og career readiness fra læringsstate
  - `CivicationCareerOutcomeRuntime.getOutcomeViewModel(...)` lager visning av arbeidsforholdsutfall
  - `CivicationDayPhaseUI.js` viser disse separat

## 3. Job learning-kontrakten

`data/Civication/jobLearningProfiles.json` er læringsmetadata, ikke rolleinnhold og ikke state.

Kontrakten er:

- Profilene ligger under `profiles`.
- Profilnøkler skal matche `role_id`, for eksempel:
  - `naer_arbeider`
  - `naer_fagarbeider`
  - `naer_mellomleder`
- Runtime laster filen best-effort og registrerer `json.profiles`, ikke root-level rolleprofiler.
- `profiles._examples` er dokumentasjon, ikke aktiv profil for en ekte rolle.
- `default` er fallback, ikke løsning for ferdige roller.
- `scripts/auditJobLearningProfiles.js` forventer egen profil for hver `data/Civication/roles/naer_*.json`-rolle. En ny næringslivsrolle uten egen profil skal feile `npm run audit:job-learning-profiles`.

Feltene i en aktiv profil betyr:

- `learning_value`
  - redaksjonell vurdering av hvor verdifull jobben er læringsmessig
  - støttede verdier i audit/runtime er `high`, `standard`, `low`

- `teaches`
  - kort liste over hva rollen lærer spilleren
  - kan speile læringsråstoff fra rollefilen, men skal være kortere og mer kontraktsaktig enn `what_player_learns` og storylet-tekstene
  - låses opp til `unlocked_teaches` når rollen mestres

- `mastery_threshold`
  - antall læringssteg før rollen regnes som mestret
  - er bevisst frikoblet fra career outcome sin plan-fullføring

- `usefulness`
  - vurdering av hvor nyttig/overførbar læringen er utenfor rollen
  - støttede verdier i audit/runtime er `high`, `standard`, `low`

- `transferable_skills`
  - ferdigheter spilleren tar med seg videre til andre roller
  - låses opp til `unlocked_skills` når rollen mestres

- `dead_end_risk`
  - risiko for at rollen er en blindvei læringsmessig
  - støtter `low`, `medium`, `high` eller et tall mellom `0` og `1`

Skillet mellom lagene er:

- `roles/naer_*.json` = rikt rolleinnhold og læringsråstoff: rollebeskrivelse, faktisk arbeid, scenariofamilier, storylets, valg og situasjoner.
- `jobLearningProfiles.json` = kort redaksjonell læringskontrakt: læringsverdi, threshold og hva som kan unlockes.
- `job_learning_progress` = hva spilleren faktisk har oppnådd: steg, mastery, unlocks og hvilke mailer som allerede er telt.

## 4. Runtime-flyt for job learning

1. Spiller har aktiv rolle med `role_id` i aktiv stilling.
2. `CivicationJobLearningRuntime` finner role key. Den bruker `role_id` først for læringsprogresjon, og kan falle tilbake til rolle-scope/slug for eldre eller delvis state.
3. Runtime leser profil fra `jobLearningProfiles.json > profiles[role_id]` etter at `loadProfilesData()` har registrert `json.profiles`.
4. Spilleren svarer på plan-fremmende jobbmail.
5. Runtime gir `+1` læringssteg i `state.job_learning_progress[role_id]` når mailen kvalifiserer.
6. Når `steps >= mastery_threshold`, settes `mastered`.
7. Ved mastery unlockes:
   - `profile.teaches` → `unlocked_teaches`
   - `profile.transferable_skills` → `unlocked_skills`
8. UI viser læringsstatus og hva spilleren tok med seg via `CivicationDayPhaseUI.js`.

Dette er separat fra career outcome. `CivicationJobLearningRuntime` skal ikke skrive eller tolke `career_outcome_state` for å avgjøre mastery.

Kvalifiserende jobbmail betyr i dagens runtime:

- `source_type: "planned"`, eller
- `daily_mail_meta.advances_role_plan === true`, og
- ikke terminal outcome-mail (`source_type: "role_outcome"` eller `mail_class: "career_outcome"`).

## 5. Career outcome vs job learning

Career outcome:

- eies av `CivicationCareerOutcomeRuntime`
- handler om arbeidsforholdet
- leser rolleplanens fullføring og outcome-regler når de finnes
- statuser:
  - `PROMOTED`
  - `STAGNATED`
  - `FIRED`

Job learning:

- eies av `CivicationJobLearningRuntime`
- handler om hva spilleren faktisk lærer
- bruker `jobLearningProfiles.json` og `state.job_learning_progress`
- statuser/begreper:
  - `still_learning`
  - `nearing_mastery`
  - `mastered`
  - `low_value`
  - `routine`
  - unlocked skills
  - career readiness

Presiseringer:

- `PROMOTED` betyr ikke automatisk `jobMastered`.
- `jobMastered` betyr ikke automatisk `PROMOTED`.
- Å bli værende i samme jobb er ikke automatisk stagnasjon.
- Stagnasjon bør forstås som lite læring/rutine/lav utvikling, ikke bare “samme stilling”.
- Career readiness er et læringssignal fra `job_learning_progress`; det er ikke et terminalt arbeidsforholdsutfall.

## 6. Hvordan datalagene virker sammen

```text
hg_careers.json
  → definerer karriere-/jobbgrunnlag
roles/naer_*.json
  → definerer rolleinnhold og storylets
mailPlans / jobbmails
  → leverer konkrete jobbmailer og valg
CivicationEventEngine.answer
  → behandler valg og konsekvenser
CivicationJobLearningRuntime
  → gir læringssteg når jobbmail kvalifiserer
jobLearningProfiles.json
  → bestemmer mastery_threshold og hva som unlockes
state.job_learning_progress
  → lagrer spillerens progresjon
CivicationDayPhaseUI
  → viser læringsstatus, unlocked skills og karrieregrunnlag
```

En mer konkret flyt er:

1. `CivicationBoot.js` laster `data/Civication/hg_careers.json` og oppretter `window.HG_CiviEngine`.
2. Aktiv rolle ligger i `hg_active_position_v1` og brukes av mail runtime, outcome runtime og learning runtime.
3. `CivicationMailRuntime` prøver planlagt mail fra `data/Civication/mailPlans/<category>/<role_scope>_plan.json`.
4. Hvis planlagt mail finnes, normaliseres den med `source_type: "planned"` og `mail_plan_meta`.
5. `CivicationEventEngine.answer(...)` behandler valget og konsekvensene.
6. `CivicationJobLearningRuntime` patcher answer-flowen best-effort og teller kvalifiserende planmail som læringssteg.
7. `CivicationCareerOutcomeRuntime` håndterer terminalt arbeidsforholdsutfall separat når rolePlan er ferdig.
8. UI henter view models og viser outcome-banner og learning-banner som to forskjellige ting.
9. History Go task payloads, når de finnes på mail/oppgaver, normaliseres av `CivicationTaskEngine` og følger task bridge-kontrakten i `docs/CIVICATION_HISTORY_GO_TASK_SCHEMA.md`.

## 7. Når ny rolle legges til

Når man legger til en ny næringslivsrolle:

1. Opprett eller oppdater `data/Civication/roles/naer_*.json`.
2. Sørg for stabil `role_id`.
3. Legg inn scenariofamilier/storylets i rollefilen.
4. Legg inn egen profil i `data/Civication/jobLearningProfiles.json > profiles[role_id]`.
5. Profilen må ha:
   - `learning_value`
   - `teaches`
   - `mastery_threshold`
   - `usefulness`
   - `transferable_skills`
   - `dead_end_risk`
6. Kjør:
   - `npm run audit:job-learning-profiles`
   - `npm run test:civication`
7. Sjekk at runtime kan matche `active.role_id` mot profilnøkkel.

Ny rolle uten egen Job Learning Profile skal feile audit. Ikke bruk `default` som permanent løsning for en ekte rolle som er klar til å merges.

## 8. Ikke bland disse lagene

Ikke:

- ikke legg spillerens progresjon i `jobLearningProfiles.json`
- ikke legg storylets i `jobLearningProfiles.json`
- ikke la `career_outcome_state` bestemme mastery
- ikke la `PROMOTED` automatisk unlocke skills
- ikke bruk default-profil som permanent løsning for ekte roller
- ikke hardkod rolleprofiler i runtime
- ikke la UI gjette læringsstatus uten view model
- ikke dupliser samme læringstekster blindt mellom rollefil og learning profile
- ikke la `mailPlans` eller `jobbmails` eie `job_learning_progress`
- ikke la History Go task payloads avgjøre career outcome eller job mastery alene

## 8b. Dual-gate job eligibility og fired category reentry lock

Jobbtilgang vurderes gjennom to porter (eies av `CivicationJobEligibilityRuntime`, ikke av career outcome):

- `knowledge_gate` = History Go / quiz / merits / kunnskap.
  - Kontraktsklar, men ikke håndhevet ennå. Har et tilbud eksplisitte kunnskapskrav, leses de tolerant; mangler de, returneres `not_configured`/`unknown` og tilbudet blokkeres ikke. Konkrete quizkrav per jobb kommer i en senere PR.
- `learning_gate` = Civication / `job_learning_progress` / mastered roles / unlocked skills.
  - Bruker `CivicationJobLearningRuntime.getCareerLearningSignals(...)`. Det er kun et signal: det promoterer aldri automatisk og skriver aldri `career_outcome_state`.

Eligibility-helperen (`getJobOfferEligibility`) skiller disse to portene og legger til `careerStateModifier`, `reentryLock`, `offerRoute`, `eligible`, `reasons` og `blockers`.

`career_reentry_locks` er en egen state-slice i `hg_civi_state_v1`, keyet på kategori (f.eks. `naeringsliv`, `media`). Hver lock har `status` (`locked`/`cleared`), `reason`, `locked_at`, `fired_category`, `fired_role_id`, `clear_condition` og clear-felt. Eligibility blokkerer kun `status: "locked"`.

Fired-regelen: **Får du sparken i én kategori, må du jobbe i en annen kategori før samme kategori åpnes igjen.**

- FIRED i en aktiv jobb oppretter en lock for jobbens kategori (tolerant resolver: `category` → `career_id` → `career` → `naer_*`-prefiks). Kan ikke kategori løses, opprettes ingen lock (ingen crash, ingen blokkering av alt).
- Locken blokkerer nye jobbtilbud i samme kategori. Andre kategorier er fortsatt tilgjengelige.
- Locken cleares først når spilleren har aktiv jobb i en annen kategori OG besvarer minst én plan-fremmende jobbmail der (samme smale signal som job learning: `source_type: "planned"` eller `daily_mail_meta.advances_role_plan`, aldri terminal/outcome-mail).
- `STAGNATED` gir ingen kategori-lock; den kan bare gi `offerRoute: "exit_from_stagnation"`. `PROMOTED` gir heller ingen lock.
- FIRED sletter aldri quiz/merits, `job_learning_progress`, mastered roles, `unlocked_skills`/`unlocked_teaches` eller job history. Locken berører kun fremtidige jobbtilbud i samme kategori.

UI skal lese aktive `career_reentry_locks` direkte fra state/runtime, fordi locked-category offers kan bli stoppet i `pushOffer` før de lagres.

## 9. Åpne neste steg

Dette dokumentet implementerer ingenting. Mulige neste steg er:

- bruke career readiness i faktiske jobbtilbud
- bruke unlocked skills i promotering/stagnasjon
- vise samlet kompetanse på profil/AHA
- formalisere History Go task bridge for place/person/quiz/story completion
- vurdere flere jobbroller utenfor næringsliv
- eventuelt lage audit for alle jobbkategorier når flere rollefiler finnes

## 10. Kort oppsummering

Rollefilen sier: Dette er jobben.

Mailen sier: Dette skjer i dag.

Career outcome sier: Hvordan gikk arbeidsforholdet?

Learning profile sier: Hva kan jobben lære deg?

Learning progress sier: Hvor mye har spilleren lært?

Unlocked skills sier: Hva tok spilleren med videre?
