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

Dette dokumentet beskriver **hvordan History GO allerede er bygget**, og hvordan strukturene skal brukes riktig og konsekvent.

Målet er **ikke** å innføre nye lag eller ontologier, men å bruke det som finnes på en klar og stabil måte.

---

## Grunnprinsipp

Vi stopper “videre”-impulsen.

I stedet for å legge på nye nivåer (world / track / theme osv.), tar vi utgangspunkt i **strukturene som allerede finnes**, og bruker dem riktig:

- merker
- emner
- fagkart
- pensum
- begreper (`core_concepts`)
- instanser (steder/personer)

Dette er tilstrekkelig for både spill, navigasjon og kunnskapsmotor.

---

## 1. Hva systemet faktisk består av

### A) Merker / Badges
**Rolle:** UI, progresjon og identitet

- Brukes til nivåer, belønning og visuell inngang
- Fungerer som grove kategorier “på toppen”
- Kan brukes som linse i AHA (field profiles)
- Skal **ikke** være sannheten om fag eller kunnskap

Merker er et **spill- og UI-lag**.

---

### B) Emner (`emne_id`, `emner_*.json`)
**Rolle:** pensumblokker / kunnskapsmoduler

- Dette er pensumkartet i praksis
- Hver emne-blokk inneholder:
  - beskrivelse
  - keywords
  - dimensions
  - `core_concepts`
- Dette er det **viktigste strukturlaget** i systemet

Emner er der kunnskap **forklares og struktureres**.

---

### C) Fagkart (`fagkart.json`, `fagkart_map.json`)
**Rolle:** navigasjon og relasjoner mellom emner

- Viser hvordan emner henger sammen
- Kan være hierarkisk eller nettverksbasert
- Brukes til progresjon, anbefalinger og oversikt

Fagkartet er **kartet over pensum**, ikke selve pensumet.

---

### D) Pensum
**Rolle:** samlet læringsinnhold

- I praksis: emner + deres struktur
- Kan senere utvides med tekster, kilder, referanser
- Pensum er **en effekt av emner**, ikke et eget datasett

---

### E) Begreper (`core_concepts`)
**Rolle:** motor og matching

- Dette er de minste, atomære enhetene i systemet
- AHA matcher, teller og kobler på disse
- Brukes på tvers av emner, steder og personer

`core_concepts` er **maskinens språk**, ikke UI-tekst.

---

### F) Instanser (places / people + overlays)
**Rolle:** verden spillet viser

- Konkrete steder, personer, hendelser
- Vises i kart og kort
- Kan kobles til emner og begreper via overlays

Instanser er **inngangen til kunnskap i verden**.

---

## 2. Helheten (det som faktisk finnes)

Systemet består allerede av disse lagene:

Merke
→ Emne
→ Begrep
→ Instans

Med:
- **fagkart** som kartet mellom emner
- **pensum** som summen av emnene

👉 Det er nok.  
Ingen nye lag er nødvendig.

---

## 3. Viktig konklusjon

Rot oppstår når:
- merker brukes som fag eller pensum
- emner brukes som kategorier
- begreper blandes med keywords/tags
- instanser prøver å “eie” struktur

Stabilitet oppstår når:
- merker er UI/progresjon
- emner er pensumblokker
- begreper er motor
- instanser er verden
- fagkart er navigasjon

---

## 4. Kort regel (kan brukes som huskeregel)

> **Merker viser vei.  
> Emner forklarer.  
> Begreper matcher.  
> Instanser viser verden.  
> Fagkart binder det sammen.**

Dette er den strukturen History GO allerede har – og den skal brukes, ikke erstattes.


# History GO – Struktur og hierarki

Dette dokumentet beskriver **hvordan innhold i History GO er strukturert**, og hvordan de ulike nivåene skal forstås og brukes.

Målet er:
- menneskelig orientering
- tydelig progresjon
- gjenbruk av eksisterende data
- ingen nye systemlag

---

## Grunnidé

History GO organiserer verden slik mennesker naturlig forstår den:

> **Fra grove verdener → via typer og praksiser → til konkrete problemstillinger.**

Systemet er bygget for å unngå å hoppe direkte fra paraply til detalj.

---

## Det ferdige hierarkiet

Dette er den strukturen History GO nå bruker konsekvent:

Merke
→ Gren
→ Undergren
→ Emne
→ Quiz
→ Instanser

Alle nivåene finnes allerede i systemet.  
Det nye er at de **brukes eksplisitt og konsekvent**.

---

## 1. Merke (paraply / verden)

**Rolle:** inngang, identitet og progresjon

Eksempler:
- Sport
- Historie
- Samfunn
- Kunst
- Natur
- Subkultur

Merker er:
- grove
- bevisst brede
- ment som startpunkt, ikke struktur

---

## 2. Gren (type / hovedretning)

**Rolle:** menneskelig sortering av hva slags ting som finnes innen et merke

Eksempler:
- Sport → Ballsport, Vintersport, Friidrett
- Historie → Politisk historie, Sosial historie, Kulturhistorie
- Kunst → Musikk, Arkitektur, Visuell kunst

Grener:
- gir oversikt
- gjør valg mulig
- er ikke detaljerte

Teknisk:
- dette er **første nivå i fagkartet** (`families`)

---

## 3. Undergren (konkret praksis / delretning)

**Rolle:** samle beslektede emner før detaljnivå

Eksempler:
- Ballsport → Fotball
- Politisk historie → Demokrati
- Musikk → Rock

Undergrener:
- gir kontekst
- er tydeligere enn grener
- men fortsatt ikke mikro-nivå

Teknisk:
- dette er **andre nivå i fagkartet** (`subfields`)

---

## 4. Emne (mikro / konkret problemstilling)

**Rolle:** pensum og forklaring

Eksempler:
- «Fotball og lokal identitet»
- «Industriby og arbeiderliv rundt 1900»
- «Demokrati i Norge etter 1945»

Emner:
- er detaljerte
- er ment å studeres
- skal aldri stå direkte under merke

Teknisk:
- `emne_id`
- `core_concepts`
- pensuminnhold

---

## 5. Quiz

**Rolle:** teste forståelse av emner

- Quiz er alltid knyttet til ett eller flere emner
- Quiz tester innhold, ikke kategorier

---

## 6. Instanser (verden)

**Rolle:** fysisk og narrativ forankring

Eksempler:
- steder
- personer
- hendelser

Instanser:
- vises i kartet
- kobles til emner
- arver kontekst via gren og undergren

---

## Hvordan dette er bygget (viktig)

History GO bruker **ingen ny ontologi** og **ingen nye datasett**.

Strukturen bygger på:
- eksisterende merker (badges)
- eksisterende fagkart (`families → subfields`)
- eksisterende emner
- eksisterende quiz-mapping

Det som er nytt, er **hvordan strukturen brukes i UI og navigasjon**.

---

## Viktige prinsipper

- Merker er innganger, ikke detaljer
- Emner er mikro-nivå, ikke oversikt
- Fagkartet er hierarkiet
- Brukeren skal alltid møte:
  1. oversikt
  2. valg
  3. detaljer

---

## Kort huskeregel

> **Merker er verdener.  
> Grener er kart.  
> Undergrener gir retning.  
> Emner er pensum.  
> Quiz tester.  
> Instanser viser verden.**

---

Dette dokumentet beskriver den **endelige strukturen** for History GO.
