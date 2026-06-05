# Index app structure

This document describes the current `index.html` app structure after the app-shell, fast boot, router, and MapView work.

The goal is to keep the index app understandable and avoid accidental large rewrites.

## Current status

`index.html` is the main History Go app shell.

It owns:

- the map surface
- the header
- the nearby/left panel
- the place card / bottom sheet
- the quiz modal flow
- miniProfile as a quick profile status surface
- the lightweight hash router for index-only routes

`index.html` keeps miniProfile for quick status. `profile.html` is the canonical full profile page. `#/profile` is not an internal view now; it redirects/navigates to `profile.html`. Profile migration into index is paused because miniProfile already covers quick status.

`Civication.html` is still a separate page. It is not an internal index view.

## Boot model

The index app now uses a split boot model.

### Critical boot

`bootCritical()` should only do the work needed to make the map usable quickly:

- initialize core app/runtime basics
- initialize open/test mode state
- initialize the map
- load the light places base/index
- expose `window.PLACES`
- set map places and marker click handling
- render the initial app shell state

Critical boot should stay small.

It should not wait for large secondary data.

### Background boot

`bootBackground()` loads non-critical data after the app is already usable:

- people
- relations
- Wonderkammer
- tags
- nature
- Lesespor
- stories
- events
- brands
- badges/secondary UI data where applicable

Background boot should be defensive. One failing background module should not prevent the map shell from working.

## Router model

The index app uses `js/router/AppRouter.js` for index-only hash routes. `#/profile` is intentionally not listed as an index route because it navigates to `profile.html`.

Supported routes:

```txt
#/map
#/place/:id
#/quiz/:id
```

Route helpers should be used instead of manually building hashes:

```js
window.HGAppRouter?.toMap?.();
window.HGAppRouter?.toPlace?.(placeId);
window.HGAppRouter?.toQuiz?.(targetId);
```

Avoid scattering manual route strings like `#/place/...` across UI files.

## MapView model

`js/views/MapView.js` owns the lightweight view-state for index routes.

It is responsible for:

- showing the base map route
- opening a place card for `#/place/:id`
- starting quiz flow for `#/quiz/:id`
- closing or hiding route-specific UI when returning to `#/map`

MapView should stay thin. It should coordinate existing DOM/runtime behavior, not replace the place card, map engine, or quiz engine.

## What should not be moved yet

Do not move these into the index router without a separate migration plan:

- `profile.html` (canonical full profile page)
- `js/profile.js`
- `Civication.html`
- `js/Civication/**`

Those pages have their own boot/runtime assumptions and should remain separate until a dedicated phase is planned.

## Safe next steps

Good next steps:

- keep using `bootCritical()` / `bootBackground()` boundaries
- keep index route helpers centralized in `AppRouter`
- add small route/state fixes in `MapView` when needed
- document new index-only behavior here
- keep miniProfile as quick status in index and `profile.html` as the full profile

Avoid:

- large router rewrites
- moving profile/Civication into index as part of unrelated patches
- restarting ProfileView migration while miniProfile already covers quick profile status
- changing boot order without checking loading behavior
- mixing app-structure work with data migrations or UI redesigns

## Rule of thumb

If a change is needed for the first usable map screen, it belongs near critical boot.

If a change enriches cards, people, stories, relations, brands, nature, or secondary panels, it belongs in background boot or event-driven refresh.
