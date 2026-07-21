# DomainRegistry README

Status: practical usage guide
Runtime file: `js/DomainRegistry.js`
Machine contract: `data/categories/category_contract.json`
Decision contract: `docs/DOMAIN_CONTRACT.md`

## Core rule

History Go has two id directions:

```text
fag/editorial subject id  -> emner, pensum, fagkart, methods
runtime category id       -> place.category, quiz categoryId, badges, merits, profile progression
```

For every category except popular culture, the fag id and runtime id are identical.

Popular culture deliberately uses:

```text
popkultur       = fag/editorial id
populaerkultur  = runtime category, badge and progression id
```

They are one domain, not two badges.

## Which method to use

### `toFagSubjectId()`

Use for:

- `data/fag/<subjectId>/`
- fag manifest keys
- emner, pensum, fagkart and methods
- learning and course structure

Examples:

```js
DomainRegistry.toFagSubjectId("populaerkultur"); // "popkultur"
DomainRegistry.toFagSubjectId("teater");         // "scenekunst"
DomainRegistry.toFagSubjectId("film");           // "film_tv"
DomainRegistry.toFagSubjectId("journalistikk");  // "media"
DomainRegistry.toFagSubjectId("filosofi");       // "vitenskap"
```

### `toRuntimeCategoryId()`

Use for:

- `place.category`
- quiz `categoryId`
- `merits_by_category`
- badges and badge images
- profile and progression statistics

Examples:

```js
DomainRegistry.toRuntimeCategoryId("popkultur");     // "populaerkultur"
DomainRegistry.toRuntimeCategoryId("teater");        // "scenekunst"
DomainRegistry.toRuntimeCategoryId("film");          // "film_tv"
DomainRegistry.toRuntimeCategoryId("journalistikk"); // "media"
```

Runtime writes must normalize explicitly at the source. Storage must not be monkey-patched to hide missing normalization.

## Canonical lists

`DomainRegistry.list()` returns these fag ids:

```text
by
historie
kunst
litteratur
media
musikk
naeringsliv
natur
politikk
popkultur
psykologi
religion
scenekunst
sport
subkultur
vitenskap
film_tv
```

`DomainRegistry.listRuntimeCategories()` returns these runtime ids:

```text
by
historie
kunst
litteratur
media
musikk
naeringsliv
natur
politikk
populaerkultur
psykologi
religion
scenekunst
sport
subkultur
vitenskap
film_tv
```

## Category decisions

- `kunst` means visual and material art. The display name is **Kunst**.
- `scenekunst` is its own category for theatre, dance, musicals, revue, standup, improvisation and live performance.
- `musikk` means music. The display name is **Musikk**.
- `kultur` is not a category id.
- `film_tv` and `media` remain independent categories, not children of popular culture.
- `religion` remains an independent category.
- `filosofi` resolves to `vitenskap`.
- `sosial_laering` is a non-place badge and is not returned by either category-list method.

## Correct popular-culture files

```text
data/badges/populaerkultur.json
data/quiz/quiz_populaerkultur.json
data/fag/popkultur/
```

Do not create parallel runtime files named `popkultur` without a complete migration.

## Before adding a category

1. Update `data/categories/category_contract.json`.
2. Update `docs/DOMAIN_CONTRACT.md`.
3. Update `js/DomainRegistry.js`.
4. Update badges, fag manifest, category UI and place policy.
5. Run `npm run audit:categories`.

If the audit fails, do not add a local fallback or an extra alias map elsewhere.
