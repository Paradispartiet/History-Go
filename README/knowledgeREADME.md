# Knowledge – personlig kunnskapsunivers i History GO

## Hva er Knowledge?

**Knowledge** er brukerens personlige kunnskapsunivers i History GO.

Det er:
- ikke fagplan
- ikke fagkart
- ikke emner
- ikke merker

Knowledge er **sporene etter hva brukeren faktisk har lært, jobbet med og forstått**, slik dette uttrykkes gjennom quiz og aktive handlinger.

Alt faglig innhold i systemet er alltid åpent.
Knowledge handler ikke om tilgang – men om **relasjon**.

---

## Grunnprinsipp

> **Quizer endrer ikke verden.  
De endrer brukerens relasjon til verden.**

Fagplaner, fagkart, emner og merkesider er:
- faste
- delte
- åpne
- objektive strukturer

Knowledge er:
- personlig
- akkumulativ
- dynamisk
- konseptuell

---

## Hva skaper Knowledge?

### 1. Quiz er eneste kilde til knowledge

Knowledge oppstår **kun** gjennom quiz (og eventuelt quiz-lignende vurderinger).

Observasjon alene:
- kan gi samling
- kan gi registrering
- gir **ikke** knowledge

Knowledge forutsetter:
- refleksjon
- vurdering
- forståelse

---

### 2. En quiz skriver alltid til knowledge

Når en quiz gjennomføres (og bestås), skrives én eller flere **knowledge entries**.

En knowledge entry er **ikke bare et poeng**.
Den er et **koblingspunkt** mellom bruker og kunnskapsstruktur.

---

## Hva kobles i en knowledge entry?

En quiz kan (og bør) koble til flere nivåer samtidig.

### Obligatoriske koblinger
- `emne_id`  
  → hvor i pensum dette hører hjemme

- `fagkart_category_id`  
  → hvilket faglig domene

### Valgfrie, men sterke koblinger
- `family_id`  
  → overordnet vitenskapsfelt

- `subfield_id`  
  → presis faglig gren (universitetsnivå)

### Konseptuelle koblinger (viktigst)
- `tags` / `concepts` / `begreper`  
  → de faktiske ideene brukeren har jobbet med

Dette inkluderer:
- fagbegreper
- fenomen
- prosesser
- mønstre
- sammenhenger
- motsetninger

Disse konseptene er **motoren** i:
- matching
- anbefalinger
- AHA / innsiktsmotor
- videre læringsforslag

---

## Hva Knowledge *ikke* gjør

Knowledge:
- låser ikke fagkart
- låser ikke emner
- endrer ikke fagplan
- begrenser ikke hva brukeren kan lese

Knowledge er **ikke en port**.
Det er et **kart over erfaring**.

---

## Forholdet mellom Knowledge og fagstrukturer

### Fagplan
- grovt, observerbart
- alltid åpen
- brukes som inngang

### Fagkart
- dypt, faglig
- alltid åpent
- viser sammenhenger i kunnskapen

### Emner
- pensum / innhold
- alltid åpne
- strukturerer stoff

### Merker
- visning og aggregering
- alltid åpne
- speiler knowledge, men eies ikke av den

### Knowledge
- personlig
- dynamisk
- bygges over tid
- knytter bruker → fag → begreper

---

## Samling vs Knowledge (kritisk skille)

### Samling (flora, fauna, steder)
- er stedlig
- er kontekstuell
- krever tilstedeværelse + handling
- kan inkludere quiz

Men:

> **Samling er ikke knowledge.**

En blomst, et dyr eller et sted er:
- et objekt
- et møte
- en erfaring

Knowledge er:
- forståelsen som kan oppstå i møtet

---

## Eksempel (konseptuelt)

Bruker:
- er i en park
- observerer hvitveis
- tar en observasjonsquiz

Resultat:
- hvitveis registreres som samlet
- quiz gir knowledge

Knowledge kobles til:
- `emne_id`: vårblomster og fenologi
- `fagkart_category_id`: flora
- `family_id`: biologi
- `subfield_id`: botanikk
- `concepts`: vårblomstring, livssyklus, pollinering, sesong

Blomsten er samlet.
Kunnskapen er internalisert.
Strukturen er bevart.

---

## Hvorfor dette er viktig

Denne modellen gjør at History GO:

- ikke reduseres til samlespill
- ikke blir låst progresjonsspill
- ikke ødelegger faglig struktur

Men i stedet:
- bygger ekte kunnskapsprofiler
- lar brukere ha ulike, unike spor
- muliggjør innsikt, matching og refleksjon
- tåler både lek, alvor og akademisk dybde

---

## Kort definisjon (kanonisk)

> **Knowledge er brukerens personlige kart over hva de faktisk har forstått,  
slik dette uttrykkes gjennom quiz og kobles til emner, fag og begreper.**

Alt annet er struktur.
Knowledge er erfaring.

---

## Status

Dette dokumentet definerer:
- hvordan knowledge skal forstås
- hvordan det skapes
- hvordan det relaterer seg til resten av systemet

Neste steg (når ønskelig):
- konkret knowledge-entry JSON-skjema
- audit-regler (duplikater, styrke, progresjon)
- visualisering på profil / innsiktssider
