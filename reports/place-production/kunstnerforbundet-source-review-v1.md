# Kunstnerforbundet — source review v1

Status: **SOURCE REVIEW / FULLPRODUKSJON IKKE LUKKET**  
Place: `kunstnerforbundet`  
Kategori: `kunst`  
Branch base: `0ddf7bb4a8f8b505b43721c132005e6a19030484`  
Kontrollert: 2026-09-13

## 1. Tidligere arbeid og canonical baseline

Tidligere-arbeid-gaten finner PR **#3476**, mergecommit `88bbf2448bc170faccfab5de698db53463138cdb`, som siste tydelige canonical produksjonsbaseline for Kunstnerforbundet. Den etablerte Kunstnerforbundet som eget Place, løste institusjonsidentiteten og verifiserte display-markøren mot Geonorge-adressen Kjeld Stubs gate 3.

**Beslutning:**

- identitet: `ALLEREDE FERDIG`;
- koordinat/geokoding: `ALLEREDE FERDIG`;
- full stedproduksjon etter dagens checklist: `REELT NYTT ARBEID`.

Det finnes ingen konkret regresjon som begrunner ny koordinatproduksjon. Eksisterende `lat`, `lon`, `r`, `coordRole`, `coordType`, `coordStatus`, `coordSource` og `coordSourceId` skal derfor bevares i denne produksjonen.

På preflight-main finnes ikke:

- `data/places/production/kunstnerforbundet.json`;
- `data/leksikon/places/oslo/kunst/leksikon_kunstnerforbundet.json`;
- `data/quiz/production_briefs/kunst/kunstnerforbundet.json`;
- `data/quiz/production_context/kunst/kunstnerforbundet.json`;
- tidligere `kunstnerforbundet-workcard-current.json` eller `kunstnerforbundet-source-review-v1.md`.

## 2. Canonical identitet og own-place-grense

Place-objektet representerer **Kunstnerforbundet som varig kunstnerstyrt visnings- og formidlingsinstitusjon i egen bygård i Kjeld Stubs gate 3**.

Det representerer ikke:

- hver enkelt skiftende utstilling som eget Place;
- hvert enkelt kunstverk som eget Place;
- Atelier Kunstnerforbundet som et separat kartsted i denne produksjonen;
- andre kunstinstitusjoner i Rådhus-/Kvadraturen-klyngen.

Kunstnerforbundets vedtekter oppgir selskapsnavnet `Kunstnerforbundet AS`, beskriver sammenslutningen som en sammenslutning av visuelle kunstnere og knytter formålet til utstillinger, omsetning av kunstneres arbeider og ivaretakelse av kunstnernes interesser. Vedtektene knytter samtidig eiendommen Kjeld Stubs gate 3 til disse formålene.

## 3. Kilder kontrollert i denne fasen

### A. Kunstnerforbundet — Om Kunstnerforbundet

URL: https://kunstnerforbundet.no/om-kunstnerforbundet

Brukes for:

- dagens kunstnerstyrte visnings-/formidlingsidentitet;
- selskaps-/vedtektsidentitet og formål;
- eiendommen Kjeld Stubs gate 3;
- navn på salene, inkludert Overlyssalen;
- økonomi-/samarbeidsspor og faste samarbeidspartnere;
- Atelier Kunstnerforbundet som program under institusjonen.

### B. Kunstnerforbundet — Arkiv

URL: https://kunstnerforbundet.no/arkiv

Brukes for:

- opprettelsen i 1910;
- utstillingsarkiv med verkslister fra 1910 til i dag;
- arkivmateriale og institusjonshistorie;
- dokumenterte tidlige kunstnere, blant andre Henrik Sørensen og Jean Heiberg.

### C. Kunstnerforbundet — Jubileumsutstillingen HUNDRE

URL: https://kunstnerforbundet.no/utstillinger/964/jubileumsutstillingen-hundre

Brukes for:

- første utstilling 11. desember 1910;
- møtet i Kviteseid med Henrik Sørensen, Henrik Wetlesen, Hans Ødegaard og Oluf Wold-Torne som opphavshistorie;
- den praktiske og kunstpolitiske bakgrunnen for initiativet;
- oppdraget til Blakstad og Munthe-Kaas om Overlyssalen i 1918;
- arkivmateriale som anmeldelser, invitasjonskort, pamfletter og kataloger;
- jubileumsboken `Kunstnerforbundets første hundre år` fra 2011.

### D. Kunstnerforbundet — Nerver, spenning og glede

URL: https://kunstnerforbundet.no/nyheter/nerver-spenning-og-glede

Brukes for:

- eksplisitt kilde til at Kunstnerforbundet siden 1917 har holdt til i Kjeld Stubs gate 3;
- plakatsamlingen som fysisk arkivspor i bygningen.

### E. Kunstnerforbundet — Atelier Kunstnerforbundet

URL: https://kunstnerforbundet.no/atelier

Brukes for:

- oppstart i 2018;
- programmet som del av Kunstnerforbundet;
- 287 m², fire atelierer, fellesrom og loft i den vernede bygården;
- produksjons-/formidlingsfunksjon og dokumenterte støtte-/samarbeidsaktører.

### F. Kunstnerforbundet — Atelier historikk

URL: https://kunstnerforbundet.no/atelier/historikk

Brukes for:

- kartlegging/katalogisering av en samling på ca. 400 verk / nær 600 enkeltarbeider;
- dokumenterte stedsspesifikke Atelier-prosjekter og bruk av arkiv, arkitektur og lysforhold.

### G. Kunstnerforbundet — Lyset blinker

URL: https://kunstnerforbundet.no/utstillinger/1404

Brukes for:

- første utstilling i Overlyssalen med Oluf Wold-Torne i mars 1919;
- historisk bruk av rommet og eksplisitt kobling mellom sal, utstilling og institusjon.

## 4. Funn som kan inngå i claim-banken

Følgende er foreløpige **source-backed kandidater**, ikke ferdig `ready_v4_2` før claimfil, setningsmapping, hashes og to reviews er materialisert:

1. Kunstnerforbundet ble opprettet i 1910 av yngre kunstnere.
2. Første utstilling åpnet 11. desember 1910.
3. Henrik Sørensen, Henrik Wetlesen, Hans Ødegaard og Oluf Wold-Torne inngår i den dokumenterte opphavshistorien fra Kviteseid.
4. Kunstnerforbundet har siden 1917 holdt til i Kjeld Stubs gate 3.
5. Kunstnerforbundet eier bygården og bruker den til visning, formidling, salg, lager, kontor og atelierfunksjoner.
6. Blakstad og Munthe-Kaas fikk i 1918 oppdraget med å tegne Overlyssalen.
7. Første utstilling i Overlyssalen var med Oluf Wold-Torne i mars 1919.
8. Utstillingsarkivet inneholder verkslister fra 1910 og fremover og omfatter blant annet protokoller, anmeldelser, presseklipp og utstillingsmateriale.
9. Atelier Kunstnerforbundet startet i 2018 og holder til i samme bygård.
10. Kunstnerforbundet organiserer seg som kunstnerstyrt, ikke-kommersiell visnings- og formidlingsinstitusjon og idealistisk aksjeselskap.

Sterke formuleringer som `eldste`, `første` utover eksplisitt dokumenterte hendelser, `viktigste`, `ledende` eller årsaksforklaringer skal ikke brukes uten at Place Description v4.2.1s sterke-claim-gate er oppfylt.

## 5. Badge, profil og faglig retning

Hovedbadge er `kunst`.

Foreslåtte underbadges for den ferdige profilen:

- `kunstinstitusjoner` — stedets primære identitet;
- `samtidskunst` — dagens visnings- og formidlingsvirksomhet;
- `kunsthistorie` — sammenhengende institusjons-/utstillingsarkiv fra 1910 og historisk rolle.

**Produksjonsprofil: `standard`.**

Begrunnelse: stedet har flere uavhengige og kildebårne spor — grunnleggelse og kunstnerorganisering, utstillingshistorie, arkiv, bygning/saler, kunstomsetning/formidling og Atelier-programmet. Dette er bredere enn et reelt `focused` sted, men ikke et `major`-kompleks.

## 6. Fire obligatoriske PlaceCard-samlinger

Canonical Kunst-profil er:

`People · Objects · Brands · Productions`

Brukerrettet navn for `productions` er **Kunstverk**.

### People — kandidat, ikke ferdig

**Henrik Sørensen** er sterkeste første kandidat fordi jubileumshistorikken knytter ham direkte til initiativet bak opprettelsen. Ingen ny People-record skal skrives før identitetsport, inspectable biografiske kilder, claims, felt-/setningsmapping og People-image-kontrakt er lest og oppfylt.

### Objects — source-bounded holdback

Kunstnerforbundets arkiv dokumenterer konkrete fysiske materialtyper: invitasjonskort, pamfletter, kataloger, protokoller og plakater. Jubileumssiden dokumenterer også den fysiske jubileumsboken `Kunstnerforbundets første hundre år`.

Ingen av disse godkjennes som Object ennå. Først må ett eller flere konkrete eksemplarer avgrenses, knyttes direkte til stedet og få et publiserbart bilde av selve objektet med proveniens.

Overlyssalen er ikke Object; den er rom/arkitektur.

### Brands — kandidataudit pågår

Offisiell institusjonsside oppgir blant annet Parabol Studio, Kunst i Kvadraturen, Oslo Art Guide og Oslo Art Weekend som faste samarbeidspartnere. Atelier-materialet dokumenterer støtte fra blant annet Sparebankstiftelsen DNB, Talent Norge, Billedkunstnernes Hjelpefond og Fritt Ord.

Dette er **kandidater**, ikke ferdige Brand-medlemmer. Hver kandidat må bestå Brand v1.1: selvstendig identitet, reell direkte place-relasjon, korrekt temporal scope og verifisert lokal logo/ordmerke. Kunstnerforbundet selv skal ikke brukes som Brand på sitt eget PlaceCard.

### Productions / Kunstverk — kandidater finnes, rettigheter gjenstår

Offisielle utstillings- og arkivsider dokumenterer mange konkrete kunstverk og har tilhørende bilder. Produksjonsfasen skal velge verk som forklarer Kunstnerforbundet som institusjon og sted, ikke tilfeldige samtidige verk. Hvert medlem trenger stabil identitet, direkte stedsevidens og publiserbart medlemsbilde med rettighetsgrunnlag.

Skiftende utstillinger skal aldri opprettes som egne Places for å løse denne samlingen.

## 7. Chronology / epoke

Kildebårne kandidatankere:

- **1910** — opprettelse og første utstilling;
- **1917** — fast tilhold i Kjeld Stubs gate 3;
- **1918** — Overlyssalen tegnes på oppdrag av Kunstnerforbundet;
- **1919** — første utstilling i Overlyssalen;
- **2018** — Atelier Kunstnerforbundet starter.

Dette er researchresultater. Epoke-/runtime-index er ikke regenerert i denne fasen.

## 8. Språkleksikon

Stedet er et enkeltsted, ikke `placeScope: area`, og skal derfor **ikke** ha dialektlag.

Reelle språkspor som skal undersøkes videre:

- `Kunstnerforbundet` som institusjonsnavn;
- `Overlyssalen` som stedsspesifikt rom-/funksjonsnavn;
- `kunstnerstyrt` som institusjonsbegrep dersom den stedlige relevansen kan uttrykkes presist uten å late som ordet er lokalt.

Minst én kildebundet oppføring og manifestkobling er obligatorisk før sluttstatus.

## 9. Quiz

Place-filen har allerede `quiz_profile`-metadata, men dette er ikke en ferdig canonical quizpakke. Preflight fant ingen `production_brief` eller `production_context` for `kunstnerforbundet`.

Quizprofilen er derfor **ikke låst**. `normal 4×7` er kun et foreløpig profilhint fordi kildene ser ut til å bære minst fire selvstendige læringsspor. Før låsing skal all eksisterende quiz/Knowledge for target-ID-en auditeres, fagmanifest og alle required inputs leses, claim-bank bygges og de første 14 spørsmålene planlegges som normale direkte spørsmål etter canonical quizregler.

## 10. Betingede moduler

- **Stories:** grunnleggelsen i 1910 kan ha selvstendig narrativ motor, men må vurderes mot Stories-governance og chronology-eierskap før produksjon.
- **Før/etter:** ingen lisensiert og motivmessig kontrollert sammenligning er godkjent ennå; kandidatsearch kreves.
- **Nyheter:** institusjonen har en aktiv nyhets-/programflate; History GO-modulen må vurderes separat og ikke fylles med flyktig programstoff bare fordi det finnes.
- **Lesespor:** `PRODUSER`. Stedet har et rikt offisielt kildegrunnlag: institusjonshistorie, arkiv, jubileumsmateriale og Atelier-dokumentasjon.
- **Relasjoner/rute:** Kunstnerforbundet inngår i en tett kunstinstitusjonsklynge med Tegnerforbundet og Norske Grafikere, med Nasjonalmuseet som nærliggende kontrastanker. Eventuell rute-/relasjonsmaterialisering skal skje i riktig subsystem, ikke som PlaceCard-fyll.

## 11. Nåværende blokkere

Stedet kan ikke ferdigmeldes før minst følgende er lukket:

1. v4.2 description production package og claim-/setningsparitet;
2. confirmed underbadges i canonical place-data;
3. place-eid Fagverk;
4. publiserbart place-bilde og ekte stående `frontImage`;
5. Språkleksikon + manifestkobling;
6. chronology/epoke-materialisering;
7. ferdig People-medlem med profil og bilde;
8. ferdig Object-samling med fysisk(e) objekt(er) og medlemsbilder;
9. ferdig Brand-medlem med verifisert logo/ordmerke;
10. ferdig Kunstverk-samling med rettighetsklar(e) medlemsbilder;
11. `place_card_profile` med nøyaktig fire ferdige samlinger;
12. canonical quiz brief/context/package + QuizCard;
13. relevante runtime-/genererte indekser;
14. exact-head CI;
15. manuell slutt-QA av popupfaner, fire 2×2-samlinger, bilder og QuizCard-flip.

## 12. Neste tillatte fase

Neste fase kan først settes `PÅGÅR` når subsystemkontraktene som eier den er lest. Den naturlige neste fasen er **claim-first description/Fagverk/source materialization**, samtidig som People/Object/Brand/Productions beholdes som separate holdbacks til deres egne kontrakter og bildeproveniens er kontrollert.

Ingen identitets- eller koordinatendring er planlagt.
