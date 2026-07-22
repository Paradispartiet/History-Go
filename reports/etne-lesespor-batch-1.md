# Etne Lesespor batch 1

## Scope

This batch adds a dedicated Lesespor collection for active History Go places in Etne municipality.

- 11 category files under `data/lesespor/etne/`
- 51 curated external reading entries
- 81 unique active Etne place IDs covered by at least one `place_ids` reference
- no copied article fulltext
- all new items use `access: "open"`, `rights: "link_only"` and an allowed source-quality/curation status

## Editorial model

The batch follows the canonical Lesespor contract: one strong text may serve several genuinely related places. It does not create a synthetic one-link-per-place catalogue. Broad institutional sources are used as orientation tracks where they genuinely cover a larger place family, while distinctive places receive focused reading tracks.

Examples include the municipal culture-environment plan for Etne's wider heritage landscape, specific Kringom and museum articles for selected historic places, official and specialist material for sports facilities, NVE for hydropower, Havforskningsinstituttet for the Etneelva research platform, and municipal service pages for politics and psychology.

## Runtime and validation integration

`data/lesespor/manifest.json` now registers the 11 Etne files in addition to the existing Oslo collection.

`tools/validate_lesespor.mts` is generalized from an Oslo-only validator to a manifest-driven multi-scope validator. It now:

- derives scope and category from `<scope>/lesespor_<scope>_<category>.json`
- requires each document's `city` field to match its scope
- validates all active manifest entries, not only files under `data/lesespor/oslo/`
- validates place references against the active global `data/places/places_index.json`
- preserves checks for schema, category, rights policy, open access, source quality, curation status, forbidden fulltext fields, valid category hints and duplicate item IDs

## Pre-write data audit

The generated Etne data model was checked before repository writes for:

- 51 unique Lesespor item IDs
- 81/81 Etne place IDs covered
- zero unknown Etne place references in the generated batch
- zero forbidden fulltext fields
- only allowed source-quality values
- only `strong_candidate` curation status
- only open-access entries

The final repository-level validator should remain the canonical gate after merge and for future Lesespor cities/municipalities.
