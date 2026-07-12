# Run #5 root-cause notes

## Run metadata requested

- Repository: `Paradispartiet/History-Go`
- Workflow: `Build people image candidates` (`build-people-image-candidates.yml`)
- Run number: `#5`
- Head SHA prefix: `9da09db`
- Report directory: `reports/people-image-workflow-run-5`

## Log and artifact retrieval status

The GitHub CLI is not installed in this container (`gh: command not found`), so the requested `gh run list`, `gh run view`, `gh run view --log`, `gh run view --log-failed`, and `gh run download` commands could not retrieve run #5 logs or artifacts here. A direct unauthenticated GitHub API attempt was also blocked by the environment proxy with `Tunnel connection failed: 403 Forbidden`.

Because the run log and artifact could not be fetched from this environment, the exact observed run #5 log line cannot be quoted from the artifact. The workflow code was inspected instead to identify and harden the only newly enabled publishing path: `Open draft PR for candidate batch`.

## Workflow progress checklist

The user-provided run comparison says run #4 used the same candidate input without `open_draft_pr` and was green, while run #5 failed only after `open_draft_pr` was enabled. Based on that and the workflow step order, the candidate pipeline likely completed before the failure:

- Network check: likely passed before candidate generation.
- `npm ci`, typecheck, build, and people-image tests: likely passed before candidate generation.
- Input validation: likely passed.
- Candidate file generation: likely completed.
- Verifier: likely green, because the draft PR step only runs after verification and diff-boundary steps.
- Diff-boundary step: likely green.
- Upload artifact step: user reports artifact count `1`, so reports/candidate output were uploaded.
- First failure area: `Open draft PR for candidate batch`.

## Suspect publishing commands checked

The previous draft-PR step:

- Created `automation/people-image-candidates-${{ github.run_id }}`.
- Staged the candidate and two verification reports with plain `git add`.
- Used `git diff --cached --quiet` only after staging.
- Pushed with `git push origin "$branch"` instead of setting upstream from `HEAD`.
- Created the draft PR with `gh pr create --draft` and `GH_TOKEN: ${{ github.token }}`.

The minimal hardening now:

- Refuses to overwrite a same-name automation branch.
- Checks that `data/people/people_image_candidates.json` changed before committing.
- Stages exactly the allowed candidate file plus the two verification reports.
- Uses `git add -f` for the two report files so local/global ignore rules cannot hide them.
- Verifies the staged file set.
- Pushes with `git push --set-upstream origin HEAD`.
- Wraps push/PR creation failures with targeted messages that say candidate generation and verification already completed, and includes the exact repository setting required if Actions is blocked from creating PRs.

## Candidate safety invariants preserved

No candidate approval, image download, apply step, license gate, identity gate, Commons/Wikimedia source requirement, or empty-batch gate was changed.
