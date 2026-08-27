# Oslo timeline v6: Kampen and Klosterenga source review

Date: 2026-08-27
Base: `e7a9e8af67f1f3ab26c014b53464407b6f32dc80`

## Scope

This tranche closes three genuine Oslo timeline gaps without changing canonical Place files:

- `kampen_kirke`
- `kampen_park`
- `klosterenga_skulpturpark`

Only exact, source-backed chronology anchors are materialized. Approximate dates, interval endpoints that are not described as events, and broad area history remain prose.

## Reviewed anchors

| Place | Exact anchors | Evidence |
| --- | --- | --- |
| Kampen kirke | 1880, 1882, 1913, 1942, 1975, 1987 | Parish creation, church consecration, interior decoration, occupation-era removal of the parish priest, and two milestones for women in ministry |
| Kampen park | 1885, 1888, 1899, 1913, 1999, 2009 | Municipal purchase, start of park construction, stairs, sculpture unveiling, grotto restoration and stair rebuilding |
| Klosterenga skulpturpark | 1999, 2000, 2019, 2023 | Park construction, first phase, resumed completion work and official inauguration |

## Explicit exclusions

- Kampen's incorporation into the city in 1878 is area history, not a Kampen church milestone.
- The 1885–1886 construction interval for Kampen park's reservoir and keeper's house is not converted into an invented exact completion year.
- The 1888–1895 park-construction interval supplies the documented 1888 start; 1895 is not separately presented as a sourced completion event.
- Klosterenga's broad canonical `1990` representation and the phrase “the 1990s” are not treated as exact historical evidence.
- The 2023 opening is described as completion of the principal art-and-stream project, while preserving the municipality's contemporary note that a smaller downstream section remained.

## Sources

- [Kirkene i Gamle Oslo – Kulturkirken på Kampen](https://www.kirken.no/nn-NO/fellesrad/kirkene-i-gamle-oslo/kirkene-i-gamle-oslo/kampen/virksomhetsomrader/kulturkirke/)
- [Oslo byleksikon – Kampen kirke](https://oslobyleksikon.no/side/Kampen_kirke)
- [Oslo byleksikon – Kampen park](https://oslobyleksikon.no/side/Kampen_park)
- [Oslo kommune – Klosterenga park opens with a public celebration](https://aktuelt.oslo.kommune.no/klosterenga-park-%C3%A5pnes-med-folkefest)
- [Oslo byleksikon – Klosterenga skulpturpark](https://oslobyleksikon.no/side/Klosterenga_skulpturpark)

All pages were reviewed on 2026-08-27.

## Coverage effect

- 16 exact timeline anchors
- Oslo dated-evidence coverage: 200 → 203 places
- Oslo awaiting-source-backed-history backlog: 380 → 377 places

## Six-part quality review

| Dimension | Score | Review |
| --- | ---: | --- |
| Correctness and evidence | 5/5 | Every exact year resolves to a reviewed institutional or city-lexicon statement; interval and area dates fail closed. |
| Coverage and completion | 5/5 | All three selected gaps have source text, chronology, runtime materialization and permanent regression coverage. |
| Editorial quality | 4/5 | Place-specific prose distinguishes buildings, park infrastructure and public art; no separate external editorial peer review was performed. |
| Technical integrity | 5/5 | Deterministic builders and relevant local gates are required before merge. |
| Safety and responsibility | 5/5 | Occupation history and religious/institutional change are presented neutrally, without personal or speculative claims. |
| Maintainability and auditability | 5/5 | Stable chronology IDs, exact sources, explicit exclusions and deterministic artifacts make the tranche reproducible. |
| **Total** | **29/30** | High quality; no unresolved blockers remain after the local verification below. |

## Verification

- `npm run epoker:places:check`
- `node --test tests/epoke-viewer.test.mjs tests/epoker-runtime-place-index.test.mjs tests/epoke-place-index.test.mjs` — 29/29
- `npm run place-open:check` — 1529 payloads
- `npm run test:place-open` — 4/4
- `npm run leksikon:ids:check`
- `npm run typecheck:web`
- `npm run build:web:check`
- `git diff --check`
