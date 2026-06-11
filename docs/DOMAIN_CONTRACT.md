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

Do not introduce parallel badges for the same concept.
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
| `film_tv` | active badge domain | film/TV is its own badge/category domain |
| `media` | active badge domain | media/journalism is its own badge/category domain |
| `populaerkultur` | active badge domain | popular culture badge/category id today; `popkultur` is its short fag/editorial alias |

## 3. Editorial / short ids

These ids are allowed as fag/editorial ids or short aliases. They must not become separate badges unless this file is changed deliberately.

| short/editorial id | rule |
|---|---|
| `popkultur` | short form of `populaerkultur`; same badge/domain, not a second badge |
| `film_tv` | keep as its own badge/domain, not a child of `popkultur` |
| `media` | keep as its own badge/domain, not a child of `popkultur` |
| `vitenskap` | includes philosophy-related material; do not add `filosofi` as a top-level runtime domain |
| `kunst` | includes theatre/scenekunst as subfields unless a separate runtime domain is deliberately created |

Important: `popkultur` and `populaerkultur` name the same popular-culture domain. Runtime badge/category data currently uses the long id `populaerkultur`; fag/editorial files may use the short id `popkultur`. Do not create two badge files or two user progression tracks for them.

## 4. Aliases and non-top-level ids

Aliases are allowed only in a normalizer/registry layer, not directly as new badge domains.

| alias / id | canonical fag/editorial target | note |
|---|---|---|
| `populaerkultur` | `popkultur` | long runtime id for the same populærkultur badge/domain |
| `populærkultur` | `popkultur` | spelling alias |
| `popular_culture` | `popkultur` | English/import alias |
| `filosofi` | `vitenskap` | philosophy belongs under science/knowledge, not as top-level badge now |
| `scenekunst` | `kunst` | subfield, not top-level runtime badge unless explicitly promoted later |
| `teater` | `kunst` | subfield unless a later theatre/scenekunst domain is deliberately created |

## 5. Current decisions

### `popkultur` and `populaerkultur`

Decision:

- They are the same badge/domain.
- `populaerkultur` remains the active runtime badge/category id for now.
- `popkultur` is the short fag/editorial id and alias.
- Do not create `data/badges/popkultur.json` while `data/badges/populaerkultur.json` exists.
- Do not create a second merit/progression track for `popkultur`.
- Any future rename from `populaerkultur` to `popkultur` must be one complete migration across places, badges, merits, quiz links, profile state and aliases.

### `film_tv` and `media`

`film_tv` and `media` are active badge domains.

Decision:

- Keep `film_tv` as its own top-level badge/domain.
- Keep `media` as its own top-level badge/domain.
- Do not collapse them into `popkultur`; they represent different knowledge tracks and progression.
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

The subject id must be either an active runtime id or an editorial/short id that is explicitly covered by alias normalization in this contract.

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

1. Keep `populaerkultur` and `popkultur` as one badge/domain with two accepted names.
2. Keep `film_tv` and `media` as their own badge domains.
3. Audit data that accidentally treats `popkultur` as a second runtime badge.
4. Only if desired later, migrate the runtime id `populaerkultur` to `popkultur` in one complete patch.
5. Then continue epoke production using this contract.
