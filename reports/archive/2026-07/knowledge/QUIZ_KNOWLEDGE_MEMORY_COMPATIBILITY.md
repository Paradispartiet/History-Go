# Quiz → Knowledge-minnekammer: kompatibilitetslag v1

## Formål

`js/quizKnowledgeMemory.js` samler kunnskapen fra eksisterende quizgenerasjoner uten å kreve at quizfilene skrives om, og uten å endre selve spørsmålsviseren.

Laget lytter til den eksisterende hendelsen:

```text
hg:quizCompleted
```

Deretter finner det riktig quizfil og riktig set gjennom `data/quiz/manifest.json`, bygger ett samlet kunnskapsbundle og lagrer det i:

```text
hg_knowledge_memory_v1
```

## Eksisterende motorer beholdes

Følgende motorer er fortsatt aktive og slettes eller erstattes ikke:

- `knowledge_universe`
- `history_go_knowledge_entry_v2`
- `trivia_universe`
- `hg_learning_log_v1`

Kompatibilitetslaget er et nytt samlingslag over disse systemene.

## Kilder som leses

### Fra hvert quizspørsmål

- `knowledge`
- `explanation`
- `answer`
- `trivia` som tekst, objekt eller liste
- `emne_id`
- `emne_ids`
- `related_emner`
- `core_concepts`
- `concept_ids`
- `concept_focus`
- `term_ids`
- `terminology` / `terminologi`
- `story_ids`
- `related_stories`
- `personId` / `person_id`
- `theorist_names`
- `related_people`
- `event_ids`
- `related_events`
- `method_id`
- `guidance_basis.method_id`
- `theory_focus`
- `source` / `sources`
- `claim_basis`
- `source_note`
- `topic`
- `dimension`
- `question_type`
- `question_family`
- `question_layer`
- `year`
- `epoke_id`
- `tags`

### Fra quizfilens toppnivå

- `profile_snapshot`
- `fun_facts` / `funFacts`
- `stories`
- `related_people`
- `related_events`
- `institutions`
- `artifacts`
- `building_stories`
- `local_conflicts`
- tilsvarende felt under `source_profile_extensions`

## Bundle

Hvert fullførte quizsett lagres som ett bundle med stabil nøkkel:

```text
<target_id>::<set_id>
```

Bundlet inneholder:

- identitet og proveniens
- fag og sted/person
- set-ID og kildefil
- resultat
- kunnskapsenheter per spørsmål
- funfacts og trivia
- historier
- personer og hendelser
- institusjoner og gjenstander
- bygningshistorier og konflikter
- emner, begreper, termer, metoder og kilder
- status for lesing, mestring og repetisjon

## Evidensstatus

```text
collected
```

Kunnskapen er samlet fra quizfila og lagret.

```text
presented
```

Brukeren har åpnet kunnskapspopupen.

```text
read
```

Brukeren har trykket **Lest – legg i Knowledge**.

```text
mastered
```

Spørsmålet ble besvart riktig.

```text
needs_review
```

Spørsmålet ble besvart feil og kunnskapen er lagt til repetisjon.

## Sluttoppsummering

Spørsmålsviseren er uendret.

Etter fullført quiz eller set får den eksisterende sluttoppsummeringen en ny knapp:

```text
Kunnskapen du samlet (N)
```

Knappen åpner en egen kunnskapspopup med:

- kunnskapspunktene
- mestret / til repetisjon
- funfacts og trivia
- historier
- begreper og emner

## Browser-API

```js
window.buildQuizKnowledgeBundle(input)
window.HGQuizKnowledgeMemory.buildQuizKnowledgeBundle(input)
window.HGQuizKnowledgeMemory.readMemory()
window.HGQuizKnowledgeMemory.saveBundle(bundle)
window.HGQuizKnowledgeMemory.openKnowledgePopup(bundleOrId)
```

## Test

```bash
node --test tests/quiz-knowledge-memory.test.js
```

Testen dekker:

- spørsmål og toppnivåbanker i samme bundle
- mestret mot repetisjon
- trivia som tekst og liste
- lagring og indeksering etter fag, sted, emne og begrep

## Neste integrasjon

Den fulle `knowledge.html`-siden skal senere lese `hg_knowledge_memory_v1` som en førsteklasses datakilde sammen med eldre Knowledge-data. Det skal gjøres uten å slette eller overskrive de eldre lagrene.
