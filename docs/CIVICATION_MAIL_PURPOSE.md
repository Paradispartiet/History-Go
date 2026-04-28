# Civication Mail – formål, metode og progresjon

Civication-mail er ikke vanlige meldinger. De er simulerte arbeidssituasjoner.

Formålet er å gjøre History Go-kunnskap, badge-progresjon og Civication-roller om til konkrete valg i arbeidshverdagen. Spilleren skal ikke bare få en stillingstittel; spilleren skal møte oppgaver, friksjon, kollegaer, regler, kunder, tidspress og konsekvenser som hører til rollen.

## Hovedprinsipp

History Go gir kunnskap. Badges gir faglig retning. Civication gjør retningen om til arbeid, ansvar, sosial posisjon og konsekvens.

Civication-mail skal derfor svare på ett spørsmål:

> Hva må spilleren forstå, vurdere eller gjøre i denne rollen akkurat nå?

En god mail er ikke bare stemning. Den inneholder en oppgave.

## Fire mailtyper som ikke må blandes

- `planned` – jobbmail / rolleprogresjon / arbeidsoppgave
- `thread` – oppfølgingssvar på et tidligere valg
- `life` – livssituasjon utenfor jobb, for eksempel arbeidsledig, økonomisk press, helse eller sosial slitasje
- `phase` – dagsrytme: lunsj, kveld, dagslutt, overgang mellom arbeidsøkter

Bare `planned` og `thread` skal skrive til `mail_runtime_v1`.
Bare `life` skal skrive til `life_mail_runtime_v1`.
Bare `phase` skal bruke `phase_context` og `phase_family`.

## Arbeidsvitenskapelig modell

Alle planned-mails skal bygges fra en arbeidsanalyse, ikke fra tilfeldig tekst.

Hver mail skal ha:

1. **Rolle** – hvem er spilleren akkurat nå?
2. **Kontekst** – hvor skjer det? Kasse, gulv, lager, bakrom, kundeservice, rapportering, produksjon.
3. **Oppgave** – hva må faktisk gjøres?
4. **Friksjon** – hva gjør oppgaven vanskelig? Tid, kunde, regel, systemfeil, kollega, lederpress, økonomi, moral.
5. **Valg** – hva kan spilleren gjøre?
6. **Kompetanse** – hvilken ferdighet testes?
7. **Konsekvens** – hva endres i kapital, psyke, relasjon, risiko eller progresjon?
8. **Læring** – hva forstår spilleren bedre etterpå?

Dette gjør mailene vitenskapelige i spillets forstand: De er forankret i observerbare arbeidsoppgaver, kompetanser og beslutningssituasjoner.

## Næringsliv skal starte på gulvet

De første trinnene i Næringsliv skal ikke føles som abstrakt kapital, ledelse eller næringslivsteori. De skal starte i konkrete gulvoppgaver.

Intern Civication-stige for Næringsliv bør være:

1. Ekspeditør / butikkmedarbeider
2. Erfaren butikkmedarbeider
3. Vareansvarlig / områdeansvarlig
4. Skiftansvarlig
5. Fagarbeider salg/service
6. Assisterende leder
7. Mellomleder
8. Driftsleder / formann
9. Daglig leder
10. Gründer / eier / konsern

Badge-labels kan utvikles gradvis, men mailene skal følge denne arbeidslogikken.

## Mailtypefunksjoner

### `job`
Konkrete arbeidsoppgaver. Eksempler: kassefeil, varepåfylling, kundespørsmål, lageravvik, rapport, rutine, produksjonsstopp.

### `people`
Relasjonelle arbeidssituasjoner. Eksempler: kollega lærer deg snarvei, leder tester tillit, kunde husker deg, nyansatt spør om hjelp.

### `conflict`
Verdikonflikt eller regelkonflikt. Eksempler: tempo mot korrekthet, salg mot ærlighet, lojalitet mot faglighet, kundeomsorg mot butikkregel.

### `story`
Yrkesidentitet og rolleforståelse. Eksempler: hva service egentlig er, hvordan gulvet bærer butikken, hvorfor taus kunnskap teller.

### `event`
Større hendelser. Eksempler: kampanje, avvik, revisjon, travel dag, svinnsak, systemfeil, nøkkelperson borte.

### `thread`
Direkte oppfølging på et valg spilleren tok.

## Første Næringsliv-domener

Ekspeditør / butikkmedarbeider skal først bygges rundt disse domenene:

- kundemøte
- kasse
- varepåfylling
- lager og bestilling
- svinn og kontroll
- salg og veiledning
- samarbeid
- renhold og butikkstandard
- åpning/lukking
- kampanje og pris

## Oppgaver på gulvet

Eksempler på riktige oppgaver:

- Kunde spør etter et produkt du ikke kjenner.
- Pris i kassa stemmer ikke med skiltet i hylla.
- Køen bygger seg opp mens en kunde vil returnere uten kvittering.
- En kampanje må settes opp før åpning.
- En kollega lærer deg en snarvei som sparer tid, men svekker kontroll.
- Lagerstatus sier at varen finnes, men hylla er tom.
- En kunde vil ha anbefaling, men du vet at den dyreste varen ikke passer best.
- Kasseoppgjøret stemmer ikke.
- En nyansatt spør deg om rutinen mens du selv har dårlig tid.

## Hvilke systemer mailene skal påvirke

Choices bør kunne påvirke:

- service
- produktkunnskap
- nøyaktighet
- tempo
- integritet
- salg
- samarbeid
- stress
- tillit fra kollega
- tillit fra leder
- kundetillit
- svinnrisiko
- økonomisk resultat
- synlighet
- autonomi

Disse mappes videre til eksisterende Civication-systemer:

- service/samarbeid → sosial kapital
- produktkunnskap/nøyaktighet → kulturell og symbolsk kapital
- salg/økonomisk resultat → økonomisk kapital
- integritet/autonomi/stress → psyke
- synlighet/tillit → symbolsk og sosial kapital
- svinnrisiko/regelbrudd → risiko, strikes eller senere konsekvensmail

## Mengdemål

Næringsliv bør på sikt ha minst 800–1000 mailer totalt.

Første mål:

- Ekspeditør: 120 mailer + threads
- Erfaren butikkmedarbeider: 120 mailer + threads
- Vareansvarlig: 100 mailer
- Skiftansvarlig: 100 mailer
- Fagarbeider: 150 mailer
- Mellomleder: 200 mailer
- Driftsleder/formann: 150 mailer
- Arbeidsledig/life: 100 mailer
- Phase-events: 100 varianter

## Spillrytme

Per Civication-dag:

- Morgen: 1 planned/job/life-mail
- Lunsj: 1 phase-event
- Ettermiddag: 0–1 oppgave, consequence eller event
- Kveld: 1 phase-event eller sosial konsekvens
- Dagslutt: oppsummering

Per Civication-uke:

- 3–5 reelle jobboppgaver
- 2–4 phase-events
- 0–2 story/people-mails
- 1 større event hvert 5.–8. steg

## Narrativt mål

Mailene skal vise hvordan en spiller beveger seg fra enkel arbeidsutførelse til faglig dømmekraft, sosial posisjon og ansvar.

I Næringsliv betyr det:

1. Du starter på gulvet.
2. Du lærer rytmen.
3. Du blir pålitelig.
4. Du får små ansvar.
5. Du møter kundens, kollegaens og lederens blikk.
6. Du gjør feil og må eie dem.
7. Du utvikler dømmekraft.
8. Du får større ansvar – eller faller ut.

Dette er Civication-mails bestemte formål.
