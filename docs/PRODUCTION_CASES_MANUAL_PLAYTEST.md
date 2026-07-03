# Production Cases manual playtest notes

Scope: documentation/test-notes only. This note defines the focused manual browser validation path for the stable Production Cases MVP and records what was actually checked in this environment. It does not request or include app logic, UI, routing, scoring, storage, seed data, simulation, career, Production Cases, gameplay, bug-fix, new-case, or Studio Career changes.

## References used

- `docs/PRODUCTION_CASES_MVP_CHECKPOINT.md` — requested reference, but not present in this checkout during this documentation pass.
- `docs/GAME_DIRECTION.md` — requested reference, but not present in this checkout during this documentation pass.
- `docs/GAME_DIRECTION_ALIGNMENT_AUDIT.md` — requested reference, but not present in this checkout during this documentation pass.
- `README.md` current status / entry-point information.
- `games/film-producer/README.md` for the current independent HG Film Producer scaffold status.

## Manual playtest path

### 1. New player path

1. Open the app fresh in a browser with a clean profile or cleared local storage.
2. Confirm the landing screen clearly recommends **Production Cases** first.
3. Click **Start Production Cases**.
4. Confirm the Production Cases library opens.
5. Confirm first-session guidance is visible and clearly points the player toward **Start first case**.

Expected result: a new player should immediately understand that Production Cases is the recommended first action and should not need to discover the feature through secondary navigation.

### 2. First case path

1. Click **Start first case**.
2. Confirm an existing production case opens.
3. Make production choices through every phase/mission in the case.
4. Confirm no case report appears before all missions are complete.
5. Complete the case.

Expected result: the case should remain in action/choice mode until the final mission is complete, with no premature report or completion state.

### 3. Case report path

1. Confirm the **Case report** appears only after completion.
2. Confirm the report shows score, result, and tier.
3. Confirm the report explains matched choices and concrete improvements.
4. Confirm the report supports “learn through action,” not only trivia recall.

Expected result: the report should connect the player's choices to production outcomes and improvement advice, so the player understands why the result happened and what to try next.

### 4. Continuation actions

1. Click **Play again**.
2. Confirm the same case restarts correctly.
3. Confirm existing progress and best result are not wiped.
4. Click **Next case**.
5. Confirm the next case opens, or that the fallback safely returns to the Production Cases library if no next case is available.

Expected result: retry and continuation actions should be safe, understandable, and should preserve meaningful best-result history.

### 5. Returning player path

1. Return to Production Cases after progress exists.
2. Confirm beginner guidance no longer dominates the screen.
3. Confirm the dashboard, **Next Action**, and recent best results make sense for a returning player.
4. Confirm the player understands how to improve from the available report/history/dashboard cues.

Expected result: returning players should see status and improvement-oriented next steps instead of being treated like a first-session player again.

## Known limitations

- Browser-driven manual test completed: **no**. No browser session was launched for this pass; this PR only adds the manual test-notes document and README link.
- Source-level inspection completed: **yes**. The requested documentation references and README/Film Producer scaffold status were inspected, and repository search found no existing Production Cases runtime text in this checkout.
- Automated checks completed: **yes, with failures noted below**. The requested commands were run, but the current `package.json` does not define `build`, `test`, or `build:ui` scripts.

## Result

**BLOCKED: blocking issue found; needs separate fix PR.**

Blocking reason for this playtest gate: browser-driven manual validation was not actually completed in this environment, so the Production Cases MVP path cannot be marked as a v0.1 candidate from this documentation-only pass. This is a validation blockage only; no app behavior bug was fixed or changed here.
