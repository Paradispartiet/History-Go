# People image workflow run 2 root cause

Could not fetch authoritative GitHub Actions diagnostics in this container because `gh` is not installed and both apt and GitHub API requests are blocked by the environment (`gh: command not found`, apt 403, GitHub API 403). The requested diagnostic commands and failures are saved in this report directory.

Based on the checked-in workflow and pipeline at head `e1800a5`, the failure class is **B. Candidate lookup** / **E. empty-batch gate**: the workflow reaches candidate generation, but the pipeline only inspected the first Wikidata search result (`limit=1`) and skipped the person if that single entity lacked P18. The workflow verification intentionally fails if the resulting candidate file is empty.

- Exact failed workflow step: not available from Actions logs in this environment.
- Exact command: expected candidate command is `npm run people:images:candidates -- --ids=<workflow input> --limit=<workflow input>` followed by verification.
- Exit code: workflow summary reported exit code 1; local GitHub log unavailable.
- First relevant failure message: not available from Actions logs in this environment.
- Network check: unavailable from artifact; local GitHub API/apt were blocked, npm was available.
- npm ci: passed locally.
- typecheck/build: passed locally.
- tests: regression test initially reproduced skipped-first-result behavior and now passes.
- input validation: not available from artifact; checked-in default IDs exist once in manifest.
- people attempted: default workflow selects 10 IDs.
- candidates written: unavailable from artifact; empty candidate output is the guarded failure mode.
- lookup errors: unavailable from artifact.
- location of bug: candidate lookup. The workflow's empty-batch gate should remain.

Fix: search up to five Wikidata hits in English and Norwegian, verify non-explicit matches are human (P31=Q5), continue past human entities without P18, and prefer explicit `person.wikidataId` when present.
