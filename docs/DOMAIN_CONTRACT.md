# History Go – domain contract

Status: active runtime contract
Owner: History Go data/runtime
Last updated: 2026-06-10

This file is a decision document. It is not a runtime source of truth.
Runtime must read domains from the existing data/runtime files, but new data and code should follow this contract.

## 1. Rule

One concept must have one runtime id.

The same id must be used when the same concept appears in:

- `place.category`
- `merits_by_category`
- badge id in `data/badges/*.json`
- badge index entry in `data/badges/index.json`
- quiz category id / quiz path
- fag/emne subject id
- epoke domain id, when an epoke file exists

Do not introduce parallel ids for the same concept.
Use aliases only at import/normalization boundaries.

## 2. Runtime ids in active use now

These ids are active runtime ids because they are already used by badge/category/progression code and must not be renamed casually:

| id | status | role |
|---|---|---|
| `by` | active | city/urban domain |
| `historie` | active | history domain |
| `kunst` | active | art domain |
| `litteratur` | active | literature domain |
| `musikk` | active | music domain |
| `naeringsliv` | active | business/economy domain |
| `natur` | active | nature domain |
| `politikk` | active | politics domain |
| `psykologi` | active | psychology domain |
| `sport` | active | sport domain |
| `subkultur` | active | subculture domain |
| `vitenskap` | active | science domain |
| `populaerkultur` | active legacy runtime id | popular culture badge/category id today |
| `film_tv` | active legacy runtime id | film/TV badge/category id today |
| `media` | active legacy runtime id | media badge/category id today |

## 3. Editorial target ids

These are the ids we want new subject/fag production to use going forward:

| target id | rule |
|---|---|
| `popkultur` | editorial/fag target for popular culture |
| `vitenskap` | includes philosophy-related material; do not add `filosofi` as a top-level runtime domain |
| `kunst` | includes theatre/scenekunst as subfields unless a separate runtime domain is deliberately created |

Important: `popkultur` is the editorial target, but runtime still has `populaerkultur` in active badge/category data. Do not mix the two in new runtime code. Normalize deliberately.

## 4. Aliases and legacy ids

Aliases are allowed only in a normalizer/registry layer, not directly in new data.

| alias / legacy | canonical target | note |
|---|---|---|
| `populaerkultur` | `popkultur` | legacy runtime id; migrate carefully because badges, places and merits can depend on it |
| `populærkultur` | `popkultur` | spelling alias |
| `popular_culture` | `popkultur` | English/import alias |
| `filosofi` | `vitenskap` | philosophy belongs under science/knowledge, not as top-level badge now |
| `scenekunst` | `kunst` | subfield, not top-level runtime badge unless explicitly promoted later |
| `teater` | `kunst` | subfield unless a later theatre/scenekunst domain is deliberately created |

## 5. Current exceptions to clean later

These are known exceptions. Do not expand them by producing more data in both forms.

### `popkultur` vs `populaerkultur`

Current repo contains `data/fag/popkultur/...`, while badge/progression still has `populaerkultur` active.

Decision:

- New fag/emne data: use `popkultur` path/id.
- Existing runtime category/badge data: keep `populaerkultur` until a single migration patch updates all dependent places, badges, merits, quiz links and aliases together.
- Do not create a second active badge file named `popkultur.json` while `populaerkultur.json` is active.

### `film_tv` and `media`

`film_tv` and `media` are active legacy runtime domains today.

Decision:

- Keep them active until we decide whether they remain separate top-level badges or become subdomains under `popkultur`.
- Do not add new unrelated domain ids such as `film`, `tv`, `kino`, `journalistikk` as top-level runtime ids without updating this file first.

### `scenekunst`

`scenekunst` appears in category/search/data contexts, but there is no separate top-level badge contract for it.

Decision:

- Treat `scenekunst` as a subfield under `kunst` for now.
- Do not add `data/badges/scenekunst.json` unless we deliberately promote it to a top-level badge/domain.

## 6. File ownership

### Badges

Canonical badge file list:

```text
data/badges/index.json
```

Runtime loader:

```text
window.DataHub.loadBadges()
```

UI consumers must not reimplement badge loading.

### Domain normalization

Canonical place for alias logic:

```text
js/DomainRegistry.js
```

Other files should call the registry/normalizer rather than making their own alias maps.

### Categories

Category UI list:

```text
js/core/categories.js
```

This list should match active runtime ids or explicit subfield ids. It should not silently create new top-level domains.

### Fag/emner

Subject data should live under:

```text
data/fag/<subject_id>/
```

The subject id must be either an active runtime id or an editorial target id that is explicitly covered by alias normalization in this contract.

### Epoker

Epoker are a time/periodization layer. They are not badges and not Wonderkammer.

Epoke domain ids should follow the same id contract as domains, with legacy aliases handled in `js/epoker-runtime.js` or the shared domain registry.

## 7. Production rule

Before producing new domain-level data, check this file.

If the id is not listed here:

1. Do not invent it in data.
2. Add a decision here first.
3. Then update registry/runtime loaders.
4. Then produce data.

## 8. Next cleanup patches

Recommended order:

1. Add/verify `DomainRegistry` aliases for `populaerkultur -> popkultur`, `filosofi -> vitenskap`, `scenekunst -> kunst`.
2. Audit `js/core/categories.js` and mark which entries are top-level domains vs subfields.
3. Decide whether `film_tv` and `media` remain top-level or move under `popkultur`.
4. Only after that, migrate `populaerkultur` runtime id to `popkultur` if desired.
5. Then continue epoke production using this contract.
