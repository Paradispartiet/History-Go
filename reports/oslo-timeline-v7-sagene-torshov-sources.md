# Oslo timeline v7: Sagene and Torshov source review

Date: 2026-08-27
Base: `e1d374919fe243114efabc28bb139ea69e7b681f`

## Scope

This tranche closes three source-backed Oslo timeline gaps without changing canonical Place files:

- `sagene`
- `torshov`
- `torshovparken`

The review separates exact events from centuries, decades, intervals and general background. Only exact, claim-near chronology anchors are materialized.

## Reviewed anchors

| Place | Exact anchors | Evidence |
| --- | --- | --- |
| Sagene | 1629, 1687, 1859 | Vøyen farm becomes city common land, Bentse Brug is established, and eastern Sagene is incorporated into Christiania |
| Torshov | 1878, 1916, 1917, 1930, 1958 | City incorporation, municipal land purchase, start of Torshovbyen construction, separate parish and church inauguration |
| Torshovparken | 1916, 1924, 1928, 1931, 1942, 2002 | Municipal land purchase, park plan, children's sculpture, official opening, wartime allotments and Jolly Kramer-Johansen bust |

## Explicit exclusions

- Sagene's 1300s settlement traces, 1500s sawmill community, industrial growth from the 1840s and rehabilitation in the 1980s remain period context rather than invented exact years.
- Torshovbyen is documented as built during 1917–1925. The exact 1917 start is materialized; 1925 is not separately presented as a sourced completion event.
- Torshovparken's general use for food production during the occupation is not converted into a 1940 anchor. The separately documented allocation of private plots from 1942 is used instead.
- No canonical Place files are changed, and no neighborhood event is reassigned to a building-only Place.

## Sources

- [Oslo byleksikon – Sagene (strøk)](https://oslobyleksikon.no/side/Sagene_%28str%C3%B8k%29)
- [Oslo byleksikon – Torshov (strøk)](https://oslobyleksikon.no/side/Torshov_%28str%C3%B8k%29)
- [Oslo byleksikon – Torshovparken](https://oslobyleksikon.no/side/Torshovparken)
- [Oslo byleksikon – Parker og grøntanlegg](https://oslobyleksikon.no/side/Parker_og_gr%C3%B8ntanlegg)
- [Oslo byleksikon – Historisk oversikt](https://oslobyleksikon.no/side/Historisk_oversikt)
- [Oslo kommune – Torshovparken](https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/torshovparken/)

All pages were reviewed on 2026-08-27.

## Coverage effect

- 14 exact timeline anchors
- Oslo dated-evidence coverage: 203 → 206 places
- Oslo awaiting-source-backed-history backlog: 377 → 374 places
- Generated History index: 252 places and 910 milestones

## Six-part quality review

| Dimension | Score | Review |
| --- | ---: | --- |
| Correctness and evidence | 5/5 | Every materialized year has claim-near city-lexicon evidence; century, decade and unsupported interval endpoints fail closed. |
| Coverage and completion | 5/5 | All three selected places have source text, chronology, runtime materialization and permanent regression coverage. |
| Editorial quality | 4/5 | The prose distinguishes neighborhood formation, municipal housing and park history; no separate external editorial peer review was performed. |
| Technical integrity | 5/5 | Deterministic builders and all relevant local gates pass on the complete diff. |
| Safety and responsibility | 5/5 | Municipal expansion, housing policy and occupation history are described neutrally without speculative personal claims. |
| Maintainability and auditability | 5/5 | Stable chronology IDs, exact sources, explicit exclusions and deterministic artifacts make the tranche reproducible. |
| **Total** | **29/30** | High quality; no unresolved blocker remains after the verification below. |

## Verification

- `npm run epoker:places:check`
- `node --test tests/epoke-viewer.test.mjs tests/epoker-runtime-place-index.test.mjs tests/epoke-place-index.test.mjs` — 30/30
- `npm run place-open:check` — 1529 payloads
- `npm run test:place-open` — 4/4
- `npm run leksikon:ids:check`
- `npm run typecheck:web`
- `npm run build:web:check`
- `git diff --check`
