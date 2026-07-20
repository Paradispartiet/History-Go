# Civication — motorer og spillvei gjennom dagen

Oppdatert: 2026-07-07

Civication er en samfunns-/livssimulator som kjøres fra `Civication.html` (og delvis fra
`index.html`/`profile.html`). Dette dokumentet forklarer **motorene** og **den ene spillveien
gjennom en dag**: hvem som eier hva, hvordan et svar flyter, og hvor data ligger.

Dette er motoroversikten. Selve mail-/rolledatakontrakten (badge → roleModel → mailPlan →
mailFamily → FWG) er beskrevet i [`data/Civication/README-mailsystem-og-rolemodels.md`](../../data/Civication/README-mailsystem-og-rolemodels.md)
og FWG-standarden i [`docs/CIVICATION_WORK_GRAMMAR_STANDARD.md`](../../docs/CIVICATION_WORK_GRAMMAR_STANDARD.md).

> **Civication-skallet er hovedproduktet; Min dag (Life Story) er primærpanelet i det.**
> `Civication.html` laster Min dag først og deretter `js/Civication/civicationShellLoader.js`.
> Shell-loaderen laster produkt-skallet som standard — kart, dashboard, nabolag, kapital,
> psyke, identitet, folk, offentlig lag, rollepanel, footer/panelnavigasjon og robuste
> tomtilstander — med Min dag øverst som ÉN modul, ikke hele appen. Life Story er én fortellingsrunner
> (`js/Civication/lifestory/`) + rene fortellingspakker (`data/Civication/lifestory/`),
> pilotert med rollen Arealplanlegger. Motoren støtter scene-**conditions**
> (flagg/meters/relasjoner/thread state), **thread state**
> (active/completed/dormant/escalated med step), **day progression**
> (`startNextDay` beholder arkiv/valg) og **konsekvenstekst** per valg.
> **Motorene beskrevet i dette dokumentet driver daglaget inne i skallet** (innboks,
> arbeidsdag, dagfase, rolle …) og lastes fra `DAY_SCRIPTS` etter at shell-boot har
> startet. Produkt-skallet lastes fra `SHELL_SCRIPTS`; full gammel/debug ligger i
> `LEGACY_DEBUG_SCRIPTS`. Kart/paneler/dashboard er **ikke** legacy — de er aktivt produkt. Den eneste egentlige
> debug-bryteren som er igjen er de tunge canvas/3D-kartene: av som standard (skallet
> bruker rich Canvas/WebGL-kartet i normal runtime), lite fallback med `Civication.html?civicationLite=1`.
> Nye fortellinger bygges som **data** i `data/Civication/lifestory/`, aldri som nye motorer.
> Min dag er primærpanelet: statuslinje, nå-scene, valg, konsekvensfeedback, trådoversikt,
> senere-i-dag og arkiv. Mail er bare én scenevisning; innboks er arkiv/bakgrunn, ikke
> hovedspillet — men den er del av skallet og vises som standard.
> Se [`docs/civication-life-story-system.md`](../../docs/civication-life-story-system.md).

## Boot-arkitektur: skall-boot vs. dag-/life-story-boot

`CivicationBoot` er ikke lenger én stor orkestrator. Den er en **tynn koordinator**
som kjører to tydelig adskilte lag i rekkefølge, slik at mail/dag aldri kan velte
selve produktet:

| Lag | Fil | Ansvar | Robusthet |
| --- | --- | --- | --- |
| **Skall-boot** | `CivicationShellBoot.js` | Selve Civication-produktet: data (badges/careers), økonomi-tick, career-role-resolver og `CivicationUI.init()` (kart, dashboard, nabolag/kapital, psyke, identitet, hjem, offentlig feed, aktiv rolle, folk, butikk, track-HUD, footer, panelnavigasjon, empty states). | Kjøres **først**. Egen try/catch. Skal **alltid** kunne starte. |
| **Dag-/life-story-boot** | `CivicationDayBoot.js` | Dag-/fortellingslaget: hendelsesmotoren (`HG_CiviEngine`), rolle-modell-runtime, blokkerte jobbmeldinger, forpliktelser og `onAppOpen()` (bygger dagens mail-/innboks-scener). | Kjøres **etterpå**. **Inert** uten dag-DOM (`#civiInboxSection`). Egen try/catch — en feil her logges, men velter aldri skallet, og viser aldri boot-error-boksen. |

Koordinatoren (`CivicationBoot.js`) kaller `CivicationShellBoot.start()` og deretter
`CivicationDayBoot.start()`, med et ekstra sikkerhetsnett rundt dag-laget. `HG_CiviDebug`
(konsoll-diagnostikk) ligger fortsatt i `CivicationBoot.js`.

**Mail/innboks/arbeidsdag er paneler inne i skallet — ikke skallet selv.** Skallet
rendrer disse panelene med robuste empty states, og dag-laget fyller dem etterpå via
`updateProfile`. **«Min dag» (Life Story) er en egen, uavhengig modul**
(`CivicationLifestoryUI`) og bootes ikke fra `CivicationBoot` i det hele tatt — den
kjører alene og fungerer også når shell-DOM mangler.

Ansvarsdelingen og robustheten er dekket av `tests/civication-boot-split.test.js`
(JSDOM): skallet starter selv om dag-motoren kaster, og dag-laget er inert uten sin DOM.

`?civicationLegacy=1` gjelder **kun** ekstra debug/full legacy-modus (debugpaneler; canvas/3D-kart er standard) og
historiske debugpaneler) — det har ingenting med boot-splitten å gjøre. Skallet
lastes uansett som standard, mens day/mail er et separat lag som ikke kan velte skallet.

## Grunnprinsipp: én aktiv handling om gangen

Civication hadde tidligere flere flater som konkurrerte om å være «aktiv handling», slik at
samme mail og samme svaralternativer dukket opp flere steder. Den ryddede regelen er:

```text
Aktive svarvalg eies KUN av NextAction (Neste handling / Neste fase).
Dagens fase er status/fortelling — den svarer aldri.
Innboksen er arkiv/detalj — den svarer aldri.
WorkdayPanel og Dashboard er presentasjon — de svarer aldri.
```

Alle de passive flatene har én knapp som åpner NextAction. Ingen annen flate rendrer
svaralternativer (`CivicationUI.js` har dette nedfelt som regel: «svaralternativene eies av
NextAction … rendres ALDRI» her).

## Dagflyt-flatene (UI)

| Flate | Global | Rolle | Eier svar? |
| --- | --- | --- | --- |
| Neste handling | `CivicationNextActionUI` | Eneste svarflate. Viser den aktive sakens valg i en modal. | **Ja** |
| Hvilken sak er aktiv | `CivicationNextActionSelector` | Read-only utvelger: returnerer nøyaktig én aktiv handling. | — |
| Dagens fase | `CivicationDayPhaseUI` | Passivt statuskort: hvor i dagen du er, hvor mange åpne saker, hva neste sak heter. | Nei |
| Innboks | `CivicationInboxTopActionUI` / `CivicationMiniSectionsUI` | Arkiv/detaljvisning av mottatte mailer. | Nei |
| WorkdayPanel | `renderWorkdayPanel` (`CivicationUI`) | Jobbkontekst: klokke, skift, status, dagens oppgave, ukesprogresjon, kontraktspress. | Nei |
| Dashboard | `CivicationDashboardUI` | Topp-HUD: PC, status, innboks-teller, rolle/livssituasjon. Ren presentasjon. | Nei |

### NextActionSelector — den autoritative utvelgeren

`CivicationNextActionSelector.getCurrent()` returnerer én aktiv handling eller `null`.
Den leser primært `CivicationDayProgression.inspect()` slik at Dagens fase og NextAction
alltid peker på **samme** sak (samme id/tittel). Fasehandlinger vinner alltid over
innboks-fallback. Den muterer ingenting og rører ikke DOM.

### NextActionUI — den eneste svarflaten

`CivicationNextActionUI` (`open/close/render/refresh/getCurrent`) tegner den aktive sakens
situasjon og knapper. Den håndterer alle varianter: vanlige svarvalg, kø-mail som må åpnes
først, oppgave-gate (`task_gate`), faseklarering («Gå til neste fase») og «Start ny dag» ved
dagslutt. Svar går via `CivicationMailEngine.answerMail(...)`, deretter re-rendres neste
handling eller modalen lukkes.

## Motorene (runtime)

Kjeden fra rolle til innboks:

```text
DailyMailBuilder  (dagens rytme)  ─┐
MailRuntime       (rolleprogresjon)─┤→ IncomingFlow → MailEngine (innboks) → NextActionUI
LifeMailRuntime   (livshendelser) ─┘                         ↑ svar ↓
                                              EventEngine (HG_CiviEngine.answer)
```

| Motor | Global | Ansvar |
| --- | --- | --- |
| DailyMailBuilder | `CivicationDailyMailBuilder` | Bygger dagskøen fra `data/Civication/mailDayProgram.json`: faser (`morning … day_end`), slots, volum og rytme. **Ruter jobbinnhold kun til arbeidsfasene (`forenoon`+`workday`); private faser får personlige/genererte mailer** (se «To rytmer»). Holder uke-2-innhold (`_week2_`/`advanced` i id/family) utenfor dag 1 til rolleplanen når det. `buildQueue` / `enqueueNext` / `inspect`. |
| MailRuntime | `CivicationMailRuntime` | **Langsiktig rolleprogresjon.** Resolver aktiv rolle, leser `mailPlans/{kategori}/{role_scope}_plan.json`, velger neste jobbmail fra stegets `allowed_families`, og fører rolleplanen videre. |
| MailEngine | `CivicationMailEngine` | **Innboks/lagring.** Mail-envelopes, pending/resolved/read/archive/delete, dedupe, legacy-speil til `hg_civi_inbox_v1`. `answerMail(mailId, choiceId)` kaller EventEngine og markerer resolved. |
| EventEngine | `CivicationEventEngine` / `HG_CiviEngine` | Generisk hendelsesmotor: `answer`/resolution, choice-effekter (score, strikes, stability, kapital, psyke, task completion, followups, warnings/fired). |
| IncomingFlow | `CivicationIncomingFlow` | Binder mailbatcher til dagfaser/kanaler; styrer hvilke innkommende saker som leveres når. |
| LifeMailRuntime | `CivicationLifeMailRuntime` | **Livshendelser utenfor jobbspor** (arbeidsledig, økonomi, kveld, risiko, sosialt). Brukes når spilleren mangler aktiv jobb eller har eksplisitte life-/identity-tags. Holdes adskilt fra rollebaserte jobbmailer. |
| RoleModelRuntime | `CivicationRoleModelRuntime` | Dekorerer valgte mailer med roleModel-metadata; endrer ikke mailflyten. |
| HistoryPeopleBridge | `CivicationHistoryPeopleBridge` | **History Go-samlingen → ekte personer (hybridmodellen).** Leser `people_collected` + den genererte indeksen `data/Civication/historyPeople_index.json` og lar samlede History Go-personer legemliggjøre arketypene fra `people_access_map.json` (identitetsbytte via `decorateAvailablePeople`; mekanikk, access og scoring urørt). Deterministisk valg per arketype; to arketyper viser aldri samme person; uten samlet person i kategorien beholdes arketypen. RoleModelRuntime bruker `getCollectedByCategory` til `history_people`-forbilder på `role_model_meta`. Hverdags-NPC-ene i mailflyten (`data/Civication/npcs/**`) forblir fiktive. Leser kun; skriver aldri. Regenerer indeksen med `npm run civication:history-people:build`. |
| ProfileSignalBridge | `CivicationProfileSignalBridge` | **History Go → private fase-mailer.** Normaliserer spillerens History Go-profil (HG_IdentityCore, `hg_capital_v1`, CivicationPsyche inkl. `psyche.energy`, `visited_places`, `merits_by_category`, `people_collected`, `hg_learning_log_v1`) til `{ identity, capital, psyche, historyGoCollection, profileTags, privatePhaseWeights }`. Offentlig API: `getSignals`, `getProfileTags`, `getPrivatePhaseWeights`, `inspect`. `getSignals()` returnerer alltid et stabilt objekt, også når alle kilder mangler (`identity.focus` har 7 dimensjoner, `psyche.energy` er `null` når ukjent). Leser kun; skriver aldri. Brukes av PrivatePhaseMailBuilder — aldri av jobbmail-sporet. |

Arbeidsdeling i én setning: **MailRuntime velger hvilken mail som skal komme, DailyMailBuilder
bestemmer dagens rytme, MailEngine lagrer og viser den, EventEngine beregner svaret.**

## To rytmer: privat døgn vs. arbeidsdag

Civication har **to rytmer**, og de skal holdes adskilt:

- **Døgnrytme (privat):** `morning`, `lunch`, `afternoon`, `dinner`, `evening`,
  `day_end` (natt/dagslutt). Dette er spillerens eget liv — familie, fritid, helse,
  økonomi, kalender, relasjoner og oppsummering av dagen.
- **Arbeidsrytme (jobb):** `forenoon` + `workday`. Dette er jobbøkten hos arbeidsgiveren,
  med rollens saker, konflikter og planmailer.

**Jobbinnhold lever i arbeidsrytmen, ikke i alle døgnfaser.** Tidligere bygde
DailyMailBuilder hele døgnet som én arbeidsdag, slik at rolle-/case-mailer
(f.eks. Arealplanlegger/Lillebekk/plankart) dukket opp i morgen, lunsj, middag,
kveld og dagslutt og føltes som spam. Nå er det **to adskilte innholdssystemer**,
hvert med sin egen builder:

- **Private fase-mailer** eies av `CivicationPrivatePhaseMailBuilder`. De bygges
  fra `data/Civication/privatePhaseMailFamilies/<fase>.json` (`morning`, `lunch`,
  `afternoon`, `dinner`, `evening`, `day_end`) og handler **kun** om livet utenfor
  jobben: morgenrutine, mat, hvile, økonomi, familie, venner, fritid, helse, søvn,
  læring, personlig kalender, sosialt liv, energi og psyke. De handler **aldri**
  om aktiv jobbcase, arbeidsgiveroppgave, plansjef, utvalg, utbygger, plankart,
  Lillebekk, varelevering, rolleprogresjon, mailPlan, role_scope eller
  arbeidsleveranse. Builderen bruker **ikke** mailPlan, role mail families,
  plannedPrimary eller role_scope. Kontrakt: **maks 1 aktiv mail per privat fase.**
  Alle private fase-mailer bærer:
  `source_type:"daily_private_phase"`, `channel:"private"`,
  `messageChannel:"private"`, `mail_class:"daily_private"`, `role_scope:""`,
  `career_id:""`, `role_id:""`, `employer_id:""`, `workday_related:false`,
  `profile_signal_source:true`.
- **Private fase-mailer er en projeksjon av History Go-profilen.** Hvem er
  spilleren utenfor jobben? `CivicationProfileSignalBridge` normaliserer det
  spilleren faktisk har bygget opp i History Go — steder samlet, badges,
  quiz-styrker, folk møtt, kapital, identitetsfokus og psyke — til
  `profileTags` og `privatePhaseWeights` (culture, sport, nature, politics,
  social, learning, economy, rest, family, subculture). Mailer i
  `privatePhaseMailFamilies/` kan bære match-regler
  (`requiresAnyProfileTags`, valgfritt `avoidAnyProfileTags`) og vektstier
  (`weightFrom`, f.eks. `"capital.cultural"` eller
  `"privatePhaseWeights.sport"`): kulturell profil får kultur-/sted-/
  læringsmail om kvelden, sport-profil får bane/trening om ettermiddagen,
  natur-profil får grønne pauser, politisk profil får lokalmøter, sosial
  profil får invitasjoner fra kontakter — og lav psyke gir hvile/søvn/ro,
  aldri mer press. To spillere med samme jobb men ulik History Go-profil får
  dermed ulike private fase-mailer; samme profil med ulik jobb får de samme.
  Mailer uten match-regler er den trygge generiske fallback-poolen (aldri
  jobbtekst, aldri «som {rolle}» / «arbeidsdagen»).
- **Arbeidslivsmail** eies av `CivicationWorkdayMailBuilder`. De bygges fra
  `mailPlan` + `mailFamilies` (via `CivicationMailRuntime`), er knyttet til
  arbeidsgiver/rolle/`workday_day_index`, og kan **kun** ha `phase_tag`
  `forenoon` eller `workday`. De lever kun inne i arbeidsdag-runtime.
- Morgenen leverer ingen case-mail. Med aktiv jobb viser den en overgang: *«Du
  har jobb som {rolle}. Neste handling: Gå til jobb / Start arbeidsdag hos
  {arbeidsgiver}.»*
- **Arbeidsdag-telleren (`workday_day_index`) er frikoblet fra døgnfase-telleren
  (`calendar.dayIndex`).** Den økes kun når arbeidsdagen faktisk fullføres, aldri
  bare fordi en ny døgnfase starter.

`CivicationDailyMailBuilder` er nå en **adaptor**: den bygger ikke lenger både
private faser og arbeidsdag i samme runtime selv. Den delegerer de private fasene
til `CivicationPrivatePhaseMailBuilder` og eier fortsatt dagsrytmen/leveringen,
mens arbeidslivsmailene bygges av `CivicationWorkdayMailBuilder`.

Kanal-/blokkerings-kontrakten (to rytmer hele veien opp):

- `CivicationEventChannels`: `daily_private`/`daily_private_phase` er **alltid**
  private; `daily_generated`/`daily_extra` klassifiseres **ikke** automatisk som
  jobb — jobb krever `daily_workday` eller en reell workday/role/employer-binding.
- `CivicationDayProgression`: en privat fase blokkeres **bare** av private
  fase-mailer, og arbeidsdagsfasen **bare** av arbeidslivsmail. En åpen jobbmail i
  den globale innboksen stopper ikke lunsj/middag/kveld/dagslutt.
- `CivicationNextActionSelector`: i private faser returneres **aldri**
  arbeidslivsmail; i arbeidsdagsfasen kan den. Fallback til global innboks scopes
  etter `DayFlow`.
- `renderCivicationInbox`: private faser viser ingen aktiv Jobbmail-seksjon
  (jobbmail kan ligge som arkiv/bakgrunn); arbeidsdagsfasen viser jobbmail/arbeidsdag.

Eierne:

| Motor | Global | Ansvar |
| --- | --- | --- |
| PrivatePhaseMailBuilder | `CivicationPrivatePhaseMailBuilder` | Bygger de private fase-mailene fra `data/Civication/privatePhaseMailFamilies/`. Maks 1 aktiv mail per privat fase. Aldri jobb, aldri mailPlan/role families/role_scope. `buildPhaseMail` / `buildPrivatePhaseItems`. |
| WorkdayMailBuilder | `CivicationWorkdayMailBuilder` | Bygger arbeidslivsmailene fra mailPlan + mailFamilies. `phase_tag` klippes alltid til `forenoon`/`workday`. Stempler `role_scope`/`employer_id`/`workday_day_index`. `buildWorkdayItems`. |
| DailyMailBuilder | `CivicationDailyMailBuilder` | Adaptor for dagsrytmen: delegerer private faser til PrivatePhaseMailBuilder, eier levering/`enqueueNext`/`inspect`. |
| DayFlow | `CivicationDayFlow` | Controller for livsrytmen: kjenner `current_day_phase`, `has_active_job`, `workday_completed_today` og oversetter til én neste handling (`go_to_work` i morgenfasen). `goToWork()` starter arbeidsdagen og flytter inn i arbeidsfasen; `finishWorkday()` fullfører og returnerer til privat rytme. |
| WorkdayRuntime | `CivicationWorkdayRuntime` | Eier arbeidsdag-status (`workday_runtime_v1`): arbeidsgiver (`employer_id`), `role_scope`, og arbeidsdag-telleren. `startWorkday` / `completeWorkday` (idempotent per dato) / `getWorkdayDayIndex`. |

Tråd-dedupe/threadKey fra den forrige opprydningen beholdes som **sikkerhetsnett**,
men hovedløsningen er denne separasjonen mellom privat dag og arbeidsdag.

## Psyke og Psykologrommet

`CivicationPsyche` (`js/Civication/core/CivicationPsyche.js`) eier psyke-state: tillit pr.
karriere, integritet, synlighet, økonomisk handlingsrom, autonomi, burnout og kollaps — pluss
**psykologisk kompetanse/resiliens**.

Koblingen til Psykologrommet (`js/psychologyRoom.js`, en innsiktsnode med id `psychology_room`):

1. Når spilleren fullfører en test/screening/refleksjon i rommet, kalles
   `CivicationPsyche.addPsychologyCompetence(activity, points)`.
2. **Anti-farming:** hver aktivitet («`type:sourceId`», journal pr. dag) gir kompetanse bare
   én gang; delta halveres og klemmes til 1–8, kompetanse 0–100.
3. Kompetansen demper negative psyke-deltaer via
   `applyPsycheResilienceModifier(value, state, …)` — brukt i `systems/day/dayConsequences.js`
   (dagskonsekvenser) og i `civicationCareerOutcomeRuntime.js` (autonomi). Effekten er
   kvantifisert av `getPsychologyResilience()` (`{ competence, reduction, reductionPct }`), og
   psyke-kortet (`CivicationMiniSectionsUI`) viser den som «Resiliens: demper negative
   psyke-treff med X%» — så spilleren ser hva kompetansen faktisk gjør.
4. Når kompetansen faktisk demper et treff (via `update*` → `recordResilienceMeta`), lagres det
   som `player.lastPsycheResilience`, en kvantifisert toast vises («… dempet integritet-treffet:
   −10 → −6.4»), og psyke-kortet viser siste hendelse via
   `getLastResilienceEvent()` («Sist dempet: integritet −10 → −6.4»).

Status: Psykologrommet (`js/psychologyRoom.js`) er interaktivt — tester/screening, øvelser,
7-dagersløp, refleksjonsjournal og **CBT-verktøy** (fylles ut som arbeidsark) gir alle
innsiktspoeng og (anti-farmet) psykologisk kompetanse via `completeSession →
addPsychologyCompetence`. Verktøyene kan også fullføres programmatisk med
`PsychologyRoom.completeTool(toolId, { steps, reflections })`. Psyke-kortet viser nå
resiliens-effekten direkte. Videre polering (flere verktøytyper, psyke-effekter på flere
kort/flater) gjenstår.

## Hvordan et svar flyter

```text
NextActionUI (klikk på data-civi-next-action-answer)
  → CivicationMailEngine.answerMail(mailId, choiceId)
    → HG_CiviEngine.answer(eventId, choiceId)        // EventEngine: choice-effekter
      → score / strikes / stability / kapital / psyke / task / followups
  → mail markeres resolved
  → events: civi:inboxChanged, civi:dayPhaseChanged, updateProfile
  → NextAction re-rendrer neste handling, ellers lukkes modalen
```

## Hendelser og state-nøkler

Sentrale events (alle flater lytter og re-rendrer på disse):

```text
civi:dayPhaseChanged   civi:inboxChanged   civi:booted
updateProfile          civi:psychologyCompetence
```

Sentrale localStorage-nøkler:

```text
hg_civi_state_v1   hg_civi_mail_v1   hg_civi_inbox_v1   hg_active_position_v1
hg_psyche_v1       hg_capital_v1     hg_civi_calendar_v1
mail_runtime_v1    mail_day_runtime_v1   life_mail_runtime_v1
```

Prinsipp: **State lagrer hva spilleren har gjort. Datafilene definerer hva rollen og mailene
er. Runtime binder dem sammen. UI viser state — det eier ikke progresjonen.**

## Data: hvor rollene bor

```text
data/badges.json
  → data/Civication/roleModels/{kategori}/{role_scope}.json     (rollebibel)
  → data/Civication/workGrammars/{kategori}/{role_scope}.json    (FWG / stillingsgrammatikk)
  → data/Civication/mailPlans/{kategori}/{role_scope}_plan.json  (dramaturgi)
  → data/Civication/mailFamilies/{kategori}/{type}/{role_scope}_{type}.json  (scener)
  → data/Civication/lifeMails/                                   (livshendelser)
  → data/Civication/mailDayProgram.json                          (dagsrytme)
  → data/Civication/rolePackIndex.json                           (generert pakkedybde-indeks)
```

`rolePackIndex.json` genereres av `npm run audit:civication:role-packs` og leses i runtime av
`systems/civicationRolePackDepth.js` (`window.CivicationRolePackDepth`): jobbtilbudskortet
viser om rollen bak tilbudet har full, delvis eller generisk rollepakke, målt mot pakken
runtime-resolveren faktisk vil spille. Regenerer indeksen når rollepakker endres.

Referanserolle (komplett FWG-styrt): **Arealplanlegger** (`by/by_radgiver_plan`).

`historyPeople_index.json` genereres av `npm run civication:history-people:build` fra
`data/people/manifest.json` (aldri redigeres for hånd; synk-sjekkes av
`npm run civication:history-people:check`, som også kjøres i `tools:check`). Den er en lett,
kategorigruppert indeks over History Go-personene som `systems/civicationHistoryPeopleBridge.js`
laster i én fetch. `people_access_map.json`-arketypene peker på personkategorier via
`hg_categories` (eksplisitte rå category-verdier, valideres av check-skriptet — ingen
normalisering/gjetting).

## Validering

```bash
node tests/civication-next-action-consolidation.test.js   # NextAction er eneste svarflate
node tests/civication-arealplanlegger-mail-plan.test.js    # deterministisk dag 1
node tests/civication-mail-choice-uniqueness.test.js       # ingen dupliserte valgpar
node tests/civication-psychology-competence.test.js        # psyke-kompetanse + anti-farming
node scripts/audit-civication-fwg-governance.mjs           # FWG styrer mailFamilies (report-only)
node tests/run-civication-tests.mjs                        # ALLE tests/civication-*.test.js (glob)
node tests/run-civication-tests.mjs phase-bundle           # filtrer på delstreng
npm run test:civication                                    # glob-runneren + jobb-audits (CI)
```

I konsoll (per `README/README_DEV.md`):

```js
CivicationDailyMailBuilder.inspect()
CivicationMailRuntime.inspect()
CivicationNextActionSelector.getCurrent()
CivicationPsyche.getSnapshot()
```
## Civication v0.1 spillflyt: én aktiv handlingsflate

NextAction er eneste aktive handlingsflate for dagsflyten. `CivicationNextActionSelector` velger én aktiv handling fra dagfasen først, deretter eventuell fase-advance, og bare som fallback en åpen innboksmail. `CivicationNextActionUI` er derfor eneste primære UI som rendrer svarvalg med `data-civi-next-action-answer`.

Dagens fase er passiv fasefortelling/status: den viser hvor spilleren er, hvor mange saker som er åpne, og hvilken sak som kommer neste, men den rendrer ikke svarvalg. Innboksen er arkiv, bakgrunn, historikk og detaljer; åpne saker rutes til NextAction i stedet for å få egne svarknapper. WorkdayPanel forklarer rollepakken, arbeidsdagen og faseprogresjon, men konkurrerer ikke med NextAction.

FWG-data styrer rollelogikk, arbeidsgrammatikk og mailfamilier. Mailer er scener i en arbeidsdag, ikke bare notifikasjoner. For Civication v0.1 er `by/by_radgiver_plan` (Arealplanlegger) og `naeringsliv/renholder` (Renholder) de to viktigste spillbare referanserollene: de skal kunne sammenlignes i samme day/phase/runtime-kontrakt, men bruke tydelig ulike konflikter, aktører, rom og valg. Barnehageassistent (`sosial_laering/barnehageassistent`) er nå også uten avvik i FWG-governance-auditen (`npm run audit:civication:fwg-governance`), men er ikke prioritert som referanserolle i v0.1.

Reaktive mailer fra motoren (strike-advarsler, generiske followups) fortrenger aldri en aktiv rolleplan: `answer()` hopper over den direkte advarsels-enqueuen for planlagte mailer og tråder (`isPlanManagedEvent`), slik at den deterministiske dags-/ukesrekkefølgen holder for alle spillestiler. Advarselstilstanden (`stability`/`strikes`) settes fortsatt i state og plukkes opp av de vanlige flytene.

