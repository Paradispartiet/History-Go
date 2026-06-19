# Civication Runtime Ownership Audit / Guard v1

Denne auditen dokumenterer eksisterende Civication-runtime etter IncomingFlow-laget. Målet er å avgrense eierskap, ikke å bygge ny runtime.

## Konklusjon

`CivicationIncomingFlow` beholdes kun som tynn helper/fasade. Den skal lese eksisterende inbox, delegere klassifisering til `CivicationEventChannels`, normalisere visningsdata og tilby lave nivå-testhelpers. Den skal ikke eie mailprogresjon, arbeidsdag, answer/state, warning/fired eller konsekvensskriving når eksisterende runtime allerede har håndtert dette.

| IncomingFlow-funksjon | Beslutning | Begrunnelse |
| --- | --- | --- |
| `getInbox` | Behold | Read-only helper som leser `CivicationMailEngine.getInbox()` og faller tilbake til `CivicationState.getInbox()` uten egen runtime. |
| `getPendingByChannel` | Behold / begrens | Kun filtrering av eksisterende pending inbox, med kanalbeslutning delegert til `CivicationEventChannels`. |
| `getPendingJobMails` | Behold / begrens | Convenience-wrapper rundt `getPendingByChannel("job")`; eier ikke jobbmail-progresjon. |
| `getPendingPrivateMessages` | Behold / begrens | Convenience-wrapper rundt `getPendingByChannel("private")`; eier ikke life/private mail-runtime. |
| `getActiveWorkdayItem` | Behold / begrens | Leser eksisterende pending job/workday-item; skal ikke bygge eller overstyre dagsbunke. |
| `enqueueBatch` | Begrens / utsett | Kan brukes som lavnivå test/helper rundt `CivicationMailEngine.sendMail`, men er ikke hovedmotor for dagsbunke. UI skal ikke bruke den som erstatning for `CivicationDailyMailBuilder`. |
| `enqueueFollowup` | Begrens | Skal delegere til `CivicationThreadBridge` eller sende konkret followup fra eksisterende pool. Hvis followup mangler returneres `{ ok:false, reason:"missing_followup" }`; ingen generisk `Oppfølging`-mail. |
| `applyConsequences` | Begrens | Default er read-only normalisering etter `HG_CiviEngine.answer`. Skriver bare ved eksplisitt flagg (`applyConsequences: true`, `consequences_applied:false` eller `effects_applied:false`). |
| `normalizeConsequences` | Behold | Ren/pure helper for visningsmodell. |
| `inspect` | Behold | Debug/read-only inspeksjon av eksisterende inbox og kanalbuckets. |

## Systemeierskap i repoet

### 1. `CivicationMailRuntime`

Fil: `js/Civication/systems/civicationMailRuntime.js`.

Eier rollebasert jobbmail-progresjon. Filens toppkommentar sier at én runtime eier jobbmailflyten, at innhold kommer fra `mailPlans` og `mailFamilies`, at `EventEngine` beholder enqueue/answer/state, og at bare planned/thread-mails får skrive `mail_runtime_v1`.

Repo-basert ansvar:

- Leser plan fra `data/Civication/mailPlans/<category>/<roleScope>_plan.json`.
- Leser familier fra `data/Civication/mailFamilies/<category>/...`.
- Resolver `role_scope` fra aktiv rolle/tittel.
- Holder runtime-state under `mail_runtime_v1`, inkludert forbrukte id-er og progresjon.
- Har thread-indeks og `triggers_on_choice`/thread-mekanismer der rollepakker definerer dem.
- Patcher `CivicationEventEngine.answer` slik at besvarte planned/thread-mails driver eksisterende progresjon videre.

### 2. `CivicationDailyMailBuilder`

Fil: `js/Civication/systems/civicationDailyMailBuilder.js`.

Eier dagsbunke/arbeidsdag. Filens toppkommentar sier eksplisitt at `MailRuntime` fortsatt eier langsiktig rolleprogresjon, mens `DailyMailBuilder` eier dagsbunke/rytme fase for fase. Kun dagens primære planmail får beholde `source_type:"planned"`; micro/followup/knowledge/consequence/day_end er dagsinnhold og flytter ikke rolePlan.

Repo-basert ansvar:

- Leser `data/Civication/mailDayProgram.json`.
- Skriver/leser `mail_day_runtime_v1`.
- Bygger dagsinnhold med morgen/lunsj/ettermiddag/kveld/dagslutt-semantikk.
- Kaller `CivicationMailRuntime.makeCandidateMailsForActiveRole` for primær planmail.
- Sender dagsmail via `CivicationMailEngine.sendMail`.
- Patcher `CivicationEventEngine.answer` for daglig flyt uten å overta mailplan-progresjon.

### 3. `CivicationMailEngine`

Fil: `js/Civication/systems/civicationMailEngine.js`.

Eier mailstore/innboks. Den har `hg_civi_mail_v1` som primær store og `hg_civi_inbox_v1` som legacy mirror. Den normaliserer envelopes, migrerer gammel inbox, deduper/merger id-er, markerer read/resolved/archive/delete og gir `answerMail`/resolved-kobling til EventEngine-flyten.

### 4. `CivicationEventEngine`

Fil: `js/Civication/core/civicationEventEngine.js`.

Eier answer/state. Den leser pending events fra MailEngine/State, svarer på valg, skriver state, håndterer score/strikes/stability/warning/fired/task completion/capital/state effects der eksisterende systemer er koblet inn, og er patch-punktet for runtimes som `MailRuntime`, `DailyMailBuilder`, job eligibility/learning og day-systemer.

### 5. `CivicationLifeMailRuntime`

Fil: `js/Civication/systems/civicationLifeMailRuntime.js`.

Eier life/private mails utenfor vanlig jobbrolle. Den bruker `life_mail_runtime_v1`, `data/Civication/lifeMails/life_manifest.json`, `life_tags`/identity/life flags, arbeidsledig/aktiv-jobb-kontekst og egne consumed/history-felt. Den skal ikke drive rolleprogresjon.

### 6. `CivicationEventChannels`

Fil: `js/Civication/systems/civicationEventChannels.js`.

Eier klassifisering. Den klassifiserer events som workday/message/milestone/system/unknown og meldingskanal som job/private/system. Den skal ikke sende mail, skrive state eller eie runtimeflyt.

### 7. `CivicationIncomingFlow`

Fil: `js/Civication/systems/civicationIncomingFlow.js`.

Skal bare være helper/fasade:

- Leser inbox via MailEngine/State.
- Filtrerer pending meldinger via `CivicationEventChannels`.
- Leser aktiv workday item fra eksisterende pending inbox.
- Normaliserer consequences for visning.
- Har lavnivå `enqueueBatch` for tester/helpers, ikke UI-hovedflyt.
- Har guard på followup slik at manglende thread/pool ikke lager fallback-mail.
- Har guard på consequences slik at UI/EventEngine-svar ikke skriver effekter to ganger.

## Eksisterende flow: aktiv rolle → mail → svar → followup/state

1. Aktiv rolle ligger i `CivicationState.getActivePosition()`.
2. `CivicationMailRuntime` resolver rolle til `role_scope`, laster `mailPlan` og relevante `mailFamilies`, og finner kandidater som ikke er consumed.
3. `CivicationDailyMailBuilder` bygger dagens arbeidsdag fra `mailDayProgram`, bruker MailRuntime for dagens primære planmail og legger til dagsinnhold/faser uten å flytte rolePlan for micro/followup/knowledge/consequence/day_end.
4. `CivicationMailEngine.sendMail` skriver meldingen til `hg_civi_mail_v1` og speiler legacy `hg_civi_inbox_v1`.
5. UI viser pending inbox, kan lese buckets via `IncomingFlow`, men svarer via `HG_CiviEngine.answer`/`CivicationEventEngine.answer`.
6. `CivicationEventEngine.answer` markerer/oppdaterer state, og eksisterende patches fra MailRuntime/DailyMailBuilder/andre runtime-moduler håndterer neste steg.
7. Followups/tråder skal komme fra eksisterende thread bridge eller konkrete events/pools. IncomingFlow skal ikke finne på generiske mailer.

## IncomingFlow-overlapp og guard

Overlappene som måtte strammes:

- `PHASE_TAGS` var for smal (`morning`, `work`, `evening`). Dette kunne droppe eksisterende `mailDayProgram`-faser. Guard: eksisterende `phase_tag` bevares, og metadata kan beholde `lunch`, `afternoon` og `day_end`.
- `enqueueFollowup` kunne lage generisk fallback med subject `Oppfølging`. Guard: manglende followup returnerer nå `missing_followup` og sender ingenting.
- `applyConsequences` skrev state/capital/psyche direkte. Guard: default er read-only; eksplisitt flagg kreves for skriving.
- `CivicationUI` kalte `applyConsequences` og `enqueueFollowup` rett etter `HG_CiviEngine.answer`. Guard: UI svarer via eksisterende engine og lar EventEngine/MailRuntime/DailyMailBuilder håndtere neste runtime-steg.

## Testdekning

Guard-testene ligger i `tests/civication-incoming-flow.test.js`:

- Ukjent `triggers_on_choice` uten thread bridge gir `{ ok:false, reason:"missing_followup" }`.
- Ingen generisk mail med subject `Oppfølging` sendes.
- `lunch`, `afternoon` og `day_end` bevares som phase tags.
- `applyConsequences` skriver ikke state uten eksplisitt flagg.

Eksisterende regresjonstester for channels, UI workday helper, mail loop og ekspeditør first-week skal fortsatt være grønne.
