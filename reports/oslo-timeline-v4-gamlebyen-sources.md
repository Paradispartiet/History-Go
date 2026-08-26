# Oslo timeline v4 — Gamlebyen source audit

Reviewed: 2026-08-26
Base: `4119e5e8fe1467508b647ef81cf7cbe55c2a836a`

## Scope

This tranche closes three actual `awaiting_source_backed_history` gaps without changing canonical Place payloads, runtime payloads, validation thresholds, Lisboa data or approximate dates.

### Clemenskirkeruinen

Materialized exact chronology anchors:

- 1920 — Gerhard Fischer's archaeological excavation phase began; Oslo byleksikon dates the work to 1920–1921.
- 1970 — Ole Egil Eide's later excavation phase began; Oslo byleksikon dates it to 1970–1971.
- 2000 — Oslo kommune states that Middelalderparken was established for the millennium celebration with the opening of Vannspeilet and the Clemenskirken ruins.

Explicit exclusion: canonical `year: 1135` is a technical midpoint for an approximate 1130s–1140s dating and is not materialized as exact evidence. Graves described as around year 1000 are likewise not converted into an exact timeline year.

Sources:

- https://oslobyleksikon.no/side/Clemenskirken
- https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/lokaliteter/items/51949?f=json
- https://www.oslo.kommune.no/slik-bygger-vi-oslo/middelalderbyen/

### Minneparken

Materialized exact chronology anchors:

- 1932 — official opening of Minneparken to the public.
- 2024 — work to expand the park and remove the concrete cover over parts of St. Hallvardskatedralen began in June 2024.

Explicit exclusion: the road intervention is described by Oslo kommune as occurring in the 1960s and is not converted into an invented single year.

Sources:

- https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/minneparken/
- https://www.oslo.kommune.no/slik-bygger-vi-oslo/middelalderbyen/

### Saxegården

Materialized exact chronology anchors:

- 1334 — the documented historical period for the first Saxegården begins; Oslo kommune and Oslo byleksikon describe the site as documented from 1334 to 1414.
- 1624 — the medieval building burned in the city fire.

Explicit exclusion: later building dating is not needed for this tranche, so the timeline does not resolve the canonical wording "omkring 1800" into a more precise claim.

Sources:

- https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/saxegarden/
- https://oslobyleksikon.no/side/Saxeg%C3%A5rden

## Expected coverage delta

- canonical Oslo places: 567 (unchanged)
- dated evidence: 183 → 186
- documented cases: 2 (unchanged)
- awaiting source-backed history: 382 → 379
- new exact chronology milestones: 7
