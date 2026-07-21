# History Go – domain contract

Status: active and binding category decision
Owner: History Go data/runtime
Last updated: 2026-07-21

Machine-readable source of truth:

```text
data/categories/category_contract.json
```

Runtime and editorial files must agree with this contract. `scripts/audit-category-governance.mjs` enforces the agreement.

## 1. Core rule

One concept has one runtime category and one editorial subject.

The same category identity must be consistent across:

- `place.category`
- `merits_by_category`
- badge id and badge index
- quiz `categoryId`
- `data/fag/fag_manifest.json`
- `js/DomainRegistry.js`
- `js/core/categories.ts`
- place validation policy

Aliases are allowed only at explicit import and normalization boundaries.

## 2. Canonical top-level categories

| Runtime id | Fag id | Display name |
|---|---|---|
| `by` | `by` | By & arkitektur |
| `historie` | `historie` | Historie |
| `kunst` | `kunst` | Kunst |
| `litteratur` | `litteratur` | Litteratur |
| `media` | `media` | Medier |
| `musikk` | `musikk` | Musikk |
| `naeringsliv` | `naeringsliv` | Næringsliv |
| `natur` | `natur` | Natur & miljø |
| `politikk` | `politikk` | Politikk & samfunn |
| `populaerkultur` | `popkultur` | Populærkultur |
| `psykologi` | `psykologi` | Psykologi |
| `religion` | `religion` | Religion |
| `scenekunst` | `scenekunst` | Scenekunst |
| `sport` | `sport` | Sport & lek |
| `subkultur` | `subkultur` | Subkultur |
| `vitenskap` | `vitenskap` | Vitenskap & filosofi |
| `film_tv` | `film_tv` | Film & TV |

`populaerkultur` and `popkultur` are two names for the same category. Runtime uses `populaerkultur`; fag/editorial data uses `popkultur`.

## 3. Decisions that are now locked

### Kunst

`kunst` covers visual and material art:

- painting, sculpture, drawing and printmaking
- photography and contemporary art
- design and form
- street art and public art
- museums, galleries, art halls, collections and art institutions

The display name is **Kunst**, not “Kunst & kultur”.

### Scenekunst

`scenekunst` is a separate top-level category. It covers:

- theatre and drama
- dance and choreography
- musicals and music theatre as performance
- revue, standup and improvisation
- performance art when the live performance is primary
- theatres, companies, stages, repertoire and production practice

`teater`, `theatre` and `theater` normalize to `scenekunst`.

### Musikk

`musikk` covers music practice and music infrastructure:

- artists, bands and ensembles
- concerts and music venues
- genres and scenes
- composition, performance, sound and production

The display name is **Musikk**, not “Musikk & scenekunst”.

### Kultur

`kultur` is **not** a top-level badge or category. It is a broad descriptive and cross-disciplinary term that may appear in text, tags, stories and analysis.

Creating a culture badge would overlap with art, scenekunst, music, literature, film/TV, media, religion, popular culture and subculture.

### Film & TV

`film_tv` remains a separate top-level category. It is not a child of popular culture.

It covers film and television works, production, camera, editing, sound, scripts, studios, broadcasting, locations, cinemas, genres, formats, audiences and audiovisual history.

Legacy `film` and `tv` ids normalize to `film_tv`; they must not become parallel top-level categories.

### Media

`media` remains a separate top-level category. It covers journalism, editorial institutions, press history, media ethics, public spheres, platforms and distribution.

`journalistikk` normalizes to `media` and must not become a parallel category.

### Religion

`religion` remains a separate top-level category for religion, faith, ritual practice, active sacred places and religious institutions.

Active churches, mosques, synagogues, temples and comparable places normally use primary `category: "religion"` when religious use is their present primary function.

Former religious buildings are classified by their present primary function. Name alone must never trigger a religion migration.

### Philosophy

`filosofi` remains under `vitenskap` and normalizes to `vitenskap`. It is not a separate top-level badge now.

### Social learning

`sosial_laering` is a non-place progression badge. It is listed in the badge index but must not appear in `place.category`, the runtime place-category list or the fag manifest.

## 4. Primary and secondary badge use

Every place has one primary category:

```json
{
  "category": "scenekunst"
}
```

Cross-domain relevance may use:

```json
{
  "secondaryBadgeIds": ["litteratur", "musikk"]
}
```

Rules:

- `category` is singular and required.
- `secondaryBadgeIds` is optional.
- Secondary badges must be active runtime categories.
- The primary category must not be repeated as secondary.
- Secondary badges express real cross-domain relevance; they do not replace the primary decision.

Examples:

- A theatre is normally primary `scenekunst`, with `litteratur` secondary when dramatic literature is central.
- A musical production may be primary `scenekunst`, with `musikk` secondary.
- A concert venue is normally primary `musikk`, with `subkultur` secondary when the underground identity is explicit.
- A visual-art museum is primary `kunst`.
- A newsroom is primary `media`.
- A cinema or film studio is primary `film_tv`.

## 5. File ownership

Canonical machine contract:

```text
data/categories/category_contract.json
```

Alias and runtime conversion:

```text
js/DomainRegistry.js
```

Category UI list:

```text
js/core/categories.ts
```

Badges:

```text
data/badges/index.json
data/badges/<runtime-id>.json
```

Fag and quiz profile registry:

```text
data/fag/fag_manifest.json
data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json
```

Place validation:

```text
tools/placeSchemaPolicy.mts
```

## 6. Production rule

Before creating or moving category-level data:

1. Check `data/categories/category_contract.json`.
2. Do not invent a new top-level id in place, people, quiz or fag data.
3. If a new category is desired, update the contract first.
4. Update registry, badges, manifest, UI and validation in the same change.
5. Run `npm run audit:categories`.

For Scenekunst, existing theatre and performance data must be migrated in controlled batches. Do not blindly move all music, literature or art records merely because they contain a stage, performance or cultural activity.
