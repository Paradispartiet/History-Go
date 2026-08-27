# History GO — Place Production Profiles

Status: **canonical scope contract for place production depth**  
Owner: `place_by_place_production_workflow`  
Last reviewed: **2026-08-27**

This contract defines **how extensive a place production should be**. It does not replace the place's subject `category` (`historie`, `naeringsliv`, `natur`, etc.), and it is not a quality ladder.

A `focused` place must be just as factual, source-bound and canonical as a `major` place. The difference is how many independent content surfaces the source material and the place's significance genuinely support.

## 1. Two different classifications

Never mix these concepts:

- `category` = what kind of subject/place this is;
- `production_profile` = how broad the production should be.

Canonical production profiles:

```text
major
standard
focused
micro
```

`micro` continues to be represented technically by `placeTier: "micro"` and `docs/MICRO_PLACE_CONTRACT.md`. The `production_profile` vocabulary is used in planning/workcards so the whole catalog can be triaged consistently.

## 2. Universal canonical core

For every ordinary canonical Place (`major`, `standard`, `focused`), the following is never removed by a smaller production profile:

1. resolved identity, scope and own-place boundary;
2. verified coordinate/geometry evidence with an honest `coordRole`;
3. reviewed, inspectable sources and source → claim discipline;
4. canonical `desc`/`popupDesc` at the required factual/editorial quality;
5. correct category, relevant subject ownership and working place-specific Fagverk;
6. image provenance for published media, including a real portrait `frontImage` when the ordinary PlaceCard contract requires it;
7. chronology/epoch research with dating precision and materialization of supported exact anchors;
8. canonical Språkleksikon ownership with at least one genuine place-specific language/name trace;
9. relation/own-place audit so separate Places are not collapsed into People, Objects or Structures;
10. runtime/materialization, relevant CI gates and manual final QA.

A production profile can reduce **breadth**, never evidence quality.

## 3. Conditional subsystems

The following surfaces must be **assessed** for every ordinary Place, but they are materialized only when the place and sources genuinely support them:

- People;
- Objects;
- Brands;
- Structures / category-owned collections;
- Stories;
- Før/etter;
- Nyheter;
- Lesespor;
- routes / narrative links;
- additional deep Fagverk tracks;
- additional media and collection assets.

`N/A` is a researched conclusion, not a shortcut. The workcard must name the candidate pass and the reason the subsystem does not qualify. Existing subsystem contracts still decide what counts as a valid candidate.

**Never create filler to satisfy fullness.** A Place may not gain a fake Brand, marginal person, arbitrary object, weak Story or duplicate Structure because a template contains that slot.

## 4. Profiles

### `major`

Use for a place with exceptional historical/cultural/system importance **and** broad source-backed material that supports several independent learning or narrative tracks.

Typical signals:

- several meaningful historical periods or transformations;
- multiple central people/actors with direct place relationships;
- several distinct material/architectural/organizational layers;
- strong cross-place importance;
- multiple non-duplicative narrative or learning tracks;
- unusually strong playable/interpretive depth.

Expectations:

- deepest research pass;
- all conditional subsystems receive an explicit candidate audit;
- relevant People/Objects/Brands/category collections should normally be rich, but no subsystem is fabricated;
- multiple strong chronology anchors where sources support them;
- Stories are expected when genuine narrative axes exist, but the Story contract's anti-duplication rule still wins;
- Quiz is selected adaptively from the canonical Quiz contract and will often be `rich` or `major` when the evidence supports it.

A famous place is not automatically `major`. The source-backed content must actually carry the breadth.

### `standard`

The default profile for a substantial canonical Place with enough material for a full place experience but without the exceptional breadth required for `major`.

Typical signals:

- a clear historical identity and chronology;
- more than one meaningful content angle;
- some strong People/Object/Structure/Brand/related material, but not necessarily all of them;
- a solid Fagverk and playable knowledge base;
- enough source material for a complete place experience without filler.

Expectations:

- full universal canonical core;
- conditional subsystems are researched and materialized when relevant;
- documented `N/A` is valid for semantically unsupported subsystems;
- Quiz profile remains evidence-driven (`normal`, `rich`, or another profile allowed by the Quiz contract);
- one strong Story is preferable to several chronology-shaped pseudo-Stories.

### `focused`

Use for a real canonical Place whose historical/cultural value is concentrated in one dominant function, event, structure, trace or narrowly bounded theme.

Typical signals:

- one main historical job or interpretive question;
- limited temporal/entity breadth after real research;
- fewer independent People/Object/Brand/Structure candidates;
- the place remains map-worthy and historically meaningful even though the content surface is narrow.

Expectations:

- full universal canonical core remains mandatory;
- research does **not** expand sideways merely to make the place look `standard`;
- People/Objects/Brands/Stories/Før–etter/Nyheter/Lesespor may be `N/A` when the candidate audit supports that conclusion;
- Quiz is not pre-sized by the place profile: if the source bank supports a canonical narrow quiz without repetition, produce it; otherwise record the evidence-bounded decision required by the active Quiz/product contract rather than inventing questions;
- chronology and Språkleksikon remain mandatory research lanes.

`focused` must never be chosen because a producer wants a cheaper or faster task. It is a source- and scope-based classification.

### `micro`

Use only when the place qualifies under `docs/MICRO_PLACE_CONTRACT.md`.

Typical examples include small marked points, selected blue plaques, Lesekiosker and other intentionally lightweight map entities whose value is location-specific but does not justify ordinary Place production.

Micro Places do not inherit the ordinary universal core wholesale. Their separate contract remains authoritative.

## 5. Profile decision

The preflight evaluates five dimensions:

1. **historical depth** — number of genuinely distinct periods/transformations;
2. **entity depth** — number and importance of independently valid People/Objects/Brands/Structures/related Places;
3. **source depth** — breadth and quality of inspectable material;
4. **interpretive depth** — number of independent questions, conflicts, processes or learning tracks;
5. **place significance** — local/city/national/system importance of the physical place itself.

Decision rule:

- choose `major` only when several dimensions are clearly high and the content can sustain multiple independent tracks;
- choose `focused` when the place remains canonical but the researched breadth is genuinely narrow;
- choose `standard` in the broad middle and as the default when evidence does not justify either extreme;
- choose `micro` only under the separate Micro Place contract.

Do not use a mechanical point score as the final authority. The workcard must give a short evidence-based reason.

## 6. Catalog-wide triage before further production

History GO uses a **two-stage classification**, not a full research freeze.

### Stage A — provisional catalog triage

Before continuing the ordinary place-production queue after adoption of this contract, make one lightweight pass over the existing canonical Place catalog and assign:

```text
production_profile: major | standard | focused | micro
profile_status: provisional
profile_reason: <short reason based on existing canonical data>
```

This pass is planning metadata, not a new content audit. It should use existing canonical metadata, known scope, already-materialized content and obvious place significance. It must **not** trigger full research of every Place.

Purpose:

- reveal how much of the backlog is actually Major/Standard/Focused/Micro;
- prevent the production queue from assuming every Place has the same cost;
- identify likely profile mistakes before expensive production begins;
- make cluster planning and sequencing realistic.

### Stage B — confirmed preflight classification

When a Place reaches active production, its null measurement must confirm or override the provisional classification after real source review:

```text
production_profile: ...
profile_status: confirmed
profile_reason: ...
profile_changed_from: <optional provisional profile>
```

The confirmed profile controls that production. A provisional profile never overrides stronger evidence found during the real preflight.

New Places that do not yet exist in the catalog (for example the next canonical intake) are classified directly during preflight and enter with `profile_status: confirmed`.

## 7. Quiz profile is separate

`production_profile` and Quiz profile are different systems.

The canonical Quiz contract independently chooses:

- `narrow`: 3 × 7;
- `normal`: 4 × 7;
- `rich`: 5–8 × 7;
- `major`: 8–10 × 7;

based on the actual claim bank and learning breadth. A `standard` Place can legitimately carry a `rich` quiz, and a `major` Place must not be padded to 10 sets when ten distinct source-backed set plans do not exist.

## 8. PlaceCard relationship

The current ordinary PlaceCard runtime remains a fixed four-slot visual grid until a dedicated UI/schema migration changes that contract.

Production profiles change **semantic completion**, not the number of current visual slots:

- every relevant collection must still meet its own canonical contract and visual-preview requirements;
- a collection that is genuinely unsupported after the required candidate audit must be recorded as `BEGRUNNET N/A` instead of filled with fake content;
- an honest empty/fallback state for a profile-approved N/A slot is preferable to fabricated content;
- `major` places should normally avoid N/A slots because their breadth is part of why they are `major`, but evidence still wins;
- a future 2/3/4-slot UI migration must be handled as a separate cross-runtime contract change and must not be smuggled into an individual place PR.

## 9. Workcard fields

Every ordinary active place-production workcard must contain:

```text
PRODUKSJONSPROFIL: major | standard | focused
PROFILSTATUS: provisional | confirmed
PROFILBEGRUNNELSE:
PROFILENDRING FRA TRIAGE: none | <old profile → new profile + reason>
UNIVERSAL CORE STATUS:
BETINGEDE SUBSYSTEMER:
  People: PASS | BEGRUNNET N/A | BLOCKED
  Objects: PASS | BEGRUNNET N/A | BLOCKED
  Brands: PASS | BEGRUNNET N/A | BLOCKED
  Category collection: PASS | BEGRUNNET N/A | BLOCKED
  Stories: PASS | BEGRUNNET N/A | BLOCKED
  Før/etter: PASS | BEGRUNNET N/A | BLOCKED
  Nyheter: PASS | BEGRUNNET N/A | BLOCKED
  Lesespor: PASS | BEGRUNNET N/A | BLOCKED
```

Additional subsystem-specific fields remain required where their own contracts demand them.

## 10. Anti-downgrade rule

Production profiles must never become a mechanism for silently weakening previously strong Places.

- Existing correct content is preserved unless separately invalidated.
- A profile change does not delete valid People, Objects, Brands, Stories, Quiz or other content merely because the new minimum is smaller.
- `focused` means narrowly scoped by evidence, not intentionally incomplete.
- A place cannot be marked complete while a **relevant** source-backed subsystem is missing merely because another profile would have required less.

## Short rule

**Classify the catalog lightly first, confirm each Place as it reaches production, keep one universal canonical core, and scale only the breadth that the sources and the place genuinely support. Never manufacture content to satisfy a template.**
