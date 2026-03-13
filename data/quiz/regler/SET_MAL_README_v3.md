# Set-mal for stedsknyttede quizfiler i History Go

Denne malen gjelder for `*_sets.json`-filer for steder i History Go.

Den skal leses sammen med **quiz generatoren**, og er ment som den menneskelesbare arbeidsmalen til:

- `quiz_generator_rules_by_v3.json`

Det betyr at set-malen ikke bare er en løs anbefaling. Den beskriver den bindende strukturen quiz generatoren skal følge når en stedfil bygges.

## Hovedregel

Quizene er knyttet til **stedet**, ikke til emnet som egen quizmotor.

Strukturen er:

```text
place
↓
set_mode
↓
source_pool
↓
stedskarakter
↓
spørsmålsvinkel
↓
questions
```

Emner brukes som **drivmotor bare i set 3, 5 og 6**.

I **set 1, 2 og 4** kan emner finnes som bakgrunnsdata, men de skal **ikke** styre spørsmålsutviklingen.

## Antall set

Hver stedfil skal ha **6 set**.

Hver set skal ha **7 spørsmål**.

Det skal **ikke** legges til et ekstra intro-sett.

Løsningen er i stedet:

- gjøre **set 1** til et bindende intro-/story-sett
- gjøre **set 2** til et bindende stedslivs-/person-/hendelsessett
- la det faglige trykket komme tydeligere fra **set 3**

## Fast logikk for settene

### Set 1 — `place_intro_story`
Intro / wow / stories.

Dette settet skal være underholdende, konkret og minneverdig.

Bruk:
- historier
- kuriøse detaljer
- ting man faktisk ser på stedet
- visuelle hooks
- signaturtrekk
- minneverdige fakta

Dette settet er **ikke emnebasert**.

#### Harde regler for set 1
- minst **4 av 7 spørsmål** skal komme fra:
  - historie/story
  - relaterte personer
  - hendelser
  - kuriøse detaljer
  - ting man faktisk ser på stedet
- maks **0–1 rent fagbegrepsspørsmål**
- minst **2 spørsmål** skal ha tydelig “det visste jeg ikke”-effekt
- minst **2 spørsmål** skal være visuelt eller sanselig forankret i stedet
- `knowledge` skal være fortellende og gi liten bonusinfo, ikke bare forklaring

#### Gode familier for set 1
- `gjenkjenning`
- `story`
- `kuriositet`
- `person`
- `hendelse`
- `scene`
- `visuell_hook`
- `saertrekk`

#### Dårlige familier for set 1
- `definition`
- `begrep`
- `abstrakt_sammenligning`
- `generisk_byromsanalyse`

### Set 2 — `place_life_people_events`
Stedsliv / personer / hendelser / kuriositeter.

Dette settet skal være “stedet i livet”, ikke “stedet i teorien”.

Bruk:
- personer
- hendelser
- bruk
- rytme og stemning
- konkrete detaljer
- arkitektur og utvikling når det er tydelig knyttet til levd stedserfaring

Dette settet er **ikke emnebasert**.

#### Harde regler for set 2
- minst **1 personspørsmål**
- minst **1 hendelsesspørsmål**
- minst **1 spørsmål om bruk/stemning/rytme**
- minst **1 spørsmål om et fysisk trekk folk faktisk legger merke til**
- hvis stedet har sterke historier, skal minst **2 spørsmål** bruke dem
- `knowledge` skal fortsatt være konkret, fortellende og lesbar

### Set 3 — `emne_based_foundation`
Første faglige sett.

Bruk:
- emner
- core concepts
- terminologi
- romlig analyse
- faglige forskjeller
- begrepsbruk

Dette settet skal være **emnebasert**.

### Set 4 — `place_concrete_advanced`
Tilbake til stedet, men mer krevende.

Bruk:
- konkrete hendelser
- konkrete funksjoner
- personer
- institusjoner
- utviklingsløp
- spesifikke trekk ved stedet

Dette settet er **ikke emnebasert**, men kan bruke emner som bakgrunnsstøtte.

### Set 5 — `emne_based_advanced`
Andre faglige sett.

Bruk:
- teori
- struktur
- emneforståelse
- hvordan stedet kan leses faglig
- terminologi fra emner og tidligere quiz
- dypere analyse

Dette settet skal være **emnebasert**.

### Set 6 — `concept_based`
Eget begrepssett.

Bruk:
- begrepsquiz
- terminologi
- definisjoner
- konseptpar
- kjerneord fra `core_concepts`
- begreper som faktisk kan definere stedet

Dette settet skal være **begrepsbasert** og hente stoff direkte fra emnefilene, mappings og tidligere quizfelt som:
- `core_concepts`
- `concept_focus`
- `topic`
- `knowledge`

## Viktig regel

Bare **set 3, set 5 og set 6** skal være emne-/begrepsbaserte.

**Set 1, 2 og 4 skal ikke styres av emnene.**
De skal bygges fra interessant, konkret og stedsspesifikk informasjon.

Dette er også en bindende regel i **quiz generatoren**.

## Quiz generator

Set-malen og quiz generatoren skal peke på hverandre.

### Quiz generatorens rolle
Quiz generatoren skal:
- lese `place.quiz_profile`
- lese set-modus for hvert sett
- velge riktige kildefelt for settet
- generere spørsmål etter riktig tone og vanskelighetsnivå
- validere at set-strukturen faktisk er fulgt

### Bindende set-modes i quiz generatoren
Quiz generatoren skal bruke denne strukturen:

```json
"set_modes": {
  "1": "place_intro_story",
  "2": "place_life_people_events",
  "3": "emne_based_foundation",
  "4": "place_concrete_advanced",
  "5": "emne_based_advanced",
  "6": "concept_based"
}
```

### Generatorens kjerneprinsipp

```text
place → set_mode → source_pool → stedskarakter → spørsmålsvinkel → konkret spørsmål
```

Ikke:

```text
emne → spørsmål
```

## Nye anbefalte kildefelt i places-fila

For at set 1 og 2 skal bli gode, bør hvert sted kunne ha mer enn bare vinkler og signaturtrekk.

I tillegg til:
- `primary_angles`
- `question_families`
- `must_include`

bør quiz generatoren kunne bruke:

```json
"fun_facts": [],
"stories": [],
"related_people": [],
"related_events": [],
"visual_hooks": [],
"quirks": []
```

Disse feltene er særlig viktige i **set 1 og 2**, før emnelogikken får styre sterkere.

## Kvalitetsregel

Unngå:
- samme spørsmål i flere varianter
- oppkonstruerte analyseformuleringer
- fem spørsmål som bare sier "makt", "kontroll" eller "symbolikk" på nye måter
- for enkle alternativer der ett svar skiller seg for tydelig ut
- begrepssett som bare gjentar faktaspørsmål med nye ord
- tørre mini-emnesett i starten

Prioriter:
- konkrete fakta
- tydelige forskjeller mellom spørsmålene
- interessante detaljer
- variasjon mellom historie, arkitektur, bruk, personer, konflikter og utvikling
- skarp terminologi i set 3, 5 og 6
- begreper som faktisk hjelper spilleren å lese stedet bedre
- underholdende og minneverdige første sett

## Filstruktur

Standard fil:

```json
{
  "targetId": "akershus_festning",
  "categoryId": "by",
  "sets": [
    {
      "set_id": "by_akershus_festning_set_1",
      "set_mode": "place_intro_story",
      "questions": []
    }
  ]
}
```

## Navn på `set_id`

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

1. bygg **set 1** som intro / wow / stories
2. bygg **set 2** som stedsliv / personer / hendelser / kuriositeter
3. sjekk `place.quiz_profile`, emnekart og mapping
4. bygg **set 3** som første emnesett
5. bygg **set 4** som krevende, men fortsatt stedsnært sett
6. bygg **set 5** som andre emnesett
7. bygg **set 6** som rent begrepssett
8. sørg for **7 spørsmål i hvert set**
9. kontroller at spørsmålene ikke bare er varianter av hverandre
10. kontroller at `set_id` og `quiz_id` følger mønsteret
11. kontroller at quiz generatoren faktisk følger riktig set-modus

## Kort standard

```text
6 set per sted
7 spørsmål per set
1 = intro/story
2 = personer/hendelser/kuriositeter
3 = første emnesett
4 = stedsnært, men dypere
5 = andre emnesett
6 = begrepssett
quiz er alltid knyttet til stedet
quiz generatoren er bindende for set-modus og validering
```
