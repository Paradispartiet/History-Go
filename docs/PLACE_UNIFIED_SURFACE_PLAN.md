# History GO — Unified Place Surface

Status: **canonical design, runtime and migration plan**  
Owner: `place_unified_surface_contract`  
Current compatibility runtime: `js/ui/place-unified-surface.ts` → `dist/web/place-unified-surface.js`  
Target runtime family: `js/ui/place-sheet/**`  
Target style: `css/place-sheet.css` + section styles  
Baseline for this revision: `fe6eb09e25381d0a83ee732c324ae44622837fb4`  
Date: **2026-09-09**

## 1. Decision

Standard canonical Places shall have one user-facing main surface: a scrollable **Place Sheet** that combines the best visual qualities of the current place popup with all existing PlaceCard functionality.

The user must be able to open one Place and then scroll through **all canonical place content automatically**. No canonical main section may require a click, tab activation, viewport intersection or user scroll before it starts rendering.

The performance strategy is therefore **automatic staged full rendering**, not viewport-lazy rendering:

```text
openPlaceCard(place)
        ↓
FIRST FRAME
hero + identity + metadata + status
frontImage + four canonical collections + primary actions
        ↓
AUTOMATIC FULL RENDER STARTS IMMEDIATELY
batch 1: About + History
        ↓
batch 2: Stories + Before/after + News
        ↓
batch 3: Reading trails + Language
        ↓
batch 4: Fagverk + Sources + relevant special sections
        ↓
FULL PLACE READY
all available canonical place sections exist in one scroll surface
```

Batching exists only to yield briefly to the browser between render groups. It must **never** make rendering conditional on scrolling.

The current implementation that generates the whole legacy popup and then embeds/moves it into PlaceCard is accepted only as **temporary compatibility scaffolding**. It is not the target architecture.

## 2. Product principle

The final experience is not a small card with links to many modals. It is a **digital place dossier**:

```text
Map / lists / NextUp / person→place
                ↓
        openPlaceCard(place)
                ↓
             Place Sheet
   ├─ Hero / identity / metadata / status
   ├─ Explore: four canonical collections
   ├─ About
   ├─ History
   ├─ Stories
   ├─ Before/after
   ├─ News
   ├─ Reading trails
   ├─ Language
   ├─ Fagverk
   ├─ Sources
   ├─ relevant place-specific special sections
   └─ Quiz / visit / route / note / observation / on-site actions
                ↓
     subsystem detail surfaces when needed
```

The Place Sheet itself must contain the complete canonical **place-level** story. Subsystem detail pages/popups remain appropriate for deep People, Objects, Brands, Quiz, full Fagverk and similar child-detail experiences.

## 3. Non-negotiable invariants

1. **0 funksjonstap.** No existing user-facing action may disappear without an explicit new destination and regression coverage.
2. **0 innholdstap.** Every existing PlaceCard or place-popup place-level content surface must map to the Place Sheet or its canonical child subsystem.
3. **Automatic full rendering.** Once a standard Place is opened, all available canonical main sections must begin rendering automatically and reach DOM without requiring user scroll or click.
4. **No viewport gate.** `IntersectionObserver`, scroll position or viewport proximity may optimize image loading or effects, but may not decide whether a canonical text/content section renders.
5. **No new truth source.** Place, Leksikon, Stories, People, Objects, Brands, Quiz, Lesespor, Språk and Fagverk remain owned by their current canonical systems.
6. **Four collections remain.** A fully produced ordinary Place still has exactly four canonical collections; People/Flora/Fauna retain circle semantics and other collections retain rounded-rectangle semantics.
7. **Quiz remains first-class.** Quiz and QuizCard actions/state remain operational and easy to reach.
8. **Micro Places remain an explicit exception.** They keep the reduced Micro contract and are not inflated into the standard full dossier.
9. **Public entry points remain compatible.** `openPlaceCard(place)` remains the primary entry point. Existing `showPlacePopup(place, target)` callers remain compatible through an adapter.
10. **Fail closed.** Legacy presentation cannot be removed before 100 % parity is proven.
11. **No silent filler.** Missing canonical content remains an honest production gap.
12. **No stale writes.** Async work for an old Place may never write into a newer active Place.

## 4. Visual design

### 4.1 Overall shell

The final Place Sheet should visually inherit the stronger editorial language of `place-popup-v2.css`, not preserve the compact two-column PlaceCard as the dominant composition.

Target characteristics:

- wider editorial surface on tablet/desktop, approximately the current popup scale rather than the old compact 760 px card;
- strong title hierarchy;
- dark, calm background with restrained borders and depth;
- clear section rhythm rather than a dense control panel;
- map context remains visible around the sheet;
- one internal vertical scroll container;
- no nested main-content modal for standard Places.

### 4.2 Hero

The first screen must contain the most important information without waiting for any secondary knowledge system:

- category/type eyebrow;
- Place title;
- area / epoch / relevant metadata;
- `frontImage` in the canonical portrait treatment;
- concise ingress/description;
- Badges;
- compact progress/status;
- primary actions;
- four canonical collections.

The hero should feel like the current place popup's editorial header/overview, while retaining PlaceCard's portrait image and collection identity.

### 4.3 Explore / four collections

The four collections become a real **Utforsk** section rather than a compressed icon/navigation grid.

Rules remain canonical:

- exactly four collections for fully produced ordinary Places;
- People / Flora / Fauna use circles;
- other collection types use rounded rectangles;
- previews use real canonical member images;
- `frontImage` must not be reused as fake member imagery;
- `related` is never a fifth collection;
- Badges remain separate.

Desktop/tablet may use a spacious 2×2 or context-appropriate balanced layout. Mobile should default to a legible 2×2 composition without shrinking labels into icon-only affordances.

**Events og Møtes** ligger i samme venstre hero-kolonne, direkte under de fire Utforsk-samlingene. Canonical rekkefølge i kolonnen er:

`frontImage → Utforsk-samlinger → Events / Møtes`

De skal ikke dupliseres som egne tabs i det globale venstre Utforsk-panelet.

### 4.4 Full content stream

After Explore, the user scrolls through the complete place dossier in canonical order:

1. Om
2. Historie
3. Fortellinger
4. Før/etter
5. Nyheter
6. Lesespor
7. Språk
8. Fagverk
9. Kilder
10. relevant place-specific special sections where canonical contracts require them

Every section with canonical content becomes visible in this stream automatically.

Empty sections do not create fake filler. If the production contract calls for an explicit gap state, render that honest state; otherwise omit genuinely inapplicable sections according to the canonical owner contract.

### 4.5 Section navigation

A sticky horizontal section navigation row is allowed and recommended for long Places:

`Om · Historie · Fortellinger · Før/etter · Nyheter · Lesespor · Språk · Fagverk · Kilder`

Its purpose is **navigation through already-rendering/already-rendered content**. It is not a tab system and does not control whether a section exists.

Clicking a section:

- scrolls to that section;
- may focus the heading for keyboard users;
- must not trigger unrelated section loads;
- must not hide other sections.

### 4.6 Actions

Primary actions should remain continuously easy to reach:

- Quiz
- Besøk
- Rute

A sticky or persistent action treatment inside the Place Sheet is acceptable if it does not cover content or conflict with the app footer.

Secondary actions such as Notat and Observasjon may live in a dedicated action area while existing DOM IDs/hooks are preserved during migration.

## 5. Canonical ownership and loss ledger

| Existing element | Canonical owner | Final Place Sheet destination |
| --- | --- | --- |
| title / name | Place | hero |
| `frontImage` | Place/image contract | hero media |
| `desc` / `popupDesc` | Place description contract | ingress + About without duplication |
| category / subcategory | Place | hero metadata |
| epoch / subject metadata | existing meta runtimes | hero metadata |
| Badges | Badges | hero/status area |
| progress / next action | profile progress reader | compact status |
| People | People | collection preview + People detail surface |
| Objects | Objects | collection preview + Objects detail surface |
| Brands | Brand system | collection preview + Brands detail surface |
| category expression | category collection owner | fourth collection + detail surface |
| About | Place / Leksikon | Om section |
| History / chronology | Leksikon / Place | Historie section |
| Stories | Stories | Fortellinger section |
| Before/after | `for_na` | Før/etter section |
| News | Leksikon/news sources | Nyheter section |
| Reading trails | Lesespor | Lesespor section |
| Language | Språkleksikon | Språk section |
| Fagverk | place learning system | Fagverk section + full Fagverk detail page |
| Sources | source summary / external links | Kilder section |
| Quiz | Quiz | persistent primary action / existing Quiz flow |
| QuizCard | QuizCard | existing QuizCard contract |
| Visit | visit/progress | primary action |
| Route | map/navigation | primary action |
| Note | notes | action area |
| Observation | observations | action area / canonical owner |
| On-site events | on-site runtime | relevant place section/action |
| sport/training/tasks | profile-specific runtimes | special place sections |
| related places | relation system | Related treatment; never a collection replacement |
| Wonderkammer actions | Wonderkammer | child/detail surfaces |
| Micro identity | Micro contract | unchanged reduced surface |

Every row must be `mapped`, `tested` and `parity_passed` before legacy removal.

## 6. Target runtime architecture

### 6.1 Separate shell, section registry and renderers

Do not grow `place-card.js` into a monolith and do not keep one giant `place-unified-surface.ts` as the permanent renderer.

Target structure:

```text
js/ui/place-sheet/
  place-sheet.ts
  place-sheet-state.ts
  place-sheet-render-queue.ts
  place-section-registry.ts
  place-section-context.ts

  sections/
    about.ts
    history.ts
    stories.ts
    before-after.ts
    news.ts
    reading.ts
    language.ts
    learning.ts
    sources.ts
    special-sections.ts

css/
  place-sheet.css
  place-sheet-sections.css
```

`js/ui/place-unified-surface.ts` becomes a compatibility adapter during migration and is removed or reduced to routing once the Place Sheet owns standard Place rendering.

### 6.2 Section contract

Each place-level section should expose a small deterministic contract, conceptually:

```ts
type PlaceSection = {
  id: PlaceSectionId;
  order: number;
  applies(place, context): boolean;
  load(place, context, signal): Promise<unknown> | unknown;
  render(container, data, context): void;
};
```

The renderer does not invent canonical data. The loader calls the existing owner system.

The same section renderer can be used by the Place Sheet and, temporarily, the legacy popup during reconciliation.

### 6.3 Full render queue

Opening a standard Place creates one render generation and immediately starts the full queue.

Required behavior:

```text
open standard Place
  → render shell + Tier 0/1 immediately
  → schedule batch 1 automatically
  → yield to browser
  → schedule batch 2 automatically
  → yield to browser
  → schedule batch 3 automatically
  → yield to browser
  → schedule batch 4 automatically
  → mark full-ready
```

No batch waits for:

- scroll;
- `IntersectionObserver`;
- section click;
- explicit "load more";
- tab selection.

Possible yielding primitives, in order of preference/fallback:

1. `scheduler.postTask` where available and appropriate;
2. `requestAnimationFrame` + queued micro/macrotask;
3. short `setTimeout(0)` fallback.

The purpose is only to avoid one long blocking main-thread task.

### 6.4 Render state

Each section has explicit state:

```text
pending → loading → rendered
                 ↘ failed
```

The Place Sheet as a whole has:

```text
opening → interactive → rendering-full → full-ready
```

`interactive` means the hero/actions/collections are usable. It does **not** mean rendering stops. The full queue continues automatically until `full-ready` or a real section failure is recorded.

## 7. Performance strategy without hiding content

### 7.1 What is allowed to be lazy

The browser may defer **resource work** that does not prevent the content itself from existing:

- below-the-fold images may use `loading="lazy"`;
- images may use `decoding="async"`;
- expensive media widgets may initialize after their containing text/card structure is already rendered;
- secondary map/media effects may activate after initial layout.

### 7.2 What is not allowed to be lazy by scroll

These must begin automatically after Place open if applicable:

- Om text;
- Historie;
- Fortellinger;
- Før/etter structure/text;
- Nyheter;
- Lesespor;
- Språk;
- Fagverk place content;
- Kilder;
- canonical special place sections.

An `IntersectionObserver` may be used for image/media optimizations, **never as the gate for main section creation**.

### 7.3 Avoid duplicated heavy work

The final architecture must not:

- create a complete hidden popup and then move it;
- render the same Fagverk block twice and reconcile later;
- fetch the same owner payload independently for several sections when one canonical load can be shared;
- keep hidden tab copies of all sections in parallel with the visible stream.

Use per-Place caches scoped to the active render generation where shared owner data is useful.

## 8. Fast Place switching and cancellation

A new Place open invalidates the previous render generation immediately.

Use one active generation plus an `AbortController`:

```ts
activeController?.abort();
activeController = new AbortController();
const generation = ++activeGeneration;
```

Every async loader receives `signal`.

Before every DOM write:

```ts
if (generation !== activeGeneration) return;
if (placeId !== currentPlaceId) return;
```

Requirements:

- stale requests may finish at transport level if they cannot be aborted, but may not mutate the current Place Sheet;
- opening Place B while Place A is still rendering must stop A's remaining automatic queue;
- returning to A may reuse safe canonical caches, but must create a new render generation;
- Micro ↔ standard transitions must clear incompatible surface state.

## 9. Public API compatibility

### `openPlaceCard(place)`

Remains the canonical public entry point throughout migration.

Target behavior:

```text
openPlaceCard(place)
  → existing Place resolution/progress semantics
  → HGPlaceSheet.open(place)
  → hero becomes interactive
  → automatic full render queue continues
```

### `showPlacePopup(place, target)`

For standard Places, becomes a compatibility route:

```text
showPlacePopup(place, "history")
  → open/focus the Place Sheet
  → ensure the requested section has at least entered its automatic queue
  → scroll/focus that section
```

If a direct section request arrives before its normal batch, that section may be **promoted earlier in the queue**, but the rest of the full queue must still continue automatically.

For Micro Places, retain the Micro-specific mini-info behavior.

### DOM compatibility

During migration retain critical IDs/selectors, especially:

- `#placeCard`
- `#pcQuiz`
- QuizCard hooks
- visit/route/note/observation hooks
- collection hooks consumed by current runtime/tests

Do not combine the visual redesign with a wholesale selector/API rename.

## 10. Micro Places

Micro Places remain a deliberate exception to full Place rendering.

They retain:

- compact identity surface;
- canonical category/subcategory/status;
- short source-backed description;
- mini information surface with sources;
- visit / route / note actions;
- Quiz only when `quizMode: "place"` and a real place-specific quiz exists.

Do not force:

- four collections;
- nine standard knowledge sections;
- Fagverk;
- language layer;
- synthetic People/Objects/Brands content.

Opening a Micro after a standard Place must abort the standard full render queue and clear its state. Opening a standard Place after Micro must restore the full Place Sheet.

## 11. Accessibility and responsive behavior

- one main Place dialog/sheet with a clear accessible label;
- one vertical scroll region;
- semantic section headings in document order;
- sticky section navigation is supplemental, not required to expose content;
- keyboard activation of nav jumps must transfer focus sensibly;
- no scroll trap;
- `prefers-reduced-motion` disables smooth section jumps/large transitions;
- sticky primary actions must never cover section content;
- touch targets remain comfortably sized;
- desktop text measure remains readable even if the overall sheet becomes wider;
- async completion announcements must be sparse; do not flood `aria-live` for every batch.

## 12. Implementation phases

### Phase 0 — freeze the new contract

This document is the canonical target. Update tests so they distinguish:

- temporary embedded-popup compatibility behavior;
- target automatic full-render behavior.

No legacy deletion yet.

### Phase 1 — visible Place Sheet hero and Explore redesign

Build the genuinely new visual shell first:

- editorial hero inspired by popup V2;
- portrait `frontImage` retained;
- title/meta/badges/status redesigned;
- four collections moved into a spacious Explore section;
- existing action IDs retained;
- no knowledge-content loss.

This phase must create an unmistakable visible UI change.

### Phase 2 — extract shared section renderers

Extract owner-backed rendering from popup code without changing canonical data ownership:

- About;
- History;
- Stories;
- Before/after;
- News;
- Reading;
- Language;
- Sources;
- Fagverk adapter.

Legacy popup may temporarily call the same renderers.

### Phase 3 — automatic full render queue

Introduce `place-sheet-render-queue.ts` and section registry.

On every standard Place open:

- shell is rendered;
- full section queue starts immediately;
- batches yield between groups;
- no viewport/scroll gating;
- full-ready event/state is emitted only after every applicable section has rendered or reported a real failure/gap.

### Phase 4 — direct routing and queue promotion

Route legacy shortcuts/direct-tabs to Place Sheet anchors.

A direct target can promote that section in the queue for responsiveness, but cannot cancel or suppress the remaining full render.

### Phase 5 — special profiles

Verify Natur, Sport, tasks/training, on-site and other profile-specific content. Add special sections only through canonical owners.

### Phase 6 — remove popup embedding bridge

Once shared renderers and the full queue are proven:

- stop generating a full hidden popup on standard Place open;
- stop moving popup DOM into PlaceCard;
- retain `showPlacePopup` only as compatibility routing for standard Places;
- retain Micro mini-popup contract.

### Phase 7 — legacy shell cleanup

Only after 100 % parity and zero active standard-place dependencies:

- remove obsolete popup shell code/CSS for standard Place presentation;
- remove redundant shortcut geometry;
- keep compatibility APIs as long as external/internal callers still require them.

## 13. Performance and correctness gates

Tests must verify behavior, not merely file presence.

### Opening gate

Immediately after `openPlaceCard(place)`:

- hero is visible and interactive;
- four collections are rendered;
- primary actions are usable;
- automatic full-render queue has started without user interaction.

### Automatic full-render gate

Without dispatching scroll, intersection or click events:

- all applicable canonical sections eventually reach `rendered`;
- the Place Sheet reaches `full-ready`;
- section order is canonical;
- no main section remains hidden behind tab state.

### No-scroll-dependency gate

A browser test must fail if any canonical section requires:

- `IntersectionObserver` callback;
- scroll event;
- section-nav click;
- `load more` action;
- tab activation.

### Place-switch gate

Open A, then B before A finishes:

- A's remaining queue is cancelled/invalidated;
- no A content appears under B;
- B reaches full-ready correctly.

### Weight gate

Track at least:

- time to interactive hero;
- longest main-thread task during Place open/full render;
- DOM node count after full-ready for representative rich Place;
- request count / duplicate owner loads;
- image decode behavior for below-the-fold media.

The goal is not to reduce final content. The goal is to prevent full rendering from blocking the first usable frame or doing duplicate work.

## 14. Representative parity matrix

| Profile | Must prove |
| --- | --- |
| standard By | hero, 4 collections, all applicable standard sections, actions, Quiz |
| Historie | Historical Events collection + chronology + Stories + full automatic stream |
| Natur | Map/Flora/Fauna/Destinations + full applicable stream |
| Sport | competition/training/tasks where present + full applicable stream |
| rich knowledge | Om, Historie, Stories, Før/etter, Nyheter, Lesespor, Språk, Fagverk, Kilder all auto-render |
| Before/after | motif/image pair, attribution, text, observation points |
| production gap | honest gap state; no fabricated filler |
| Micro | reduced contract; no forced standard full render; Micro↔standard reset |

## 15. Acceptance criteria

- `openPlaceCard(place)` visibly opens the redesigned Place Sheet for ordinary standard Places.
- The hero and Explore area are materially redesigned; completion cannot be claimed from wiring-only changes.
- All four canonical collections remain intact.
- **All applicable place-level canonical sections start rendering automatically immediately after Place open.**
- **No applicable main section waits for scroll, viewport intersection or click.**
- The Place Sheet reaches a deterministic `full-ready` state containing all applicable canonical place-level content.
- Sticky section navigation only scrolls; it does not reveal/hide content.
- Direct legacy section calls may promote a section earlier but the rest of the automatic render queue continues.
- Quiz, QuizCard, visit, route, note, observation, status and on-site behavior remain operational.
- Språk retains its canonical Knowledge/Språkleksikon ownership.
- Fagverk remains owned by the learning system and appears in the full stream while retaining its full detail surface.
- No user-facing `Mer` rest category exists.
- Micro Places remain reduced.
- Async work cannot land on the wrong active Place.
- The final standard Place path no longer generates a full hidden popup merely to move its DOM into the sheet.
- Relevant exact-head CI is green before merge.
- Post-merge Main integrity is green on the exact merge SHA.

## 16. Rollback and fail-closed rules

The migration remains additive until the target architecture proves parity.

Stop the rollout if:

- any loss-ledger row has no destination;
- a main canonical section is changed to scroll/click-gated rendering;
- an old action has no equivalent;
- a new data copy is introduced to make the UI work;
- full render creates duplicated canonical owner output;
- Micro is treated as a standard full Place;
- Quiz/QuizCard or progress state loses its contract;
- stale async data can appear under the wrong Place;
- a legacy target is removed before routing/parity is tested;
- performance is "fixed" by hiding or omitting canonical content;
- existing tests are deleted instead of migrated or superseded by stronger tests.

Rollback must never require reversing canonical data changes because this project is a presentation/runtime migration, not a data migration.

## 17. Definition of Done

The work is complete only when:

- ordinary standard Places use the visibly redesigned Place Sheet by default;
- the design is materially closer to the stronger editorial popup language than the old compact PlaceCard;
- hero, four collections and primary actions are immediately usable;
- the full canonical place stream renders automatically after open with no scroll/click requirement;
- all applicable sections are present in one continuous scroll surface at `full-ready`;
- all existing place entry points still work;
- all four collections and PlaceCard actions remain functional;
- Fagverk, Quiz, QuizCard, Lesespor, Språk, Sources, on-site and status behavior remain functional;
- Micro remains a separate reduced tier;
- the loss ledger reaches **100 % parity**;
- legacy `Mer` is absent;
- no parallel data source exists;
- the hidden-popup-then-embed bridge is removed from the final standard Place path;
- performance gates prove that full rendering is batched without sacrificing content;
- relevant exact-head CI and post-merge integrity are green.

A prettier surface alone is not completion. A fast first frame alone is not completion. The target is: **a visibly better Place Sheet where all canonical place content renders automatically into one continuous scroll experience, with zero functional/data loss and without blocking the initial interaction.**
