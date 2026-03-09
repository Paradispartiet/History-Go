# Set-mal for stedsknyttede quizfiler i History Go

Denne malen gjelder for `*_sets.json`-filer for steder.

## Hovedregel

Quizene er knyttet til **stedet**, ikke til emnet som egen quizmotor.

Strukturen er:

```text
place
↓
sets
↓
questions
```

Emner brukes bare som styring i de faglige settene.

## Antall set

Hver stedfil skal ha **6 set**.

Hver set skal ha **7 spørsmål**.

## Fast logikk for settene

### Set 1
Konkret og tilgjengelig.

Bruk:
- grunnleggende fakta
- plassering
- navn
- opphav
- enkel funksjon

Ikke emnebasert.

### Set 2
Fortsatt konkret og stedsnært.

Bruk:
- historie
- arkitektur
- bruk
- utvikling
- hendelser
- konkrete detaljer

Ikke emnebasert.

### Set 3
Første faglige sett.

Bruk:
- emner
- core concepts
- terminologi
- romlig analyse
- faglige forskjeller
- begrepsbruk

Dette settet skal være **emnebasert**.

### Set 4
Tilbake til stedet, men mer krevende.

Bruk:
- konkrete hendelser
- konkrete funksjoner
- personer
- institusjoner
- utviklingsløp
- spesifikke trekk ved stedet

Ikke emnebasert.

### Set 5
Andre faglige sett.

Bruk:
- teori
- struktur
- emneforståelse
- hvordan stedet kan leses faglig
- terminologi fra emner og tidligere quiz
- dypere analyse

Dette settet skal være **emnebasert**.

### Set 6
Eget begrepssett.

Bruk:
- begrepsquiz
- terminologi
- definisjoner
- konseptpar
- kjerneord fra `core_concepts`
- begreper som faktisk kan definere stedet

Dette settet skal være **begrepsbasert** og hente stoff direkte fra emnefilene, mappings og tidligere quizfelt som `core_concepts`, `concept_focus`, `topic` og `knowledge`.

## Viktig regel

Bare **set 3, set 5 og set 6** skal være emne-/begrepsbaserte.

**Set 1, 2 og 4 skal ikke styres av emnene.**
De skal bygge på interessant, konkret og stedsspesifikk informasjon.

## Kvalitetsregel

Unngå:
- samme spørsmål i flere varianter
- oppkonstruerte analyseformuleringer
- fem spørsmål som bare sier "makt", "kontroll" eller "symbolikk" på nye måter
- for enkle alternativer der ett svar skiller seg for tydelig ut
- begrepssett som bare gjentar faktaspørsmål med nye ord

Prioriter:
- konkrete fakta
- tydelige forskjeller mellom spørsmålene
- interessante detaljer
- variasjon mellom historie, arkitektur, bruk, personer, konflikter og utvikling
- skarp terminologi i set 3, 5 og 6
- begreper som faktisk hjelper spilleren å lese stedet bedre

## Filstruktur

Standard fil:

```json
{
  "targetId": "akershus_festning",
  "categoryId": "by",
  "sets": [
    {
      "set_id": "by_akershus_festning_set_1",
      "questions": []
    }
  ]
}
```

## Navn på set_id

Mønster:

```text
by_<place_id>_set_1
by_<place_id>_set_2
by_<place_id>_set_3
by_<place_id>_set_4
by_<place_id>_set_5
by_<place_id>_set_6
```

Eksempel:

```text
by_barcode_set_1
by_barcode_set_2
by_barcode_set_3
by_barcode_set_4
by_barcode_set_5
by_barcode_set_6
```

## Spørsmålsskjema

Hvert spørsmål skal følge denne strukturen:

```json
{
  "id": "barcode_quiz_1",
  "quiz_id": "by_barcode_set_1_q1",
  "categoryId": "by",
  "placeId": "barcode",
  "personId": "",
  "natureId": "",
  "question_scope": "place",
  "question": "...",
  "options": ["...", "...", "..."],
  "answer": "...",
  "answerIndex": 0,
  "dimension": "...",
  "topic": "...",
  "knowledge": "...",
  "trivia": [],
  "difficulty": 1,
  "question_type": "fact",
  "year": null,
  "epoke_id": null,
  "epoke_domain": "by",
  "emne_id": "...",
  "related_emner": [],
  "core_concepts": [],
  "concept_focus": [],
  "learning_paths": [],
  "tags": [],
  "required_tags": [],
  "source": []
}
```

## Bruk av emnefelt

`emne_id`, `related_emner`, `core_concepts` og `concept_focus` skal alltid fylles best i **set 3, 5 og 6**.

I **set 1, 2 og 4** kan disse feltene finnes, men de skal ikke styre spørsmålsutviklingen.

## Manifest-logikk

Manifestet skal peke til hvert enkelt set, ikke bare til fila generelt.

Eksempel:

```json
{ "targetId": "akershus_festning", "set_id": "by_akershus_festning_set_1", "order": 1, "file": "data/quiz/by/akershus_festning_sets.json" }
```

## Arbeidsregel

Når en ny stedfil lages:

1. bygg set 1, 2 og 4 fra konkrete fakta om stedet
2. sjekk emnekart og mapping
3. bygg set 3 og 5 fra de riktige emnene
4. bygg set 6 som rent begrepssett
5. sørg for 7 spørsmål i hvert set
6. kontroller at spørsmålene ikke bare er varianter av hverandre
7. kontroller at `set_id` og `quiz_id` følger mønsteret

## Kort standard

```text
6 set per sted
7 spørsmål per set
1, 2 og 4 = konkrete stedsspørsmål
3 og 5 = emnebaserte
6 = begrepssett
quiz er alltid knyttet til stedet
```
