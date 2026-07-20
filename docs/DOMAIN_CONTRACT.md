# History Go – domain contract

Status: active runtime contract
Owner: History Go data/runtime
Last updated: 2026-07-20

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

## 2. Primary and secondary badges

`place.category` is the primary badge/domain for a place. It answers: **what is this place first and foremost as a History Go gameplay object?**

A place may also carry secondary badge links through:

```json
"secondaryBadgeIds": ["subkultur", "musikk"]
```

Rules:

- `category` remains singular and required.
- `secondaryBadgeIds` is optional.
- Every `secondaryBadgeIds[]` value must be an active runtime badge/domain id from `data/badges/index.json`, after alias normalization.
- `secondaryBadgeIds` must not repeat the primary `category`.
- `secondaryBadgeIds` must not introduce new badge/domain ids.
- Use `secondaryBadgeIds` for cross-domain meaning, not to avoid choosing a primary category.

Examples:

- A concert venue is normally primary `musikk`, even if it has underground/subcultural significance.
- A self-organized punk/activist house is normally primary `subkultur`, with `musikk` as secondary if concerts are a major part of the place.
- A zine/comics/fandom shop can be primary `subkultur` or `populaerkultur` depending on the gameplay angle; use secondary badges for the other dimension.
- A park is normally `by` or `natur`; it should only be primary `subkultur` if the place data explicitly treats subcultural use as its defining gameplay identity.
- An active church, mosque, synagogue, temple or other primary place of worship is normally primary `religion`.
- A former religious building whose present main function is cultural is classified by its present function instead. For example, a repurposed cultural venue can be primary `kunst` even if its name still contains `kirke`.

## 3. Runtime ids in active use now

These ids are active runtime ids because they are already used by badge/category/progression code and must not be renamed casually:

| id | status | role |
|---|---|---|
| `by` | active | city/urban domain |
| `historie` | active | history domain |
| `kunst` | active | art/culture domain |
| `litteratur` | active | literature domain |
| `musikk` | active | music domain |
| `naeringsliv` | active | business/economy domain |
| `natur` | active | nature domain |
| `politikk` | active | politics domain |
| `psykologi` | active | psychology domain |
| `religion` | active | religion, faith, worship and sacred-place domain |
| `sport` | active | sport domain |
| `subkultur` | active | subculture domain |
| `vitenskap` | active | science domain |
| `film_tv` | active badge domain | film/TV is its own badge/category domain |
| `media` | active badge domain | media/journalism is its own badge/category domain |
| `populaerkultur` | active badge domain | popular culture badge/category id today; `popkultur` is its short fag/editorial alias |
| `sosial_laering` | active badge domain | social learning domain |

## 4. Editorial / short ids

These ids are allowed as fag/editorial ids or short aliases. They must not become separate badges unless this file is changed deliberately.

| short/editorial id | rule |
|---|---|
| `popkultur` | short form of `populaerkultur`; same badge/domain, not a second badge |
| `film_tv` | keep as its own badge/domain, not a child of `popkultur` |
| `media` | keep as its own badge/domain, not a child of `popkultur` |
| `religion` | same id is used for runtime badge/category and fag/editorial data |
| `vitenskap` | includes philosophy-related material; do not add `filosofi` as a top-level runtime domain |
| `kunst` | includes theatre/scenekunst and cultural venues as subfields unless a separate runtime domain is deliberately created |

Important: `popkultur` and `populaerkultur` name the same popular-culture domain. Runtime badge/category data currently uses the long id `populaerkultur`; fag/editorial files may use the short id `popkultur`. Do not create two badge files or two user progression tracks for them.

## 5. Aliases and non-top-level ids

Aliases are allowed only in a normalizer/registry layer, not directly as new badge domains.

| alias / id | canonical fag/editorial target | note |
|---|---|---|
| `populaerkultur` | `popkultur` | long runtime id for the same populærkultur badge/domain |
| `populærkultur` | `popkultur` | spelling alias |
| `popular_culture` | `popkultur` | English/import alias |
| `filosofi` | `vitenskap` | philosophy belongs under science/knowledge, not as top-level badge now |
| `scenekunst` | `kunst` | subfield, not top-level runtime badge unless explicitly promoted later |
| `teater` | `kunst` | subfield unless a later theatre/scenekunst domain is deliberately created |

## 6. Current decisions

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

### `religion`

`religion` is an active top-level badge/domain.

Decision:

- Active places of worship and places whose primary present function is religious use primary `category: "religion"`.
- Historical importance does not move an active religious place back to `historie`; history can remain in descriptions, emner, quizzes and other content layers.
- Architectural importance does not move an active religious place back to `by` or `kunst` when worship/religious use is still its primary present function.
- Classification is explicit in place data. Runtime must not infer `religion` merely from words such as `kirke`, `moske` or `tempel` in a name.
- Former religious buildings are classified by their present primary function. Known examples such as Sofienberg kirke and Kulturkirken Jakob belong to the culture track (`kunst`) rather than `religion` when their primary present use is cultural.
- Place migration into `religion` must therefore be audited, not performed as a blind name-based rewrite.

### `scenekunst`

`scenekunst` appears in category/search/data contexts, but there is no separate top-level badge contract for it.

Decision:

- Treat `scenekunst` as a subfield under `kunst` for now.
- Do not add `data/badges/scenekunst.json` unless we deliberately promote it to a top-level badge/domain.

### Music and subculture overlap

Punk, hiphop, rave/club culture and underground scenes can belong to both `musikk` and `subkultur`, but they do not mean the same thing in the badge model.

Decision:

- `musikk` covers music practice, artists, scenes, genres, concert venues, clubs as music infrastructure, production and performance.
- `subkultur` covers identity, DIY/self-organization, motkultur, alternative public spheres, skate, graffiti, fandom/zines and underground social formations.
- If the main thing is a concert venue or music club, use primary `musikk` and secondary `subkultur` where appropriate.
- If the main thing is a self-organized house, youth culture house, skate/graffiti/fandom/zine institution or motkulturell infrastructure, use primary `subkultur` and secondary `musikk` where concerts/music are important.

## 7. File ownership

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
Runtime writes must explicitly call `DomainRegistry.toRuntimeCategoryId(raw)` (or the pure
`HGDomainRuntime.toRuntimeCategoryId(raw)` wrapper) before writing progression state.
Storage access must not be monkey-patched to hide missing normalization at call sites.

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

## 8. Production rule

Before producing new domain-level data, check this file.

If the id is not listed here:

1. Do not invent it in data.
2. Add a decision here first.
3. Then update registry/runtime loaders.
4. Then produce data.

Before adding or moving places, decide:

1. primary `category`
2. optional `secondaryBadgeIds`
3. emne/tags/quiz_profile after the badge decision

For `religion`, audit the place's **present primary function** before moving it. Do not classify by name alone.

## 9. Next cleanup patches

Recommended order:

1. Keep `populaerkultur` and `popkultur` as one badge/domain with two accepted names.
2. Keep `film_tv` and `media` as their own badge domains.
3. Add `religion` runtime/badge support before moving existing place data.
4. Audit active churches, mosques, synagogues, temples and other primary religious places, then migrate them to `religion` in controlled data batches.
5. Keep repurposed cultural venues such as Sofienberg kirke and Kulturkirken Jakob under `kunst` rather than `religion`.
6. Audit data that accidentally treats `popkultur` as a second runtime badge.
7. Audit places/people where `subkultur` was used as a fallback for music venues, artists, parks, byoriginaler or generic culture.
8. Move pure music venues to `musikk` and use `secondaryBadgeIds: ["subkultur"]` only when the subcultural dimension is explicit.
9. Only if desired later, migrate the runtime id `populaerkultur` to `popkultur` in one complete patch.
10. Then continue epoke production using this contract.
