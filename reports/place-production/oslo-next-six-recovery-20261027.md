# PR #6622 recovery checkpoint — 27 October 2026

Base/head at recovery: 65666c566a4e9d102fd0f67f63d480e2bf0afe5c.
Scope: Kontraskjæret, Paléhaven/Paleet, avisen Tiden, Egertorget, Mustadgården, Wessels plass. Oslo-bolk 04 is excluded.

Previous local implementation and tests were lost before the remote branch was updated. Those test results do not certify the current remote files.

Remaining work:
1. Recover source-reviewed fullquiz, briefs, contexts and QuizCards, preserving known source disagreements and avoiding year drilling.
2. Regenerate Knowledge using the existing builder. The generated registry exceeds the connector's 16 MiB transport limit; a temporary branch-scoped workflow performs this exact rebuild in GitHub.
3. Correct five existing description texts in a separate description PR with v4.2 source packets; preserve Wessels plass's already improved prose.
4. Integrate current main, regenerate derived files, run ordinary CI, full real-app quiz and visual acceptance.
5. Remove the temporary materialization workflow before merge, review all six quality dimensions, merge and verify Pages.

No completion, v1 approval or merge-readiness is claimed by this checkpoint.
