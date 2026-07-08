# Bislett Stadion batch 2 image asset todo

Status in this PR:

- No image file was added.
- No external image URL was copied into data.
- New people entries use empty `image` and `cardImage` fields.

Reason:

- The requested Bislett image / hero-wall photos must be handled as a separate verified asset pass.
- Use only user-provided photos or verified/licensed local assets committed to the repo.
- Do not reference external web images directly from people entries.

Recommended later asset pass:

1. Photograph or source the actual Bislett hero-wall / stadium hero portraits.
2. Add approved local assets under the repo's existing people-card image convention.
3. Update batch 1 and batch 2 Bislett people entries with safe `image` and `cardImage` values.
4. Consider one shared Bislett Stadium place/card asset if the app supports place-level imagery.

Batch 2 entries needing images:

- `ron_clarke`
- `steve_ovett`
- `kay_stenshjemmet`
- `sten_stensen`
- `tomas_gustafson`
