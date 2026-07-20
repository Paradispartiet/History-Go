# Knowledge – personlig minnekammer i History Go

## Kanonisk definisjon

> **Knowledge er brukerens personlige, systematiserte forhold til fagkunnskap: emner, begreper, terminologi, kunnskapsenheter, relasjoner og historier som brukeren har møtt, lest og arbeidet med i History Go.**

Kunnskapen kan komme fra mange flater: steder, personer, emner, fagtekster, historier, Wonderkammer og quiz.

Quiz har en særrolle. Den er både:

- et sted kunnskap samles og formidles
- en prøve
- dokumentasjon på hva brukeren har møtt og lest
- dokumentasjon på hva brukeren har mestret

Knowledge skal ikke være en flat liste over quizspørsmål. Quizinnholdet skal kobles til stabile faglige objekter slik at samme kunnskap kan finnes igjen og settes i sammenheng på tvers av hele appen.

Den fullstendige arkitekturen står i:

```text
README/KNOWLEDGE_MEMORY_CHAMBER.md
data/knowledge/knowledge_system_policy_v1.json
data/knowledge/knowledge_unit_schema_v1.json
data/quiz/quiz_knowledge_delivery_contract_v1.json
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
Formidling gjennom steder, personer, emner, historier og quiz
        ↓
Quizlesing og vurdering
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

Er den faglige beholderen. Et emne samler kunnskapsenheter, begreper, terminologi, metoder, steder, personer, quizzer og historier.

Et emne er ikke en quiz og ikke et enkelt faktum.

### Begrep

Et `concept_id` representerer en faglig idé, prosess, sammenheng, motsetning eller analytisk kategori.

### Terminologi

Et `term_id` representerer en presis fagterm med foretrukket navn og definisjon. Synonymer skal registreres eksplisitt. History Go skal ikke normalisere seg fram til nye begreper eller synonymer.

### Kunnskapsenhet

En `knowledge_unit_id` representerer det minste selvstendige faglige innholdet som kan formidles, forstås, kobles, testes og repeteres.

Eksempler:

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

Den samme kunnskapsenheten kan vises på stedssiden, personsiden, emnesiden, historiesiden, i Wonderkammer, i quiz og på Knowledge-siden.

### Historie

En `story_id` binder sammen hendelser, steder, personer og kunnskapsenheter i et faglig eller kronologisk forløp.

En rekke quizspørsmål om samme sted er ikke automatisk en historie.

### Quiz

Quiz er både læringsflate og prøve.

Den skal:

1. samle relevant kunnskap i et faglig forløp
2. formidle kunnskapen gjennom spørsmål, svaralternativer og forklaring
3. teste bestemte kunnskapsenheter, begreper og termer
4. vise kunnskapsforklaring etter svaret
5. registrere at stoffet er møtt og lest
6. registrere vurdering og mestring

Quiz kan bære hele kunnskapsforklaringen i `knowledge` eller `knowledge_payload`, men innholdet skal samtidig ha stabile faglige ID-er.

### Knowledge

Knowledge lagrer brukerens relasjon til kunnskapen, ikke bare quizresultatet.

Lesetilstander:

```text
encountered
read
```

Mestringstilstander:

```text
recognized
understood
explained
applied
repeated
```

Quiz-ID, sted, person og andre flater beholdes som proveniens og kontekst.

---

## 3. Hva vet vi gjennom quizen?

Det må skilles mellom tre ting:

```text
har møtt kunnskapen
har lest kunnskapen
har mestret kunnskapen
```

### Møtt

Når spørsmålet og kunnskapsforklaringen er vist, kan `encountered` registreres.

### Lest

Når forklaringen er vist og brukeren aktivt går videre, kan `read` registreres.

### Mestret

Et riktig svar gir vurderingsevidens i henhold til spørsmålets `evidence_type`:

```text
recognize
recall
explain
compare
connect
apply
```

Et feil svar kan fortsatt dokumentere at stoffet er møtt og lest. Det skal ikke late som brukeren har mestret det. Kunnskapen kan markeres for repetisjon.

---

## 4. Andre kunnskapskilder

Kanonisk kunnskap kan formidles gjennom:

```text
place_page
person_page
emne_page
story_page
wonderkammer
quiz
knowledge_page
curated_external_source
```

Disse flatene skal ikke opprette konkurrerende versjoner av samme faglige påstand. De skal referere til samme `knowledge_unit_id` når innholdet er det samme.

Quiz er flaten som tydeligst kan dokumentere at brukeren faktisk har lest og arbeidet med stoffet, fordi den krever et aktivt svar og en aktiv videreføring etter forklaringen.

---

## 5. Nye quizkontrakter

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
knowledge eller knowledge_payload
feedback_basis
source / claim_basis
```

Når relevant:

```text
story_ids
relation_ids
method_ids
chronology_ids
```

`knowledge_payload` kan inneholde:

```text
summary
explanation
why_it_matters
term_definitions
story_fragment
relations
source_note
```

Legacy-feltene skal beholdes:

```text
knowledge
core_concepts
related_emner
```

De skal kobles inn i den strukturerte modellen, ikke fjernes.

---

## 6. Begreper skal være presise

Begreper og terminologi er minnekammerets semantiske motor.

De brukes til:

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

## 7. Knowledge-siden

Canonical side:

```text
knowledge.html
knowledge.html?subject=by
knowledge.html?subject=historie
knowledge.html?subject=sport
...
```

Siden skal bygge én samlet read-model med:

1. fag og emner
2. begreper og terminologi
3. kunnskapsenheter
4. historier og tidsforløp
5. relasjoner mellom ideer, steder, personer og hendelser
6. kilder og steder kunnskapen ble lest
7. lesing, mestring og repetisjon
8. quizforløpene som formidlet og prøvde kunnskapen

Quizene skal være synlige som viktige læringsrom og som dokumentasjon under «slik lærte du dette». Hovedorganiseringen skal likevel være fagkunnskapen, ikke rekkefølgen quizene ble tatt i.

> **Knowledge-siden er et minnekammer, ikke bare en gjennomføringslogg.**

---

## 8. Runtime-status

### Aktiv overgangsmodell

```text
js/knowledgeV2.js
hg_knowledge_entries_v2
history_go_knowledge_entry_v2
```

V2 bevares for bakoverkompatibilitet. Den fanger quiztekst og organiserer entries etter fag og emner.

Dagens quizmotor lagrer i hovedsak Knowledge ved riktig svar og viser bare «Riktig» eller «Feil» som umiddelbar feedback. Det er ikke tilstrekkelig for den nye modellen.

Videre runtimearbeid skal:

1. vise kunnskapsforklaringen etter hvert svar
2. registrere `encountered` når forklaringen vises
3. registrere `read` når brukeren aktivt går videre
4. registrere mestring separat ved riktig svar
5. lagre `knowledge_unit_id`, `concept_id`, `term_id` og `story_id`
6. samle flere quizbevis under samme kunnskapsenhet
7. hindre at tags behandles som fagbegreper
8. bygge Knowledge-siden fra faglige objekter og læringsevidens

### Legacy

```text
knowledge_universe
hg_learning_log_v1
hg_learning_v1
hg_insights_events_v1
```

Legacy-data skal bevares. Usikre koblinger skal merkes som uløste, ikke gis falsk presisjon.

---

## 9. Canonical personlig memory node

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
  "reading_state": "read",
  "mastery_state": "understood",
  "evidence": [
    {
      "type": "quiz_read",
      "quiz_id": "sport_skoytemuseet_set_1_q1",
      "target_id": "skoytemuseet",
      "knowledge_presented": true,
      "continued_after_feedback": true,
      "recorded_at": "2026-07-21T00:00:00.000Z"
    },
    {
      "type": "quiz_assessment",
      "quiz_id": "sport_skoytemuseet_set_1_q1",
      "correct": true,
      "evidence_type": "explain",
      "recorded_at": "2026-07-21T00:00:00.000Z"
    }
  ],
  "last_seen_at": "2026-07-21T00:00:00.000Z",
  "times_seen": 1
}
```

---

## 10. Audit-regler

For ny produksjon skal audit kontrollere:

1. fag finnes
2. emne finnes
3. `primary_knowledge_unit_id` finnes
4. knowledge unit peker tilbake til emne
5. `concept_ids` og `term_ids` finnes og er faglige
6. story-koblinger finnes når de brukes
7. quizens kunnskapsinnhold kan spores til canonical claim
8. source/claim basis finnes
9. samme påstand gjenbruker samme knowledge unit
10. kunnskapsforklaringen faktisk vises etter svaret
11. `read` og mestring registreres separat
12. feil svar ikke gir falsk mestring

Audit skal skille mellom:

- `error`: faglig kjede er brutt
- `warning`: data er bevart, men legacy eller svakt koblet

Ingen data skal slettes automatisk.

---

## Låste regler

- Én canonical Knowledge-arkitektur.
- Strenge ID-er og ingen automatisk normalisering.
- Emner organiserer faget.
- Begreper og termer gir presist språk.
- Kunnskapsenheter bærer påstander og forklaringer.
- Historier binder kunnskapsenheter sammen.
- Steder, personer, emner, historier og quiz kan formidle kunnskapen.
- Quiz samler, formidler og prøver kunnskapen.
- Quiz viser både hva brukeren har lest og hva brukeren har mestret.
- Knowledge systematiserer personlig lesing, mestring og proveniens.
- Legacy-data bevares ærlig.

---

## Kortform

```text
Fagstruktur = hva som finnes å lære
Emne = hvor kunnskapen hører hjemme
Begrep og term = språket kunnskapen forstås med
Knowledge unit = det faglige innholdet
Historie = sammenhengen over tid og på tvers
Quiz = kunnskapsrom og prøve
Quizlesing = dokumentasjon på hva brukeren har møtt og lest
Quizsvar = dokumentasjon på hva brukeren har mestret
Knowledge = brukerens systematiserte minnekammer
```
