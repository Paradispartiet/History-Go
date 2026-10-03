# People browser verification after #6123

Runtime baseline: `893b1d4e412bd6d1944767eb979f9b681bec7515`. This work changes tests and CI only.

## Cold-boot request diagnosis

The former smoke test discarded request URLs/error reasons and only checked dashboard/text presence. It listened through browser shutdown. The instrumented replay preserves its 2.5-second observation window and records both network failures and HTTP errors.

On test head `f573c378f075e574704b787438a6f2cb4fc757c9`, [baseline run 37153014437](https://github.com/Paradispartiet/History-Go/actions/runs/37153014437) recorded 78 failed GET requests, all `net::ERR_INSUFFICIENT_RESOURCES`, before close; zero failed requests during close. No uncaught page errors occurred. This classifies the new replay, not every historical request behind the previous count of 72, whose details were never saved.

| Requests | Count | Evidence |
|---|---:|---|
| Authored place files in `data/places/manifest.json` | 73 | Every failed authored place path belongs to the current manifest |
| `data/places/places_index.json` | 1 | Resource failure in the same cold-boot window |
| `js/Civication/ui/CivicationThreeMap.js` | 1 | Required rich-map script failed |
| `data/Civication/map/historyGoPlaceMapping.json` | 1 | Resource failure |
| `data/Civication/map/buildingTypes.json` | 1 | Resource failure |
| `data/Civication/lifestyles.json` | 1 | Resource failure |

There were also 576 HTTP 404 responses (575 before close, one during close). All paths end in `_manifest.json`. `DataHub.preferSiblingSplitManifest` probes these sibling files and catches failure before loading the original place source. These are separate from `requestfailed`; HTTP 404 does not emit that event. The replay does not establish that every fallback completed.

The source path leading to a large fanout is `CivicationCityLayer.render` → `CivicationFriendsEngine.getCityModel` → `CivicationSocialPlaceResolver.loadAllSocialPlaces` → `loadPlaces`. When `window.PLACES` is empty, the resolver calls `Promise.all(files.map(...fetchJson...))` over the **1,546** files in `data/places/manifest.json`, without a concurrency bound. This is the leading explanation for resource saturation; the captured browser error establishes resource exhaustion, while the source inspection identifies the unbounded producer. A future runtime fix needs its own cold-boot comparison.

A separate cold replay with `civicationLite=1` also failed: 86 resource failures, including `civicationMailEngine.js`; engine, catalog, selector and NextAction UI remained absent after 30 seconds. Disabling rich-map scripts does not remove this social-place fanout. See [run 37153753999](https://github.com/Paradispartiet/History-Go/actions/runs/37153753999).

## People regression scope

The People replay uses the normal `Civication.html` bootstrap with the existing `window.PLACES` cache seeded from the exact repository `data/places/places_index.json` (1,533 entries at this baseline). This bypasses the unrelated social-place fanout through its supported cache branch. No production function or network response is replaced. The independent cold-boot run remains unseeded and continues reporting the failures.

Controlled saved-game data selects the reviewed Munch mail through the real SceneCatalog, RoleModelRuntime, WorkdayMailBuilder, MailEngine, NextActionSelector and NextActionUI. Assertions cover the exact reviewed claim, reason, question, source URL and application limit; a real click switches to the dilemma question. Negative scenarios cover an unrelated collected artist, explicit empty binding, old category-only saved mail, and collection reset. Saved mails retain answer choices. Collection comparisons use the known seed from before production code executes.

This is a browser regression for controlled saved-game scenarios with a prepared canonical place cache. It does not prove cold-boot health, career unlocks, a full player journey, or editorial coverage beyond the existing six-role/90-mail audit. Chromium execution evidence and the six-part quality assessment are recorded in PR #6124 after CI completes; no complete status is implied by this report alone.

Every baseline run uploads `civication-browser-diagnostics`: full request URLs/reasons, HTTP statuses, People diagnostics and linked/failure screenshots. Reproduce with `npm install`, `npx playwright install --with-deps chromium`, and `npm run civication:boot-smoke` from the repository root.
