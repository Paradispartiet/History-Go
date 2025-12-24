# HISTORY GO — QUIZ, LEARNING, OBSERVATIONS & COURSES
## SYSTEM README (AUTHORITATIVE / FASIT)

Dette dokumentet beskriver HELE quiz- og læringssystemet i History GO,
slik det faktisk er bygget.  
Ingen hypotetiske deler. Ingen forslag. Dette er gjeldende arkitektur.

============================================================
1. QUIZ-SYSTEM
============================================================

Filstruktur:
data/quiz/quiz_<subjectId>.json

Eksempel:
data/quiz/quiz_by.json

Quiz-item:
{
  "id": "carl_berner_quiz_1",
  "categoryId": "by",
  "personId": "carl_berner",
  "question": "Hvilken rolle hadde Carl Berner under unionsoppløsningen i 1905?",
  "options": ["Stortingspresident", "Statsminister", "Justisminister"],
  "answer": "Stortingspresident",
  "dimension": "politisk historie",
  "topic": "Unionsoppløsningen 1905",
  "knowledge": "Carl Berner var stortingspresident i 1905 og ledet Stortingets arbeid da unionen med Sverige ble oppløst."
}

Viktige regler:
- Quiz er eneste kilde til verifisert kunnskap
- Riktig svar genererer knowledge
- Quiz kan knyttes til placeId eller personId

============================================================
2. QUIZ HISTORY
============================================================

Storage:
localStorage["quiz_history"]

Bruk:
- Sjekke om quiz er fullført
- Finne sist brukt kategori

Funksjoner:
hasCompletedQuiz(targetId)
getLastQuizCategoryId(targetId)

============================================================
3. KNOWLEDGE SYSTEM
============================================================

Storage:
localStorage["knowledge_universe"]

Struktur:
categoryId →
  dimension →
    [ knowledgeItems ]

Knowledge-item:
{
  "id": "quiz_<targetId>_<quizId>",
  "topic": "…",
  "text": "…"
}

Regler:
- Knowledge lagres kun via quiz
- Knowledge er objektiv / faglig
- Observations lagres IKKE her

Rendering:
renderKnowledgeSection(categoryId)
getInlineKnowledgeFor(categoryId, targetId)

============================================================
4. LEARNING LOG (HG_LEARNING_LOG_V1)
============================================================

Storage:
localStorage["hg_learning_log_v1"]

Prinsipp:
- Append-only
- Felles datastrøm for:
  - quiz events
  - concept hits
  - emne hits
  - observations

Hjelpefunksjoner:
getLearningLog()
getUserConceptsFromLearningLog()
getUserEmneHitsFromLearningLog()

============================================================
5. OBSERVATIONS
============================================================

Observations er subjektive, brukerbaserte tolkninger.
De er IKKE knowledge.

Event-format:
{
  "schema": 1,
  "type": "observation",
  "ts": 1730000000000,
  "subject_id": "by",
  "categoryId": "by",
  "targetType": "place",
  "targetId": "place_toyen_torg",
  "lens_id": "by_stemning",
  "selected": ["trygt", "lokalt"],
  "note": "Rolig stemning på kvelden"
}

Regler:
- Lagres kun i learning log
- Vises i place-popup og person-popup
- Vises ALDRI i knowledge-seksjon

============================================================
6. OBSERVATION LENSES
============================================================

Fil:
data/observations/observations_<subjectId>.json

Struktur:
{
  "schema": 1,
  "subject_id": "by",
  "lenses": [
    {
      "lens_id": "by_brukere_hvem",
      "type": "multi_select",
      "options": []
    },
    {
      "lens_id": "by_stemning",
      "type": "multi_select",
      "allow_note": true,
      "note_max_len": 280,
      "options": []
    },
    {
      "lens_id": "by_makt_ulikhet",
      "type": "multi_select",
      "options": []
    }
  ]
}

============================================================
7. HVOR OBSERVATIONS TRIGGES
============================================================

Observations trigges KUN fra Place Card:

HGObservations.start({
  target: {
    targetId: place.id,
    targetType: "place",
    subject_id: "by",
    categoryId: "by",
    title: place.name
  },
  lensId: "by_brukere_hvem"
});

============================================================
8. EMNER & EMNE-DEKNING
============================================================

Emner lastes via:
js/emnerLoader.js

Emne-dekning:
computeEmneDekning(userConcepts, emner)
computeEmneDekningV2(userConcepts, emner, { emneHits })

V2-regel:
- Hvis emne_id finnes direkte i learning log → directHit = true
- Teller som full dekning

============================================================
9. PENSUM, MODULER & KURS
============================================================

Pensumfil:
data/pensum_<subjectId>.json

Modul:
{
  "module_id": "kur_by_01_byrom",
  "title": "Byrom og makt",
  "emner": ["em_by_romlig_orden"],
  "konsepter": ["akse", "offentlighet"],
  "quiz_sett": ["karl_johan_quiz_1"],
  "status": "pilot"
}

============================================================
10. REWARD POPUPS
============================================================

Funksjoner:
showRewardPlace(place)
showRewardPerson(person)

Reward popup:
- Viser kort
- Viser knowledge (inline)
- Viser trivia
- Har KUN én handling: "Fortsett"

Regler:
- Reward popup skal IKKE auto-forsvinne
- Reward popup skal IKKE åpne ny popup automatisk

============================================================
11. MINI-OPPDRAG (UTFASET)
============================================================

Mini-oppdrag er erstattet av:
- Quiz (objektiv kunnskap)
- Observations (subjektiv lesning)
- Notes (personlig refleksjon)

============================================================
12. SYSTEM-FASIT
============================================================

Dette må være sant:
1. Quiz er eneste kilde til knowledge
2. Knowledge ≠ observations
3. Observations lagres kun i learning log
4. Emne-dekning bruker learning log
5. Kurs/diplom bygges på emner + quiz
6. Reward popup er stabil og kontrollert

============================================================
SLUTT
============================================================
