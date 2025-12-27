# HG Knowledge Ontology v1

**Status:** aktiv  
**Gjelder for:** History GO + AHA  
**Implementasjon:** runtime (DataHub)  
**Versjon:** v1 (stabil)

---

## 1. Formål

HG Knowledge Ontology definerer hvordan kunnskap struktureres, kobles og forstås i History GO og AHA.

Målet er å:
- skille klart mellom **verden**, **begrep** og **faglig linse**
- unngå semantisk rot (samme ord brukt på flere nivåer)
- gjøre systemet robust uten å endre eksisterende datafiler

Ontologien er **operativ**, ikke teoretisk fullstendig.

---

## 2. Grunnprinsipp

> Ontologi lagres ikke i datafiler.  
> Den legges på i runtime som en *linse* over eksisterende data.

Dette gjør systemet:
- bakoverkompatibelt
- lett å justere
- stabilt over tid

---

## 3. De seks ontologiske nivåene

### Nivå 0 — Instans (Instance)
**Hva:** konkrete ting i verden

Eksempler:
- sted
- person
- hendelse
- rute
- quiz

**Kilde:** eksisterende JSON (`places.json`, `people.json`, osv.)

---

### Nivå 1 — Begrep (Concept)
**Hva:** abstrakte kunnskapsknagger

Brukes til:
- matching
- innsikt
- progresjon
- søk

Eksempler:
- `industrial_urbanization`
- `class_conflict`
- `constitutionalism`

**Kilde i data:**
- `core_concepts`
- `concepts`

---

### Nivå 2 — Modul (Module)
**Hva:** avgrenset lærings- eller kunnskapspakke

Eksempler:
- pensumblokk
- quizpakke
- temamodul

**ID-er:**
- `module_id`
- legacy: `emne_id`

> Ordet **emne** brukes ikke som ontologisk nivå i HG.

---

### Nivå 3 — Domene (Domain)
**Hva:** fagområde innen en disiplin

Eksempler:
- byhistorie
- arbeidssosiologi
- modernistisk kunsthistorie

**Status:** valgfritt / gradvis innført

---

### Nivå 4 — Disiplin (Discipline)
**Hva:** akademisk fagtradisjon

Eksempler:
- historie
- sosiologi
- filosofi
- biologi

**Kilde i systemet:**
- `subjectId` (eksplisitt kontekst)

---

### Nivå 5 — Felt (Field)
**Hva:** overordnet kunnskapsverden / badge-kategori

Eksempler:
- historie
- vitenskap
- kunst
- natur

**Merk:**
- I v1 kan `field_id === discipline_id`
- Skillet finnes for fremtidig utvidelse

---

## 4. Hvor ontologien lever

Ontologien legges på **etter** at base-data og overlays er merget.

Den lagres alltid under én nøkkel:

```js
instance.hg = {
  field_ids: string[],
  discipline_ids: string[],
  module_ids: string[],
  domain_ids: string[],
  concepts: string[]
}
