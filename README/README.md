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
- **Profil:** `profile.html` (canonical full profilside)
- **Kunnskap:** `knowledge.html`
- **Notater:** `notater.html`
- **Emner/pensum:** `emner.html`
- **AHA:** `AHA/index.html` (import + innsiktskammer + meta)

### Index appstruktur
- `index.html` er hoved-app-shell for kart, nearby, place card, quiz og miniProfile.
- miniProfile gir rask profilstatus i index.
- `profile.html` er full profil for samling, merker, profilkart, historikk og profilpaneler.
- Index bruker split boot: `bootCritical()` for raskt kart/places og `bootBackground()` for people/relations/wonderkammer/nature/stories/events/brands.
- Index-routeren eier `#/map`, `#/place/:id` og `#/quiz/:id`; `#/profile` er ikke en intern summary-view og navigerer til `profile.html`.
- `profile.html` og `Civication.html` er fortsatt egne sider og skal ikke flyttes inn uten egen fase.
- Se også: [`docs/APP_STRUCTURE_INDEX.md`](../docs/APP_STRUCTURE_INDEX.md)

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
    ahaHistoryGoImport.js

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
