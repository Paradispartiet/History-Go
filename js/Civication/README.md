# Civication — motorer og spillvei gjennom dagen

Oppdatert: 2026-06-30

Civication er en samfunns-/livssimulator som kjøres fra `Civication.html` (og delvis fra
`index.html`/`profile.html`). Dette dokumentet forklarer **motorene** og **den ene spillveien
gjennom en dag**: hvem som eier hva, hvordan et svar flyter, og hvor data ligger.

Dette er motoroversikten. Selve mail-/rolledatakontrakten (badge → roleModel → mailPlan →
mailFamily → FWG) er beskrevet i [`data/Civication/README-mailsystem-og-rolemodels.md`](../../data/Civication/README-mailsystem-og-rolemodels.md)
og FWG-standarden i [`docs/CIVICATION_WORK_GRAMMAR_STANDARD.md`](../../docs/CIVICATION_WORK_GRAMMAR_STANDARD.md).

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
| DailyMailBuilder | `CivicationDailyMailBuilder` | Bygger **én spillbar arbeidsdag**. Sjekker FØRST om et episode-script finnes for aktiv rolle/dag (`data/Civication/roleEpisodes/manifest.json`) — da eier scriptet dagen og bygger køen kun fra beats. Ellers bygges dagen fra `data/Civication/mailDayProgram.json`: faser (`morning … day_end`), slots, volum og rytme; velger dagens mailer fra katalogene, holder uke-2-innhold (`_week2_`/`advanced` i id/family) utenfor dag 1 til rolleplanen når det. `buildQueue` / `enqueueNext` / `inspect`. |
| MailRuntime | `CivicationMailRuntime` | **Langsiktig rolleprogresjon.** Resolver aktiv rolle, leser `mailPlans/{kategori}/{role_scope}_plan.json`, velger neste jobbmail fra stegets `allowed_families`, og fører rolleplanen videre. |
| MailEngine | `CivicationMailEngine` | **Innboks/lagring.** Mail-envelopes, pending/resolved/read/archive/delete, dedupe, legacy-speil til `hg_civi_inbox_v1`. `answerMail(mailId, choiceId)` kaller EventEngine og markerer resolved. |
| EventEngine | `CivicationEventEngine` / `HG_CiviEngine` | Generisk hendelsesmotor: `answer`/resolution, choice-effekter (score, strikes, stability, kapital, psyke, task completion, followups, warnings/fired). |
| IncomingFlow | `CivicationIncomingFlow` | Binder mailbatcher til dagfaser/kanaler; styrer hvilke innkommende saker som leveres når. |
| LifeMailRuntime | `CivicationLifeMailRuntime` | **Livshendelser utenfor jobbspor** (arbeidsledig, økonomi, kveld, risiko, sosialt). Brukes når spilleren mangler aktiv jobb eller har eksplisitte life-/identity-tags. Holdes adskilt fra rollebaserte jobbmailer. |
| RoleModelRuntime | `CivicationRoleModelRuntime` | Dekorerer valgte mailer med roleModel-metadata; endrer ikke mailflyten. |

Arbeidsdeling i én setning: **MailRuntime velger hvilken mail som skal komme, DailyMailBuilder
bestemmer dagens rytme, MailEngine lagrer og viser den, EventEngine beregner svaret.**

### Narrativ først, mail som kanal (episode-scripts)

**En rolle-dag er en episode, ikke en inbox-feed.** For scriptede dager er mailmotoren kun
transportlag — den er ikke dramaturg. Et episode-script
(`data/Civication/roleEpisodes/<kategori>/<role_scope>_day<N>_<case>.json`, registrert i
`roleEpisodes/manifest.json`) beskriver dagens beats: hvilken fase, hvilken mail (fra rollens
eksisterende mailFamilies), hvilken story-node. Finnes et script for aktiv rolle/dag, gjelder
en **hard guard** i `buildQueue`: køen bygges fra scriptet, og den generelle pool-/slot-
generatoren kjøres ikke i det hele tatt. Reglene for en scripted day:

- maks **én aktiv beslutningsmail per fase**, og maks én hovedkonflikt om gangen
- maks **6–7 hovedmailer** per dag
- maks **én aktiv mail per story-node** — aldri micro-, followup-, consequence- og
  people-versjonen av samme narrative situasjon samtidig
- beats som peker på ukjent mail-id eller gjenbrukt story-node hoppes over med
  `console.error` — de erstattes **aldri** av pool-innhold (FAIL FAST, ingen gjetting)
- rolleplanen flyttes fortsatt kun gjennom den ekte planlagte kandidaten (`source_type:
  "planned"`), og day_end-oppsummering leveres av dayEvents-generatoren som før

Mailmotoren beholder infrastrukturen (levering, svarvalg, state, arkiv, konsekvenser, phase
unlock). thread_key-dedupen (`CASE_THREAD_TYPES`, sendMail-vakten, `sweepDuplicateThreadRows`)
består som **sikkerhetsnett**, ikke som hovedløsning. Generatoren kan fylle hull på dager uten
script, men får ikke overstyre en scripted day. Første episode:
Arealplanlegger dag 1 (`by_radgiver_plan_day1_lillebekk`), pinnet av
`tests/civication-arealplanlegger-episode-script.test.js`.

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

