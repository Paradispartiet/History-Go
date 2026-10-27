# PR #6622 – recovery and five-place handoff, 27 October 2026

## Scope and authoritative main

This PR now owns only five *remaining* canonical Oslo Places: `kontraskjaeret`, `palehaven_paleet`, `avisen_tiden_radhusgata_10`, `egertorget`, `mustadgarden_kongens_gate_3`. Wessels plass was finished on main by PR #6637 (merge `6c4a221d`). Its authoritative Place and place-open files have been copied from main to this branch; never re-activate, re-author or overwrite its quiz, Knowledge, Fagverk or images.

Do not modify Oslo-bolk 04. #6643 is the separate five-description v4.2 PR and is not automatically part of this branch.

## Repository-backed progress on this branch

- Five Fagverk/Place candidates and existing media production retained pending integration.
- Five source-reviewed 3×7 quiz packages now exist under `data/quiz/{historie,by}/`, totalling **105** questions. Kontraskjæret/Egertorget were already drafted and reviewed; Paleet, Tiden and Mustadgården are now additional reviewed quiz/brief files.
- The 105-question source/answer consistency audit passed on the current branch: **21/21** per place; **0** duplicate IDs within a target; **0** duplicate question stems across the five; **0** pure year-number answers; **0** missing reviewed brief/source/claim-basis matches; **0** invalid answer indices or duplicate options.
- Scoped integration script and five-place parity test no longer include Wessels plass.
- A temporary, branch-only workflow is configured to call the existing context/Knowledge builders, materialize the five quizcard files, and require the parity test before committing generated artifacts.

## Not yet complete — strict release gates

1. No canonical Knowledge or QuizCard materialization has been confirmed for the newly authored quizzes. No five-place quiz manifest registration or real-app unlock is yet proven. **Do not label any of the five as active/v1.**
2. The temporary workflow has no confirmed successful run on the final SHA; app/CI tests, mobile and desktop image/content review and five full playthroughs still need evidence.
3. Branch diverges from main (72 commits behind at the earlier comparison); reconcile with main, including authoritative Wessels and future #6643 description changes, and rebuild generated Fagverk, places index, epoke and place-open indexes as applicable. No blind overwrite of main.
4. Review quiz variety and image/description evidence after the integration. Remove the temporary scoped workflow before merging.
5. Only then make the PR ready, obtain required green CI, merge and verify GitHub Pages.

This checkpoint records committed quiz and source material, **not** a merged PR, published release, or v1 approval.
