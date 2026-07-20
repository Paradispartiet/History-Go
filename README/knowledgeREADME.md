# Knowledge – personlig minnekammer i History Go

## Kanonisk definisjon

> **Knowledge er brukerens personlige, systematiserte forhold til kanonisk fagkunnskap: emner, begreper, terminologi, kunnskapsenheter, relasjoner og historier som brukeren har møtt gjennom vurdert læring.**

Knowledge er ikke en samling av quizspørsmål. Quiz er vurdering og evidens. Selve kunnskapen skal finnes som egne faglige objekter som kan gjenbrukes, kobles og forstås på tvers av quizzer, steder og personer.

Den fullstendige arkitekturen står i:

```text
README/KNOWLEDGE_MEMORY_CHAMBER.md
data/knowledge/knowledge_system_policy_v1.json
data/knowledge/knowledge_unit_schema_v1.json
```

---

## 1. Den faglige kjeden

```text
Fagkart / pensum
        ↓
Emne
        ↓
Begreper og terminologi
        ↓
Kunnskapsenheter og historier
        ↓
Quiz / vurdering
        ↓
Læringsevidens og mestring
        ↓
Personlig Knowledge-minnekammer
```

Alle nye Knowledge-koblinger skal kunne spores gjennom denne kjeden.

---

## 2. Ansvarsdeling

### Fagkart og pensum

Definerer fagets domener, progresjon, metoder og faglige grenser.

### Emne

Er den faglige beholderen. Et emne samler kunnskapsenheter, begreper, terminologi, metoder, steder, personer og historier.

Et emne er ikke en quiz og ikke et enkelt faktum.

### Begrep

Et `concept_id` representerer en faglig idé, prosess, sammenheng, motsetning eller analytisk kategori.

### Terminologi

Et `term_id` representerer en presis fagterm med foretrukket navn og definisjon. Synonymer skal registreres eksplisitt. History Go skal ikke normalisere seg fram til nye begreper eller synonymer.

### Kunnskapsenhet

En `knowledge_unit_id` representerer det minste selvstendige faglige innholdet som kan forstås, kobles, testes og repeteres.

Eksempler på typer:

```text
definition
fact
process
cause_effect
relation
comparison
method
event
biography
place_reading
story_fragment
interpretation
```

### Historie

En `story_id` binder sammen hendelser, steder, personer og kunnskapsenheter i et faglig eller kronologisk forløp.

En rekke quizspørsmål om samme sted er ikke automatisk en historie.

### Quiz

Quiz peker til kunnskapsenhetene den tester. Et riktig svar skaper læringsevidens og oppdaterer brukerens mestring av den kanoniske kunnskapen.

### Knowledge

Knowledge lagrer brukerens relasjon til kunnskapen:

```text
encountered
recognized
understood
explained
applied
repeated
```

Quiz-ID, sted og person beholdes som proveniens og kontekst.

---

## 3. Hva skaper Knowledge?

En vurdert læringssituasjon skaper evidens. Quiz er dagens hovedkilde.

Observasjon, besøk, innsjekk, samling og notater kan gi kontekst og progresjonssignal, men de skaper ikke alene en vurdert Knowledge-mestring.

```text
Handling / besøk / observasjon
        ↓
Learning log / erfaring / kontekst

Riktig quiz-svar / vurdert forståelse
        ↓
Learning evidence
        ↓
Personlig mestring av canonical knowledge units
```

---

## 4. Nye quizkontrakter

Nye quizspørsmål skal minst ha:

```text
subject_id eller categoryId
emne_id eller emne_ids
primary_knowledge_unit_id
knowledge_unit_ids
concept_ids
term_ids
learning_objective_id
evidence_type
source / claim_basis
```

Når relevant:

```text
story_ids
relation_ids
method_ids
chronology_ids
```

Legacy-feltene kan beholdes:

```text
knowledge
core_concepts
related_emner
```

Men de skal ikke være eneste faglige kobling i ny produksjon.

`knowledge` kan brukes som kort feedbacktekst, men den kanoniske påstanden skal ligge i kunnskapsenheten.

---

## 5. Begreper skal være presise

Begreper og terminologi er minnekammerets semantiske motor.

De skal brukes til:

- emnekobling
- fagordregister
- sammenhenger mellom kunnskapsenheter
- søk og gjenfinning
- videre læringsforslag
- AHA / innsiktsmotor
- repetisjon og mestring

Følgende skal ikke automatisk bli begreper:

- tags
- quiz-ID-er
- target-ID-er
- sted-ID-er
- generelle stemningsord
- UI-etiketter

Dagens V2-runtime inkluderer fortsatt `tags` i sin legacy-normalisering. Dette er en overgangsfunksjon og skal ikke brukes som fasit for ny produksjon.

---

## 6. Knowledge-siden

Canonical side:

```text
knowledge.html
knowledge.html?subject=by
knowledge.html?subject=historie
knowledge.html?subject=sport
...
```

Siden skal utvikles til én samlet read-model med disse inngangene:

1. fag og emner
2. begreper og terminologi
3. kunnskapsenheter
4. historier og tidsforløp
5. relasjoner mellom ideer, steder, personer og hendelser
6. kilder og proveniens
7. mestring og repetisjon

Quizspørsmål kan vises under «slik lærte du dette», men skal ikke være hovedorganiseringen.

> **Knowledge-siden er et minnekammer, ikke en gjennomføringslogg.**

---

## 7. Runtime-status

### Aktiv overgangsmodell

```text
js/knowledgeV2.js
hg_knowledge_entries_v2
history_go_knowledge_entry_v2
```

V2 bevares for bakoverkompatibilitet. Den fanger quiztekst og organiserer entries etter fag og emner.

V2 er nå en overgangsmodell. Videre runtimearbeid skal:

1. lagre `knowledge_unit_id`, `concept_id`, `term_id` og `story_id`
2. skille canonical content fra personlig mestring
3. samle flere quizbevis under samme kunnskapsenhet
4. hindre at tags behandles som fagbegreper
5. bygge Knowledge-siden fra faglige objekter, ikke fra en flat liste over quiztekster

### Legacy

```text
knowledge_universe
hg_learning_log_v1
hg_learning_v1
hg_insights_events_v1
```

Legacy-data skal bevares. Usikre koblinger skal merkes som uløste, ikke gis falsk presisjon.

---

## 8. Canonical personlig memory node

Målmodellen for personlig Knowledge er en referanse til canonical kunnskap, ikke en ny kopi av hele quizspørsmålet.

```json
{
  "schema": "history_go_personal_memory_node_v1",
  "version": 1,
  "memory_node_id": "km_sport_ku_skoytemuseet_samling",
  "knowledge_unit_id": "ku_sport_skoytemuseet_samling",
  "subject_id": "sport",
  "emne_ids": ["em_sport_stedlig_idrettshukommelse"],
  "concept_ids": ["concept_sport_idrettshukommelse"],
  "term_ids": ["term_sport_idrettshukommelse"],
  "story_ids": ["story_sport_norsk_skoytehistorie"],
  "mastery_state": "understood",
  "evidence": [
    {
      "type": "quiz",
      "quiz_id": "sport_skoytemuseet_set_1_q1",
      "target_id": "skoytemuseet",
      "correct": true,
      "learned_at": "2026-07-21T00:00:00.000Z"
    }
  ],
  "last_seen_at": "2026-07-21T00:00:00.000Z",
  "times_seen": 1
}
```

---

## 9. Audit-regler

For ny produksjon skal audit kontrollere:

1. fag finnes
2. emne finnes
3. `primary_knowledge_unit_id` finnes
4. knowledge unit peker tilbake til emne
5. `concept_ids` og `term_ids` finnes og er faglige
6. story-koblinger finnes når de brukes
7. quizfeedback kan spores til canonical claim
8. source/claim basis finnes
9. samme påstand gjenbruker samme knowledge unit
10. Knowledge lagrer mestring og proveniens, ikke bare en ny kopi av quizen

Audit skal skille mellom:

- `error`: faglig kjede er brutt
- `warning`: data er bevart, men legacy eller svakt koblet

Ingen data skal slettes automatisk.

---

## 10. Låste regler

- Én canonical Knowledge-arkitektur.
- Strenge ID-er og ingen automatisk normalisering.
- Emner organiserer faget.
- Begreper og termer gir presist språk.
- Kunnskapsenheter bærer påstander og forklaringer.
- Historier binder kunnskapsenheter sammen.
- Quiz tester; den eier ikke kunnskapen.
- Knowledge lagrer personlig mestring og proveniens.
- Steder og personer er kontekst, ikke kunnskap i seg selv.
- Legacy-data bevares ærlig.

---

## Kortform

```text
Fagstruktur = hva som finnes å lære
Emne = hvor kunnskapen hører hjemme
Begrep og term = språket kunnskapen forstås med
Knowledge unit = det faglige innholdet
Historie = sammenhengen over tid og på tvers
Quiz = vurdert møte med kunnskapen
Learning evidence = dokumentasjon på møtet
Knowledge = brukerens systematiserte minnekammer og mestring
```
