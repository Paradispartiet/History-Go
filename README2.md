# README – History GO (Systemkontrakt + Utvidet Knowledge)

**Dato:** 2025-12-29  
Dette dokumentet er en **utvidelse** av eksisterende README – ingenting er fjernet.  
Målet er å stadfeste hvordan vi utnytter dagens runtime (knowledge.js + courses + emner/fagkart) med **rikere knowledge**.

---

## 0) Låst modell (trickle-down)

Én vei, ingen parallelle sannheter:

**Merke → Fagkart (=Fagplan) → Emner → Steder → Evidens (quiz/observasjon/notat) → Courses (progresjon) → Knowledge/UI**

- **Fagkart**: definerer hovedrom (Byliv, Arkitektur, …)  
- **Emner**: faglige undergrupper/linser med *utfyllende beskrivelser og begreper*  
- **Steder**: konkrete “ankere” i byen  
- **Evidens**: det spilleren faktisk gjør (quiz/observasjon/notat)  
- **Courses**: tolker evidens og regner progresjon (ikke et ekstra innholdslag)  
- **Knowledge**: viser kunnskap på flere nivåer (fagkart, emne, sted, person) og kan i tillegg vise course-status

---

## 1) Hva “utvidet knowledge” betyr i vårt system

Utvidet knowledge betyr at knowledge-visningen kan vise **kanonisert og popularisert fagtekst** på flere nivåer – ikke bare “ting som falt ut av quiz”.

Vi bruker tre nivåer:

### 1A. Fagkart-nivå (kontekst og ryggrad)
- Kort “hva dette faget handler om”
- Kanoniske nøkkelbegreper / rød tråd
- Skal være spill-nært (observerbart), men faglig presist

**Bruk:** knowledge-sider per merke/kategori, introduksjonstekst, progresjonsramme.

### 1B. Emne-nivå (der dybden bor)
- Emner kan (og bør) ha lange beskrivelser, begreper, historiske linjer, “hva du ser etter”.
- Emner er den primære enheten for *faglig dybde* i appen.

**Bruk:** knowledge-sider, kursmoduler, quiz-kontekst, observasjonslinser.

### 1C. Sted/person-nivå (situert kunnskap)
- Korte, konkrete “hva er dette stedet/personen”, + kobling til emner/fagkart.
- Observasjon og quiz legger evidens på toppen.

**Bruk:** placeCard, popups, reward, nærmeg-liste, kart.

---

## 2) Hvordan vi utnytter eksisterende runtime (ingen ny arkitektur)

### 2A. knowledge.js / knowledge_component.js – allerede riktig form
Vi trenger ikke ny struktur for å vise rik kunnskap:
- knowledge-komponenten kan rendere lengre blokker
- grupperinger viser “dimensjoner” / seksjoner
- HGCourseUI kan mountes inn i knowledge-seksjonen uten å endre datamodellen

**Konsekvens:**  
Kunnskap kan komme fra emner, steder, personer, kurs – visningen bryr seg ikke om kilden, bare ID/struktur.

### 2B. emnerLoader + emne-filer – der teksten og dybden bor
- Emne-filer er *ikke* “små”
- Emne-filer er riktig sted for:
  - forklaringer
  - definisjoner
  - begreper
  - mål/milepæler (hvis brukt)
  - koblinger (sted/person/quiz)

**Konsekvens:**  
Når du fyller emnene, får du automatisk:
- mer å vise i knowledge
- bedre kurs (courses) som kan peke til emner
- mer presise observasjonslinser og quiz

### 2C. fagkartLoader + fagkart – ryggraden (fagplan)
- Fagkartet er den offisielle fagplanen
- Ikke splitt “fagplan vs fagkart” i kode
- Fagkart gir bare: navn, struktur, korte beskrivelser (valgfritt)

### 2D. courses (progresjonslag) – ikke innholdslag
- Courses regner status basert på evidens (learning log / quiz history / observations)
- Courses peker “hvilke emner/tema du bør gjøre videre”, men *inneholder ikke* selve fagteksten (den ligger i emner/knowledge)

---

## 3) Praktisk “trickle-down” for By (konkret)

**Merke:** By & arkitektur  
**Fagkart-kategorier:** Byliv, Arkitektur, Bolig og nabolag, Administrasjon og plan, Urbanisme, Arbeid og næring, Historiske lag, Makt og konflikt  
**Emner:** under hver kategori (10–30 stk over tid), med tekst/begreper  
**Steder:** tagges/tilknyttes relevante emner (én primær + flere sekundære er ok)  
**Observasjon/quiz:** alltid peker til et emne (og dermed indirekte fagkart)

---

## 4) Hva vi IKKE gjør

- Vi gjeninnfører ikke `structure_*.json` i runtime  
- Vi lager ikke “nytt nivå” mellom emner og steder  
- Vi flytter ikke fagtekst ut av emner til tilfeldige andre filer  
- Vi bygger ikke en egen “knowledge-ontologi” ved siden av fagkart/emner

---

## 5) Sjekkliste: er et merke “komplett fra topp til bunn”?

Minimum (spillbart):
- [ ] fagkart for merket
- [ ] 8–12 emner (minst) fordelt på fagkart-kategorier
- [ ] 10–30 steder knyttet til emner
- [ ] 1 observasjon per emne (start)
- [ ] 1 kort quiz per emne (start)
- [ ] knowledge-side som viser:
      - HGCourseUI (progress)
      - emne-tekster / blokker
      - relevant evidens (quiz/obs) når låst opp

---

# ORIGINAL README (verbatim)

Nedenfor er originalfilen uendret, for historikk og full kontekst.

---
README (UPDATED 2025-12-28)
===========================

NOTE
----
Denne fila er oppdatert uten å slette noe av originalteksten.
Originalinnholdet står fortsatt her, og nye avklaringer er lagt til som egne seksjoner.

# 🧭 History GO
Offline-first, stedbasert lærings- og kunnskapssystem: kart → quiz → knowledge/trivia → profil → emner/pensum → AHA-innsikt.

History GO er designet for byvandring, samling og læring: du oppdager steder på kartet, tar quiz, låser opp kunnskap og funfacts, samler personer, skriver notater og kan eksportere alt til AHA (innsiktsmotor).

---

## Status / sider
- **Hovedapp:** `index.html` (kart + utforsk + quiz + popups + ruter + progresjon)
- **Profil:** `profile.html`
- **Kunnskap:** `knowledge.html`
- **Notater:** `notater.html`
- **Emner/pensum:** `emner.html`
- **AHA:** `AHA/index.html` (import + innsiktskammer + meta)

---

## Funksjoner (høy-nivå)

### 🗺️ Kart og utforsk
- MapLibre-kart + markører + visited-state
- Fokus/zoom til sted, og ruter via `routes.js`

### 🧪 Quiz
- Manifest-basert quiz-lasting
- Rewards/hooks på riktige svar:
  - HGInsights (begreper)
  - Knowledge (varig kunnskap)
  - Trivia (mikrobelønning)

### ✨ Knowledge
- `knowledge_universe` i localStorage
- Visning i:
  - place/person popups (låst bak fullført quiz)
  - `knowledge.html`
  - profil (“Siste kunnskap”)

### 🎈 Trivia
- `trivia_universe` i localStorage
- Visning i popups og profil (“Siste funfacts”)

### 📝 Notater + 🗣️ Person-dialoger
- Notater: `hg_user_notes_v1`
- Dialoger: `hg_person_dialogs_v1`
- `notater.html` rendrer notater

### 📚 Emner/pensum
- `emner.html` viser dekning basert på HGInsights + emner-loadere

### 🔁 AHA-integrasjon
- HG skriver eksportbuffer: `aha_import_payload_v1`
- AHA importerer buffer via “Importer History Go” (knapp i AHA)

---

## Kjøring lokalt
Bruk en lokal webserver (anbefalt):
- VS Code Live Server
- `python -m http.server`

Åpne `index.html`. Service worker fungerer best når du ikke kjører `file://`.

---

## Filstruktur (konseptuelt)

/
  index.html
  profile.html
  knowledge.html
  notater.html
  emner.html
  sw.js
  manifest.json

  /js
    app.js                  # orkestrator (init + progresjon + AHA-export)
    dataHub.js              # data/caching/enrichment
    map.js                  # HGMap (MapLibre)
    quizzes.js              # QuizEngine (manifest + hooks)
    routes.js               # ruter
    popup-utils.js          # popups + gating + inline knowledge/trivia
    knowledge.js            # knowledge universe + updateProfile + AHA sync
    trivia.js               # trivia universe + updateProfile + AHA sync
    hgInsights.js           # innsikt-events (core_concepts)
    hgConceptIndex.js       # konseptindeks
    knowledge_component.js  # UI-komponenter for knowledge
    DomainRegistry.js       # domene-fasit + alias + fail-fast
    domainHealthReport.js   # sanity check for domener (emner/quiz/merke + manifest)
    quiz-audit.js           # quiz-target audit (PEOPLE/PLACES vs quiz)

  /data
    places.json, people.json, badges.json, tags.json, routes.json
    quiz/manifest.json + quizfiler

  /AHA
    index.html
    insightsChamber.js
    metaInsightsEngine.js
    ahaEmneMatcher.js
    ahaFieldProfiles.js
    ahaChat.js

---

## Domene-system (kritisk)
### `DomainRegistry.js`
- **Canonical domain IDs** (låst liste)
- **Alias** må være eksplisitt
- **Fail-fast** hvis ukjent domene dukker opp
- Har helper for filkonvensjoner (`file(kind, domainId)`)  [oai_citation:6‡DomainRegistry.js](sediment://file_000000008360720ab3a478d5d1c0d42c)

### `domainHealthReport.js`
- Sjekker at alle domener har forventede filer:
  - `emner/emner_<id>.json`
  - `data/quiz/quiz_<id>.json` (eller alias-fil)
  - `merker/merke_<id>.html` (eller alias-fil)
  - `data/quiz/manifest.json` (best effort)
- Kjøres manuelt: `DomainHealthReport.run({ toast: true })`  [oai_citation:7‡domainHealthReport.js](sediment://file_00000000e7f471f4aedee10968b3595c)

**Hvorfor:** dette gjør teamarbeid trygt — feil i domene/filnavn blir oppdaget tidlig.

---

## Quiz-audit (dataintegritet)
### `quiz-audit.js`
- Laster `data/quiz/manifest.json`
- Laster alle quizfiler, bygger “targets”
- Verifiserer at `personId/placeId` peker på eksisterende PEOPLE/PLACES
- Kjør: `QuizAudit.run()` (logger summary + missingTargets + bad)  [oai_citation:8‡quiz-audit.js](sediment://file_00000000fa54720aabdb60556e9c8681)

**Hvorfor:** hindrer at quiz peker på id-er som ikke finnes i datasett.

---

## AHA-system (oversikt)
### `ahaFieldProfiles.js`
- Definerer `window.HG_FIELD_PROFILES` som “linse” per tema/merke
- Inneholder ingress, kjernebegreper og dimensjoner per fagfelt  [oai_citation:9‡ahaFieldProfiles.js](sediment://file_0000000086bc720a91836afbff47490e)

### `ahaEmneMatcher.js`
- `matchEmneForText(subjectId, text)`:
  - laster emner for subject
  - scorer på keywords + core_concepts
  - returnerer beste match med score  [oai_citation:10‡ahaEmneMatcher.js](sediment://file_000000004a78720ab78a7929271e8b15)

### `metaInsightsEngine.js`
- Bygger meta-profil på tvers av tema:
  - lifecycle (ny/voksende/moden/integrasjon)
  - global semantic profile (modality/valence/phases)
  - cross-topic patterns
  - begrepsindeks + POS-filter + multiword extraction
  - akademiske teoriklynger (Marx/Weber/Foucault/Bourdieu osv.)  [oai_citation:11‡metaInsightsEngine.js](sediment://file_00000000487871f48023ad7d767e6096)

**Hvorfor:** AHA gir “abstraksjon” og mønsterlesing over HG-hendelser.

---

## Dataflyt (kort)
1) Quiz riktig svar →
- HGInsights logges
- knowledge_universe + trivia_universe oppdateres
- `updateProfile` dispatches
- HG skriver/oppdaterer `aha_import_payload_v1`

2) AHA →
- Importer History Go → leser `aha_import_payload_v1` → bygger/oppdaterer chamber/meta

---

## Team-regler (kort)
1) Ikke endre localStorage-keys uten migrering.
2) Ikke endre domene/alias uten å oppdatere DomainRegistry.
3) Kjør DomainHealthReport og QuizAudit ved større data-endringer.
4) Ikke fjern gating (knowledge/trivia vises kun etter fullført quiz) uten bevisst produktvalg.

---

# Struktur i History GO

Dette dokumentet beskriver **den faktiske strukturen** i History GO slik den er ment å fungere i spillet.

Målet er å:
- unngå at innhold oppleves trivielt eller fragmentert
- gi brukeren oversikt før detaljer
- bruke eksisterende data riktig, uten nye ontologier eller refaktor

---

## Grunnidé

History GO skal ikke gå direkte fra grove kategorier til detaljerte problemstillinger.

Mennesker orienterer seg slik:

> paraply → type → tema → detalj

Systemet må gjenspeile dette.

---

## Den endelige strukturen

Merke
→ Gren / type
→ Temaområde
→ Emne (mikro)
→ Quiz
→ Instanser (steder / personer / hendelser)

Dette er **minimumsstrukturen** som gjør innhold forståelig og meningsfullt.

---

## 1. Merke (paraply)

**Hva:**  
- Overordnet kategori / verden i spillet

**Eksempler:**  
- Sport  
- By  
- Samfunn  
- Historie  
- Kunst  
- Natur  

**Rolle:**  
- Inngang
- Identitet
- UI og progresjon (badges)

Merker er **bevisst grove** og skal ikke forklare faglig innhold.

---

## 2. Gren / type (artsnivå)

**Hva:**  
- Grove, menneskelige underkategorier innen et merke
- Svarer på: *«Hva slags typer ting finnes her?»*

**Eksempler:**

**Sport**
- Vintersport
- Ballsport
- Friidrett
- Motorsport
- Breddeidrett og lek

**By**
- Byliv og kultur
- Byplanlegging og styring
- Bolig og nabolag
- Transport og infrastruktur
- Økonomi og arbeid
- Natur og miljø i byen

**Viktig:**
- Gren er **ikke pensum**
- Gren er **ikke problemstilling**
- Gren er **ikke akademisk disiplin**

Gren er et **orienteringsnivå**.

---

## 3. Temaområde

**Hva:**  
- Samlende problemfelt innen en gren
- Dette er nivået som allerede finnes i data (`area_id` / `area_label`)

**Eksempler (By):**
- Offentlige rom og møtesteder
- Infrastruktur og mobilitet
- Bydelsforskjeller og segregering
- Gentrifisering og eiendom

Temaområder:
- grupperer emner
- gir faglig retning
- er mer spesifikke enn gren, men ikke detaljer

---

## 4. Emne (mikro)

**Hva:**  
- Konkrete problemstillinger / pensumblokker

**Eksempler:**
- Industriby og arbeiderliv rundt 1900
- Urban segregering etter 1945
- Fotball og lokal identitet

Emner er:
- detaljerte
- bevisst avgrensede
- knyttet til `core_concepts`

Emner skal **aldri stå direkte under merker**.

---

## 5. Quiz

**Hva:**  
- Tester forståelse av ett eller flere emner

**Regel:**  
- Quiz er alltid koblet til `emne_id`
- Quiz er aldri koblet direkte til gren eller merke

---

## 6. Instanser

**Hva:**  
- Konkrete ting i verden
- Steder, personer, hendelser

Instanser:
- kobles til emner
- arver kontekst via tema → gren → merke
- gir fysisk og narrativ forankring

---

## Hvorfor denne strukturen er nødvendig

Uten gren/type-nivå skjer dette:

Merke
→ Emne (mikro)

Resultat:
- Emner oppleves trivielle
- Brukeren mister oversikt
- Systemet føles brått og krevende

Med riktig struktur får vi:

Merke
→ Gren (oversikt)
→ Temaområde (retning)
→ Emne (detalj)

Dette gir:
- ro
- forståelse
- valg
- progresjon

---

## Viktige prinsipper (låst)

- Merker er innganger, ikke fagforklaringer
- Grener er typer, ikke tema
- Temaområder grupperer problemfelt
- Emner er detaljer
- Quiz tester emner
- Instanser forankrer i verden

---

## Kort huskeregel

> **Merker gir verden.  
> Grener gir oversikt.  
> Tema gir retning.  
> Emner gir forståelse.**

Dette er strukturen History GO skal bygges videre på.

UPPDATERINGER / KLARGJØRINGER (2025-12)
-------------------------------------
Dette er bevart
- Original README inneholder ofte historikk, motivasjon, og arkitektur-notater. Det beholdes.

Oppdatert kjernefortelling (kort)
- History GO er et stedbasert læringssystem hvor faglig progresjon måles gjennom evidens:
  - quiz/observasjon/notat → learning log → courses beregner progresjon → UI viser den.


- `structure_*.json` er tatt helt ut av runtime. Hvis eldre tekst refererer til "structure", regnes det nå som DEPRECATED/historisk.
- Ontologi som *modell* er fortsatt relevant, men implementasjonen i runtime skjer via: Merker → Fagkart → Emner → Evidens (learning log) → Courses → UI.
- `Courses` er progresjonsmotor (tolkningslag) og skal ikke introdusere ny fagstruktur; den bruker emner + learning log + pensum-filer for å beregne modulstatus/diplom.
- Knowledge-visningen er nå flat (ingen structure) og kan i tillegg vise kursprogresjon via `HGCourseUI`/`HGCourses.compute`.


Tips for å unngå at lagene sklir
- Fagkart = struktur. Emner = innhold. Courses = progresjon. UI = presentasjon.
