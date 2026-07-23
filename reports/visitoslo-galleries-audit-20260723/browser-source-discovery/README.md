# VisitOSLO Galleries — browser source discovery

Date: 2026-07-23

This research pass tested whether the full client-rendered VisitOSLO Galleries category can be recovered reliably with Playwright after the earlier raw HTTP fetch was blocked with 403.

## Result

- The official gallery URL loaded successfully in headless Chromium with HTTP 200.
- The page exposed 38 rendered product-style links and 37 unique TLP ids.
- The captured set is **not** a valid complete gallery-category scope.
- The same broad 38-link pattern appeared on the parent attractions control page.
- The extracted links include unrelated global/navigation recommendations such as Oslo Jazzfestival, Ringnes Brygghus and Mathallen Oslo.
- The first `Vis flere` click failed because the Cookie Information banner intercepted pointer events, so the runner did not prove that the actual gallery listing was fully expanded.

## Conclusion

The browser approach works, but this pass remains a technical discovery result only. It must not be used to claim that the full VisitOSLO Galleries category is closed or completely inventoried.

The next runner should dismiss or neutralize the cookie banner before interaction, isolate links to the actual gallery result container, and capture the exact TellUs/Search response that powers that container. A complete category scope may only be claimed when the result set is reproducible and clearly separated from global page/navigation product links.
