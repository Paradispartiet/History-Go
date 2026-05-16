README PENSUM (UPDATED 2025-12-28)
==================================

NOTE
----
Denne fila er oppdatert uten å slette noe av originalteksten.
Originalinnholdet står fortsatt her, og nye avklaringer er lagt til som egne seksjoner.

# History GO – Kunnskaps- og pensumarkitektur

Dette dokumentet beskriver **hvordan innhold, læring og progresjon er strukturert i History GO**, og hva de ulike filene og nivåene faktisk betyr.  
Formålet er å unngå overlapp, dobbel logikk og “systemer oppå systemer”.

---

## Grunnprinsipp

> **Knowledge samler erfaring.  
> Pensum tolker erfaring til progresjon.**

Pensum er **ikke innhold** og **ikke historikk**.  
Pensum er **kurssammensetning og regler**.

---

## Oversikt over nivåene

```
Merke (badge)
→ Structure (gren / type / area)
→ Emner (mikro-pensum)
→ Quiz (evaluering i verden)
→ Knowledge (brukerens erfaring)
→ Pensum (kursplan som tolker erfaring)
```

---

## 1) Merker (Badges)
**Rolle:** Inngang, kategori, identitet, progresjonsramme

- Eksempel: `sport`, `by`, `historie`
- Brukes i UI, belønning og som toppnivå
- Inneholder **ikke** faglig struktur

📁 `data/badges.json`  
📄 `merke_<id>.html`

---

## 2) Structure (`structure_<id>.json`)
**Rolle:** Navigasjon og oversikt (“bibliotekets hyller”)

- Definerer:
  - **grener / typer**
  - **area_id** (temaområder)
- Brukes av **Knowledge-visning**
- Definerer **ikke** læringsrekkefølge eller krav

📁 `data/pensum/structure_<subject>.json`

Eksempel:
```json
branch → area_id → (emner vises her)
```

---

## 3) Emner (`emner_<id>.json`)
**Rolle:** Mikro-pensum (innhold + motor)

- Ett emne = én konkret problemstilling
- Inneholder:
  - `core_concepts` (motoren)
  - `dimensions`
  - tekstlig forklaring
- Gjenbrukbart på tvers av kurs

📁 `data/emner/emner_<subject>.json`

> Emner er **innhold**, ikke kurs.

---

## 4) Quiz
**Rolle:** Evaluering i kontekst (kartet)

- Tester **emner**, ikke merker eller structure
- Kobles til:
  - `emne_id`
  - ofte `place_id` og/eller `person_id`
- Gir erfaring → knowledge

📁 `data/quiz/quiz_<subject>.json`

---

## 5) Knowledge (brukerens erfaring)
**Rolle:** Logg over hva brukeren har vært borti

- Samler:
  - begreper
  - emner
  - steder
  - personer
- Akkumulativ og åpen
- **Ingen krav eller rekkefølge**

📁 `knowledge.js`, `knowledge_component.js`

> Knowledge er **erfaring**, ikke progresjon.

---

## 6) Pensum (`pensum_<id>.json`)
**Rolle:** Kurssammensetning og progresjonslogikk

Pensum beskriver:
- hvilke **emner** som inngår i et kurs
- i hvilken **rekkefølge**
- hvilke **krav** som må oppfylles
- hvordan erfaring tolkes til “fullført”

Pensum:
- inneholder **ingen emnetekster**
- skrives **aldri til**
- brukes kun til **beregning**

📁 `data/pensum_<subject>.json`

Eksempel:
```json
module → emne_ids → regler → status (beregnet)
```

---

## Viktig skille (kritisk)

| Del | Hva den er | Hva den ikke er |
|---|---|---|
| Structure | Navigasjon | Pensum |
| Emner | Innhold | Kurs |
| Quiz | Evaluering | Pensum |
| Knowledge | Erfaring | Progresjon |
| Pensum | Kursplan | Logg |

---

## Flyt ved fullført quiz

1. Quiz fullføres  
2. → Knowledge oppdateres (begreper / emne)  
3. → Pensum **tolker** knowledge:
   - hvilke emner er dekket?
   - hvilke moduler er fullført?
4. → Kursstatus vises i UI  

> Pensumfila endres **aldri**.  
> Status er alltid **beregnet**, ikke lagret.

---

## Designmål (låst)

- Én sannhet per nivå
- Ingen duplisering av innhold
- Pensum = regler, ikke data
- Knowledge = erfaring, ikke fasit
- Structure = oversikt, ikke didaktikk

---

## Status
Denne arkitekturen er:
- konsistent
- skalerbar
- egnet for by, sport, historie, vitenskap
- kompatibel med eksisterende kodebase

---

**Dette dokumentet er normativt.**  
Hvis noe bryter med dette, er det en feil i implementasjon – ikke i modellen.

UPPDATERINGER / KLARGJØRINGER (2025-12)
-------------------------------------
Hva som er nytt siden eldre versjoner
- Emnefilene er styrket som "én sannhet".
- Progresjon skal forstås faglig: emnedekning + begrepsdekning + quiz-kvalitet, ikke bare poeng.
- Courses/pensum-filer brukes til å definere *moduler* og *krav* for diplom.


- `structure_*.json` er tatt helt ut av runtime. Hvis eldre tekst refererer til "structure", regnes det nå som DEPRECATED/historisk.
- Ontologi som *modell* er fortsatt relevant, men implementasjonen i runtime skjer via: Merker → Fagkart → Emner → Evidens (learning log) → Courses → UI.
- `Courses` er progresjonsmotor (tolkningslag) og skal ikke introdusere ny fagstruktur; den bruker emner + learning log + pensum-filer for å beregne modulstatus/diplom.
- Knowledge-visningen er nå flat (ingen structure) og kan i tillegg vise kursprogresjon via `HGCourseUI`/`HGCourses.compute`.


Hvordan du kobler alt sammen
- Emner peker "nedover" til quiz via `related_emner`/`core_concepts`-logikk.
- Courses peker "oppover" ved å oppsummere (modul/diplom) per merke og (eventuelt) per fagkart-node.

Manifest-kontrakt for aktive fagfiler (2026-05)
------------------------------------------------
- Aktiv fagfilkontrakt er nå `data/fag/fag_manifest.json`.
- Manifestet peker til aktive filer per `subjectId` for:
  - `pensum`
  - `emner`
  - `fagkart`
  - `methods`
  - `supersetQuizMal`
- Canonical/versjonerte filnavn kan beholdes uendret.
- Runtime skal laste fagfiler via manifestet først, med eksisterende fallback-paths intakt.
- Store fagfiler skal ikke renames for å bytte aktiv versjon.
- Bytte av aktiv fagversjon gjøres ved å oppdatere manifestet.
