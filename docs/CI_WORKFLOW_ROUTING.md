# CI workflow routing

History GO routes pull-request validation by the canonical source files that can
affect each domain. Generated, repository-wide Fagverk outputs must not fan out
into every domain workflow.

## Binding rules

- Domain workflows listen to their own `data/fag/<domain>/**` and
  `data/fagverk/<domain>/**` inputs, plus their own scripts, tests and reports.
- `data/fagverk/fagverk_registry.json`, `subject_status.json` and
  `fagverk_release.json` are owned by central integrity workflows.
- `data/fag/fag_manifest.json` is owned by the central general-engine,
  inventory, phase-3 and release gates.
- Fagverk pull-request validation is read-only. A workflow must fail with the exact
  deterministic command needed to repair stale generated files; it must never
  commit or push a replacement head.
- Fagverk pull-request workflows cancel stale runs when a newer head is pushed.

The permanent `CI workflow routing governance` check enforces these rules.

## Baseline and target

The Freia production pull request started 68 ordinary workflows. Forty-eight
were triggered only by the global Fagverk manifest/release outputs. Those runs
used 23.5 of 41.1 runner-minutes, including 15 minutes of checkout and setup.

This routing policy preserves the central whole-architecture checks and every
domain's own tests while preventing unrelated domain suites from running on a
place-only change.
