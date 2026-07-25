# Knowledge som minnekammer – kanonisk arkitektur v1.1

## Formål

Knowledge skal være brukerens presise, personlige minnekammer for det de har lært i History Go.

Kunnskapen kan formidles fra mange flater: steder, personer, emner, fagtekster, historier, Wonderkammer og quiz. Quiz har en særrolle fordi den både **samler og formidler kunnskap** og samtidig gir dokumentasjon på at brukeren har møtt, lest og arbeidet med den.

Knowledge skal ikke være en flat liste over gjennomførte quizspørsmål. Quizene skal være viktige kunnskapsrom, men innholdet må kobles til egne faglig strukturerte objekter slik at det kan gjenbrukes, sammenstilles, søkes og forstås på tvers av alle flatene.

## Den kanoniske kjeden

```text
Fagkart / pensum
        ↓
Emne
        ↓
Begreper og terminologi
        ↓
Kunnskapsenheter og historier
        ↓
Formidling på steder, personer, emner, historier og quiz
        ↓
Quiz / vurdering og dokumentert lesing
        ↓
Læringsevidens og mestring
        ↓
Personlig Knowledge-minnekammer
```

Ingen del av kjeden skal hoppes over i ny produksjon.

## Ansvarsdeling

### Fagkart og pensum

Definerer hva faget omfatter, hvilke domener det har og hvilken progresjon som er faglig riktig.

### Emne

Er den faglige beholderen. Et emne samler beslektede kunnskapsenheter, begreper, metoder, steder, personer og historier.

Et emne er ikke en quiz og ikke et enkelt faktum.

### Begrep og terminologi

Et begrep skal ha en stabil ID, foretrukket term, presis definisjon og faglig rolle. Synonymer kan registreres eksplisitt, men skal aldri oppstå gjennom automatisk normalisering.

Begreper skal ikke fylles fra UI-tags, quiz-ID-er, steder eller generelle stemningsord.

### Kunnskapsenhet

En kunnskapsenhet er det minste selvstendige faglige innholdet som skal kunne formidles, huskes, kobles, testes og repeteres.

Tillatte hovedtyper er blant annet:

- definisjon
- faglig påstand eller faktum
- prosess
- årsak og virkning
- relasjon
- sammenligning
- metode
- hendelse
- biografisk kunnskap
- stedlig lesning
- historie eller narrativt forløp

Kunnskapsenheten eier den presise faglige påstanden, forklaringen, begrepene og kildegrunnlaget. Den kan vises helt eller delvis i quiz, på stedssider, personsider, emnesider, historiesider og i Knowledge.

Quiz kan inneholde hele kunnskapsforklaringen som et læringsinnhold, men den samme kunnskapen skal ha en stabil `knowledge_unit_id` slik at den kan samles og gjenbrukes andre steder.

### Historie

En historie er et sammenhengende narrativt spor som kan gå gjennom flere hendelser, personer, steder, emner og kunnskapsenheter.

Historier skal kunne bygges gradvis. Når brukeren lærer nye deler, skal minnekammeret vise hvordan delene henger sammen, ikke bare at flere quizzer er fullført.

### Formidlingsflater

Kanonisk kunnskap kan vises gjennom flere flater:

```text
place_page
person_page
emne_page
story_page
wonderkammer
quiz
knowledge_page
```

Flatene kan presentere innholdet forskjellig, men skal peke til samme kunnskapsenhet, begrep, term eller historie når det faglige innholdet er det samme.

### Quiz

Quiz er både **læringsflate og prøve**.

Quiz skal:

1. samle relevant kunnskap om stedet, personen eller emnet i et faglig forløp
2. formidle fakta, forklaringer, terminologi, sammenhenger og historier
3. velge hvilke kunnskapsenheter og begreper som prøves
4. formulere et presist læringsmål
5. vise kunnskapsforklaring eller feedback etter svaret
6. registrere at brukeren har møtt og lest kunnskapen når forklaringen er vist og brukeren går videre
7. registrere vurderingsevidens fra svaret
8. koble læringen til emner, begreper, termer, historier og kilder

Quiz skal altså kunne være et viktig sted der selve kunnskapen samles og leses. Men den skal ikke være et lukket lager som gjør kunnskapen utilgjengelig for resten av systemet.

### Knowledge

Knowledge lagrer brukerens relasjon til kunnskapen:

- møtt
- lest
- gjenkjent
- forstått
- forklart
- anvendt
- repetert

En personlig Knowledge-entry skal primært referere til `knowledge_unit_id`, `term_id`, `concept_id`, `story_id` og `emne_id`. Quiz-ID og sted/person beholdes som proveniens og kontekst.

## To typer quizbevis

### 1. Formidlingsevidens

Når et spørsmål og den tilhørende kunnskapsforklaringen er vist, og brukeren aktivt går videre, kan systemet registrere:

```text
encountered
read
```

Dette gjelder også når svaret var feil. Brukeren har da møtt og lest stoffet, men ikke dokumentert mestring.

### 2. Vurderingsevidens

Svaret kan dokumentere ulike nivåer:

```text
recognize
recall
explain
compare
connect
apply
```

Et riktig svar oppgraderer mestring i tråd med spørsmålets `evidence_type`. Et feil svar beholder lesebeviset og kan markere kunnskapsenheten for repetisjon.

Det må derfor skilles mellom:

```text
har lest / møtt kunnskapen
har svart på kunnskapen
har mestret kunnskapen
```

## Hva Knowledge-siden skal vise

Knowledge-siden skal bygge én samlet read-model med følgende innganger:

1. **Fag og emner** – hvor kunnskapen hører hjemme
2. **Begreper og terminologi** – et presist personlig fagordregister
3. **Kunnskapsenheter** – definisjoner, sammenhenger, prosesser, metoder og fakta
4. **Historier og tidsforløp** – narrativer som bygges opp på tvers av quizzer
5. **Relasjoner** – koblinger mellom personer, steder, hendelser, institusjoner og ideer
6. **Kilder og proveniens** – hvor kunnskapen kommer fra og hvor den ble lest
7. **Lesing, mestring og repetisjon** – hva brukeren har møtt, lest, forstått og brukt

Quizene skal være synlige som viktige læringsforløp og som dokumentasjon under «slik lærte du dette». Hovedorganiseringen skal likevel være fagkunnskapen, ikke rekkefølgen quizene ble tatt i.

## Krav til nye quizdata

Nye quizzer skal minst oppgi:

```text
subject_id / categoryId
emne_id eller emne_ids
primary_knowledge_unit_id
knowledge_unit_ids
concept_ids
term_ids
story_ids når relevant
learning_objective_id
evidence_type
knowledge / knowledge_payload
feedback_basis
source / claim_basis
```

Quizens kunnskapsinnhold kan ligge direkte i quizfila gjennom `knowledge`, `knowledge_payload`, termforklaringer og historiefragmenter, men skal samtidig være koblet til stabile faglige ID-er.

Legacy-feltene `knowledge`, `core_concepts` og `related_emner` kan beholdes. De skal videreføres inn i den strukturerte modellen, ikke fjernes.

## Krav til emner

Et kanonisk emne skal kunne peke til:

```text
knowledge_unit_ids
concept_ids
term_ids
story_ids
method_ids
related_places
related_people
quiz_ids
```

Et emne uten egne kunnskapsenheter eller begreper er bare en overskrift og er ikke ferdig produsert.

## Presisjonsregler

- Strenge ID-er; ingen automatisk normalisering.
- Tags er metadata, ikke begreper.
- Steder og personer er kunnskapskontekst og formidlingsflater, men ikke automatisk faglige påstander i seg selv.
- Quiz kan bære og formidle kunnskapen, men innholdet skal ha stabile faglige koblinger.
- Samme kunnskapsenhet skal gjenbrukes på tvers av quizzer og andre flater når innholdet er det samme.
- Ulike faglige påstander skal ikke slås sammen bare fordi de handler om samme sted.
- Historier må ha eksplisitte deler og rekkefølge når rekkefølge er faglig relevant.
- Alle koblinger skal kunne auditeres tilbake til emne, kunnskapsenhet og kilde.
- Lesing og mestring skal registreres som forskjellige typer evidens.

## Migrering

Eksisterende `history_go_knowledge_entry_v2` og `knowledge_universe` bevares.

Migreringen skal skje uten falsk presisjon:

1. quizens kunnskapstekst beholdes som læringsinnhold og proveniens
2. sikre emne- og begrepskoblinger flyttes til strukturerte ID-er
3. en canonical `knowledge_unit_id` opprettes når innholdet er faglig avgrenset og kildebelagt
4. quizvisning og quizsvar registreres som forskjellige bevis
5. usikre koblinger merkes som uløste
6. ingen kunnskap slettes automatisk

## Kortform

```text
Emnet organiserer faget.
Begrepene gir presist språk.
Kunnskapsenhetene bærer innholdet.
Historiene binder innholdet sammen.
Steder, personer, emnesider og quiz formidler kunnskapen.
Quiz samler, lærer bort og prøver.
Quiz viser hva brukeren har lest og hva brukeren har mestret.
Knowledge husker, systematiserer og forbinder alt dette.
```
