# Decision: ProfileView migration paused / not continuing now

Internal ProfileView was tested as a lightweight index summary, but this duplicates the existing miniProfile.
Current decision:
- keep miniProfile as the quick status surface in index
- keep profile.html as the canonical full profile page
- do not continue moving profile into index
- do not add quick links or more ProfileView content now

Status: historical/paused plan. This document is kept only to explain the paused decision and the boundary that should be preserved.

---

## Current canonical structure

```txt
index.html
  = map / nearby / placeCard / quiz / miniProfile

miniProfile
  = quick profile status in index

profile.html
  = canonical full profile page / collection / badges / profile map / history / knowledge / Civication-related panels
```

The index router remains focused on:

```txt
#/map
#/place/:id
#/quiz/:id
```

`#/profile` is not an internal ProfileView route now. It should navigate to `profile.html` instead of mounting a profile summary inside index.

---

## Why the migration is paused

`profile.html` is a full page with its own page mode, dashboard DOM, profile map, script pipeline, localStorage readers, profile renderers, and Civication-related panels. Moving it into index would require a separate, deliberate lifecycle split.

A lightweight internal ProfileView summary was explored, but that surface overlaps with miniProfile, which already gives quick status inside `index.html`.

Therefore:

- miniProfile stays the fast status surface in index
- `profile.html` stays the full/canonical profile surface
- badges, collection, profile map, history, knowledge dashboard, groundhopper, and Civication panels stay out of index
- `js/profile.js` must not be imported or initialized from index
- Leaflet/profile map boot must not be initialized in index

---

## Historical note

Earlier migration notes considered creating `js/views/ProfileView.js` and gradually adding a small profile summary under `#/profile`. That direction is no longer active.

Do not use this document as approval to:

- recreate `js/views/ProfileView.js`
- add quick links or more ProfileView content
- move badge/collection/profile-map/Civication panels into index
- import `js/profile.js` from `js/app.js`
- change miniProfile to point at an internal profile route

Any future profile migration must start from a new decision document and should not be bundled with unrelated map/place/quiz/router work.
