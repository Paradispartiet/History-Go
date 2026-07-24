# History Go – domain contract

Status: active and binding category decision  
Owner: History Go data/runtime  
Last updated: 2026-07-24

Machine-readable source of truth:

```text
data/categories/category_contract.json
```

Runtime and editorial files must agree with this contract. `scripts/audit-category-governance.mjs` enforces the agreement.

## Core rule

Every runtime category has one clear identity across map markers, badges, place data and UI. Editorial subjects may be shared temporarily only when the mapping is explicit in `runtimeToFag`.

## Canonical top-level categories

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
| `filosofi` | `vitenskap` | Filosofi |
| `film_tv` | `film_tv` | Film & TV |

`populaerkultur` and `popkultur` are two names for the same category. Runtime uses `populaerkultur`; fag/editorial data uses `popkultur`.

## Vitenskap

`vitenskap` covers empirical and formal knowledge production: observation, measurement, experimentation, modelling, mathematics, medicine, technology, research methods and scientific institutions.

Map palette:

- main: `#6A5AE0`
- secondary/border: `#332B51`

## Filosofi

`filosofi` is a separate runtime category and badge. It covers ethics, logic, epistemology, metaphysics, political philosophy, aesthetics, philosophy of science, language philosophy, existentialism, phenomenology, environmental philosophy and history of ideas.

Map palette:

- main: `#7A5FD0`
- secondary/border: `#3E2E73`

During the first split phase, philosophy uses the `vitenskap` editorial subject through:

```json
{
  "runtimeToFag": {
    "filosofi": "vitenskap"
  }
}
```

This preserves existing emne and quiz compatibility while allowing philosophy places and badges to have a distinct runtime identity. A separate philosophy fag map can replace this mapping in a later controlled migration.

## Primary and secondary badge use

Every place has one primary category:

```json
{
  "category": "filosofi"
}
```

Cross-domain relevance may use:

```json
{
  "secondaryBadgeIds": ["vitenskap", "natur"]
}
```

Rules:

- `category` is singular and required.
- `secondaryBadgeIds` is optional.
- Secondary badges must be active runtime categories.
- The primary category must not be repeated as secondary.
- Secondary badges express real cross-domain relevance.

## File ownership

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

Place validation:

```text
tools/placeSchemaPolicy.mts
```

## Production rule

Before creating or moving category-level data:

1. Check `data/categories/category_contract.json`.
2. Update registry, badges, UI and validation in the same change.
3. Run `npm run audit:categories`.
4. Migrate existing records in controlled batches; do not reclassify solely because a text contains a category word.
