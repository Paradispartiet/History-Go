# Knowledge – personlig kunnskapsunivers i History GO

## Kanonisk definisjon

> **Knowledge er brukerens personlige kart over hva de faktisk har forstått, slik dette uttrykkes gjennom quiz eller quiz-lignende vurdering og kobles til fag, emner og begreper.**

Knowledge er ikke fagplan, fagkart, emner, merker, samling eller besøkslogg. Alt faglig innhold er åpent. Knowledge beskriver brukerens **relasjon til kunnskapen**, ikke tilgang til den.

---

## 1. Hva skaper Knowledge?

### Quiz er kilden

En Knowledge-entry oppstår når brukeren svarer riktig i en quiz eller fullfører en annen vurdering som eksplisitt er definert som knowledge-skapende.

Observasjon, besøk, innsjekk, samling av et sted eller en person og notater kan:

- gi kontekst
- gi progresjonssignal
- dokumentere erfaring
- hjelpe anbefalingsmotorer

Men de skaper **ikke** en Knowledge-entry alene.

Dette skillet er låst:

```text
Handling / besøk / observasjon
        ↓
Learning log / progresjon / kontekst

Riktig quiz-svar / vurdert forståelse
        ↓
Knowledge
```

---

## 2. Canonical Knowledge-entry

Ny canonical runtime-modell er `history_go_knowledge_entry_v2`.

Lagringsnøkkel:

```text
hg_knowledge_entries_v2
```

Minimumsform:

```json
{
  "schema": "history_go_knowledge_entry_v2",
  "version": 2,
  "id": "kv2_by_torggata_gentrifisering",
  "subject_id": "by",
  "fagkart_category_id": "by",
  "emne_ids": ["em_by_gentrifisering_eiendom"],
  "concepts": ["gentrifisering", "eiendomsverdi", "planmakt"],
  "dimension": "konflikt_forandring",
  "topic": "Gentrifisering i Torggata",
  "text": "...",
  "source": {
    "type": "quiz",
    "quiz_id": "...",
    "target_id": "torggata",
    "place_id": "torggata",
    "person_id": null
  },
  "learned_at": "2026-07-20T00:00:00.000Z",
  "last_seen_at": "2026-07-20T00:00:00.000Z",
  "times_seen": 1,
  "link_status": "linked"
}
```

### Obligatoriske faglige koblinger

En ferdig produsert Knowledge-entry skal kunne kobles til:

- `subject_id` / `fagkart_category_id`
- minst ett `emne_id` når fagstrukturen har relevante emner
- konkrete `concepts`
- en faktisk knowledge-tekst
- en quiz-/vurderingskilde

`emne_ids` er et array fordi én quiz kan treffe flere emner.

---

## 3. Begreper er semantisk motor

`concepts` skal beskrive faktiske ideer brukeren har jobbet med:

- fagbegreper
- fenomen
- prosesser
- mønstre
- sammenhenger
- motsetninger

Begrepene brukes til:

- emnekobling
- kunnskapsprofil
- matching
- anbefalinger
- AHA / innsiktsmotor
- videre læringsforslag

Begreper skal ikke fylles med tilfeldige quiz-id-er, UI-tags eller generiske stemningsord.

---

## 4. Proveniens: kunnskap skal kunne spores tilbake

En Knowledge-entry skal bevare hvor forståelsen kom fra.

Minimum:

```text
Knowledge-entry
→ quiz/vurdering
→ target (sted/person når relevant)
→ fag
→ emne
→ concepts
```

Stedet eller personen er **kilde og kontekst**, ikke Knowledge i seg selv.

Dette gjør det mulig å svare på:

- Hva har brukeren lært?
- Hvilket emne hører det til?
- Hvilke begreper har de arbeidet med?
- Hvilken quiz skapte kunnskapspunktet?
- Hvilket sted eller hvilken person ga konteksten?

---

## 5. Runtime: én capture-modell og én read-model

### Capture

`js/knowledgeV2.js` eier den nye capture-kontrakten.

Den:

1. beholder eksisterende `saveKnowledgeFromQuiz()` for bakoverkompatibilitet
2. skriver samtidig canonical entries til `hg_knowledge_entries_v2`
3. dedupliserer samme kunnskapspunkt og øker `times_seen`
4. forsøker å koble manglende `emne_ids` mot learning-loggen
5. bevarer ufullstendige legacy-entries i stedet for å slette dem

### Read-model

All ny Knowledge-UI skal lese:

```js
await HGKnowledgeV2.buildProfile()
```

Read-modellen organiserer Knowledge slik:

```text
Knowledge-profil
├── fagfelt
│   ├── emner
│   │   └── knowledge entries
│   ├── concepts
│   └── kursstatus (separat progresjonslag)
└── uløste legacy-koblinger
```

UI skal ikke selv bygge en alternativ sannhet direkte fra tre-fire localStorage-nøkler.

---

## 6. Forholdet til eksisterende lagring

### `hg_knowledge_entries_v2`

Canonical Knowledge-storage for nye entries.

### `knowledge_universe`

Legacy tekstarkiv. Beholdes for bakoverkompatibilitet og migreres inn i V2-read-modellen uten datatap.

Legacy-data som mangler emne eller concepts skal markeres som uløst, ikke gjøres om til falskt presise koblinger.

### `hg_learning_log_v1`

Append-only evidens- og progresjonslogg.

Kan inneholde:

- quiz-sett
- emnetreff
- concepts
- observations

Learning log kan hjelpe med å forklare eller koble Knowledge, men **loggen er ikke Knowledge**.

### `hg_learning_v1`

Avledet læringsstatus (`seen`, `understood`, `applied`). Dette er progresjonstilstand, ikke selve Knowledge-arkivet.

### `hg_insights_events_v1`

Legacy/sekundær begrepsstrøm. Ny Knowledge-UI skal ikke bruke den som eneste kilde til hva brukeren kan.

---

## 7. Knowledge-siden

Canonical side:

```text
knowledge.html
knowledge.html?subject=by
knowledge.html?subject=historie
...
```

Siden viser:

- samlet Knowledge
- fagfelt
- emner med faktisk Knowledge
- begreper
- konkrete kunnskapspunkter
- proveniens
- uløste eldre koblinger
- kursprogresjon som et separat tolkningslag

Separate `knowledge/knowledge_<subject>.html`-sider er legacy og skal ikke utvikles videre som egne implementasjoner.

---

## 8. Samling vs Knowledge

Samling er stedlig og objektrettet.

Knowledge er forståelsen som oppstår gjennom vurdert læring.

Eksempel:

```text
Besøk Torggata
→ stedet registreres som erfaring/samling

Svar riktig på quiz om gentrifisering
→ Knowledge-entry opprettes
→ kobles til By
→ kobles til emne om gentrifisering og eiendom
→ concepts registreres
→ Torggata beholdes som kildekontekst
```

> **Samling er ikke Knowledge. Stedet er ikke Knowledge. Forståelsen er Knowledge.**

---

## 9. Audit-regler

Knowledge-produksjonen skal kunne auditeres.

For quizspørsmål som har `knowledge`, kontroller:

1. kategori/fag finnes
2. knowledge-tekst finnes
3. `core_concepts`/concepts finnes
4. `related_emner` eller annen gyldig emnekobling finnes
5. refererte emner finnes i aktiv emnefil
6. target kan spores når quizen er sted-/personbundet

Audit skal skille mellom:

- `error`: kunnskap kan ikke plasseres faglig
- `warning`: kunnskap er bevart, men koblingen er svak eller legacy

Ingen data skal slettes automatisk av audit.

---

## 10. Låste arkitekturregler

- Én canonical Knowledge-entry-modell.
- Én canonical Knowledge read-model.
- Quiz/vurdering skaper Knowledge.
- Observasjon og besøk skaper ikke Knowledge alene.
- Alle nye Knowledge-entries skal ha faglig proveniens.
- Legacy-data bevares og merkes når koblinger mangler.
- UI skal vise hva som er kjent, og være ærlig om hva som ikke kan kobles sikkert.
- Pensum/Courses tolker erfaring og Knowledge til progresjon, men eier ikke Knowledge.
- Fagplan, fagkart og emner er åpne strukturer og endres ikke av brukerens Knowledge.

---

## Kortform

```text
Fagstruktur = hva som finnes å lære
Quiz = vurdert møte med kunnskapen
Knowledge = hva brukeren faktisk har forstått
Learning log = evidens om hva brukeren har gjort
Courses/pensum = tolkning til progresjon
Knowledge UI = personlig kart over forståelsen
```
