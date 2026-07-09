# Content i18n places batch 16 repair

## Purpose
This repair documents and fixes the double-merged batch 16 state before batch 17.

## What changed
- Repaired batch 16b Spanish and Portuguese `desc` / `popupDesc` values that used generic fallback prose.
- Replaced those values with concrete translations based on the canonical Norwegian place semantics.
- Preserved placeIds, field sets, `_sourceHash`, and `_status`.
- Rewrote `reports/content-i18n-places-batch-16.md` so it documents both merged batch 16 PRs.

## What did not change
- No new placeIds were added.
- No placeIds were removed.
- No canonical place data was changed.
- No `places_index.json` regeneration was done.
- No runtime, UI dictionary, people, quiz, tool, test, or build-output files were changed.

## Batch 16 interpretation after repair
Batch 16 is the combined result of PR #2023 and PR #2035:

- Batch 16a / PR #2023: 20 placeIds.
- Batch 16b / PR #2035: 20 placeIds.
- Total batch 16 additions after batch 15: 40 placeIds.
- Entries per content language increased from 674 before batch 16 to 714 after batch 16b.

## Next-batch requirement
Batch 17 must exclude both the batch 16a and batch 16b ID sets listed in `reports/content-i18n-places-batch-16.md`.
