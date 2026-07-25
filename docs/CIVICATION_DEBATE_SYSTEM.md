# Civication — debatt- og konfrontasjonssystem

Status: **operational runtime contract**  
Sist kontrollert: **2026-07-25**

Dette dokumentet beskriver det interne debatt-/konfrontasjonssystemet i Civication og hvorfor det finnes i spillet.

Det må ikke forveksles med History GO sin sted- og standpunktbaserte debattflate, som er dokumentert i [`CIVICATION_HISTORY_GO_DEBATE_SURFACE.md`](./CIVICATION_HISTORY_GO_DEBATE_SURFACE.md). Civication-motoren bruker roller, kapital, identitet, psyke og scenarioer; History GO-flaten produserer `HGDebates`-signaler gjennom `#/debate/:id`.

## Hva dette systemet skal gjøre

Debattsystemet er laget for å gi kapital, identitet, psyke og quizkunnskap en tydelig funksjon i gameplay.

Jobber skal fortsatt i hovedsak åpnes gjennom quiz og faglig progresjon. Verdiene skal ikke først og fremst være adgangskrav til innhold. I stedet skal de brukes i møter med andre mennesker, institusjoner og roller i samfunnet.

Spilleren skal derfor ikke bare samle verdier, men bruke dem aktivt i:

- diskusjoner
- konfrontasjoner
- forhandlinger
- samfunnsdebatter
- arbeidslivskonflikter

## Kjerneidé

Systemet bygger på fire lag:

1. **Quizkunnskap** — hva spilleren faktisk kan om relevante temaer. Quizprogresjon gir saklig tyngde.
2. **Kapital** — ulike typer sosial og retorisk kraft og hvordan spilleren kan få gjennomslag.
3. **Identitet** — hvilken stil spilleren naturlig går inn i konflikter med.
4. **Psyke** — hvor godt spilleren tåler press, synlighet, motstand og konsekvenser.

## Hvorfor dette er viktig for spillet

Uten et slikt system blir kapital og identitet lett bare dekorative målere. Med debattsystemet får de en faktisk rolle i spillet.

Målet er at spilleren skal lære:

- ulike yrker
- ulike samfunnslag
- ulike livssituasjoner
- ulike typer mennesker
- ulike måter å argumentere, forsvare, påvirke og stå i konflikt på

Dette passer med den større idéen i History GO og Civication: Spilleren lærer ikke bare steder og fakta, men også hvordan ulike mennesker lever, tenker og handler i samfunnet.

## Hva de ulike ressursene betyr i debatt

### Quizkunnskap

Quizkunnskap gir saklig tyngde. Det er denne delen som gjør at spilleren faktisk vet noe om temaet som diskuteres.

### Kapital

Kapitaltypene brukes som ulike former for makt i diskusjon:

- **Økonomisk kapital:** ressursbruk, drift, effektivitet, investering og realisme
- **Kulturell kapital:** kvalitet, referanser, historie, smak, presisjon og fortolkning
- **Sosial kapital:** tillit, allianser, relasjoner og menneskelig forankring
- **Symbolsk kapital:** autoritet, troverdighet, legitimitet og status
- **Politisk kapital:** strukturforståelse, strategi, institusjoner og maktlinjer
- **Subkulturell kapital:** autentisitet, miljøkode, outsider-posisjon og anti-etablissement-tyngde

### Identitet

Identiteten påvirker hvordan spilleren går inn i debatten. To spillere kan ha samme kunnskap, men ulik identitet og derfor få ulik effekt av samme strategi.

### Psyke

Psyken avgjør hvor mye press spilleren tåler. Debatter handler derfor ikke bare om riktige svar, men også om styrke, integritet, autonomi, tillit og synlighet.

## Hva spilleren gjør

Spilleren møter en motpart og velger en strategi. Strategiene representerer ulike måter å gå inn i en konflikt på, for eksempel:

- bruk fakta
- bruk ressurslogikk
- bruk relasjoner
- bruk autoritet
- bruk systemforståelse
- stå på prinsipp
- bruk autentisitet

Systemet vurderer strategien opp mot:

- relevant quizkunnskap
- relevant kapitaltype
- identitetsfokus
- psykisk kapasitet
- motpartens profil

## Hva som teller som seier

Debatter kan gi flere utfall:

- klar seier
- seier
- delvis gjennomslag
- tap

Mange konflikter i samfunnet avgjøres ikke helt, men forskyves. Spilleren skal merke forskjellen på å dominere et rom, få litt gjennomslag eller tape definisjonsmakten.

## Situasjoner systemet brukes til

Systemet er særlig relevant for:

- arbeidslivskonflikter
- ledelsesdiskusjoner
- spørsmål om sikkerhet, tempo, kvalitet og ansvar
- offentlige og samfunnsmessige spørsmål
- kulturelle og symbolske konflikter
- møter mellom ulike livsformer og klasseposisjoner

Eksempler:

- **Arbeider:** tempo mot sikkerhet, innleie, ansvar og slit
- **Fagarbeider:** kvalitet mot produksjonspress, opplæring og faglig integritet
- **Mellomleder:** lojalitet, rapportering, styringsspråk og avstanden mellom tall og virkelighet
- **Formann:** bemanning, forsvarlighet, lojalitet til lag mot styringslinje og ansvar under press

## Hva systemet skal lære spilleren

Systemet skal hjelpe spillet med å bli mer enn et quizspill. Det skal lære spilleren:

- hvordan ulike roller tenker
- hvordan konflikter ser forskjellige ut fra ulike posisjoner
- at kunnskap alene ikke alltid er nok
- at gjennomslag også handler om sosial form, autoritet, strategi og psykologisk utholdenhet

## Runtime-eierskap

Første implementasjon ligger i:

- `js/Civication/systems/civicationDebateEngine.js`
- `js/Civication/ui/CivicationDebateUI.js`
- `Civication.html`

Motoren:

- velger debattscenario ut fra aktiv rolle
- bruker merit/quizprogresjon som kunnskapsscore
- bruker kapital, identitet og psyke i beregningen av gjennomslag
- lar spilleren velge strategi
- lagrer debattstate under `hg_civi_debate_v1`
- gir utfall og oppdaterer videre verdier gjennom eksisterende runtime

Bindende globals, storage- og subsystemgrenser eies fortsatt av [`../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md`](../README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md). Ved konflikt gjelder subsystemkontrakten og faktisk runtime-kode foran denne produktforklaringen.

## Videre produktarbeid

Mulige videre steg er:

1. flere debattscenarioer per rolle
2. flere motpartstyper med tydeligere profiler
3. mer dynamiske konsekvenser etter seier og tap
4. tydeligere kobling mellom mailsystemet og debattsystemet
5. bredere samfunnsspørsmål utenfor ren jobbkontekst
6. bedre spillerhistorikk over debattutfall

Disse punktene er produktmuligheter, ikke implementert kontrakt med mindre de er dokumentert i runtime-/subsystemkontrakten og testet.

## Oppsummert

- quiz gir kunnskap
- kapital gir sosial kraft
- identitet gir stil og retning
- psyke gir utholdenhet og sårbarhet
- debattene gir spilleren en flate der alt dette brukes mot faktiske motparter

Den tidligere rotfilen `README_CIVICATION_DEBATT.md` er erstattet av dette dokumentet. Git-historikken bevarer originalteksten.
