# Civication Patch Order

Civication-runtimen er bygget av mange små moduler som koordinerer noen få delte funksjoner. Kandidatflyten har fortsatt enkelte historiske wrappers. **Svarflyten er under aktiv strangler-migrering til `CivicationChoiceDirector`**, som skal være eneste eier av `CivicationEventEngine.prototype.answer` når migreringen er ferdig.

> Kilde: `js/Civication/civicationShellLoader.js`, de aktuelle runtimefilene og Scene Pipeline-policyen. Ikke gjett rekkefølgen — kontroller den faktiske scriptlista og ChoiceDirector-registeret.

## De tre delte sømmene

All cross-modul-koordinering går hovedsakelig gjennom tre mekanismer:

1. **`window.CiviMailPlanBridge.makeCandidateMailsForActiveRole(active, state)`** — bygger dagens kandidat-mailer for aktiv rolle. Wrappes for å filtrere/score/variere kandidatene.
2. **`CivicationChoiceDirector`** — canonical svargrense for `CivicationEventEngine.prototype.answer(eventId, choiceId)`. Rundt-svar-logikk registreres som prioritert middleware; valgkonsekvenser registreres som handlers.
3. **Event-bussen** (`window` `CustomEvent`-er, f.eks. `civi:npcReaction`, `civi:inboxChanged`) — løs, rekkefølge-uavhengig kobling mellom moduler.

I tillegg dekoreres to **renderere** (`renderWorkdayPanel`, `renderCivicationInbox`) for å injisere UI uten å eie panelet.

## Strangler-prinsippet for svarflyten

Historisk gjorde hver modul dette:

```js
const prev = target.fn;
target.fn = async function (...args) {
  // egen før-/etterlogikk
  return prev ? prev.apply(this, args) : undefined;
};
```

Det gjorde oppførselen avhengig av scriptrekkefølgen. Den nye modellen er:

```js
CivicationChoiceDirector.registerAnswerMiddleware(name, async (ctx, next) => {
  // før
  const result = await next();
  // etter
  return result;
}, priority);
```

Lavere middleware-prioritet ligger **ytterst** og kjøres derfor først før `next()` og sist etter `next()`. Middleware som lastes før ChoiceDirector kan legge seg i den deferred køen `__civicationChoiceAnswerMiddlewareQueue`; Director adopterer køen ved boot. Det gjør at wrapperne kan flyttes én for én uten å endre scriptrekkefølgen eller gameplayet.

---

## Søm 1 — `makeCandidateMailsForActiveRole`

`CiviMailPlanBridge.makeCandidateMailsForActiveRole` (definert i `js/Civication/mailPlanBridge.js`) er den kanoniske kandidat-sømmen. Når `CivicationMailRuntime` er aktiv, delegerer broen til runtimens egen `makeCandidateMailsForActiveRole`, som leser `mailPlans` + `mailFamilies`.

### Wrappere på **broen** (`window.CiviMailPlanBridge`), i lasterekkefølge

| Modul | Rolle |
| --- | --- |
| `systems/day/dayPeopleMeetingGate.js` | Porter people-meeting-mailer inn/ut av kandidatsettet |
| `systems/day/dayPeopleMeetingRelationshipVariant.js` | Varierer people-meeting-mailer etter relasjonstilstand |
| `systems/day/dayChoiceToneVariants.js` | Gir valgene tonevarianter (samme effekt, ulik ordlyd) |
| `systems/day/dayAllianceMailScoring.js` | Vekter kandidatene etter alliansestate |
| `systems/day/dayFactionMailScoring.js` | Vekter kandidatene etter fraksjonsmatch |
| `systems/day/dayFactionVoice.js` | Legger fraksjonens «stemme»/innramming på mailene |

### Wrapper på **runtimen** (`CivicationMailRuntime`)

| Modul | Rolle |
| --- | --- |
| `systems/civicationCareerOutcomeRuntime.js` | Gjør kandidatene karriere-utfall-bevisste (`runtimeApi.makeCandidateMailsForActiveRole`) |

**Effektiv pipeline:** `bro (day-wrappere) → runtime (careerOutcome-wrapper) → mailPlan/mailFamilies-data`.

---

## Søm 2 — canonical `answer`-pipeline

### Canonical eier

`systems/day/dayChoiceDirector.js` eier den offentlige svargrensen. Den:

- validerer Scene Interaction-kontrakten (`decision` / `task` / `ack` / `info`) før inner state-mutasjon;
- eier det prioriterte rundt-svar-registeret `registerAnswerMiddleware(name, fn, priority)`;
- eier valg-handler-registeret `registerHandler(name, fn, priority)`;
- eksponerer `listAnswerMiddlewares()` slik at faktisk runtime-rekkefølge kan inspiseres;
- adopterer middleware som ble registrert før Director ble lastet.

### Flyttet til eksplisitt ChoiceDirector-middleware

| Prioritet | Modul | Rolle | Plassering |
| --- | --- | --- | --- |
| 10 | `systems/day/dayActiveRoleStateSync.js` | Synker `mail_system`, thread-fase og aktiv rolle etter vellykket svar | ytterst |
| 20 | `dayChoiceDirector.js` | **builtin `choice_contract`**: validering + choice-handlerpunkt | canonical grense |
| 30 | `systems/civicationLifeMailRuntime.js` | Registrerer besvart life/private-mail etter vellykket inner svar | innenfor kontrakten |
| 40 | `systems/civicationDailyMailBuilder.js` | Daily-runtime markering, suppress-followup og rollback ved svarfeil | innenfor Life |
| 50 | `systems/civicationJobEligibilityRuntime.js` | Fanger aktiv jobb før inner svar; oppretter/clearer FIRED reentry-lock kun etter vellykket svar | innenfor Daily / utenfor gjenværende legacy-kjede |

Denne rekkefølgen bevarer den tidligere nestingen:

```text
ActiveRole pre
→ Choice contract / validation
  → Life pre
    → Daily pre
      → Eligibility pre (capture activeBefore)
        → gjenværende legacy svarstabel
      ← Eligibility post (reentry-lock best-effort ved success)
    ← Daily post / rollback
  ← Life post
← choice handlers
← ActiveRole post
```

### Gjenværende legacy `answer`-wrappere

Disse fire modulene wrapper fortsatt `EventEngine.answer` direkte og skal flyttes inn i middleware-registeret i neste porter. De står her i historisk inner→outer-rekkefølge:

| Neste middleware-prioritet | Modul | Nåværende ansvar |
| --- | --- | --- |
| 90 | `systems/day/dayPatches.js` | recovery/onboarding, task-kapital, fase/followup-koordinering |
| 80 | `systems/civicationMailRuntime.js` | pre-answer mailplan-state, brandkonsekvens og trigget thread |
| 70 | `systems/civicationCareerOutcomeRuntime.js` | terminal outcome/FIRED-forberedelse og outcome-state |
| 60 | `systems/civicationJobLearningRuntime.js` | læringsprogresjon fra besvart jobbmail |

`CivicationChoiceDirector` lastes fortsatt etter disse fire. Derfor fanger Director den gjenværende legacy-kjeden som sin terminal og legger de eksplisitte middleware-stegene rundt den. Det er bevisst en overgangstilstand, ikke sluttarkitekturen.

### Valg-handler-registeret

Choice-handlere reagerer på et **reelt kildeeid valg** etter at inner svarpipeline har lyktes. De skal ikke brukes til rundt-semantikk som trenger før/etter `next()`.

| Prioritet | Modul | Handler |
| --- | --- | --- |
| 10 | `systems/day/dayConsequences.js` | `dayConsequences` (kapital/psyke/grenbias-deltaer) |
| 15 | `systems/day/dayCharacterReplyConsequences.js` | `character_reply_consequence` (NPC-karaktersvar) |
| 20 | `systems/day/dayFactionNpcReactions.js` | `faction_npc_reaction` (fraksjonsfarget NPC-replikk) |
| 20 | `systems/day/dayNpcReactions.js` | `npcReactions` (produserer `civi:npcReaction`) |

**Ny kode skal ikke legge til en direkte `EventEngine.answer`-wrapper.** Bruk `registerAnswerMiddleware` for rundt-svar-semantikk og `registerHandler` for choice-konsekvenser.

---

## Renderer-dekoratører

`renderWorkdayPanel` defineres i `ui/CivicationUI.js` og re-eksponeres globalt + speiles til `CivicationUI.renderWorkdayPanel` av `systems/day/dayPatches.js`. `renderCivicationInbox` kommer fra UI-laget.

| Modul | Injiserer |
| --- | --- |
| `systems/day/dayConsequencesUI.js` | Konsekvensboks (kapital/psyke-delta) i innboks + arbeidsdag |
| `systems/day/dayNarrativeConsequencesUI.js` | Narrativ (tillitsbasert) konsekvenstekst i innboks + arbeidsdag |

Begge er **kun visning** — effektene beregnes i `dayConsequences`.

---

## Event-bussen (rekkefølge-uavhengig)

| Event | Typisk produsent | Typiske konsumenter |
| --- | --- | --- |
| `civi:booted` | `CivicationBoot` | Moduler som må vente på ferdig boot |
| `civi:dataReady` | boot/dataflyt | `dayActiveRoleStateSync` m.fl. |
| `civi:inboxChanged` | progression/mail | UI-paneler |
| `civi:dayPhaseChanged` | `dayProgressionController` | day-/fase-UI |
| `civi:npcReaction` | NPC-reaction-systemene | allianse-, fraksjons- og karaktertråder |
| `civi:homeChanged`, `civi:mapRendered`, `civi:*MapTransformChanged` | kart/hjem-UI | tilhørende UI-lag |
| `updateProfile` | mange | History GO-profil + AHA-eksport |

---

## Regler for ny svarlogikk

1. **Validerings- og svargrensen eies av ChoiceDirector.** Ikke opprett nye direkte `proto.answer = ...`-patcher.
2. Trenger logikken kode både før og etter svaret, rollback eller midlertidig suppress-state: bruk `registerAnswerMiddleware`.
3. Trenger logikken bare å reagere på et vellykket, reelt valg: bruk `registerHandler`.
4. Middleware-prioritet er en del av kontrakten. Lavere tall er ytterst. Bevar dokumentert plassering ved migrering.
5. Middleware må kalle `next()` maksimalt én gang. Director avviser dobbelt `next()` med `choice_director_next_called_twice`.
6. Skriv ikke effekter to ganger. Progresjonseierskap ligger fortsatt hos de respektive runtime-eierne; migreringen flytter **koblingsmekanismen**, ikke domenansvaret.
7. Kandidat-mailer hører til kandidat-sømmen, ikke answer-pipelinen. Løs kobling hører til event-bussen.
8. Oppdater denne filen når en legacy-wrapper flyttes, og lås rekkefølgen med Civication-regresjon.

## Gjenværende mål for 4F

- Flytt `civicationJobLearningRuntime` → priority 60.
- Flytt `civicationCareerOutcomeRuntime` → priority 70.
- Flytt `civicationMailRuntime` → priority 80.
- Flytt `dayPatches` answer-del → priority 90.
- Når disse fire er borte, skal `CivicationChoiceDirector` være den eneste modulen som tilordner `CivicationEventEngine.prototype.answer` i den aktive produksjonsruntimen.

## Kjente forbehold

- `systems/civicationRuntimeSanityGuard.js` har historisk kode som patcher `proto.answer`, men lastes ikke av standard Civication-runtime. Hvis den skal aktiveres, må den først konverteres til ChoiceDirector-middleware.
- Wrapper-migreringen skal ikke endre gameplay-effekter, source ownership eller interaction-mode-semantikk. Hver port må være regresjonsgrønn før neste wrapper flyttes.
