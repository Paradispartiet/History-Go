# Popkultur / populaerkultur alias audit

Dato: 2026-06-10
Status: beslutningsaudit, ingen runtime-migrering

## Konklusjon

`popkultur` og `populaerkultur` brukes om samme domene: populærkultur.

Det finnes ikke tegn på to separate badge-spor i de sentrale runtimefilene:

- `data/badges/index.json` peker på `data/badges/populaerkultur.json`.
- `data/badges/populaerkultur.json` har `id: "populaerkultur"`.
- `data/quiz/quiz_populaerkultur.json` bruker `categoryId: "populaerkultur"`.
- `data/fag/fag_manifest.json` bruker `popkultur` som fag-/manifestnøkkel, men peker til filer med `populaerkultur` i filnavn.
- `data/people/popkultur/...` bruker kort mappe-id, men personobjektene bruker `category: "populaerkultur"`.

Det riktige bildet er derfor:

```text
populaerkultur = lang runtime-id for badge/category/progression
popkultur      = kort fag-/mappe-/editorial-id for samme domene
```

Ikke opprett `data/badges/popkultur.json`.
Ikke opprett `data/quiz/quiz_popkultur.json`.
Ikke opprett eget merit/progresjonsspor for `popkultur`.

## Sentrale observasjoner

### Badge

`data/badges/index.json` inkluderer bare populærkultur som lang runtime-id:

```text
data/badges/populaerkultur.json
```

`data/badges/populaerkultur.json` har:

```json
{
  "id": "populaerkultur",
  "name": "Populærkultur"
}
```

Dette er korrekt runtime-spor.

### Quiz

`data/quiz/quiz_populaerkultur.json` bruker:

```json
"categoryId": "populaerkultur"
```

Dette er korrekt for badge-/merit-opptelling.

### Fag / emner

`data/fag/fag_manifest.json` bruker:

```json
"popkultur": {
  "pensum": "popkultur/populaerkulturpensum_canonical_v4_5.json",
  "emner": "popkultur/emner_populaerkultur_canonical_v4_5.json",
  "fagkart": "popkultur/fagkart_populaerkultur_canonical_v4_5.json",
  "methods": "popkultur/methods_populaerkultur_canonical_v4_5.json",
  "supersetQuizMal": "popkultur/supersetQUIZMAL_populaerkultur.json"
}
```

Dette er akseptabelt fordi `popkultur` her er fag-/editorial-id, ikke nytt badge.

### Places

`data/places/popkultur/oslo/places_oslo_populaerkultur.json` ligger i kort mappe, men bruker runtime-kategori på faktiske popkultursteder:

```json
"category": "populaerkultur"
```

Samme fil kan også inneholde `film_tv`, som er riktig fordi film/TV er eget badge-domene.

### People

`data/people/manifest.json` peker på kort mappe:

```text
people/popkultur/oslo/people_popkultur_oslo.json
```

Objektene inni bruker lang runtime-kategori:

```json
"category": "populaerkultur"
```

Dette er riktig: kort mappe for organisering, lang runtime-id for kategori/progresjon.

### DomainRegistry

`js/DomainRegistry.js` resolver:

```text
populaerkultur -> popkultur
```

Dette er riktig for fag-/editorial-laget, men må ikke brukes blindt til badge-/merit-nøkler uten runtime-bro.

### Category list

`js/core/categories.js` markerer nå `populaerkultur` som:

```js
scope: "runtime_domain_alias",
canonicalFagId: "popkultur",
aliases: ["popkultur"]
```

Dette er riktig: ett runtime-domene, kort alias.

## Risiko

Risikoen er ikke at det finnes to badgefiler nå.

Risikoen er at fremtidig kode gjør dette:

```js
const id = DomainRegistry.resolve("populaerkultur"); // popkultur
merits_by_category[id] += 1;
```

Da ville progresjon havne på `popkultur` i stedet for eksisterende runtime-spor `populaerkultur`.

## Regel fremover

Bruk `populaerkultur` når koden arbeider med:

- `place.category`
- `categoryId` i quiz
- `merits_by_category`
- badge id
- badge image/id/opptelling
- profile/progression

Bruk `popkultur` når koden arbeider med:

- `data/fag/popkultur/`
- fagmanifest subject id
- emne-/pensum-/fagkart-routing
- editorial/faglig produksjon

## Trygg neste patch

Legg inn én liten runtime-bro, ikke et nytt system.

Forslag:

```js
function toRuntimeCategoryId(id) {
  const raw = String(id || "").trim();
  if (raw === "popkultur") return "populaerkultur";
  return raw;
}

function toFagSubjectId(id) {
  const raw = String(id || "").trim();
  if (raw === "populaerkultur") return "popkultur";
  return window.DomainRegistry?.resolve ? window.DomainRegistry.resolve(raw) : raw;
}
```

Plassering bør vurderes før kode:

- Enten i `js/core/categories.js` fordi dette er runtime category-laget.
- Eller i `js/DomainRegistry.js` hvis den får eksplisitte metoder for begge retninger.

Viktig: Ikke endre eksisterende data før denne broen finnes og er brukt på riktige steder.

## Ikke gjør nå

Ikke gjør disse endringene som småpatcher:

- Rename `data/badges/populaerkultur.json` til `popkultur.json`.
- Rename `data/quiz/quiz_populaerkultur.json` til `quiz_popkultur.json`.
- Endre quiz `categoryId` fra `populaerkultur` til `popkultur`.
- Endre place/person `category` fra `populaerkultur` til `popkultur`.
- Endre `merits_by_category`-nøkler uten migrering av brukerdata.

Hvis runtime-id en gang skal byttes til `popkultur`, må det være én samlet migrering.
