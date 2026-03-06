Ja. Her er den oppdaterte hele modellen med 7 set, der de to første er lette, åpne og inngangsvennlige før systemet blir mer faglig.

# History Go – Quizmodell for BY

Dette dokumentet definerer den faste quizarkitekturen for BY-kategorien i History Go.

Målet er:
- å gjøre quizene varierte
- å gi en myk inngang før det blir faglig tyngre
- å holde fast på progresjonen vi allerede har bestemt
- å gjøre quizsystemet stabilt for både manuell skriving og senere generering

---

## 1. Grunnprinsipp

Quizsystemet har to akser:

1. **Set-nivå**
   - styrer progresjon og dybde

2. **Question type**
   - styrer hvilken type spørsmål det er

Disse må ikke blandes.

- **Set** sier *hvilket lag i læringen spørsmålet tilhører*
- **question_type** sier *hvordan spørsmålet er bygget*

Eksempel:

```json
{
  "question_type": "fact",
  "question_layer": "historie_kontekst"
}


⸻

2. Fast progresjon for settene

Dette er den faste modellen for alle BY-sett:

{
  "set_1": "intro_lett",
  "set_2": "intro_sted",
  "set_3": "fakta_sted",
  "set_4": "historie_kontekst",
  "set_5": "hendelser_personer",
  "set_6": "konflikt_struktur",
  "set_7": "teori_begrep"
}

Set 1 – intro / lett

Formål:
	•	få brukeren inn
	•	være løs, ledig, enkel og litt morsom
	•	ingen tung faglighet
	•	bygge nysgjerrighet

Typiske spørsmål:
	•	enkle fakta
	•	synlige kjennetegn
	•	hva stedet er kjent for
	•	små trivia-spørsmål
	•	umiddelbar gjenkjennelse

Set 2 – intro / sted

Formål:
	•	fortsatt lett inngang
	•	mer konkret stedskunnskap
	•	fortsatt ikke tørt eller teoretisk
	•	brukeren skal føle at de “blir kjent” med stedet

Typiske spørsmål:
	•	plassering
	•	navn
	•	funksjon
	•	nærmiljø
	•	enkel historisk orientering

Set 3 – fakta / sted

Formål:
	•	nå begynner det mer systematiske laget
	•	tydelige faktaspørsmål om stedet eller personen
	•	mer kunnskapsmessig tyngde enn set 1–2

Set 4 – historie / kontekst

Formål:
	•	historisk plassering
	•	utviklingslinjer
	•	epoker
	•	bakgrunn

Set 5 – hendelser / personer

Formål:
	•	koble stedet til aktører og konkrete hendelser
	•	gjøre materialet mer stofflig og levende

Set 6 – konflikt / struktur

Formål:
	•	vise hvordan stedet inngår i større mønstre
	•	makt, regulering, konflikt, styring, mobilitet, forskjeller

Set 7 – teori / begrep

Formål:
	•	løfte stedet inn i faglig analyse
	•	bruke emnekart, fagkart og emner eksplisitt
	•	begreper, mekanismer og analytiske distinksjoner

⸻

3. Faste question types

Dette er de tillatte question_type-verdiene:

[
  "fact",
  "place",
  "year",
  "concept",
  "mechanism",
  "epoque",
  "comparison",
  "case",
  "trivia",
  "analysis"
]

Disse skal brukes konsekvent.

⸻

4. Faste question layers

Vi bruker lag som matcher set-progresjonen:

[
  "intro_lett",
  "intro_sted",
  "fakta_sted",
  "historie_kontekst",
  "hendelser_personer",
  "konflikt_struktur",
  "teori_begrep"
]

Eksempel:

{
  "question_type": "trivia",
  "question_layer": "intro_lett"
}

{
  "question_type": "fact",
  "question_layer": "intro_sted"
}

{
  "question_type": "analysis",
  "question_layer": "konflikt_struktur"
}


⸻

5. Fast kobling mellom set og spørsmålstyper

Set 1 – intro / lett

Typisk miks:
	•	fact
	•	fact
	•	trivia
	•	place
	•	fact

Hovedregel:
	•	lett
	•	åpent
	•	morsomt
	•	konkret
	•	lite fagterminologi

Set 2 – intro / sted

Typisk miks:
	•	fact
	•	place
	•	fact
	•	trivia
	•	year

Hovedregel:
	•	fortsatt lett
	•	mer stedsnært
	•	mer informativt enn set 1
	•	fortsatt lav terskel

Set 3 – fakta / sted

Typisk miks:
	•	fact
	•	fact
	•	place
	•	trivia
	•	concept

Hovedregel:
	•	nå kan spørsmålene være mer faste og kunnskapsorienterte
	•	men fortsatt ganske tilgjengelige

Set 4 – historie / kontekst

Typisk miks:
	•	fact
	•	year
	•	epoque
	•	case
	•	concept

Set 5 – hendelser / personer

Typisk miks:
	•	fact
	•	case
	•	comparison
	•	fact
	•	trivia

Set 6 – konflikt / struktur

Typisk miks:
	•	mechanism
	•	mechanism
	•	analysis
	•	comparison
	•	case

Set 7 – teori / begrep

Typisk miks:
	•	concept
	•	concept
	•	mechanism
	•	analysis
	•	comparison

⸻

6. Fast kobling mellom question type og datafelt

A. fact

Brukes til:
	•	faktaspørsmål om sted eller person

Krever:
	•	minst ett av placeId, personId, natureId
	•	knowledge

Valgfritt:
	•	year

⸻

B. place

Brukes til:
	•	stedsspørsmål der stedet selv er case

Krever:
	•	placeId
	•	emne_id
	•	knowledge

⸻

C. year

Brukes til:
	•	årstallsspørsmål

Krever:
	•	year
	•	epoke_id

⸻

D. concept

Brukes til:
	•	begrepsspørsmål

Krever:
	•	core_concepts
	•	concept_focus

⸻

E. mechanism

Brukes til:
	•	spørsmål om årsak/virkning eller funksjon

Krever:
	•	emne_id
	•	core_concepts

⸻

F. epoque

Brukes til:
	•	epokeforståelse

Krever:
	•	epoke_id
	•	knowledge

⸻

G. comparison

Brukes til:
	•	sammenligning mellom emner, steder eller typer byrom

Krever:
	•	related_emner

⸻

H. case

Brukes til:
	•	case-baserte spørsmål

Krever:
	•	placeId
	•	core_concepts

⸻

I. trivia

Brukes til:
	•	funfacts og overraskende kunnskap

Krever:
	•	knowledge
	•	trivia

⸻

J. analysis

Brukes til:
	•	analytiske spørsmål

Krever:
	•	emne_id
	•	core_concepts
	•	epoke_id

⸻

7. Fast minstekrav for alle spørsmål

Alle spørsmål skal ha:

[
  "quiz_id",
  "question_type",
  "question_layer",
  "knowledge"
]

Og hvert spørsmål må i tillegg ha minst én tydelig kunnskapsbærer utover bare svaralternativer:

[
  "year",
  "emne_id",
  "concept_focus",
  "epoke_id",
  "trivia",
  "related_emner"
]

Viktig unntak for set 1 og set 2

I de to første settene trenger ikke hvert spørsmål være tungt forankret i fagmodellen.

Der gjelder denne mildere regelen:
	•	alle spørsmål må ha knowledge
	•	minst noen av spørsmålene i settet skal bruke year, emne_id, trivia eller concept_focus
	•	set 1 og set 2 kan være mer frie, så lenge de er informative og stedsnære

Altså:
	•	set 1 og 2 skal være inviterende
	•	set 3–7 skal være mer systematiske

⸻

8. Distractors (feilalternativer)

Feilalternativer skal ikke være tilfeldige.

De skal trekkes fra:
	•	andre emner i samme kategori
	•	andre core_concepts
	•	andre steder
	•	andre epoker
	•	nærliggende mekanismer

Eksempel:
Spørsmål om mobilitet

Riktig:
	•	knutepunkt

Distractors:
	•	gentrifisering
	•	symbolsk geografi
	•	territorialitet

Dette gjør quizene mindre banale.

⸻

9. Prinsipp for concept_focus

concept_focus skal aldri fylles mekanisk.

Det skal:
	•	være tomt [] hvis spørsmålet er rent faktabasert
	•	inneholde ett eller maks to begreper hvis spørsmålet faktisk peker mot et begrep

Riktig:

"concept_focus": ["knutepunkt"]

Også riktig:

"concept_focus": []

Feil:
	•	å sette første element i core_concepts automatisk

⸻

10. Prinsipp for emne_id

Et set skal som hovedregel ikke blande emner hvis det kan unngås.

Særlig fra set 3 og oppover bør spørsmålene samles rundt ett tydelig emne når stedet faktisk peker mot ett hovedtema.

Viktig unntak

Set 1 og set 2 kan være mer åpne og stedsnære.
Der er det lov å være løsere før quizene blir tydelig faglig organisert.

⸻

11. Standard oppsett for nye BY-sett

Set 1 – intro / lett
	•	3 fact
	•	1 trivia
	•	1 place

Layer:
	•	intro_lett

Set 2 – intro / sted
	•	2 fact
	•	1 place
	•	1 trivia
	•	1 year

Layer:
	•	intro_sted

Set 3 – fakta / sted
	•	2 fact
	•	1 place
	•	1 trivia
	•	1 concept

Layer:
	•	fakta_sted

Set 4 – historie / kontekst
	•	1 fact
	•	1 year
	•	1 epoque
	•	1 case
	•	1 concept

Layer:
	•	historie_kontekst

Set 5 – hendelser / personer
	•	1 fact
	•	1 case
	•	1 comparison
	•	1 fact
	•	1 trivia

Layer:
	•	hendelser_personer

Set 6 – konflikt / struktur
	•	2 mechanism
	•	1 analysis
	•	1 comparison
	•	1 case

Layer:
	•	konflikt_struktur

Set 7 – teori / begrep
	•	2 concept
	•	1 mechanism
	•	1 analysis
	•	1 comparison

Layer:
	•	teori_begrep

⸻

12. Superset-standard

Eksempel på korrekt struktur:

{
  "id": "aker_brygge_quiz_1",
  "quiz_id": "by_aker_brygge_set_1_q1",
  "categoryId": "by",
  "placeId": "aker_brygge",
  "personId": "",
  "natureId": "",
  "targetId": "aker_brygge",
  "question_scope": "place",
  "question": "Hva var Aker Brygge-området før det ble et kommersielt byområde?",
  "options": [
    "Verfts- og industriområde",
    "Kongelig hageanlegg",
    "Jordbrukslandskap"
  ],
  "answer": "Verfts- og industriområde",
  "answerIndex": 0,
  "dimension": "historie",
  "topic": "Transformasjon",
  "knowledge": "Aker Brygge vokste fram på området til det tidligere Akers mekaniske verksted og ble senere transformert til handel, servering og kontorer.",
  "trivia": [],
  "difficulty": 1,
  "question_type": "fact",
  "question_layer": "fakta_sted",
  "year": null,
  "epoke_id": null,
  "epoke_domain": "by",
  "emne_id": "em_by_uteservering_kommersielt_byliv",
  "related_emner": [],
  "core_concepts": [
    "kommersielt byliv",
    "forbruk",
    "servering",
    "promenade",
    "iscenesatt offentlighet",
    "turistifisering"
  ],
  "concept_focus": [
    "kommersielt byliv"
  ],
  "learning_paths": [],
  "tags": [
    "fakta",
    "sted",
    "historie",
    "transformasjon",
    "aker_brygge"
  ],
  "required_tags": [],
  "source": []
}


⸻

13. Fast regel for nye quiz

Alle nye spørsmål skal:
	1.	ha korrekt question_type
	2.	ha korrekt question_layer
	3.	passe inn i riktig set
	4.	bruke riktige fagfelt fra fagkart_by, emnekart_by og emner_by
	5.	ikke få automatisk utfylte begreper som ikke faktisk passer
	6.	være lettere og friere i set 1–2
	7.	være tydeligere faglig strukturert fra set 3 og oppover

⸻

14. Kort oppsummert

History Go BY-quiz bygger på denne modellen:
	•	settene styrer progresjon
	•	set 1 og 2 er lette, inviterende og stedsnære
	•	set 3–7 går gradvis over i mer faglig struktur
	•	question_type styrer spørsmålsform
	•	question_layer speiler set-nivå
	•	emne_id, core_concepts og epoke_id kobler quiz til fagmodellen
	•	distractors skal være faglig relevante
	•	concept_focus skal brukes presist, ikke mekanisk

Dette er den faste standarden fremover.

Hvis du vil, lager jeg dette som en ferdig `.md`-fil.
