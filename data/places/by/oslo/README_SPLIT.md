# Split place files

One-file-per-place data is now available for Oslo by places. The original aggregate file is kept as runtime fallback until the loader is migrated.

## Oslo by layout

```text
data/places/by/oslo/places_by.json
data/places/by/oslo/places/
data/places/by/oslo/places_by_manifest.json
data/places/by/oslo/places_by_index.json
data/places/by/oslo/places_by_split_report.txt
```

## Generic splitter

A generic splitter is available for all place categories:

```bash
node scripts/split-place-files.mjs
```

It reads `data/places/manifest.json` and creates one JSON file per place for every aggregate place file.

For folders with several aggregate files, the output folder is named after the source file stem, for example:

```text
data/places/historie/innlandet/places_historie_innlandet_batch1/<placeId>.json
```

This avoids collisions between batches in the same category folder.
