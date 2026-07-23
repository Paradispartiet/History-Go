# VisitOSLO source-family master status

Date: 2026-07-23

## Area-series status

The current VisitOSLO area index contains nine visitor-oriented areas. The History Go completeness series now has a durable closure for all nine.

| VisitOSLO area | Final closure |
|---|---|
| Oslo sentrum | PR #2804 — `VisitOSLO City Centre` closure |
| Oslo vest | PR #2749 |
| Oslo øst | PR #2966 |
| Grünerløkka | PR #3034 |
| Bygdøy | PR #3048, supported by PR #3047 |
| Aker Brygge & Tjuvholmen | PR #3052 |
| Bjørvika | PR #3430, after production PR #3080 |
| Oslofjorden | PR #3120 |
| Holmenkollen | PR #3150 |

Status: **9 / 9 current area sources formally closed.**

The master audit therefore must not restart another area pass unless VisitOSLO materially changes an area's bounded source list and the new rows are explicitly treated as a delta audit.

## Thematic source families

### Museums / visitor museum list

Status: **research complete and production complete**.

The durable closure report from the museum pass states:

- all 18 approved new candidates were produced;
- the coordinate and representation decisions are closed;
- there is no remaining approved production backlog from the reviewed museum source set.

Primary closure: PR #2584 and `reports/oslo-museum-source-completeness-closure-20260720.md`.

Do not reopen this source merely because a museum appears again in an area, gallery or broad attractions list.

### Parks / natural attractions

Status: **scope closed; production chain exists; no single final thematic closure found yet**.

PR #3144 closed the first 30 visible rows with:

- 17 already covered;
- 3 outside Oslo;
- 7 distinct new physical places approved;
- 3 canonical identity migrations required instead of duplicate new places;
- 0 unresolved scope decisions.

Known downstream production includes the coordinate-intake chain and later parent/migration work, including PRs #3146, #3178 and #3180.

Decision: do **not** start a competing parks/nature audit. The correct follow-up is to reconcile the current production chain and write one final thematic closure when all approved candidates and migrations are confirmed on current `main`.

### Galleries

Status: **next unstarted systematic VisitOSLO source family**.

Current official source:

`https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/attraksjoner/galleri/`

A repo-wide PR-history search found no dedicated systematic VisitOSLO Galleries completeness audit or final closure.

This source cannot be treated as a naive list of new place candidates. Existing policy decisions must be reused:

- Oslo West already deferred private/commercial gallery listings rather than selecting them arbitrarily.
- Aker Brygge & Tjuvholmen deferred six commercial/private gallery listings under the same policy.
- Fineart Oslo was explicitly deferred in the completed museum-source pass pending a systematic commercial-gallery/art-sales venue policy.

The gallery audit must therefore classify every visible source row into at least:

1. existing canonical place;
2. stable public/noncommercial institutional gallery with a potential independent place identity;
3. already-deferred private/commercial gallery under the existing policy;
4. parent/subfeature reuse;
5. closed, moved or status-sensitive venue;
6. unresolved manual-review case.

No gallery should be approved for production merely because it appears on VisitOSLO.

## Master decision

- **Area source series:** closed.
- **Museum thematic source:** closed.
- **Parks/nature thematic source:** do not duplicate; reconcile existing production chain later.
- **Next new systematic source family:** VisitOSLO Galleries.

Status: **READY TO START BOUNDED GALLERY SOURCE SNAPSHOT AND CURRENT-MAIN COVERAGE AUDIT.**
