# History Go Area Overview

Status: **V1 implementation started**

This document defines the product and runtime contract for the universal **Område** feature in History Go.

## Product contract

Every canonical History Go place can be used as the center of an area overview.

The overview is not tied to municipalities, cities, prebuilt region pages, or the user's GPS position. The active place is the center point.

Example flow:

1. Open any PlaceCard.
2. Press **Område** in the PlaceCard footer.
3. History Go opens an area overview centered on that place.
4. Choose a radius: **2 km, 5 km, 20 km, 50 km, or 100 km**.
5. The complete overview updates from the same canonical place dataset used by the map.
6. Press another place in the overview to return to the map. The existing map navigation flow moves to the target first and opens its PlaceCard only after the map movement is complete.

The core state is therefore:

```text
centerPlaceId
centerLat
centerLon
radiusKm
```

`centerLat` and `centerLon` are derived from the canonical place record. They are not a second source of truth.

## Non-goals

The area feature must not:

- create handcrafted Etne, Oslo, municipality, or region pages;
- require municipality boundaries;
- silently use a private home address;
- use GPS as the center when an active place has been selected;
- introduce a second place database;
- duplicate PlaceCard opening or map-navigation timing logic;
- require full place records to be loaded for every result just to build the overview.

## Radius model

The fixed radius choices are:

```text
2 km
5 km
20 km
50 km
100 km
```

The first opening may choose a sensible radius from History Go place density. The user can always override it.

Current V1 rule:

- calculate distances from the selected center place once, up to 100 km;
- choose the smallest radius containing at least 24 other usable places;
- if no radius reaches that density, use the largest radius containing available results;
- changing radius filters the cached distance index instead of reloading place data.

This is a data-density heuristic, not a definition of what counts as a city or rural area.

## Data source

V1 reads from `window.PLACES`, which is populated from the same canonical place loading path as the map.

Eligible results:

- have a canonical `id`;
- have finite `lat` and `lon` coordinates;
- are not `hidden`;
- are not `stub`;
- are not the center place itself.

Distance uses the existing `window.distMeters` helper when available. The area runtime contains a Haversine fallback only so the overview can fail safely if that helper is unavailable.

The overview does not call `DataHub.loadFullPlace()` for every result. Base place data is enough for distance, category, title, short description, and preview image. Full place content remains on-demand when a place is actually opened.

## V1 information architecture

The area overview is a full-screen in-app surface, not a wider Nearby drawer.

### Header

- back to map / active PlaceCard
- History Go
- Område

### Hero

- center-place image when available
- `Området rundt`
- center-place name
- number of places within the selected radius

### Radius selector

A persistent selector for:

`2 · 5 · 20 · 50 · 100 km`

Changing radius updates the complete overview.

### Overview statistics

V1 can show:

- number of places;
- number of represented categories;
- number of unique related people when the relation index is available.

### Category overview

Categories are generated from actual results and sorted by count. Empty categories are not shown.

Selecting a category filters the distance sections while preserving the same center and radius.

### Distance sections

The universal geographic structure is:

| Band | Label |
| --- | --- |
| 0–2 km | Rett rundt stedet |
| 2–5 km | I nærheten |
| 5–20 km | En liten tur unna |
| 20–50 km | Utforsk regionen |
| 50–100 km | Større område |

Only bands with results inside the active radius are rendered.

Large bands initially render a preview and expose **Vis alle** so a 100 km overview does not create an unnecessarily large initial DOM.

## Navigation contract

The area overview must not open a new PlaceCard directly while the map is still elsewhere.

On area-result selection:

1. close the area surface;
2. call `HGMapView.openPlace(placeId)` when available;
3. let `MapView` move the map;
4. let the existing `moveend` completion contract open the PlaceCard.

This keeps Area, Nearby, search, and route navigation aligned around the same PlaceCard timing rule.

## Footer entry

`Område` is a PlaceCard action.

Its center is always the PlaceCard's current `data-current-place-id`.

V1 injects the action beside the existing PlaceCard actions and exposes it as an icon button with accessible `aria-label` and `title` text.

The area runtime is loaded from the existing PlaceCard extension bootstrap so it does not create a second app boot path.

## Runtime API

V1 exposes:

```js
window.HGAreaOverview.open({
  centerPlaceId: "stensparken",
  radiusKm: 5
});
```

The radius argument is optional.

Other public helpers:

```js
HGAreaOverview.close();
HGAreaOverview.setRadius(20);
HGAreaOverview.getState();
HGAreaOverview.distanceKm(placeA, placeB);
HGAreaOverview.buildDistanceIndex(centerPlace);
```

## Files

V1 starts with:

```text
js/ui/area-overview.js
css/area-overview.css
docs/README_area_overview.md
```

The existing PlaceCard extension bootstrap loads the new runtime.

## V1 acceptance criteria

The first functional pass is complete when all of the following work:

- opening any normal PlaceCard makes the **Område** action available;
- pressing **Område** uses that exact place as the center;
- 2/5/20/50/100 km all update the result set correctly;
- hidden and stub records are excluded;
- categories are calculated dynamically;
- distance bands are calculated dynamically;
- a category can be selected and cleared;
- large result bands can be expanded;
- selecting an area result returns to the map and uses `HGMapView.openPlace()`;
- Escape and the back button close the area surface;
- the feature works without a new data manifest or new area records.

## Test matrix

At minimum, manually test places representing very different densities:

### Dense city

- Stensparken
- expected: 2 km should already contain substantial content;
- verify that larger radii do not freeze the UI.

### Small town / regional center

- a canonical Etne place such as Etne stadion;
- expected: the automatic radius should normally be wider than in central Oslo;
- verify that 20 km and 50 km produce useful regional overviews.

### Sparse area

- a canonical rural or mountain place;
- expected: 50 km or 100 km may be required;
- zero-result smaller bands must fail gracefully.

### Navigation

From each test place:

1. open Area;
2. select a result;
3. confirm the area surface closes;
4. confirm the map moves to the selected marker;
5. confirm PlaceCard opens only after map movement completes.

## Next passes

The first pass intentionally establishes the universal geographic contract before adding richer modules.

Likely follow-up layers:

1. compact area map with the center and radius visible;
2. curated or computed highlights;
3. player progress in the area;
4. people, routes, badges, nature, and other area-level collections;
5. URL/history state so an area overview can be deep-linked and restored;
6. richer ranking so the overview surfaces important places without hiding the complete result set.

These layers should consume the same area model rather than creating separate geographic queries.
