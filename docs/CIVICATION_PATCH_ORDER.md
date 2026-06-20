# Civication Patch Order

Civication-runtimen er bygget av mange små moduler som **wrapper (monkey-patcher) noen få
delte funksjoner** i stedet for å kalle hverandre direkte. Det gir løs kobling, men gjør
oppførselen **avhengig av lasterekkefølgen** i `Civication.html`. Dette dokumentet kartlegger
hvilke moduler som patcher hva, i hvilken rekkefølge, og hva man må passe på når man legger
til en ny patch.

> Kilde: `Civication.html` (script-rekkefølgen) og toppkommentarene i hver fil. Tallene i
> parentes nedenfor er modulens posisjon i Civication-script-lista i `Civication.html`.
> Ikke gjett rekkefølgen — slå den opp i `Civication.html` hvis du er i tvil.

## De tre delte sømmene

All cross-modul-koordinering går gjennom tre mekanismer:

1. **`window.CiviMailPlanBridge.makeCandidateMailsForActiveRole(active, state)`** — bygger
   dagens kandidat-mailer for aktiv rolle. Wrappes for å filtrere/score/variere kandidatene.
2. **`CivicationEventEngine.prototype.answer(eventId, choiceId)`** (a.k.a. `HG_CiviEngine.answer`)
   — håndterer et svar på en mail/event. Wrappes for å kjøre tilleggslogikk per svar.
3. **Event-bussen** (`window` `CustomEvent`-er, f.eks. `civi:npcReaction`, `civi:inboxChanged`)
   — løs, rekkefølge-uavhengig kobling mellom moduler.

I tillegg dekoreres to **renderere** (`renderWorkdayPanel`, `renderCivicationInbox`) for å
injisere UI uten å eie panelet.

## Wrappemønsteret (les dette først)

Hver patch gjør i praksis:

```js
const prev = target.fn;                 // fang den forrige versjonen
target.fn = async function (...args) {  // installer ny
  // ... egen logikk (før og/eller etter) ...
  return prev ? prev.apply(this, args) : undefined;  // kall den forrige
};
```

Konsekvenser:

- **Sist lastet = ytterst.** Den modulen som lastes sist wrapper alle de forrige, og kjører
  «utenpå» dem.
- **Nettoeffekten avhenger av om hver wrapper kaller `prev` før eller etter sin egen logikk.**
  Derfor er lasterekkefølgen en del av kontrakten, ikke en tilfeldighet.
- En modul som **ikke** kaller `prev` bryter kjeden for alle under den. Ikke gjør det uten en
  veldig god grunn (og dokumentér den).

---

## Søm 1 — `makeCandidateMailsForActiveRole`

`CiviMailPlanBridge.makeCandidateMailsForActiveRole` (definert i `js/Civication/mailPlanBridge.js`,
**19**) er den kanoniske kandidat-sømmen. Når `CivicationMailRuntime` er aktiv, delegerer broen
til runtimens egen `makeCandidateMailsForActiveRole`, som leser `mailPlans` + `mailFamilies`.

### Wrappere på **broen** (`window.CiviMailPlanBridge`), i lasterekkefølge

| # | Modul | Rolle |
| --- | --- | --- |
| 22 | `systems/day/dayPeopleMeetingGate.js` | Porter people-meeting-mailer inn/ut av kandidatsettet |
| 23 | `systems/day/dayPeopleMeetingRelationshipVariant.js` | Varierer people-meeting-mailer etter relasjonstilstand |
| 24 | `systems/day/dayChoiceToneVariants.js` | Gir valgene tonevarianter (samme effekt, ulik ordlyd) |
| 27 | `systems/day/dayAllianceMailScoring.js` | Vekter kandidatene etter alliansestate |
| 29 | `systems/day/dayFactionMailScoring.js` | Vekter kandidatene etter fraksjonsmatch |
| 30 | `systems/day/dayFactionVoice.js` | Legger fraksjonens «stemme»/innramming på mailene |

### Wrapper på **runtimen** (`CivicationMailRuntime`)

| # | Modul | Rolle |
| --- | --- | --- |
| 77 | `systems/civicationCareerOutcomeRuntime.js` | Gjør kandidatene karriere-utfall-bevisste (`runtimeApi.makeCandidateMailsForActiveRole`) |

**Effektiv pipeline:** `bro (6 day-wrappere) → runtime (careerOutcome-wrapper) → mailPlan/mailFamilies-data`.

> Merk: day-scoring-modulene (22–30) lastes **før** EventEngine (31) og MailRuntime (76).
> De wrapper broen, ikke runtimen. Eier aldri selve mailprogresjonen — den ligger i
> `CivicationMailRuntime` (se `docs/CIVICATION_RUNTIME_OWNERSHIP_AUDIT.md`).

---

## Søm 2 — `CivicationEventEngine.prototype.answer`

Ni moduler wrapper `answer`. I lasterekkefølge (dvs. **applikasjonsrekkefølge** — sist
nederst er ytterst):

| # | Modul | Hva wrapperen gjør |
| --- | --- | --- |
| 75 | `systems/day/dayPatches.js` | Fase-HUD, recovery/onboarding, task-kapital fra valg, omtagging av pending event |
| 76 | `systems/civicationMailRuntime.js` | Driver rollebasert mailplan-progresjon videre ved svar på planned/thread-mail |
| 77 | `systems/civicationCareerOutcomeRuntime.js` | Oppdaterer karriere-utfall ut fra svaret |
| 78 | `systems/civicationJobLearningRuntime.js` | Kobler svar til jobb-/læringsprofil |
| 79 | `systems/civicationJobEligibilityRuntime.js` | Oppdaterer jobb-kvalifisering ut fra svaret |
| 80 | `systems/civicationDailyMailBuilder.js` | Daglig flyt/dagsbunke uten å overta mailplan-progresjon |
| 85 | `systems/civicationLifeMailRuntime.js` | Life/private-mail-progresjon (utenfor jobbrolle) |
| 86 | `systems/day/dayChoiceDirector.js` | Kjører det prioriterte valg-handler-registeret (se under) |
| 94 | `systems/day/dayActiveRoleStateSync.js` | Holder `mail_system`-binding/thread-fase i synk med aktiv rolle |

**Ytterst (kjøres først når `answer()` kalles):** `dayActiveRoleStateSync` →
`dayChoiceDirector` → … → `dayPatches` → original `EventEngine.answer`.

### Valg-handler-registeret (inni `dayChoiceDirector`-wrapperen)

`CivicationChoiceDirector` (86) er ikke bare en patch — den eksponerer et **prioritert
register** (`registerHandler(name, fn, priority)`, lav prioritet kjører først). Disse
modulene registrerer seg i stedet for å patche `answer` hver for seg:

| Prioritet | Modul | Handler |
| --- | --- | --- |
| 10 | `systems/day/dayConsequences.js` | `dayConsequences` (kapital/psyke/grenbias-deltaer) |
| 15 | `systems/day/dayCharacterReplyConsequences.js` | `character_reply_consequence` (NPC-karaktersvar) |
| 20 | `systems/day/dayFactionNpcReactions.js` | `faction_npc_reaction` (fraksjonsfarget NPC-replikk) |
| 20 | `systems/day/dayNpcReactions.js` | `npcReactions` (produserer `civi:npcReaction`) |

> **Foretrekk ChoiceDirector fremfor en ny `answer`-wrapper** når du vil reagere på et valg.
> Det holder `answer`-kjeden kort og gir deterministisk, prioritert rekkefølge.

---

## Renderer-dekoratører

`renderWorkdayPanel` defineres i `ui/CivicationUI.js` (55) og re-eksponeres globalt + speiles
til `CivicationUI.renderWorkdayPanel` av `systems/day/dayPatches.js` (75). `renderCivicationInbox`
kommer fra UI-laget. To moduler dekorerer dem via en lokal `patchRenderer(name, injector)`:

| # | Modul | Injiserer |
| --- | --- | --- |
| 88 | `systems/day/dayConsequencesUI.js` | Konsekvensboks (kapital/psyke-delta) i innboks + arbeidsdag |
| 89 | `systems/day/dayNarrativeConsequencesUI.js` | Narrativ (tillitsbasert) konsekvenstekst i innboks + arbeidsdag |

Begge er **kun visning** — effektene beregnes i `dayConsequences` (87).

---

## Event-bussen (rekkefølge-uavhengig)

Disse signalene kobler moduler løst og er **ikke** avhengige av lasterekkefølge. Bruk dem
fremfor en ny wrapper når koblingen ikke trenger å stå i en bestemt rekkefølge.

| Event | Typisk produsent | Typiske konsumenter |
| --- | --- | --- |
| `civi:booted` | `CivicationBoot` (102) | Moduler som må vente på ferdig boot |
| `civi:dataReady` | boot/dataflyt | `dayActiveRoleStateSync` m.fl. |
| `civi:inboxChanged` | progression/mail | UI-paneler |
| `civi:dayPhaseChanged` | `dayProgressionController` (65) | `CivicationDayPhaseUI` (66) |
| `civi:npcReaction` | `dayNpcReactions` / `dayFactionNpcReactions` | `dayAllianceSystem`, `dayFactionConflictSystem`, `dayNpcCharacterThreads` |
| `civi:homeChanged`, `civi:mapRendered`, `civi:*MapTransformChanged` | kart/hjem-UI | tilhørende UI-lag |
| `updateProfile` | mange | History GO-profil + AHA-eksport |

---

## Regler for å legge til en ny patch

1. **Velg riktig søm.** Reagere på et valg → registrer en handler i `CivicationChoiceDirector`.
   Endre/score kandidat-mailer → wrap `CiviMailPlanBridge.makeCandidateMailsForActiveRole`.
   Løs kobling → bruk event-bussen. Wrap `answer` direkte **bare** når ingen av de andre
   passer.
2. **Kall alltid den forrige funksjonen** (`prev.apply(this, args)`) — ellers bryter du kjeden
   for alle under deg.
3. **Idempotent patching.** Sett et `__patched`-flagg (slik `mailPlanBridge` bruker
   `__civicationMailRuntimePatched` og `dayPatches` bruker `__civiDayPhaseUiPatched`) så
   modulen ikke wrapper to ganger ved re-init.
4. **Skriv ikke effekter to ganger.** Konsekvens-/followup-eierskap ligger hos
   EventEngine/MailRuntime/DailyMailBuilder — se `docs/CIVICATION_RUNTIME_OWNERSHIP_AUDIT.md`.
   `CivicationIncomingFlow.applyConsequences` er read-only uten eksplisitt flagg.
5. **Plassér scriptet riktig i `Civication.html`.** Day-scoring-modulene må ligge etter
   `mailPlanBridge` (19); `answer`-wrappere etter `civicationEventEngine` (31); handler-moduler
   etter `dayChoiceDirector` (86). Oppdater tabellene i dette dokumentet når du legger til en rad.
6. **Topp-kommentar er påkrevd.** Hver day-fil har en kort header som sier hva den eier og
   hvordan den hekter seg på. Følg samme mal.

## Kjente forbehold

- **`systems/civicationRuntimeSanityGuard.js` patcher `proto.answer`, men lastes ikke av
  `Civication.html`.** Den er per i dag en sovende modul. Hvis den skal aktiveres, må posisjonen
  i kjeden bestemmes bevisst (den er ment som et ytterste sanity-sjekk-lag).
- **Patch-stabelen er kraftig, men skjør.** Ni `answer`-wrappere + syv kandidat-wrappere betyr
  at en feilplassert eller `prev`-glemmende patch kan endre oppførsel stille. Foretrekk
  ChoiceDirector-handlere og event-bussen; reserver direkte wrapping til runtime-eierne.
- Wrapper-rekkefølgen her gjenspeiler `Civication.html` på skrivetidspunktet. Hvis lista i HTML
  endres, er **HTML fasiten** — oppdater dette dokumentet, ikke omvendt.
