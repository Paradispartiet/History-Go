# CI workflow routing

History GO routes pull-request validation by canonical ownership. A generated or
repository-wide artifact must have one owner; it must not fan out into every
domain workflow. Assertions remain in the workflows where they protect a domain,
but edits to shared test helpers, reports and builders trigger only their owning
gate.

## Ownership rules

- Domain workflows listen to their own `data/fag/<domain>/**`,
  `data/fagverk/<domain>/**`, scripts, tests and domain-prefixed reports.
- `fagverk-inventory.yml` owns the subject-inventory audit, test and report.
- `fagverk-general-engine.yml` owns the general-engine audit, test and report.
- `fagverk-release.yml` owns the release builder and whole-architecture release
  inputs. It remains a main-push workflow because it dispatches the committed
  release digest to AHA-EchoNet.
- The category contract is owned by the central general-engine and category
  gates, rather than every Fagverk domain.
- Fagverk pull-request validation is read-only. A stale generated artifact fails
  with the deterministic repair command; CI never replaces the pull-request head.

## Product routing

- `data-checks.yml` owns Knowledge, quiz, people and place content integrity.
  `knowledge-checks.yml` owns the browser/UI surface and does not run Chromium for
  content-only changes. Fagverk manifest and canonical emne changes route only to
  the Knowledge content job because canonical Knowledge inference reads them.
- The specialized Civication Scenario People gate owns its generated indexes;
  the full Civication suite excludes those paths.
- Oslo Micro Places listens only to Micro Place source, contract, UI and audit
  paths. Global place indexes, runtime payloads and generic production outputs do
  not trigger it.
- Place Rounds owns its shared UI and explicitly named legacy place contracts.
  Global story, people, brand and place-index outputs do not trigger it.

## Pull requests versus main

Read-only validation runs on pull requests. `main-integrity.yml` then verifies the
composed repository state once after merge: CI routing, generated web runtime,
place indexes, canonical Knowledge data and the Fagverk release manifest.

The only workflows allowed to combine pull requests and pushes are workflows
with a distinct push-side effect:

- `coordinate-branch-runner.yml` mutates dedicated one-shot coordinate branches.
- `fagverk-release.yml` dispatches the committed release digest after a main push.

Every active pull-request workflow has a concurrency group and cancels stale
runs, except the mutating coordinate runner where cancellation could strand a
half-finished branch. The closed-PR cleanup workflow is not a validation workflow.

## Measured routing budgets

The permanent audit simulates representative production changes and rejects a
regression above the budget.

| Production change | Before | Current | Budget |
| --- | ---: | ---: | ---: |
| Full place production | 20 | 9 | 16 |
| Utdanning subject production | 46 | 12 | 12 |
| Oslo Micro Place production | 26 | 13 | 16 |

At the repository level, 84 workflows previously combined pull-request and push
validation. Only the two effectful exceptions remain. Twenty-six active
pull-request workflows lacked stale-run cancellation; none do now.

`CI workflow routing governance` runs for every workflow, routing-audit or policy
documentation change and enforces ownership, cancellation, duplication rules and
the production fan-out budgets above.
