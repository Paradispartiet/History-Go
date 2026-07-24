# History Go – domain contract

Status: active and binding category decision  
Owner: History Go data/runtime  
Last updated: 2026-07-24

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
| `vitenskap` | `vitenskap` | Vitenskap |
| `filosofi` | `filosofi` | Filosofi |
| `film_tv` | `film_tv` | Film & TV |

`populaerkultur` and `popkultur` are two names for the same category. Runtime uses `populaerkultur`; fag/editorial data uses `popkultur`.

## 3. Locked domain decisions

### Kunst

`kunst` covers visual and material art: painting, sculpture, drawing, printmaking, photography, contemporary art, design, public art, museums, galleries and collections.

### Scenekunst

`scenekunst` covers theatre, drama, dance, choreography, musicals, revue, standup, improvisation, performance and scene institutions. `teater`, `theatre` and `theater` normalize to `scenekunst`.

### Musikk

`musikk` covers artists, ensembles, concerts, venues, genres, composition, performance, sound and production.

### Kultur

`kultur` is not a top-level badge or category. It remains a cross-disciplinary description.

### Film & TV

`film_tv` is a separate top-level category. Legacy `film` and `tv` normalize to it.

### Media

`media` covers journalism, editorial institutions, press history, media ethics, public spheres, platforms and distribution. `journalistikk` normalizes to `media`.

### Religion

`religion` covers religion, faith, ritual practice, active sacred places and religious institutions. Present primary function controls place classification.

### Vitenskap

`vitenskap` covers empirical and formal knowledge production: observation, measurement, experiments, mathematical models, research methods, scientific institutions and documented technological research.

### Filosofi

`filosofi` is an independent runtime and editorial subject. It covers:

- argumentation, logic and conceptual analysis
- epistemology, metaphysics and philosophy of mind
- ethics and applied ethics
- political philosophy and public reason
- aesthetics and hermeneutics
- philosophy of science and technology
- existentialism and phenomenology
- intellectual history and environmental philosophy

`philosophy` normalizes to `filosofi`. A place is primary `filosofi` when philosophical thinking, a documented thinker, an intellectual tradition or a philosophical public practice is its central relevance. Empirical research institutions remain primary `vitenskap`. Real overlap uses `secondaryBadgeIds`.

### Social learning

`sosial_laering` is a non-place progression badge. It must not appear in `place.category`, runtime category lists or the fag manifest.

## 4. Primary and secondary badge use

Every place has one primary category:

```json
{
  "category": "filosofi",
  "secondaryBadgeIds": ["natur", "vitenskap"]
}
```

Rules:

- `category` is singular and required.
- `secondaryBadgeIds` is optional.
- Secondary badges must be active runtime categories.
- The primary category must not be repeated as secondary.
- Secondary badges express real cross-domain relevance; they do not replace the primary decision.

Examples:

- A philosophical cabin or documented thinking place may be primary `filosofi`, with `natur` secondary.
- A philosophy-of-science institution may be primary `filosofi`, with `vitenskap` secondary.
- A laboratory is normally primary `vitenskap`.
- A theatre is primary `scenekunst`, with `litteratur` secondary when dramatic literature is central.
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

Philosophy foundation:

```text
data/fag/filosofi/filosofipensum_canonical_v1.json
data/fag/filosofi/emner_filosofi_canonical_v1.json
data/fag/filosofi/fagkart_filosofi_canonical_v1.json
data/fag/filosofi/methods_filosofi_canonical_v1.json
data/fag/filosofi/supersetQUIZMAL_filosofi.json
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

Existing `vitenskap` places must be migrated to `filosofi` only in controlled, evidence-based batches. Do not move universities, schools or research institutions merely because philosophy is taught there. The primary place story must be philosophical.
