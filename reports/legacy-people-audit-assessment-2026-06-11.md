# Legacy people-audit assessment (2026-06-11)

## Recommendation

**delete later** — do not TypeScript-migrate `tools/audit-people-split-vs-legacy.mjs` now.

The split-vs-legacy audit has mostly served its transition purpose. The committed audit report shows `onlyInLegacy: 0`, with only four relation-only legacy stubs left in `data/people.json`, while runtime people loading already uses `data/people/manifest.json`. The tool is not wired into `package.json`; it is a manual report generator that rewrites `reports/people-split-vs-legacy.{json,md}`.

## Findings

- `tools/audit-people-split-vs-legacy.mjs` compares legacy `data/people.json` with manifest-listed split files under `data/people/` and writes `reports/people-split-vs-legacy.json` plus `reports/people-split-vs-legacy.md`.
- `package.json` has no script entry for `audit-people-split-vs-legacy.mjs` or `people-split-vs-legacy`, so the tool is not part of the normal npm validation path.
- `reports/people-split-vs-legacy.md` is still useful as historical documentation/worklist evidence, but the current report says there are no IDs only in legacy. It no longer looks like an active migration worklist.
- `js/boot.js` and `js/boot-fast.js` load runtime people from `data/people/manifest.json`, not directly from `data/people.json`.
- `DataHub.loadPeopleBase()` still fetches `data/people.json`, and `DataHub.loadPeople()` is still a backwards-compatible alias to it.
- Active call sites still reach `DataHub.loadPeopleBase()` from profile/story-resolution code. This means `data/people.json` is still a runtime compatibility source even though boot uses split files.
- Other non-split references to `data/people.json` still exist: `notater.html`, `tools/buildTags.js`, `scripts/audit-wonderkammer-data.mts`, and the top-level app `manifest.json` data list.

## Practical value now

The current value is low and transitional:

1. It can still verify that legacy-only IDs do not reappear before `data/people.json` cleanup.
2. It is not a modern runtime-health audit because runtime loads split files through the manifest while the tool focuses on legacy parity.
3. It produces generated reports, so TypeScript migration would preserve a report-writing workflow rather than remove the remaining legacy runtime dependencies.

## Suggested follow-up PRs

1. **Runtime/source cleanup PR:** map every remaining `data/people.json` consumer and replace active runtime/tool consumers with manifest-based people loading where appropriate. This is broader than `DataHub.loadPeopleBase()` because direct consumers remain outside DataHub.
2. **People-audit cleanup PR:** after the remaining consumers are either migrated or explicitly documented as legacy/stub-only, remove or archive `tools/audit-people-split-vs-legacy.mjs` and decide whether `reports/people-split-vs-legacy.{json,md}` should stay as historical documentation or move to an archive location.
3. **Optional smaller modern audit:** if a guard is still needed, replace the legacy parity audit with a smaller manifest-oriented check: manifest files exist, split IDs are unique, relation-only stubs are explicitly allowed, and no active runtime path reads `data/people.json` unexpectedly.

## Scope notes

- No TypeScript migration was done.
- No data changes.
- No runtime changes.
- No Civication changes.
- No sport/place-manifest changes.
