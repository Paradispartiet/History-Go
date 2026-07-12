# People image workflow run 3 diagnostics

The requested GitHub Actions diagnostics could not be fetched from this container, so this report does **not** claim to be the authoritative run #3 log analysis.

## Retrieval status

- `gh auth status`: failed because `gh` is not installed in the container (`gh: command not found`). See `gh-auth-status.txt`.
- `gh run list`: failed because `gh` is not installed in the container (`gh: command not found`). See `run-list.json`.
- Installing `gh` with apt failed because the apt repositories returned HTTP 403 through the environment proxy.
- Direct GitHub API access also failed with `Tunnel connection failed: 403 Forbidden`.
- This checkout has no configured `origin` remote and no GitHub token environment variable was available.

Because of that, the following artifacts were not available: `network-check.txt`, `npm-ci.txt`, `typecheck-tools.txt`, `build-tools.txt`, `tests.txt`, `input-validation.txt`, `candidates.txt`, `verification-log.txt`, `verification.json`, `verification.md`, `git-status.txt`, `diff-stat.txt`, `people_image_candidates.before.json`, and `people_image_candidates.json` from the actual workflow run.

## Authoritative run #3 fields

Unavailable in this environment:

- Exact failed workflow step: unavailable.
- Exact command: unavailable.
- First relevant error message: unavailable.
- Exit code: visible user-provided summary says exit code 1, but the step-local exit source is unavailable.
- Network check: unavailable.
- `npm ci`: unavailable.
- Tool typecheck/build/tests: unavailable.
- Input validation: unavailable.
- Candidate generation: unavailable.
- Candidate count: unavailable.
- Lookup error count: unavailable.
- People with candidates: unavailable.
- People without candidates: unavailable.
- Pipeline vs verifier fault: unavailable from logs/artifact.

## Local schema review performed instead

The checked-in pipeline emits candidate objects with the expected fields: `personId`, `personName`, `sourceFile`, `personIndex`, `pointer`, `wikidataId`, `commonsFileName`, `originalImageUrl`, `commonsPage`, `creator`, `credit`, `license`, `licenseUrl`, `width`, `height`, `approved`, `reason`, and `score`.

The workflow verifier validates this actual format by requiring:

- `approved: false` and never auto-approval.
- a Wikidata ID and Commons filename.
- `commonsPage`/`sourcePage` on `commons.wikimedia.org`.
- image URL on a Wikimedia domain.
- an allowed license family.
- `licenseUrl`.
- at least one of `creator` or `credit`.
- positive width and height.

The local code review found one schema/metadata normalization risk that can make a real otherwise-valid Commons candidate fail verification: Commons `extmetadata` can provide the license link in `License.value` HTML while `LicenseUrl.value` is absent. The pipeline previously copied only `LicenseUrl.value`, producing an empty `licenseUrl` even when the allowed license and legal license URL were present in Commons metadata.

## Implemented local regression target

The regression test added in this branch reproduces that metadata shape: a Commons image with `LicenseShortName: CC BY-SA 4.0`, no `LicenseUrl`, and a `License.value` HTML link to the Creative Commons URL. The pipeline now normalizes `licenseUrl` from `LicenseUrl`, then from `License`, then from known allowed license families when needed.

No candidates were approved. No images were added. No people-data files were changed.
