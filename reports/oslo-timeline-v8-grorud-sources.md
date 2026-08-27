# Oslo timeline v8: Grorud source review

Date: 2026-08-27
Base: `8de9114e646efd9c10dbf025e25d315038666408`

## Scope

This tranche closes two source-backed Oslo timeline gaps without changing canonical Place files:

- `grorud`
- `grorudparken`

`groruddammen` and the other established places along the Alna route already carry dated evidence, so they are not padded into this tranche. Groruddammen remains a separate canonical place inside Grorudparken.

## Reviewed anchors

| Place | Exact anchors | Evidence |
| --- | --- | --- |
| Grorud | 1595, 1831, 1846, 1854, 1862, 1867, 1897, 1900, 1902, 1917, 1918, 1947, 1966, 1972 | Farm construction, transport, industry, local institutions, parish status, T-bane opening and the end of the Nyland arsenal period |
| Grorudparken | 2002, 2009, 2011, 2013 | Park vision, documented project start, reopening of Leirfossen and project completion |

## Explicit exclusions

- Evidence of farming at Grorud before 1350 is contextual and not converted into an exact 1350 event.
- General development described as the late 1940s or early 1970s remains period context rather than invented 1940 or 1970 anchors.
- The documented Grorudparken project interval is 2009–2013. Its stated start and completion are materialized; no synthetic 2010 or 2012 midpoint is added.
- Groruddammen remains its own canonical place and does not receive duplicated park-wide chronology.
- No canonical Place files are changed, and no event is reassigned to a nearby stand-in.

## Sources

- [Oslo byleksikon – Grorud (strøk)](https://oslobyleksikon.no/side/Grorud_%28str%C3%B8k%29)
- [Oslo byleksikon – Grorud skysstasjon](https://oslobyleksikon.no/side/Grorud_skysstasjon)
- [Oslo byleksikon – Tunnelbanen](https://oslobyleksikon.no/side/Tunnelbanen)
- [Ruter – I ord og bilder: Grorud](https://ruter.no/om-oss/kollektivhistorien/i-ord-og-bilder-grorud)
- [Oslo kommune – Grorudparken](https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/grorudparken)
- [Oslo byleksikon – Walks+Talks: Grorud Valley Park](https://oslobyleksikon.no/side/Walks%2BTalks:_Grorud_Valley_Park)
- [Architecture Norway – Grorudparken](https://www.architecturenorway.no/projects/culture/grorudparken-2013/)

All pages were reviewed on 2026-08-27.

## Coverage effect

- 18 exact timeline anchors
- Oslo dated-evidence coverage: 206 → 208 places
- Oslo awaiting-source-backed-history backlog: 374 → 372 places
- Generated History index: 254 places and 928 milestones
- Generated place-open payloads: 1529

## Six-part quality review

| Dimension | Score | Review |
| --- | ---: | --- |
| Correctness and evidence | 5/5 | Every materialized year has claim-near evidence from city, transit, municipal or architecture sources; broad periods fail closed. |
| Coverage and completion | 5/5 | Both selected gaps have sourced prose, chronology, runtime materialization and permanent regression coverage. |
| Editorial quality | 4/5 | The prose keeps farm, transport, industrial and park histories distinct; no separate external editorial peer review was performed. |
| Technical integrity | 5/5 | Deterministic builders and all relevant local gates pass on the complete diff. |
| Safety and responsibility | 5/5 | Historical development and public-space changes are described neutrally without speculative personal claims. |
| Maintainability and auditability | 5/5 | Stable chronology IDs, exact sources, explicit exclusions and deterministic artifacts make the tranche reproducible. |
| **Total** | **29/30** | High quality; no unresolved blocker remains after the verification below. |

## Verification

- `npm run epoker:places:check`
- `node --test tests/epoke-viewer.test.mjs tests/epoker-runtime-place-index.test.mjs tests/epoke-place-index.test.mjs` — 31/31
- `npm run place-open:check` — 1529 payloads
- `npm run test:place-open` — 4/4
- `npm run leksikon:ids:check`
- `npm run typecheck:web`
- `npm run build:web:check`
- `git diff --check`
