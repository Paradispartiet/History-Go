# 🧭 HISTORY GO — CHANGELOG (FULL)

Dette er en **utvidet changelog** som **bevarer nesten alt fra tidligere versjoner**, og legger til nye endringer uten å komprimere bort kontekst.

Prinsipp:
- Ingenting viktig er fjernet
- Nye versjoner legges **oppå**, ikke i stedet for
- Changelog beskriver både **systemretning** og **konkrete endringer**

---

# 🧭 HISTORY GO — CHANGELOG
## v4.0 — Knowledge & Insight Build
**Status:** Stabil kjerne · Systemintegrasjon fullført  
**Fokus:** Fra “quiz + kart” → komplett kunnskaps- og innsiktssystem  
**Kompatibilitet:** iPad (Safari), desktop, offline-first

---

## 🚀 HOVEDENDRING
History GO er nå et **fullverdig kunnskapssystem** hvor:
- læring (quiz + trivia) → genererer **knowledge**
- brukerens handlinger → genererer **innsikt**
- dialog og notater → bygges inn i **AHA**

Appen er ikke lenger bare et spill eller kart, men et **samlet lærings- og refleksjonsmiljø**.

---

## 🧠 NYE SYSTEMER (viktig)

### ✨ Knowledge system
- Nytt vedvarende **knowledge_universe** (localStorage).
- Knowledge opprettes **kun ved riktige quiz-svar**.
- Knowledge kobles til:
  - sted
  - person
  - kategori
  - quiz-id
- Knowledge:
  - vises i placeCard / person-popup (låst bak fullført quiz)
  - vises samlet i `knowledge.html`
  - vises som “Siste kunnskap” i profil

**Hvorfor:** kunnskap skal være fortjent, varig og gjenbrukbar.

---

### 🎈 Trivia system
- Eget **trivia_universe** for funfacts/mikrolæring.
- Triggeres parallelt med knowledge ved riktige svar.
- Brukes som:
  - rask belønning
  - flyt-forsterker mellom større quizer
- Vises i:
  - popups
  - profil (“Siste funfacts”)

**Hvorfor:** holde momentum uten å tynne ut kunnskapen.

---

### 🗣️ Person-chat
- “Snakk med personen” tilgjengelig i person-popup.
- Samtaler lagres i:
  - `hg_person_dialogs_v1`
- Hver dialog:
  - knyttes til person
  - kan eksporteres til AHA
- Chat er **ikke bare UI**, men innsiktsmateriale.

**Hvorfor:** dialog produserer tekst → tekst produserer innsikt.

---

### 📝 Notater
- Bruker kan skrive notater knyttet til:
  - person
  - sted
- Notater lagres i:
  - `hg_user_notes_v1`
- Egen side: `notater.html`
- Notater eksporteres automatisk til AHA.

**Hvorfor:** History GO er også et personlig minnekammer.

---

### 🧩 Innsikt & begreper (HGInsights)
- Nye **HGInsights** logger kun reelle begreper:
  - `core_concepts` er fasit
  - `topic` brukes ikke som fallback
- Innsikts-events lagres i:
  - `hg_insights_events_v1`
- Brukes videre av:
  - emner/pensum
  - AHA-import

**Hvorfor:** innsikt må være faglig robust, ikke kosmetisk.

---

### 📚 Emner / pensum
- Ny side: `emner.html`
- Brukerens begreper → matches mot emner.
- Dekning beregnes via:
  - `computeEmneDekning(concepts, emner)`
- Viser:
  - hva brukeren faktisk har lært
  - hull i pensum

**Hvorfor:** koble uformell læring til formell struktur.

---

### 🔁 AHA-integrasjon (History GO → AHA)
- History GO bygger kontinuerlig:
  - `aha_import_payload_v1`
- Payload inneholder:
  - knowledge
  - trivia
  - notater
  - person-dialoger
  - innsikts-events
- AHA kan importere alt med ett klikk.

**Hvorfor:** HG produserer erfaring, AHA produserer abstraksjon.

---

## 🧭 ARKITEKTUR (oppdatert)

### ❌ Ingen core.js
- `app.js` er nå **faktisk core/orchestrator**:
  - init
  - events
  - progresjon
  - AHA-eksport

### ✅ DataHub etablert som datasentral
- JSON lastes via DataHub (med bevisste unntak).
- Støtte for:
  - base data
  - overlays
  - quiz-manifest
  - emner/pensum

### 🗺️ Kart (HGMap)
- MapLibre-basert kart.
- Marker-state synkes mot `visited`.
- Klikk på kart → callback til app/UI.

### 🧪 QuizEngine (ny motor)
- Manifest-basert quiz-lasting.
- Gating:
  - sted må være “visited”
- Rewards:
  - knowledge
  - trivia
  - innsikt
- Én konsistent belønningskanal.

---

## 💾 STATE & KONTRAKTER (viktig)

### Nye / sentrale localStorage-keys
- `knowledge_universe`
- `trivia_universe`
- `hg_insights_events_v1`
- `hg_person_dialogs_v1`
- `hg_user_notes_v1`
- `aha_import_payload_v1`

### Designregler
- Knowledge/trivia vises **kun** etter fullført quiz.
- Innsikt = begreper, ikke UI-labels.
- AHA styrer ikke History GO-UI.

---

## 🌐 Offline & PWA
- Service Worker:
  - cache-first for statics
  - network-first for HTML
- Quiz-filer og data cache-bare.
- Manifest + install-støtte.

---

## ⚠️ KJENTE AVVIK (bevisste)
- `notater.html` fetcher data direkte (ikke via DataHub).
- To quiz-spor eksisterer (`quiz_history` vs QuizEngine-state) – dokumentert, ikke refaktorert ennå.

---

## 🧭 HVA ER NYTT KONSEPTUELT
- History GO er nå:
  - kart
  - spill
  - kunnskapsbase
  - refleksjonsverktøy
- AHA er:
  - ikke en chat
  - men et **innsiktskammer** bygget av HG-data

---

## 🏁 KONKLUSJON
**History GO v4.0** er første versjon der:
- alt henger sammen
- dataflyt er lukket og bevisst
- kunnskap → innsikt → refleksjon

Dette er riktig tidspunkt for:
- team-arbeid
- onboarding
- ekstern demo
- videre faglig skalering


---

## 🆕 v4.2 — Deterministisk progresjon & systemstabilisering
**Dato:** 2026-01-02  
**Status:** Stabil kjerne · Læringsmotor ferdigstilt  
**Overordnet fokus:** Fra “robust, men implisitt” → **deterministisk, eksplisitt og etterprøvbart**

### 🚀 NYE ENDRINGER (I TILLEGG, IKKE ERSTATNING)

#### QuizEngine
- Full overgang til **ID-basert progresjon**
- `topic` brukes kun til visning / UI
- Begreper, emner og progresjon kommer kun fra eksplisitte felt
- Unlocks trigges **kun** ved korrekt svar
- Ingen fallback fra tekst → begrep

#### HGUnlocks
- Normalisering fullstendig fjernet
- Ingen kategori-gjetting
- Én unlock kan kun registreres én gang
- Samme logikk gjelder nå for alle kategorier (inkl. vitenskap, kultur, sport)

#### Test Mode
- Fullt isolert fra permanent state
- Skriver aldri unlocks, progresjon eller rewards
- Kan brukes til UI-testing og quiz-simulering uten bivirkninger

#### NextUp / UI-flyt
- NextUp foreslår realistiske valg:
  - quiz
  - unlock
  - observe
- Avgir ingen progresjonsbeslutninger
- Gir mer menneskelignende flyt (ikke “alt samtidig”)

#### Profil / Knowledge
- Profilen viser kun faktisk oppnådd progresjon
- Ingen falske positive unlocks
- Knowledge kan vise course-status uten å eie progresjon

### 🧠 ARKITEKTURKLARGJØRING
- `app.js`
  - Eier global state
  - Eier init-rekkefølge
- `quizzes.js`
  - Eier quizlogikk
  - Muterer ikke global state
- `HGUnlocks`
  - Kun registrering
  - Ingen UI-ansvar
- Courses
  - Tolkningslag (leser evidens)
  - Introduserer ikke innhold

### ⚠️ KJENT PROBLEM (DOKUMENTERT)
- Ved retur til forsiden kan steder vises som besøkt
- Årsak: state-reset / init-rekkefølge
- Ikke en logisk feil i QuizEngine eller Unlocks

---

## 📝 META
- Denne changeloggen er bevisst **lang**
- Den fungerer også som:
  - historikk
  - beslutningslogg
  - arkitektonisk hukommelse

For kontrakter:
- `SYSTEM_REGISTRY.md`  
For arkitektur:
- `SYSTEM_MAP.md`  
For visjon:
- `IDE_BIBLE.md`
