# Repository hygiene

History GO has accumulated a large amount of historical production evidence, generated reports and agent branches. Repository hygiene must reduce orchestration and storage overhead without weakening factuality, source provenance or regression coverage.

## Canonical rule

Git contains durable product data, source/claim evidence that is part of a product contract, executable contracts, deterministic small reports needed by tests, and documentation.

Transient diagnostics belong in GitHub Actions artifacts. New raw HTML captures, archives, PDFs and other large diagnostic dumps must not be committed under `reports/` unless the path is explicitly reviewed and allowlisted in `.github/ci/repository-hygiene-allowlist-v1.json`.

Changed report artifacts over 500 KiB are rejected by the repository-hygiene gate unless explicitly allowlisted. The gate also prints the largest tracked files in the current tree so growth remains visible. Existing historical files are not retroactively deleted by this policy; removal/history rewriting requires a separate evidence-preservation review.

## CI routing

Domain-specific tests remain permanent but must be routed to affected data. Shared runtime/schema/registry changes run the full relevant matrix. A local content change must not start unrelated People, Quiz, Knowledge or Fagverk subject jobs merely because a broad directory changed.

## Branch lifecycle

Merged same-repository branches under `agent/*`, `automation/*`, `codex/*`,
`data/audit-unsplit-*` and `data/split-*` are disposable working refs.
`.github/workflows/cleanup-merged-agent-branch.yml` deletes the triggering branch
after a successful merge and periodically backfills older branches. Backfill
requires all of the following before deletion: the pull request has `merged_at`,
the head repository is History GO, the ref still exists, the prefix is explicitly
allowlisted and the merge is older than the race-safety window. Open, unmerged,
fork and unknown-prefix branches are never deleted.

## Temporary workflows

TEMP/bootstrap/writeback workflows are not a normal production mechanism. Permanent workflows validate the actual PR head. A temporary workflow is only acceptable for an exceptional migration and must be removed from the final merge head.

On 2026-08-27, 97 historical Place split/audit workflows were retired. Ninety-six
were tied to branches with confirmed merged pull requests; the final workflow
targeted a ref that no longer existed. Their product data, generators, tests and
Git history remain intact. Future split migrations run on an ordinary working
branch and are reviewed through permanent data gates; they do not add a
write-capable workflow per batch.
