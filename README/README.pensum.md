# History GO – kunnskaps- og pensumarkitektur

Dette dokumentet beskriver forholdet mellom fagstruktur, Knowledge, læringsevidens og kursprogresjon.

For den kanoniske definisjonen av brukerens personlige Knowledge gjelder også `README/knowledgeREADME.md`.

---

## Grunnprinsipp

```text
Fagstruktur beskriver hva som finnes å lære.
Quiz og vurderinger produserer Knowledge.
Learning log beskriver hva brukeren har gjort.
Pensum/Courses tolker evidens til progresjon.
```

Knowledge og progresjon er derfor ikke det samme.

---

## Canonical flyt

```text
Merke
  ↓
Fagkart / fagplan
  ↓
Emner
  ↓
Quiz og quiz-lignende vurdering
  ├──→ Knowledge-entry
  └──→ Learning log / progresjonsevidens
             ↓
       Courses / pensum
             ↓
      Beregnet kursstatus
```

Steder, personer og observasjoner kan være kontekst og læringsevidens, men de blir ikke automatisk Knowledge.

---

## 1. Merker

**Rolle:** inngang, kategori, identitet og aggregering.

Eksempler:

- `historie`
- `by`
- `sport`
- `vitenskap`

Merker inneholder ikke den detaljerte faglige strukturen.

---

## 2. Fagkart / fagplan

**Rolle:** beskriver fagets struktur og sammenhenger.

Fagkart er:

- delt
- åpent
- ikke personlig
- ikke progresjonstilstand

Aktive fagfiler skal finnes gjennom:

```text
data/fag/fag_manifest.json
```

Manifestet peker per `subjectId` til aktive filer for blant annet:

- `pensum`
- `emner`
- `fagkart`
- `methods`
- `supersetQuizMal`

Runtime skal bruke manifestet først og kan beholde fallback-paths der det er nødvendig for bakoverkompatibilitet.

---

## 3. Emner

**Rolle:** faglig mikrostruktur.

Ett emne beskriver en konkret problemstilling eller kunnskapsenhet.

Typiske felt:

- `emne_id`
- `subject_id`
- `title`
- `description`
- `core_concepts`
- `dimensions`
- `keywords`

Emner er innhold og struktur, ikke brukerens historikk.

> Emner finnes uavhengig av om brukeren har Knowledge i dem.

---

## 4. Quiz og vurdering

**Rolle:** vurdert møte mellom bruker og kunnskap.

Når brukeren svarer riktig på et knowledge-skapende quizspørsmål, skal runtime produsere en canonical Knowledge-entry.

Quizdata bør derfor koble til:

- fag / kategori
- ett eller flere `emne_id`
- konkrete `core_concepts` / concepts
- knowledge-tekst
- target når quizen er sted- eller personbundet

Quiz kan samtidig produsere learning-log-events som brukes av progresjonsmotoren.

---

## 5. Knowledge

**Rolle:** brukerens personlige kart over vurdert forståelse.

Canonical storage for nye entries:

```text
hg_knowledge_entries_v2
```

Canonical runtime/read-model:

```js
HGKnowledgeV2
await HGKnowledgeV2.buildProfile()
```

Knowledge samler:

- konkrete kunnskapspunkter
- fagkobling
- emnekobling
- concepts
- proveniens tilbake til quiz og kontekst

Knowledge er:

- personlig
- akkumulativ
- dynamisk
- etterprøvbar mot kilden som skapte entry-en

Knowledge er ikke:

- besøkslogg
- samling
- observasjonslogg
- kursstatus
- fagkart

`knowledge_universe` er legacy tekstarkiv og bevares/migreres inn i V2-read-modellen uten å bli slettet.

---

## 6. Learning log og annen evidens

**Rolle:** append-only spor etter aktivitet og læring.

Primær logg:

```text
hg_learning_log_v1
```

Den kan inneholde blant annet:

- quiz-events
- emnetreff
- concepts
- observations

Besøkte steder, samlede personer og andre runtime-states kan også brukes som kontekst eller progresjonssignal.

Men:

> Evidens om erfaring er ikke automatisk Knowledge.

Learning log kan hjelpe med å koble eller forklare en Knowledge-entry, for eksempel når eldre quizdata mangler eksplisitt `emne_id`.

---

## 7. Pensum / Courses

**Rolle:** tolker fagstruktur og læringsevidens til progresjon.

Pensum beskriver typisk:

- moduler
- hvilke emner som inngår
- rekkefølge
- krav
- diplomregler

Pensum skal ikke kopiere emnetekster og skal ikke brukes som brukerhistorikk.

Status beregnes av runtime, blant annet gjennom:

```js
HGCourses.compute({ subjectId, emnerAll })
```

Pensumfila endres ikke når brukeren lærer noe.

---

## 8. Kritisk skille

| Del | Hva den er | Hva den ikke er |
|---|---|---|
| Merke | Inngang og aggregering | Detaljert fagstruktur |
| Fagkart | Faglig struktur | Brukerprogresjon |
| Emne | Mikro-kunnskapsstruktur | Brukerhistorikk |
| Quiz | Vurdert læringssituasjon | Pensum |
| Knowledge | Personlig vurdert forståelse | Besøks-/observasjonslogg |
| Learning log | Evidens og historikk | Knowledge-arkiv |
| Pensum/Courses | Progresjonsregler og tolkning | Innhold eller logg |

---

## 9. Flyt ved quiz

Ved riktig svar på et knowledge-skapende spørsmål:

1. Quiz registrerer riktig svar.
2. Knowledge-entry opprettes eller oppdateres.
3. Entry kobles til fag, emner, concepts og kilde.
4. Quiz-/sett-event kan skrives til learning log.
5. Courses/Pensum tolker tilgjengelig evidens til beregnet progresjon.
6. UI viser Knowledge og progresjon som to relaterte, men separate lag.

---

## 10. Structure-filer

`structure_*.json` er deprecated som runtime-lag.

Eldre dokumentasjon som beskriver følgende runtime-flyt:

```text
Merke → Structure → Emner
```

skal forstås som historisk.

Aktiv modell er:

```text
Merke → Fagkart/fagplan → Emner → Quiz/vurdering → Knowledge + Learning log → Courses/Pensum → UI
```

---

## 11. Designmål

- Én sannhet per nivå.
- Ingen duplisering av faginnhold.
- Én canonical Knowledge-entry-modell.
- Én canonical Knowledge read-model.
- Ingen automatisk likestilling mellom «opplevd» og «forstått».
- Legacy-data skal bevares, ikke oppfinnes om.
- Usikre koblinger skal markeres som usikre.
- Progresjon skal beregnes, ikke skrives inn i pensumfilene.

---

## Kortform

```text
Fagkart = hvor kunnskapen finnes
Emner = hva kunnskapen handler om
Quiz = vurdering
Knowledge = hva brukeren faktisk har forstått
Learning log = hva brukeren har gjort
Pensum/Courses = hvordan erfaring tolkes til progresjon
```
