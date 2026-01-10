# Epoker i History GO  
**Designavgjørelser, prinsipper og praktisk bruk**

Denne README-en dokumenterer avgjørelsene som er tatt rundt **epoker** i History GO, og hvordan epoker skal forstås, lagres og brukes i systemet – både teknisk og opplevelsesmessig.

Målet har vært å gjøre epoker til en **bærende struktur for forståelse**, uten at appen blir skoleaktig, mekanisk eller gamifisert på en måte som bryter med History GO sin kjerneidé: utforskning, sammenheng og undring.

---

## 1. Grunnleggende prinsipp

**History GO er i sin natur epokebasert.**  
All kunnskap i systemet – steder, ideer, uttrykk, institusjoner, teknologier og praksiser – eksisterer i tid og utvikler seg gjennom epoker.

Likevel:

> Epoker skal **oppleves som fortelling og kontekst**, ikke som progresjonsnivå eller pensum.

Dette er den viktigste avgjørelsen.

---

## 2. Hva epoker er (og ikke er)

### Epoker ER:
- Tidsmessige rammer som forklarer *hvordan* og *hvorfor* noe oppstår
- Faglig funderte inndelinger (vitenskapelige / historiske)
- Avhengige av domene (film, TV, sport, kunst, politikk har ulike epokelogikker)
- Et verktøy for sammenheng, orientering og dypere forståelse

### Epoker er IKKE:
- Et badge-nivå
- En progresjonsmåler
- Et krav for opplåsing
- Et skolepensum eller quizstruktur
- En universell tidslinje som tvinges på alle fag

Dette betyr konkret:
- Ingen prosentbarer
- Ingen “du er 40 % gjennom epoken”
- Ingen lineær “fullfør epoke X for å gå videre”

---

## 3. Separate epokesystemer per domene

En avgjørende beslutning var å **forkaste idéen om ett felles epokesystem**.

I stedet:
- Hvert fag/domene har sine **egne epoker**
- Epokene defineres vitenskapelig innen sitt felt

Eksempler:
- Film har korte, intense epoker (stumfilm, lydovergang, New Hollywood, streaming)
- TV har andre brytningspunkter (monopol, kommersiell TV, reality, plattformer)
- Sport har egne epoker (amatør → profesjonalisering → kommersialisering)
- Historie har lange tidsrom (forhistorie, middelalder, industrialisering, samtid)

Dette er grunnen til at epoker ligger i **egne JSON-filer per domene**, og ikke som tags.

---

## 4. Epoker ≠ Wonderkammer

En viktig avklaring:

- **Wonderkammer** = innhold, historier, vendepunkter, artefakter, myter, øyeblikk
- **Epoker** = tidslig ramme rundt disse

Epoker er **kontekst**, ikke selve innholdet.

Derfor:
- Wonderkammer-entries *peker på* epoker
- Epoker inneholder ikke entries
- Epoker forklarer *når og hvorfor*, ikke *hva*

Dette hindrer dobbeltføring og holder systemet ryddig.

---

## 5. Hvordan epoker brukes i data

### I wonderkammer-entry:
- En entry kan referere til én eller flere epoker
- Epoken brukes til å plassere historien i tid
- Epoken er deskriptiv, ikke normativ

### Runtime:
- Epoker bygges inn i et runtime-index
- Indexen er robust mot ulike schema-varianter
- Brukes til:
  - oppslag
  - sortering
  - filtrering
  - UI-kontekst

Det finnes **ikke** et separat “epoke-tags-register”.  
Epokefilene er sannhetskilden.

---

## 6. Hvordan epoker vises i UI

Epoker skal være **synlige, men ikke påtrengende**.

### Prinsipper:
- Epoke vises som tekstlig kontekst
- Forklarende fremfor klassifiserende
- Alltid frivillig å fordype seg videre

### Eksempler på riktig bruk:
- “Knyttet til overgangen mellom stumfilm og lydfilm”
- “Et sentralt sted i streaming-epokens fremvekst”
- “Oppstår i etterkrigstidens modernistiske brudd”

### Eksempler på feil bruk:
- “Epoke 3/7”
- “Fullfør epoken”
- “Du mangler 2 steder for å låse opp epoken”

---

## 7. Forholdet til badges og fagkart

- **Badges** = faglig identitet og progresjon
- **Fagkart** = struktur og begrepsmessig sammenheng
- **Epoker** = tidslig orientering

De tre systemene overlapper, men erstatter ikke hverandre.

Et sted kan:
- gi progresjon i et badge
- være del av et fagkart-emne
- være knyttet til én eller flere epoker

Uten at noen av systemene blir avhengige av hverandre.

---

## 8. Hvorfor dette er fremtidsrettet

Denne modellen:
- skalerer til flere byer, land og fag
- tåler nye forskningsperspektiver
- lar deg legge til epoker uten å bryte eksisterende data
- åpner for AI-bruk (svar basert på epoke + sted + entries)
- holder History GO langt unna skole- og quizfellen

Kort sagt:

> Epoker gir dybde uten å ta frihet.

---

## 9. Status etter dagens avgjørelser

- Epoker er egne, domenespesifikke JSON-filer
- Epoker brukes som kontekst, ikke progresjon
- Wonderkammer og epoker er tydelig adskilt
- Runtime-index håndterer epoker robust
- UI skal vise epoker narrativt, ikke mekanisk

Dette legger et svært solid fundament for videre utvikling.

---

**History GO er ikke en tidslinje man fullfører.  
Det er en verden man forstår – litt bedre for hvert steg.**
