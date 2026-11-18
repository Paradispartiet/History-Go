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

## Civication: rask utvikling, full sluttkontroll

Civication-PR-er skal normalt opprettes som **utkast**. På hvert push til et utkast
kjører en rask CI-sjekk av endrede Civication-artefakter og relevante
rolletester. For renholder sjekkes også aktiv stilling/gjenoppretting og
dag-8/9-scenene. TypeScript, kontolagring og dokumentasjonskontroller beholder
sine eksisterende filbaserte utløsere.

De tre tunge arbeidsflytene (full Civication-regresjon, Civication browser
smoke og seks renholder-nettleserløp) kjøres **ikke på hvert draft-push**.
Når PR-en markeres **Ready for review**, kjører alle relevante tunge kontroller.
Et nytt push til en allerede klar PR kjører dem på nytt. Manuell dispatch og
planlagt nattkjøring beholder full testdybde. In-progress-jobber fra eldre
commits avbrytes med eksisterende concurrency-policy.

**Merge-regel:** Ikke merge fra utkast, eller med feilende eller ventende
sluttkontroller. Alle påkrevde resultatene skal gjelde siste HEAD. Draft-gaten
erstatter aldri sluttkontrollen; den gir bare tidligere, rimeligere feedback.
Ikke synkroniser med `main` bare fordi en irrelevant commit har kommet, med
mindre merge-regel/konflikt krever det.

## PlaceCard and By v1: fast drafts, full browser review

`placecard-media-browser-audit.yml` and `by-v1-twenty-app-qa.yml` use the same
two-stage model as Civication. While a PR is a draft, lightweight checks run
on every relevant push: PlaceCard JavaScript syntax, controller restoration and
the 16 Oslo v1 QuizCard bindings; or the 11 canonical By quiz and card sets.
This keeps immediate functional feedback without downloading Chromium or
launching the long PlaceCard / 20-place browser suites for every draft update.

Marking the PR **Ready for review** triggers the full relevant browser suite,
as do any subsequent pushes to that ready PR. Manual workflow dispatch still
runs the complete suite. Conversion back to draft cancels obsolete browser runs
and restores the focused draft check. No assertion has been removed from the
full browser jobs, and a draft PR cannot be merged.

**Merge rule:** Do not accept a ready PR unless all required full browser jobs
on its latest head are green, including every shard of By v1 and the real
PlaceCard composition checks. The routing governance audit protects the event
triggers and job gates so these checks cannot silently disappear.

## TypeScript guard: metadata versus runtime changes

The TypeScript scope classifier lives in `scripts/ci-typescript-scope.mjs`
with executable contract tests in `tests/ci-typescript-scope.test.mjs`.
Workflow configuration (other than `typescript-guard.yml` itself) and this
routing document are **not** shared-UI runtime changes. Edits to routing scripts
still run script typechecks and builds but no longer spuriously run the
Place-open UI regression.

Changes to `typescript-guard.yml` itself, package manifests and unknown source
paths retain conservative full-gate behavior. Actual browser/UI source changes
still require web, shared-UI and legacy checks as before. The scope job runs its
contract test before selecting gates, preventing silent omissions.

## Pull requests versus main

Read-only validation runs on pull requests. `main-integrity.yml` then verifies the
composed repository state after merge: CI routing, generated web runtime, place
indexes, canonical Knowledge data and the Fagverk release manifest. It listens to
both `main` pushes and closed, merged pull requests, locks checkout to the merge
SHA and deduplicates both event paths by that SHA.

Validation and mutation use separate event paths:

- Every active pull-request workflow declares `contents: read` at workflow level.
  The routing audit rejects missing or workflow-wide write permission.
- `coordinate-branch-runner.yml` runs only on pushes to dedicated one-shot
  coordinate branches (or an explicit manual dispatch); it never executes
  pull-request code with a write-capable token.
- `fagverk-release.yml` validates active Fagverk pull requests read-only and
  dispatches only after the same PR is confirmed merged.
- `build-nature-place-candidates.yml` validates maps and produces its artifact
  read-only. Only its manually requested, artifact-dependent publish job receives
  `contents: write`; pull-request code cannot enter that job.

Every active pull-request workflow has a concurrency group and cancels stale
runs. Closed-PR cleanup and post-merge finalization are not active pull-request
validation workflows.

## Measured routing budgets

The permanent audit simulates representative production changes and rejects a
regression above the budget.

| Production change | Before | Current | Budget |
| --- | ---: | ---: | ---: |
| Full place production | 20 | 9 | 16 |
| Utdanning subject production | 46 | 11 | 12 |
| Oslo Micro Place production | 26 | 13 | 16 |

At the repository level, 84 workflows previously combined pull-request and push
validation. No active pull-request workflow does now. Twenty-six active
pull-request workflows lacked stale-run cancellation; none do now.

`CI workflow routing governance` runs for every workflow, routing-audit or policy
documentation change and enforces ownership, cancellation, duplication rules and
the production fan-out budgets above. It also enforces read-only pull-request
tokens and rejects the return of completed
`split-*` writeback workflows; historical migrations belong in Git history, not
the permanent Actions inventory.

Helse og Utdanning deler én registry-drevet domenegate. Fagspesifikke endringer
velger bare berørt registry; delte kontrakter validerer begge i samme jobb og
kjører de felles Fagverk-auditene én gang.
