# Stories episode v1 remediation — 2026-07-27

## Input

- Repository: `Paradispartiet/History-Go`
- Base: fresh `main`
- Trigger: semantic audit of Oslo Akerselva batch 1 and Bygdøy museumslandskap batch 1

## Root cause

The two batches passed the existing integrity check because that check validated activation, required fields and references, but not the semantic Stories contract. The files used the non-canonical type `historical`, manually assigned scores, broad place biographies and thematic `next_scenes` links.

## Remediation

- Rewrote ten stories as concrete episodes with actors, date, action and consequence.
- Replaced `historical` with canonical types from `story_types.json`.
- Removed thematic `next_scenes`.
- Added canonical `related_people` where a verified people ID exists.
- Recomputed all scores with the active runtime scoring formula.
- Added `quality_profile: episode_v1`.
- Added `stories_episode_v1_manifest.json`.
- Extended `check_stories_integrity.mts` to enforce episode v1.
- Expanded `STORIES_DATA_GOVERNANCE.md` with the semantic contract and coverage levels.

## Expected production diff

1. `data/stories/stories_oslo_akerselva_industri_batch1.json`
2. `data/stories/stories_oslo_bygdoy_museumslandskap_batch1.json`
3. `data/stories/stories_episode_v1_manifest.json`
4. `tools/check_stories_integrity.mts`
5. `docs/STORIES_DATA_GOVERNANCE.md`
6. `reports/stories-episode-v1-remediation-2026-07-27.md`

## Required validation

- JSON parse for all changed JSON files
- `npm run typecheck:tools`
- `npm run check:stories`
- `git diff --check`
- exact changed-file guard against the six expected paths
