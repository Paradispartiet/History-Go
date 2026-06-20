# TypeScript Node-only candidates after PR #1359

Scope: audit of remaining `tools/*.mjs`, `tools/*.js`, `scripts/*.mjs`, and `scripts/*.js` after the coordinate-audit TypeScript batch. The coordinate candidate generator is deliberately excluded and was not inspected for migration or changed.

Preflight validation before this audit:

- `npm run typecheck` — passed
- `npm run typecheck:scripts` — passed
- `npm run build:scripts` — passed
- `npm run typecheck:tools` — passed
- `npm run build:tools` — passed

## Explicitly out of scope

| File | Reason |
| --- | --- |
| `tools/generate-place-coordinate-candidates.mjs` | Coordinate-candidate generator is under active remediation and must not be migrated in this batch. |
| `js/**` | Browser/Civication runtime scope, excluded from this Node-only audit. |
| `scripts/*civication*.js`, `scripts/*civication*.mjs` | Civication runtime/audit surface, excluded by task scope and tsconfig guard exclusions. |
| Browser files, service worker, HTML/CSS/data | Not part of Node-only TypeScript migration candidate scope. |

## Candidate matrix

| File | Current extension | Package script | Node-only | Browser globals | Writes files | Network / external API | Safe to migrate now | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `tools/apply-verified-coordinate-candidates.mjs` | `.mjs` | none | Yes | No | Yes, updates place JSON unless `--dry-run` | No | No | Coordinate-candidate application path; defer with coordinate pipeline. |
| `tools/apply_place_image_candidates.mjs` | `.mjs` | none | Yes | No | Yes, writes JSON and image files | Yes, downloads image URLs | No | External network and data/image writes make this unsuitable for a small safe batch. |
| `tools/audit-litteratur-legacy-cleanup.mjs` | `.mjs` | none | Yes | No | Yes, writes JSON and Markdown reports | No | Later | Stable audit script but writes substantial reports; suitable as a later report-writer batch. |
| `tools/audit-people-invalid-place-refs.mjs` | `.mjs` | none | Yes | No | Yes, writes JSON and Markdown reports | No | Later | Stable Node audit; good candidate after report-writer conventions are agreed. |
| `tools/audit-people-of-places-status.mjs` | `.mjs` | none | Yes | No | Yes, writes JSON and Markdown reports | No | Later | Stable Node audit; larger report surface. |
| `tools/audit-people-place-coverage.mjs` | `.mjs` | none | Yes | No | Yes, writes JSON and Markdown reports | No | Later | Stable Node audit; larger report surface. |
| `tools/audit-place-data.mjs` | `.mjs` | none | Yes | No | Yes, writes Markdown and worklist JSON | No | Later | Place-data report/worklist writer; defer to report-writer batch. |
| `tools/buildTags.js` | `.js` | none | Yes | No | No | No | Yes | Small read-only CommonJS helper; best next tiny migration if still used. Verify consumers/import style first. |
| `tools/build_nature_place_candidates.mjs` | `.mjs` | none | Yes | No | Yes, writes candidate data | Yes, Artsdatabanken API | No | External API and generated candidate output; defer. |
| `tools/build_nature_place_candidates_v2.mjs` | `.mjs` | none | Yes | No | Yes, writes candidate data | Yes, Artsdatabanken API | No | External API and generated candidate output; defer. |
| `tools/build_place_image_candidates.mjs` | `.mjs` | none | Yes | No | Yes, writes candidate JSON | Yes, Wikidata/Commons APIs | No | External APIs and generated candidate output; defer. |
| `tools/check-place-emne-links.mjs` | `.mjs` | none | Yes | No | No | No | Yes | Read-only validation script; strong next migration candidate. Add to tools tsconfig and, if a package script is added later, point to `dist/tools/check-place-emne-links.mjs`. |
| `tools/fetch-place-coordinate-sources.mjs` | `.mjs` | none | Yes | No | Yes, writes cache and reports | Yes, Nominatim/OpenStreetMap | No | Coordinate-source/candidate-adjacent network fetcher; defer with coordinate pipeline. |
| `tools/validate_nature_maps.mjs` | `.mjs` | none | Yes | No | No | No | Yes | Read-only validation script; good small migration candidate with low runtime risk. |
| `scripts/auditJobKnowledgeRequirements.js` | `.js` | `audit:job-knowledge-requirements` | Yes | No | No | No | No | Used inside Civication validation flow; defer with Civication/runtime-adjacent work. |
| `scripts/auditJobLearningProfiles.js` | `.js` | `audit:job-learning-profiles` | Yes | No | No | No | No | Used inside Civication validation flow; defer with Civication/runtime-adjacent work. |

## Deferred Civication scripts

These files match the requested discovery glob, but are excluded from migration consideration because they are Civication runtime/audit surface:

- `scripts/audit-civication-building-types.mjs`
- `scripts/audit-civication-city-map-entries.mjs`
- `scripts/audit-civication-historygo-map.mjs`
- `scripts/audit-civication-historygo-place-mapping.mjs`
- `scripts/civication-badge-role-audit.mjs`
- `scripts/generate-civication-mails.js`
- `scripts/validate-civication-avdelingsleder-mails.js`
- `scripts/validate-civication-daily-task-gates.js`
- `scripts/validate-civication-finance-mails.js`
- `scripts/validate-civication-finance-rolemodels.js`
- `scripts/validate-civication-mails.js`
- `scripts/verify-civication-assets.js`
- `scripts/verify-civication-boot-smoke.js`
- `scripts/verify-civication-json.js`

## Recommended next batch

1. `tools/check-place-emne-links.mjs` — read-only Node validation script, no package script currently points to it, no browser globals, no external API, no data writes.
2. `tools/validate_nature_maps.mjs` — read-only Node validation script, no package script currently points to it, no browser globals, no external API, no data writes.
3. `tools/buildTags.js` — tiny read-only CommonJS helper, but verify whether any runtime expects CommonJS before converting.

## Candidates to postpone

- Coordinate-candidate and coordinate-source files: `tools/generate-place-coordinate-candidates.mjs`, `tools/apply-verified-coordinate-candidates.mjs`, and `tools/fetch-place-coordinate-sources.mjs` should remain untouched until the coordinate pipeline remediation is complete.
- Network/API candidate builders: `tools/apply_place_image_candidates.mjs`, `tools/build_nature_place_candidates.mjs`, `tools/build_nature_place_candidates_v2.mjs`, and `tools/build_place_image_candidates.mjs` should wait for a dedicated network/data-output migration batch.
- Large report/worklist writers: `tools/audit-litteratur-legacy-cleanup.mjs`, `tools/audit-people-invalid-place-refs.mjs`, `tools/audit-people-of-places-status.mjs`, `tools/audit-people-place-coverage.mjs`, and `tools/audit-place-data.mjs` should wait for a report-writer migration batch.
- Civication-adjacent scripts: `scripts/auditJobKnowledgeRequirements.js`, `scripts/auditJobLearningProfiles.js`, and the `scripts/*civication*` files should wait for a Civication-specific migration plan.

## Decision for this PR

No scripts/tools were migrated in this PR. The safest outcome for phase 2c is a precise inventory and next-batch recommendation without touching coordinate-candidate generation, coordinate outputs, data files, browser runtime, or Civication runtime.
