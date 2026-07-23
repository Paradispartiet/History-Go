# VisitOSLO Galleries — browser source discovery

Date: 2026-07-23

This is a research-only attempt to resolve the full client-rendered VisitOSLO Galleries source after raw Node fetches were blocked with HTTP 403. It creates no canonical place decisions.

Method:
- load the official Galleries page in headless Chromium through Playwright
- allow the page's own client-side JavaScript to run
- capture rendered product/TellUs links
- capture network responses and request payloads whose URLs or content types indicate search/listing/product/API data
- click visible `Vis flere` / `Se flere` / `Load more` controls repeatedly while result counts increase
- run the same capture on the parent attractions page as a control

Result summary:
- gallery navigation status: 200
- rendered gallery product links: 38
- unique gallery TLP ids: 37
- captured gallery API/search-like responses: 13
- parent-page product links: 38

The durable next step is to inspect `gallery-network.json` and `gallery-product-links.json`. A full category scope may only be claimed if the rendered result set or an exact official TellUs response is complete and reproducible.
