# places_by split

This folder splits the old `places_by` array into one JSON file per place.

## Layout

```text
places_by_manifest.json      # ordered manifest with id → file mapping
places_by_index.json         # lightweight map/list startup index
places/
  <place.id>.json            # one full place object per file
places_by_rebuilt_from_split.json
places_by_split_report.txt
```

## Loader recommendation

Use `places_by_index.json` for startup/map rendering and lazy-load the full file when a specific place is selected:

```js
const index = await fetch("data/places/by/places_by_index.json").then(r => r.json());

async function loadPlace(placeId) {
  const row = index.find(p => p.id === placeId);
  if (!row) throw new Error(`Unknown place: ${placeId}`);
  return fetch(`data/places/by/${row.file}`).then(r => r.json());
}
```

During migration, keep the old combined `places_by.json` as a fallback only. New work should patch `places/<placeId>.json`, not regenerate or duplicate the place.
