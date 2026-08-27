# Oslo timeline v5: Eastern Gamlebyen source review

Date: 2026-08-27  
Base: `ab71bf0da866fe797a52b9d72847a3fc838cba1f`

## Scope

This tranche closes three genuine Oslo timeline gaps without changing canonical Place files:

- `gamlebyen_gravlund`
- `gamlebyen_kirke`
- `galgeberg`

Only exact, source-backed chronology anchors are materialized. Approximate or inferred dates remain prose and are explicitly excluded from the generated timeline.

## Reviewed anchors

| Place | Exact anchors | Evidence |
| --- | --- | --- |
| Gamlebyen gravlund | 1874, 1894, 1925, 1961 | Municipal cemetery consecration, two name changes, administrative merger |
| Gamlebyen kirke | 1794, 1796, 1939 | Fire, consecration of the current church, reopening after restoration |
| Galgeberg | 1197, 1240, 1745, 1934 | Two medieval events, mapped gallows and wheel, street-name resolution |

## Explicit exclusions

- The old unsourced `1880` metadata for Gamlebyen gravlund is removed and regression-tested.
- Galgeberg's broad canonical `1600` representation is not treated as exact historical evidence.
- No exact medieval start year is invented for either the hospital cemetery or the execution site.
- The standing Gamlebyen church is kept distinct from earlier medieval church and monastery layers.

## Sources

- [Oslo kommune – Gamlebyen gravlund](https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/gamlebyen-gravlund/)
- [Oslo byleksikon – Gamlebyen gravlund](https://oslobyleksikon.no/side/Gamlebyen_gravlund)
- [Oslo Hospital – Gamlebyen kirke](https://www.ekebergveien1.no/gamlebyen-kirke/)
- [Oslo byleksikon – Gamlebyen kirke](https://oslobyleksikon.no/side/Gamlebyen_kirke)
- [Oslo byleksikon – Galgeberg](https://oslobyleksikon.no/side/Galgeberg)

All pages were reviewed on 2026-08-26.

## Coverage effect

- 11 new exact timeline anchors
- Oslo dated-evidence coverage: 197 → 200 places
- Oslo awaiting-source-backed-history backlog: 383 → 380 places
