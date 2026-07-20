# Knowledge som minnekammer – kanonisk arkitektur v1

## Formål

Knowledge skal være brukerens presise, personlige minnekammer for det de har lært i History Go.

Knowledge skal ikke være en liste over gjennomførte quizspørsmål. Quiz er vurdering og evidens. Selve kunnskapen skal finnes som egne faglig strukturerte objekter som kan gjenbrukes, kobles, søkes og forstås på tvers av steder, personer og quizzer.

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
Quiz / vurdering
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

En kunnskapsenhet er det minste selvstendige faglige innholdet som skal kunne huskes, kobles og testes.

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

Kunnskapsenheten eier den kanoniske forklaringen og kildegrunnlaget. Quizspørsmålet peker til kunnskapsenheten; det skal ikke være eneste stedet kunnskapen finnes.

### Historie

En historie er et sammenhengende narrativt spor som kan gå gjennom flere hendelser, personer, steder, emner og kunnskapsenheter.

Historier skal kunne bygges gradvis. Når brukeren lærer nye deler, skal minnekammeret vise hvordan delene henger sammen, ikke bare at flere quizzer er fullført.

### Quiz

Quiz skal:

1. velge hvilke kunnskapsenheter, begreper eller historier som testes
2. formulere et presist læringsmål
3. registrere evidens når brukeren svarer
4. gi forklaring som er avledet fra den kanoniske kunnskapsenheten

Quiz skal ikke skape nye faglige sannheter i runtime.

### Knowledge

Knowledge lagrer brukerens relasjon til kanonisk kunnskap:

- møtt
- gjenkjent
- forstått
- forklart
- anvendt
- repetert

En personlig Knowledge-entry skal derfor primært referere til `knowledge_unit_id`, `term_id`, `concept_id`, `story_id` og `emne_id`. Quiz-ID og sted/person beholdes som proveniens og kontekst.

## Hva Knowledge-siden skal vise

Knowledge-siden skal bygge én samlet read-model med følgende innganger:

1. **Fag og emner** – hvor kunnskapen hører hjemme
2. **Begreper og terminologi** – et presist personlig fagordregister
3. **Kunnskapsenheter** – definisjoner, sammenhenger, prosesser, metoder og fakta
4. **Historier og tidsforløp** – narrativer som bygges opp på tvers av quizzer
5. **Relasjoner** – koblinger mellom personer, steder, hendelser, institusjoner og ideer
6. **Kilder og proveniens** – hvor kunnskapen kommer fra
7. **Mestring og repetisjon** – hva brukeren har møtt, forstått og brukt

Quizspørsmål kan vises som dokumentasjon under «slik lærte du dette», men skal ikke være hovedorganiseringen.

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
knowledge feedback avledet fra kunnskapsenheten
source / claim_basis
```

Legacy-feltene `knowledge`, `core_concepts` og `related_emner` kan beholdes, men skal ikke være eneste kobling i ny produksjon.

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
```

Et emne uten egne kunnskapsenheter eller begreper er bare en overskrift og er ikke ferdig produsert.

## Presisjonsregler

- Strenge ID-er; ingen automatisk normalisering.
- Tags er metadata, ikke begreper.
- Steder og personer er kontekst, ikke kunnskap i seg selv.
- En quiztekst er evidens, ikke kanonisk lagringsformat.
- Samme kunnskapsenhet skal gjenbrukes på tvers av quizzer når innholdet er det samme.
- Ulike faglige påstander skal ikke slås sammen bare fordi de handler om samme sted.
- Historier må ha eksplisitte deler og rekkefølge når rekkefølge er faglig relevant.
- Alle koblinger skal kunne auditeres tilbake til emne, kunnskapsenhet og kilde.

## Migrering

Eksisterende `history_go_knowledge_entry_v2` og `knowledge_universe` bevares.

Migreringen skal skje uten falsk presisjon:

1. quiztekst beholdes som legacy-evidens
2. sikre emne- og begrepskoblinger flyttes til strukturerte ID-er
3. en canonical `knowledge_unit_id` opprettes bare når innholdet er faglig avgrenset og kildebelagt
4. usikre koblinger merkes som uløste
5. ingen kunnskap slettes automatisk

## Kortform

```text
Emnet organiserer faget.
Begrepene gir presist språk.
Kunnskapsenhetene bærer innholdet.
Historiene binder innholdet sammen.
Quiz tester.
Knowledge husker, systematiserer og viser mestring.
```
