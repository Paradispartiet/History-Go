# Temporary task: close coordinate documentation review findings

This file exists only to make the repair branch non-empty. It must be deleted before review.

Required final diff:

1. `docs/documentation_registry.json`
   - Restore exactly one document entry for `docs/PROFILE_PROGRESS_READER_RUNTIME.md`.
   - Place it immediately after the `docs/PROGRESSION_MODEL.md` entry and before `docs/DATA_PRODUCTION_CONTRACT.md`.
   - Use:
     - `status`: `operational`
     - `role`: `Aktiv read-only runtimeguide for HGProfileProgressReader og eksisterende progresjonskilder`
     - `owns`: `["profile_progress_reader_runtime"]`
     - `last_verified`: `2026-07-25`
   - Preserve every other current registry entry and the current top-level verification date.

2. `package.json`
   - Add `npm run places:coords:evidence:audit` exactly once to `scripts.tools:check`.
   - Place it immediately after `node tests/coordinate-source-contract-anchor-trust.test.mjs` and before `npm run audit:places-split-manifest-sync`.
   - Preserve every other script and dependency unchanged.

3. Delete this temporary task file before review.

Validation:

- Both JSON files parse.
- The runtime-guide registry path occurs exactly once.
- All registered paths still exist.
- Every non-empty ownership key is unique.
- The evidence audit occurs exactly once in `tools:check` in the required position.
- `npm run test:coordinate-source-contract`
- `npm run places:coords:evidence:audit`
- Final diff contains only `docs/documentation_registry.json` and `package.json`.
