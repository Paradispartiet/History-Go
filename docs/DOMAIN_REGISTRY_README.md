# DomainRegistry README

Status: practical usage guide
Runtime file: `js/DomainRegistry.js`
Decision contract: `docs/DOMAIN_CONTRACT.md`

This README explains which DomainRegistry method to use in each layer of History Go.
It is documentation only. Runtime source of truth is still `js/DomainRegistry.js`.

## Core rule

Do not use one generic domain resolver everywhere.

History Go has two different id directions:

```text
fag/editorial subject id  -> emner, pensum, fagkart, methods
runtime category id       -> place.category, quiz categoryId, badges, merits, profile progression
```

For most domains these ids are identical.
For populærkultur they are deliberately different names for the same domain:

```text
popkultur       = short fag/editorial id
populaerkultur  = runtime badge/category/progression id
```

They are not two badges.
They are not two progression tracks.

Runtime category writes must call `DomainRegistry.toRuntimeCategoryId(raw)` explicitly at the source.
There is no `Storage.prototype` monkey-patching or hidden storage normalization.
`popkultur` must never become a `merits_by_category` key; runtime progression uses `populaerkultur`.

## Method choice

### Use `toFagSubjectId()` for fag/emne/pensum

Use this when code is going into `data/fag/<subjectId>/` or loading subject structure.

```js
DomainRegistry.toFagSubjectId("populaerkultur");
// "popkultur"
```

Correct places to use this direction:

```text
data/fag/<subjectId>/
fag_manifest subject keys
emner
pensum
fagkart
methods
course/learning subject analysis
```

### Use `toRuntimeCategoryId()` for badges/progression

Use this when code is comparing or writing runtime categories.

```js
DomainRegistry.toRuntimeCategoryId("popkultur");
// "populaerkultur"
```

Correct places to use this direction:

```text
place.category
quiz categoryId
merits_by_category
badge id
badge lookup
badge image/overlay
profile/progression stats
```

## Important examples

### Correct: fag load

```js
const subjectId = DomainRegistry.toFagSubjectId(rawId);
await DataHub.loadEmner(subjectId);
```

If `rawId` is `populaerkultur`, this loads from the fag/editorial side as `popkultur`.

### Correct: badge/progression lookup

```js
const categoryId = DomainRegistry.toRuntimeCategoryId(rawId);
const badge = badges.find((b) => b.id === categoryId);
```

If `rawId` is `popkultur`, this matches the existing badge id `populaerkultur`.

### Wrong: using `resolve()` for merits

```js
const id = DomainRegistry.resolve("populaerkultur");
merits_by_category[id] += 1;
```

This is wrong because `resolve("populaerkultur")` returns `popkultur`, which is the fag/editorial id.
That would create a new progression key instead of using the existing runtime key.

Use this instead:

```js
const id = DomainRegistry.toRuntimeCategoryId("populaerkultur");
merits_by_category[id] += 1;
```

## Current populærkultur contract

```text
populaerkultur = active runtime id
popkultur      = short fag/editorial id
```

Current correct files:

```text
data/badges/populaerkultur.json
data/quiz/quiz_populaerkultur.json
data/fag/popkultur/
data/people/popkultur/
```

Do not create these unless a full migration is planned:

```text
data/badges/popkultur.json
data/quiz/quiz_popkultur.json
```

## Runtime category list

`DomainRegistry.listRuntimeCategories()` should include ids used directly by runtime category/badge/progression logic:

```text
by
historie
kunst
litteratur
musikk
naeringsliv
natur
politikk
populaerkultur
psykologi
sport
subkultur
vitenskap
film_tv
media
```

`film_tv` and `media` are their own badge domains. They are not subdomains of `popkultur`.

## Fag/editorial list

`DomainRegistry.list()` returns canonical fag/editorial ids:

```text
by
historie
kunst
litteratur
musikk
naeringsliv
natur
politikk
popkultur
psykologi
sport
subkultur
vitenskap
```

`filosofi` resolves to `vitenskap`.
`scenekunst` resolves to `kunst`.

## Practical rule before coding

Before changing category code, ask:

```text
Am I loading learning structure?
-> use toFagSubjectId()

Am I matching badges, categories, quiz categoryId or merits?
-> use toRuntimeCategoryId()
```

Do not call `resolve()` in new runtime badge/progression code unless you specifically want the fag/editorial id.

## Storage and debugging

Storage is deliberately passive: no helper may replace `Storage.prototype.getItem` or
`Storage.prototype.setItem`. Every quiz, badge and progression writer must normalize its
category before indexing a map, calling an API hook or dispatching a runtime event.

In DEBUG mode the app warns if existing `merits_by_category` data contains both
`popkultur` and `populaerkultur`. The warning is diagnostic only; it does not silently
migrate or rewrite user data.
