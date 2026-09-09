# History GO — Unified Place Surface

Status: **canonical implementation and migration plan**  
Owner: `place_unified_surface_contract`  
Runtime: `js/ui/place-unified-surface.js`  
Style: `css/place-unified-surface.css`  
Baseline inspected: `1f4a3837220921883cbe055989d39ce5bbc5572f`  
Date: **2026-09-08**

## 1. Decision

Standard canonical Places shall have one user-facing main surface: a scrollable **Unified Place Surface**. The existing PlaceCard remains the public shell/entry point and absorbs the canonical place-popup knowledge renderer. The change is a presentation reconciliation, not a new data model.

```text
Map / lists / NextUp / person→place
                ↓
        openPlaceCard(place)
                ↓
       Unified Place Surface
   ├─ identity / metadata / status
   ├─ four canonical collections
   ├─ About
   ├─ History
   ├─ Stories
   ├─ Before/after
   ├─ News
   ├─ Reading trails
   ├─ Language
   ├─ Fagverk
   ├─ Sources
   └─ Quiz / visit / route / note / observation / on-site actions
                ↓
     subsystem detail surfaces
```

The popup renderer remains connected as the canonical knowledge renderer, but is embedded in-flow inside PlaceCard rather than presented as a second modal. This preserves existing async decorators, canonical source ownership and content routing while changing the shell.

## 2. Non-negotiable invariants

1. **0 funksjonstap.** No existing user-facing function can disappear without an explicit new destination and a regression test.
2. **0 innholdstap.** Every existing PlaceCard or place-popup content surface must map to the Unified Place Surface or to its existing canonical subsystem.
3. **No new truth source.** Place, Leksikon, Stories, People, Objects, Brands, Quiz, Lesespor, Språk and Fagverk remain owned by their current canonical systems.
4. **Four collections remain.** A fully produced ordinary Place still has exactly four canonical collections; People/Flora/Fauna retain circle semantics and other collections retain rounded-rectangle semantics.
5. **Quiz remains first-class.** Quiz and QuizCard actions/state must continue to work.
6. **Micro Places remain an explicit exception.** They keep the reduced Micro contract and standalone source-backed mini information surface.
7. **Public entry points remain compatible.** `openPlaceCard(place)` remains the primary place entry point. Existing `showPlacePopup` callers remain compatible through the adapter.
8. **Fail closed.** Legacy presentation cannot be deleted before 100 % parity is proven on the representative test matrix.
9. **Progressive loading remains.** One scroll surface must not become an eager load of every subsystem at marker click.
10. **No silent filler.** Missing canonical content remains an honest production gap.

## 3. Canonical knowledge sections

The Unified Place Surface uses the canonical place-popup knowledge model, without a user-facing legacy `Mer` category:

1. Om / About
2. Historie / History
3. Fortellinger / Stories
4. Før/etter / Before-after
5. Nyheter / News
6. Lesespor / Reading
7. Språk / Language
8. Fagverk / Learning
9. Kilder / Sources

`Mer` is staging only. Direct-tab routing continues to move legacy staging content to its canonical owner.

## 4. Loss ledger

| Existing element | Canonical owner | Unified destination |
| --- | --- | --- |
| title / name | Place | hero |
| `frontImage` | Place/image contract | media grid |
| `desc` / `popupDesc` | Place description contract | intro + About without duplication |
| category / subcategory | Place | hero metadata |
| epoch / subject metadata | existing meta runtimes | hero metadata |
| Badges | Badges | title/meta surface |
| progress / next action | profile progress reader | status surface |
| People | People | collection preview + People detail surface |
| Objects | Objects | collection preview + Objects detail surface |
| Brands | Brand system | collection preview + Brands detail surface |
| category expression | category collection owner | fourth collection + detail surface |
| About | place popup / Leksikon | About section |
| History / chronology | Leksikon / Place | History section |
| Stories | Stories | Stories section |
| Before/after | `for_na` | Before/after section |
| News | Leksikon/news sources | News section |
| Reading trails | Lesespor | Reading section |
| Language | Språkleksikon | Language section |
| Fagverk | place learning surface | Fagverk section + full Fagverk page |
| Sources | source summary / external links | Sources section |
| Quiz | Quiz | persistent place action |
| QuizCard | QuizCard | existing card flip/action contract |
| Visit | visit/progress | place action |
| Route | map/navigation | place action |
| Note | notes | place action |
| Observation | observations | place action / canonical owner |
| On-site events | on-site runtime | existing on-site block |
| sport/training/tasks | profile-specific runtimes | profile-specific section/surface |
| related places | relation system | Related; never a fifth collection |
| Wonderkammer collection actions | Wonderkammer | subsystem detail surfaces |
| Micro identity | Micro contract | unchanged reduced surface |

Every ledger row must be `mapped`, `tested` and `parity_passed` before legacy removal.

## 5. Migration phases

### Phase 0 — inventory

Map public entry points, popup wrappers, DOM selectors, actions and representative tests. No visual deletion.

### Phase 1 — additive unified renderer

Load `place-unified-surface.js` after canonical popup routing. Keep `openPlaceCard` and `showPlacePopup` public compatibility. The canonical popup renderer is embedded inside `#placeCard`; no source data is copied.

### Phase 2 — scroll navigation

Expose the canonical popup sections as a sticky internal navigation row. All canonical panels are displayed in sequence. `Mer` remains hidden staging. Existing PlaceCard popup shortcuts route to internal sections through `HGPlacePopupTabs.openTab`.

### Phase 3 — learning and special surfaces

Use `HGPlaceLearningSurface` to render Fagverk in the same scroll flow while retaining the full Fagverk owner page. Preserve language collection handlers and profile-specific runtimes.

### Phase 4 — parity

Run representative standard By, Historie, Natur, Sport, rich knowledge, Before/after, production-gap and Micro fixtures. Require 100 % parity, 0 orphaned actions and 0 orphaned content owners.

### Phase 5 — legacy removal

Only after parity is green may the standalone visual place-popup shell and redundant shortcut geometry be removed. Compatibility APIs should remain for older callers until a separate API cleanup is proven safe.

## 6. Runtime compatibility

### `openPlaceCard(place)`

Remains the public entry point. The wrapper first lets the existing PlaceCard runtime hydrate/render all existing card actions and collections, then mounts the unified knowledge renderer.

### `showPlacePopup(place, target)`

For standard Places, it becomes a compatibility adapter to the Unified Place Surface and an internal section target. For Micro Places it continues to invoke the legacy mini popup path.

### `HGPlacePopupTabs.openTab(place, tabId)`

Becomes the preferred shortcut bridge. Existing PlaceCard shortcut code can therefore route to the same scroll surface without knowing about the migration.

### DOM compatibility

`#placeCard`, Quiz/QuizCard IDs, existing collection nodes and footer action IDs remain intact in the first implementation. Selector renaming is explicitly out of scope for this migration.

## 7. Micro Places

Micro Places are not inflated into the standard knowledge sheet. They keep:

- compact identity panel;
- canonical category/subcategory and status;
- short source-backed description;
- mini information popup with inspectable sources;
- visit / route / note actions;
- Quiz only when the Micro contract allows a real place quiz.

Opening a standard Place after a Micro Place must fully restore the standard Unified Place Surface. Opening a Micro Place after a standard Place must clear the embedded standard renderer.

## 8. Performance and state

The Unified Place Surface keeps the existing progressive-loading principle.

- Place identity, media, collections and actions render first.
- The canonical popup renderer hydrates its Leksikon, Stories, Lesespor and Language data asynchronously.
- Async writes remain place-scoped. A stale generation may not write into a newer active place.
- The embedded renderer stays connected so existing async popup decorators continue to function.
- Internal section navigation must tolerate sections that hydrate after the initial mount.

## 9. Accessibility and responsive behavior

- One place surface, with a clear scroll region and headings.
- Existing collection and action controls remain keyboard reachable.
- Sticky section navigation is horizontally scrollable on narrow screens.
- Section jumps support keyboard activation and focus handoff.
- `prefers-reduced-motion` disables smooth scrolling.
- The mobile sheet keeps map context and safe-area/footer boundaries.
- The long surface uses sections and progressive rendering rather than nested modal chains.

## 10. Representative parity matrix

| Profile | Must prove |
| --- | --- |
| standard By | 4 collections, metadata, actions, Quiz |
| Historie | Historical Events, chronology, Stories |
| Natur | Map/Flora/Fauna/Destinations and nature-specific collection form |
| Sport | Competitions and training/tasks where present |
| rich knowledge | all canonical popup sections + Fagverk + Språk + Lesespor |
| Before/after | image pair, attribution, text and observation points |
| production gap | honest gap state; no fabricated filler |
| Micro | reduced contract and Micro↔standard state reset |

## 11. Acceptance criteria

- `openPlaceCard(place)` opens the Unified Place Surface for standard Places with no caller migration.
- Existing place-popup shortcuts open the corresponding internal section.
- All canonical popup knowledge sections remain available in one scroll flow.
- The four canonical collections remain intact and are not replaced by knowledge sections.
- Quiz, QuizCard, visit, route, note, observation, status and on-site behavior remain operational.
- Språk retains its Knowledge V2 collection behavior.
- Fagverk remains owned by the learning system and can open the full place Fagverk page.
- No user-facing `Mer` rest category is introduced.
- Micro Places remain reduced.
- Async hydration cannot land on the wrong active place.
- Relevant exact-head CI is green before merge.
- Post-merge `Main integrity` is green on the exact merge SHA.

## 12. Rollback and fail-closed rules

The migration is additive until parity is proven. Rollback must require only switching/removing the presentation adapter; canonical data must not be reverted or regenerated to restore the old shell.

Stop the rollout if any of the following occurs:

- a loss-ledger row has no destination;
- an old action has no equivalent;
- a new data copy is needed to make the UI work;
- Micro is treated as a standard Place;
- Quiz/QuizCard or progress state loses its current contract;
- async data can appear under the wrong place;
- a legacy target is removed before its new route is tested;
- relevant existing tests are deleted rather than migrated or superseded by stronger coverage.

## 13. Definition of Done

The migration is complete only when:

- standard Places use the Unified Place Surface by default;
- all existing place entry points still work;
- all canonical knowledge sections are available in the same scroll surface;
- all four collections and PlaceCard actions remain functional;
- Fagverk, Quiz, QuizCard, Lesespor, Språk, Sources, on-site and status behavior remain functional;
- Micro remains a separate reduced tier;
- the loss ledger reaches **100 % parity**;
- legacy `Mer` is absent from the user surface;
- no parallel data source was introduced;
- relevant exact-head CI and post-merge integrity are green.

A prettier surface alone is not completion. Completion requires a prettier surface **and** proven zero functional/data loss.
