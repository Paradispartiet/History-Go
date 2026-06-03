# Civication → History Go task schema

Dette dokumentet definerer kontrakten for Civication-oppgaver som peker spilleren tilbake til History Go. Det er schema-/kontraktsarbeid: Civication forblir JavaScript, og dokumentet innfører ikke deep-link UI eller en completion bridge tilbake til Civication.

## Formål

Civication skal skape problemet, behovet eller oppgaven i spillerens livsløp. History Go er stedet spilleren går for å lære, undersøke, lese, besøke, låse opp, ta quiz eller delta i debatt.

Når oppgaven er fullført i History Go, skal en senere bro kunne rapportere fullføring tilbake til Civication som progresjon, innsikt eller konsekvens. Denne PR-en etablerer bare payload-skjemaet som gjør slike oppgaver entydige.

## Eier og runtime-kontrakt

`js/Civication/core/civicationTaskEngine.js` eier normalisering og klassifisering av History Go-task-payloads.

Eksponerte funksjoner på `window.CivicationTaskEngine`:

- `normalizeHistoryGoTaskPayload(payload)` normaliserer kjente felt uten å mutere input.
- `isHistoryGoTaskPayload(payload)` returnerer `true` når payloaden faktisk peker til History Go.

Når task engine oppretter en oppgave fra mail, normaliseres bare `task_payload` som klassifiseres som History Go-payload. Andre payloads beholdes som før.

## Normalisert payload

Normalisering returnerer et objekt med faste nøkler. Manglende felt blir `null`, og `return_context` kopieres grunt når den er et objekt.

```js
{
  task_kind: "history_go_place",
  target_type: "place",
  target_id: "akershus_festning",
  place_id: "akershus_festning",
  person_id: null,
  category_id: null,
  quiz_id: null,
  emne_id: null,
  debate_id: null,
  conflict_id: null,
  unlock_id: null,
  required_kind: null,
  completion_mode: "open_place",
  title: "Undersøk stedet",
  description: "Åpne stedet i History Go og les konteksten.",
  return_context: {
    source: "civication",
    mail_id: "mail_123"
  }
}
```

`target_id` er en samlet peker for bro-/UI-lag. Den brukes fra eksplisitt `target_id` når feltet finnes. Hvis ikke hentes den fra relevant ID-felt, for eksempel `place_id`, `person_id`, `quiz_id`, `category_id`, `emne_id`, `debate_id`, `conflict_id` eller `unlock_id`.

## Støttede target types

| `target_type` | Bruk |
| --- | --- |
| `place` | Stedsoppgaver der History Go skal åpne, besøke, quize eller lese om et sted. |
| `person` | Personoppgaver der spilleren skal åpne, lese profil eller ta personquiz. |
| `knowledge` | Kunnskaps-, kategori-, emne- eller quizoppgaver. |
| `debate` | Debatt-/konfliktoppgaver som peker mot debatt eller posisjonsvalg i History Go. |
| `unlock` | Samle-/unlockoppgaver der History Go skal registrere at noe er låst opp. |

## Støttede task kinds og completion modes

### 1. Stedsoppgave

- `task_kind`: `history_go_place`
- `target_type`: `place`
- ID-felt: `place_id`
- `completion_mode`: `open_place`, `visit_place`, `place_quiz`, `read_story`

```js
{
  task_kind: "history_go_place",
  target_type: "place",
  place_id: "PLACE_ID",
  completion_mode: "read_story",
  title: "Finn historien bak stedet",
  description: "Les stedshistorien før du svarer Civication-kontakten.",
  return_context: { mail_id: "MAIL_ID", consequence_key: "local_insight" }
}
```

### 2. Personoppgave

- `task_kind`: `history_go_person`
- `target_type`: `person`
- ID-felt: `person_id`
- `completion_mode`: `open_person`, `person_quiz`, `read_profile`

```js
{
  task_kind: "history_go_person",
  target_type: "person",
  person_id: "PERSON_ID",
  completion_mode: "read_profile",
  title: "Undersøk personen",
  description: "Les profilen i History Go før du tar stilling i Civication.",
  return_context: { mail_id: "MAIL_ID" }
}
```

### 3. Kunnskaps-/quizoppgave

- `task_kind`: `history_go_knowledge`
- `target_type`: `knowledge`
- ID-felt: `category_id`, `quiz_id`, `emne_id`
- `completion_mode`: `quiz_completed`, `correct_answer`, `read_leksikon`

```js
{
  task_kind: "history_go_knowledge",
  target_type: "knowledge",
  category_id: "CATEGORY_ID",
  quiz_id: "QUIZ_ID",
  emne_id: "EMNE_ID",
  completion_mode: "quiz_completed",
  title: "Bygg faglig grunnlag",
  description: "Fullfør relevant quiz i History Go.",
  return_context: { mail_id: "MAIL_ID", insight_key: "knowledge_evidence" }
}
```

### 4. Debattoppgave

- `task_kind`: `history_go_debate`
- `target_type`: `debate`
- ID-felt: `debate_id`, `conflict_id`
- `completion_mode`: `debate_participated`, `position_chosen`

```js
{
  task_kind: "history_go_debate",
  target_type: "debate",
  debate_id: "DEBATE_ID",
  conflict_id: "CONFLICT_ID",
  completion_mode: "position_chosen",
  title: "Ta stilling i debatten",
  description: "Velg posisjon i History Go før Civication regner ut konsekvensen.",
  return_context: { mail_id: "MAIL_ID", public_feed_key: "debate_signal" }
}
```

### 5. Unlock-/samleoppgave

- `task_kind`: `history_go_unlock`
- `target_type`: `unlock`
- ID-felt: `unlock_id`
- `required_kind`: `place`, `person`, `badge`, `player`, `object`
- `completion_mode`: `unlocked`

```js
{
  task_kind: "history_go_unlock",
  target_type: "unlock",
  unlock_id: "UNLOCK_ID",
  required_kind: "badge",
  completion_mode: "unlocked",
  title: "Lås opp nødvendig innsikt",
  description: "Samle riktig unlock i History Go før oppgaven fortsetter.",
  return_context: { mail_id: "MAIL_ID", progression_key: "unlock_gate" }
}
```

## Klassifisering

`isHistoryGoTaskPayload(payload)` er konservativ. Den returnerer bare `true` når payloaden har et konkret mål-ID-felt som normaliseres til `target_id`, og i tillegg har en støttet History Go-`task_kind` og støttet `target_type`, eller når støttet `target_type` kombineres med en støttet `completion_mode`.

Det konkrete målet kan komme fra eksplisitt `target_id`/`targetId`, eller fra et av de støttede mål-ID-feltene (`place_id`, `person_id`, `category_id`, `quiz_id`, `emne_id`, `debate_id`, `conflict_id` eller `unlock_id`). Dette hindrer tomme eller generiske payloads fra å bli behandlet som deep-linkbare History Go-oppgaver ved et uhell.

## Avgrensning for denne PR-en

Denne schema-PR-en gjør ikke følgende:

- Den implementerer ikke deep-link UI fra Civication til History Go.
- Den implementerer ikke completion bridge fra History Go tilbake til Civication.
- Den markerer ikke oppgaver som fullført uten faktisk History Go-signal.
- Den legger ikke inn store eksempeldata i mail families.
- Den endrer ikke `HG_CiviEngine.answer` sin answer-flow.
- Den endrer ikke eksisterende localStorage-nøkler.
- Den migrerer ikke Civication til TypeScript.

## Planlagte senere PR-er

1. **Deep-link UI:** En senere PR skal lese normalisert `task_payload` og vise en liten, tydelig handling som sender spilleren til riktig History Go-flate.
2. **Completion bridge:** En senere PR skal la History Go sende fullføringssignal tilbake til Civication, slik at Civication kan registrere progresjon, innsikt eller konsekvens.
