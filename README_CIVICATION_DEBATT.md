# Civication – debatt- og konfrontasjonssystem

Dette dokumentet beskriver debatt-aspektet i Civication og hvorfor det finnes i spillet.

## Hva dette systemet skal gjøre

Debattsystemet er laget for å gi kapital, identitet, psyke og quizkunnskap en tydelig funksjon i gameplay.

Jobber skal fortsatt i hovedsak åpnes gjennom quiz og faglig progresjon.
Verdiene skal ikke først og fremst være adgangskrav til innhold.
I stedet skal de brukes i møter med andre mennesker, institusjoner og roller i samfunnet.

Spilleren skal derfor ikke bare samle verdier, men bruke dem aktivt i:
- diskusjoner
- konfrontasjoner
- forhandlinger
- samfunnsdebatter
- arbeidslivskonflikter

## Kjerneidé

Systemet bygger på fire lag:

1. Quizkunnskap
   Dette er hva spilleren faktisk kan om relevante temaer.
   Quizprogresjon gir saklig tyngde i debatter.

2. Kapital
   Kapitalformene representerer ulike typer sosial og retorisk kraft.
   De sier noe om hvordan spilleren kan få gjennomslag.

3. Identitet
   Identiteten sier noe om hva slags person spilleren er blitt, og hvilken stil spilleren naturlig går inn i konflikter med.

4. Psyke
   Psyken avgjør hvor godt spilleren tåler press, synlighet, motstand og konsekvenser.

## Hvorfor dette er viktig for spillet

Uten et slikt system blir kapital og identitet lett bare dekorative målere.
Med debattsystemet får de en faktisk rolle i spillet.

Målet er at spilleren skal lære:
- ulike yrker
- ulike samfunnslag
- ulike livssituasjoner
- ulike typer mennesker
- ulike måter å argumentere, forsvare, påvirke og stå i konflikt på

Dette passer med den større idéen i History Go og Civication:
Du lærer ikke bare steder og fakta, men også hvordan ulike mennesker lever, tenker og handler i samfunnet.

## Hva de ulike ressursene betyr i debatt

### Quizkunnskap
Quizkunnskap gir saklig tyngde.
Det er denne delen som gjør at spilleren faktisk vet noe om temaet som diskuteres.

### Kapital
Kapitaltypene brukes som ulike former for makt i diskusjon.

- Økonomisk kapital: argumentere gjennom ressursbruk, drift, effektivitet, investering og realisme
- Kulturell kapital: argumentere gjennom kvalitet, referanser, historie, smak, presisjon og fortolkning
- Sosial kapital: argumentere gjennom tillit, allianser, relasjoner og menneskelig forankring
- Symbolsk kapital: argumentere gjennom autoritet, troverdighet, legitimitet og status
- Politisk kapital: argumentere gjennom strukturforståelse, strategi, institusjoner og maktlinjer
- Subkulturell kapital: argumentere gjennom autentisitet, miljøkode, outsider-posisjon og anti-etablissement-tyngde

### Identitet
Identiteten påvirker hvordan spilleren går inn i debatten.
To spillere kan ha samme kunnskap, men ulik identitet og derfor få ulik effekt av samme strategi.

### Psyke
Psyken avgjør hvor mye press spilleren tåler.
Det gjør at debatter ikke bare handler om riktige svar, men også om styrke, integritet, autonomi, tillit og synlighet.

## Hva spilleren egentlig gjør i systemet

Spilleren møter en motpart og må velge en strategi.
Strategiene skal representere ulike måter å gå inn i en konflikt på.

Eksempler:
- bruk fakta
- bruk ressurslogikk
- bruk relasjoner
- bruk autoritet
- bruk systemforståelse
- stå på prinsipp
- bruk autentisitet

Systemet vurderer så strategien opp mot:
- relevant quizkunnskap
- relevant kapitaltype
- identitetsfokus
- psykisk kapasitet
- motpartens profil

## Hva som teller som seier

Målet er ikke bare én enkel seierstype.
Debatter kan gi ulike utfall:

- klar seier
- seier
- delvis gjennomslag
- tap

Dette er viktig fordi mange konflikter i samfunnet ikke avgjøres helt, men forskyves.
Spilleren skal merke forskjellen på å dominere et rom, få litt gjennomslag, eller tape definisjonsmakten.

## Hvilke typer situasjoner systemet skal brukes til

Systemet er særlig relevant for:
- arbeidslivskonflikter
- ledelsesdiskusjoner
- spørsmål om sikkerhet, tempo, kvalitet og ansvar
- offentlige og samfunnsmessige spørsmål
- kulturelle og symbolske konflikter
- møter mellom ulike livsformer og klasseposisjoner

For eksempel:
- Arbeider: tempo vs sikkerhet, innleie, ansvar og slit
- Fagarbeider: kvalitet vs produksjonspress, opplæring, faglig integritet
- Mellomleder: lojalitet, rapportering, styringsspråk, avstand mellom tall og virkelighet
- Formann: bemanning, forsvarlighet, lojalitet til lag vs styringslinje, ansvar under stans og press

## Hva systemet skal lære spilleren

Dette systemet skal hjelpe spillet med å bli mer enn et quizspill.
Det skal lære spilleren:
- hvordan ulike roller tenker
- hvordan konflikter ser forskjellige ut fra ulike posisjoner
- at kunnskap alene ikke alltid er nok
- at gjennomslag også handler om sosial form, autoritet, strategi og psykologisk utholdenhet

Dermed blir spillet et sted hvor man ikke bare lærer fakta, men også lærer ulike måter å leve, arbeide og kjempe på.

## Første implementasjon i koden

Første versjon av systemet er lagt inn i:
- `js/Civication/systems/civicationDebateEngine.js`
- `js/Civication/ui/CivicationDebateUI.js`
- `Civication.html`

Den første implementasjonen gjør følgende:
- velger debattscenario ut fra aktiv rolle
- bruker merit/quizprogresjon som kunnskapsscore
- bruker kapital, identitet og psyke i beregning av gjennomslag
- lar spilleren velge strategi
- gir utfall og oppdaterer videre verdier

## Veien videre

Neste utviklingssteg for dette systemet er:

1. Flere debattscenarioer per rolle
2. Flere motpartstyper med tydeligere profiler
3. Mer dynamiske konsekvenser etter seier og tap
4. Kobling mellom mailsystemet og debattsystemet
5. Debatter om bredere samfunnsspørsmål også utenfor ren jobbkontekst
6. Egen historikk over hvilke debatter spilleren har vunnet, tapt eller bare forskjøvet

## Oppsummert

Debattsystemet finnes for å gjøre dette mulig:

- quiz gir kunnskap
- kapital gir sosial kraft
- identitet gir stil og retning
- psyke gir utholdenhet og sårbarhet
- debattene gir spilleren et sted å bruke alt dette mot andre

Dette gjør at verdiene i spillet ikke bare beskriver spilleren, men faktisk brukes i spillverdenen.
