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
  inputs. After a Fagverk PR is confirmed merged, it checks out the exact merge
  SHA and dispatches the committed release digest to AHA-EchoNet.
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
composed repository state after merge: CI routing, generated web runtime, place
indexes, canonical Knowledge data and the Fagverk release manifest. It listens to
both `main` pushes and closed, merged pull requests, locks checkout to the merge
SHA and deduplicates both event paths by that SHA.

Validation and mutation use separate event paths:

- `coordinate-branch-runner.yml` runs only on pushes to dedicated one-shot
  coordinate branches (or an explicit manual dispatch); it never executes
  pull-request code with a write-capable token.
- `fagverk-release.yml` validates active Fagverk pull requests read-only and
  dispatches only after the same PR is confirmed merged.

Every active pull-request workflow has a concurrency group and cancels stale
runs. Closed-PR cleanup and post-merge finalization are not active pull-request
validation workflows.

## Measured routing budgets

The permanent audit simulates representative production changes and rejects a
regression above the budget.

| Production change | Before | Current | Budget |
| --- | ---: | ---: | ---: |
| Full place production | 20 | 9 | 16 |
| Utdanning subject production | 46 | 12 | 12 |
| Oslo Micro Place production | 26 | 13 | 16 |

At the repository level, 84 workflows previously combined pull-request and push
validation. No active pull-request workflow does now. Twenty-six active
pull-request workflows lacked stale-run cancellation; none do now.

`CI workflow routing governance` runs for every workflow, routing-audit or policy
documentation change and enforces ownership, cancellation, duplication rules and
the production fan-out budgets above. It also rejects the return of completed
`split-*` writeback workflows; historical migrations belong in Git history, not
the permanent Actions inventory.

Helse og Utdanning deler én registry-drevet domenegate. Fagspesifikke endringer
velger bare berørt registry; delte kontrakter validerer begge i samme jobb og
kjører de felles Fagverk-auditene én gang.
