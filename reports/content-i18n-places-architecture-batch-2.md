# Content i18n places architecture batch 2

## Status

Batch 2 audited and tightened the places content-i18n wiring. No canonical place data or translation JSON files were changed.

Runtime changes were limited to wiring and merge behavior:

- `js/i18n.js` still loads `data/i18n/content/places/<lang>.json` through the existing content-loader pattern.
- Place localization now uses an allowlist of translatable place fields instead of the previous four-field-only merge.
- The current translation files still only contain `name`, `desc` and `popupDesc` plus metadata, so no new content was introduced.
- Search, map marker labels and the legacy place popup now localize the place object before rendering.
- Fallback remains canonical Norwegian place data when the selected language is `nb`, when a content file is missing, when a place id has no translation, or when a translated field is empty/null.

## Files inspected

Required inputs inspected:

- `reports/content-i18n-audit-batch-1.md`
- `js/i18n.js`
- `data/i18n/content/places/en.json`
- `data/i18n/content/places/es.json`
- `data/i18n/content/places/pt.json`
- `data/places/manifest.json`
- `data/places/places_index.json`
- `js/ui/place-card.js`
- `js/ui/popup-utils.js`
- `js/ui/lists.js`
- `js/ui/search.js`
- `js/map.js`

## Existing place content-i18n model

### Loader

`js/i18n.js` has a generic content loader:

```js
loadContentJson(type, lang) -> data/i18n/content/<type>/<lang>.json
```

Places use that loader through `loadPlaceTranslations(lang)`, which normalizes the selected language and loads `data/i18n/content/places/<lang>.json` for non-`nb` languages.

### Language selection and fallback

- `nb` is the fallback/source language.
- Selecting `nb` returns an empty place translation dictionary and leaves canonical data in place.
- Missing content translation files are caught and replaced with `{}`.
- Missing place ids or fields fall back to the original canonical place object.
- The fallback model is therefore id-based overlays on top of canonical Norwegian place data.

### Translation file shape

Current files are id-based dictionaries:

```json
{
  "torggata": {
    "name": "...",
    "desc": "...",
    "popupDesc": "...",
    "_sourceHash": "...",
    "_status": "machine_translated"
  }
}
```

A quick key inventory showed all three files currently use only these user-facing translated fields:

- `name`
- `desc`
- `popupDesc`

The metadata keys `_sourceHash` and `_status` are present and are intentionally ignored by the runtime merge.

## Merge model after this batch

The desired merge model is still id-based:

```json
{
  "place_id": {
    "title": "...",
    "summary": "...",
    "description": "..."
  }
}
```

The runtime now supports a broader allowlist of place-content fields for future batches while preserving the existing data format. Supported overlay keys are:

- `title`
- `name`
- `label`
- `description`
- `desc`
- `popupDesc`
- `popupdesc`
- `summary`
- `shortDescription`
- `shortDesc`
- `subtitle`
- `intro`
- `body`
- `facts`
- `why`
- `tasks_profile`
- `for_na`
- `leksikon`
- `stories`
- `works`
- `badges`

Metadata fields such as `_sourceHash` and `_status` are not merged into place objects.

Technical fields remain outside the overlay allowlist and must not be translated by this architecture, including ids, slugs, categories, coordinates, sources, images, icons, colors and version fields.

## Renderer coverage

### Covered before this batch

- `DataHub.loadFullPlace(...)` was already wrapped in `js/i18n.js`, so full place data passed through that API received place translations.
- `window.openPlaceCard(place)` was already wrapped, so the primary PlaceCard title and description fields were localized when opened through the standard card API.
- `renderNearbyPlaces()` and `renderCollection()` were already wrapped by temporarily localizing `window.PLACES` during render.

### Fixed in this batch

- Map marker labels now localize the map's internal place list before building GeoJSON label features.
- Language changes now ask `window.HGMap.refreshMarkers()` to redraw marker labels after content translations load.
- Global search now searches and renders localized place objects, so translated `name`, `desc` and `popupDesc` participate in matching and display.
- `showPlacePopup(place)` now localizes its input place before rendering the legacy popup title and description.

### Still canonical / out of scope

The following areas still contain content surfaces that are not fully covered by places content-i18n and should be handled by later batches rather than this wiring batch:

- Category labels from `CATEGORY_LIST` are taxonomy/UI-content and not place translations.
- People, stories, quiz, nature species, Wonderkammer and Civication content rendered inside place surfaces still need their own content-i18n architecture.
- Place-specific nested fields are now supported by the merge allowlist, but there are no current translations for those fields in `data/i18n/content/places/{en,es,pt}.json`.

## Validation

Commands run:

```sh
python3 -m json.tool data/i18n/content/places/en.json >/dev/null && python3 -m json.tool data/i18n/content/places/es.json >/dev/null && python3 -m json.tool data/i18n/content/places/pt.json >/dev/null
```

```sh
node --check js/i18n.js
```

```sh
node --check js/ui/search.js
```

```sh
node --check js/map.js
```

```sh
node --check js/ui/popup-utils.js
```

```sh
git diff --check
```

Additional check:

```sh
npm run i18n:places:check
```

This command completed TypeScript compilation and build steps, then failed in `i18n:places:audit` because existing translation coverage still has missing, stale and extra ids. That is expected for this architecture batch and was not fixed because this PR must not bulk-translate or edit canonical/translation content files.
