# History Go – data production contract

Status: **canonical data-production contract**
Owner: History Go data/runtime
Last verified: 2026-07-27

This document defines how new History Go data must be produced, checked and inserted without breaking category logic, place references, people references, badges, progression or generated indexes.

This file is a documentation contract. Runtime source of truth remains the actual source data, manifests and loaders.

Related contracts:

```text
docs/FACTUALITY_CONTRACT.md
docs/DOMAIN_CONTRACT.md
docs/SUBJECT_FILE_CONTRACT.md
docs/DOMAIN_REGISTRY_README.md
README/SYSTEM_REGISTRY.md
```

## 0. Factuality and source verification

All user-facing data production is governed by [`FACTUALITY_CONTRACT.md`](./FACTUALITY_CONTRACT.md). Never invent, guess, interpolate or silently complete missing facts. A language model, an existing History GO description or a generated candidate report is not a factual source.

Every published factual claim must be traceable to an inspectable source that actually supports the claim. Missing information must remain missing. When sources conflict and the conflict cannot be resolved, omit the field or describe the uncertainty only when the uncertainty itself is sourced and relevant.

Schema validity, field coverage, readiness scores, green CI and `verifiedAt` do not prove factual correctness. Content production must stop when source coverage is insufficient.

## 1. One place ID, one canonical place object

A place ID must not be duplicated across categories.

If a place already exists in any `data/places/**` source file, do not create a second place object with the same `id` in another category file.

Correct workflow:

1. Search all `data/places/**` files for the place ID and obvious name variants.
2. If the place exists, update the existing source object.
3. If the place exists in the wrong primary category, make an explicit category decision before moving it.
4. If the place has relevance for several domains, do not duplicate it. Use people links, quiz, `emne_ids`, relations, stories, leksikon, wonderkammer, routes, works or future overlay data instead.

`data/places/places_index.json` is build-output and must never be edited manually.

## 2. `category` is the primary badge/domain

Every place has one primary category:

```json
"category": "politikk"
```

The `category` field is the primary badge/domain. It decides the place's main subject identity and category fallback behavior.

Do not invent secondary category fields such as:

```json
"categories": []
"badgeIds": []
"categoryIds": []
```

unless runtime support and schema support have been explicitly added first.

## 3. `underbadge_ids` is the underbadge field

Use `underbadge_ids` for subcategory/underbadge classification.

Example:

```json
"underbadge_ids": [
  "arbeiderbevegelse",
  "aktivisme_og_protest"
]
```

The values must exist in the matching badge file, for example:

```text
data/badges/politikk.json
```

For `category: "politikk"`, valid underbadge IDs are currently:

```text
storting_og_regjering
kommune_og_byraad
fylke_og_region
rettsstat_og_domstoler
politi_og_beredskap
interesseorganisasjoner
arbeiderbevegelse
aktivisme_og_protest
religion_og_livssyn_i_samfunn
velferd_og_institusjoner
```

Do not use planning-only fields such as `politikkSubcategories` in runtime data.

## 4. `rounds` is UI, not category logic

`rounds` controls which PlaceCard circles are shown and prioritized.

It is not a badge system.

Use only canonical round IDs:

```text
people
fortellinger
leksikon
wonderkammer
routes
badges
tasks
observations
brands
civication
works
```

Do not use `rounds` to express subject classification.

Do not use the legacy alias `rundinger` in new data.

## 5. Places must be added through manifest-loaded source files

New places must be added to the correct source file under:

```text
data/places/<category>/<city-or-region>/...
```

The file must be listed in:

```text
data/places/manifest.json
```

If the file is not manifest-listed, the place is not part of the app's canonical loaded data.

Do not update `data/places/places_index.json` directly. Regenerate it from source when relevant.

When a category has been split to one file per place, edit the manifest-listed per-place file. Do not edit the retained aggregate merely because it still exists in the repository.

## 6. People must be added through manifest-loaded people files

New people must be added to the correct source file under:

```text
data/people/<category>/<city-or-region>/...
```

The file must be listed in:

```text
data/people/manifest.json
```

Do not duplicate people across category files.

If a person already exists in `people/historie`, `people/politikk`, `people/vitenskap`, or another people file, update the existing person object instead of creating a new one.

A person can have several place links:

```json
"placeId": "stortinget",
"places": [
  "stortinget",
  "eidsvolls_plass"
]
```

`placeId` is the primary place. `places` contains all relevant place anchors.

## 7. Politics data rule

Politics is manifest-driven and must not have a parallel data structure.

### Places

Oslo politics places have been split to one file per place under:

```text
data/places/politikk/oslo/places_politikk/<place_id>.json
```

The split layout and source provenance are documented in:

```text
data/places/politikk/oslo/places_politikk_manifest.json
```

The global runtime authority is still:

```text
data/places/manifest.json
```

Only files listed by the global manifest are active canonical runtime sources. The retained aggregate:

```text
data/places/politikk/oslo/places_politikk.json
```

is an original/source aggregate retained during the split. It must not be treated as the active edit target unless the global manifest explicitly activates it again.

Existing politics places must be improved in their manifest-listed per-place source file. Search by ID and name before editing; do not rely on a static ID list in documentation.

### People and badges

The currently manifest-listed Oslo politics people source is:

```text
data/people/politikk/oslo/people_politikk_oslo.json
```

Politics underbadges remain defined in:

```text
data/badges/politikk.json
```

Do not create parallel politics place, people or badge registries.

Important ID rule:

```text
Oslo tinghus = tinghuset
```

Do not introduce `oslo_tinghus` unless a deliberate migration is performed.

## 8. Cross-domain places

Some places are relevant to several subjects.

Examples:

```text
karl_johan
universitetsplassen
villa_grande
nobelinstituttet
slottet
bankplassen
radhusplassen
```

These must not be duplicated into several category files.

Choose one primary category. Add cross-domain relevance through:

```text
people links
relations
stories
quiz
emne_ids
leksikon
wonderkammer
routes
works
future overlays if enabled
```

## 9. Quiz and source-production rule

Quiz content must be source-led.

Canonical files may guide selection, progression, `emne_id`, theory choice and method choice, but should not become the visible factual substance of the quiz.

Preferred path:

```text
external/local source -> concrete claim -> story unit -> question
```

Do not generate visible questions directly from emne labels, method names, theory hooks or thinker lists.

Use canonical files to:

```text
choose what kind of question to ask
choose which emne fits
choose which method fits
choose which theory fits
spread cases and thinkers
avoid overlap and theory overreach
```

## 10. Validation before merge

Before merging data changes:

1. JSON must parse.
2. No duplicate place IDs.
3. No duplicate person IDs.
4. All `placeId` and `places[]` references on people must point to existing places.
5. All quiz `placeId` / `personId` targets must point to existing data.
6. All `underbadge_ids` must exist in the relevant `data/badges/<category>.json`.
7. `data/places/places_index.json` must be regenerated from source, never manually edited.
8. Each new or materially changed user-facing factual claim must be checked against the source used for it.
9. Batch material must identify which sources support names, dates, roles, works, results, events and place links.
10. Unverified details must be omitted, not filled for completeness.
11. Any progression-changing code must dispatch:

```js
window.dispatchEvent(new Event("updateProfile"));
```

## 11. Data work principle

Always fix the source of truth.

Do not solve data problems by adding runtime filters, hardcoded exceptions or temporary UI patches.

If data is wrong, fix the relevant JSON source file or schema contract.

Minimal, source-first data work is preferred over broad refactors. Source-first means that the source is opened and read before the claim is written; it does not mean merely attaching a plausible URL afterward.

### Rundingsregel for minneskilt og plaketter

Blå skilt, minneskilt og minneplaketter skal ikke automatisk arve Nature fra kategori-profilen. Nye slike records skal bruke `rounds_exclude: ["nature"]` og skal ikke ha `nature_profile`. Naturinnhold må tilhøre et faktisk natursted eller et sted der naturen er en selvstendig dokumentert del av gameplay-objektet, ikke selve minneplaketten.

## Historie: profil- og evidenslag

Historie bruker nå et separat profil- og evidenslag for konkrete geografiske cases. Universelle emner eier `case_requirement_ids`; profiler eier casekandidater og mappings; claim-, source- og place-evidence-registrene eier dokumenterte påstander og kildegrunnlag.

Kontrakten håndheves av de canonical registrene og de permanente History-validatorene.
