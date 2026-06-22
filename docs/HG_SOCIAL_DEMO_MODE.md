# HG Social Demo Mode

HG Social Demo Mode is a local-only seed and smoke-test layer for visually verifying the History Go knowledge-graph social layer. It is designed for demo and QA use and does not require backend data.

## Enable demo mode

Set this localStorage flag in the browser console on `profile.html`:

```js
localStorage.setItem("HG_SOCIAL_DEMO_MODE", "1");
location.reload();
```

You can also use the **HG Social Smoke Test** panel on the profile page:

- **Enable Demo Mode** sets `HG_SOCIAL_DEMO_MODE=1` and seeds data.
- **Seed Demo Data** reseeds the local demo objects.
- **Run Smoke Test** runs the end-to-end checks.
- **Clear Demo Data** restores the local social keys that existed before demo mode, then removes the demo flag.

## Seeded data

`js/hgSocialDemoData.js` first snapshots the existing social localStorage keys, then seeds local/mock data only:

- six public demo profiles: Industrial Historian, Urban Explorer, Art Walker, Nature Observer, Political Oslo and Film History Nerd;
- knowledge fingerprints derived from badges, completed emner, core concepts and interests;
- meet invites, including one pending incoming invite and one accepted invite;
- learning circles for industrial city history and public culture;
- shared routes, shared quiz state and shared observations;
- privacy settings that opt demo users into public profile, match lists, meet invites, circle invites and social reputation.

The current demo user is tuned to match strongest with Industrial Historian, Urban Explorer and Political Oslo, and weaker with Nature Observer and Film History Nerd.

## Run the smoke test

From the profile page console:

```js
window.HGSocialSmokeTest.runHGSocialSmokeTest();
```

The function returns:

```js
{
  ok: true,
  checks: [
    { id, label, ok, details }
  ]
}
```

## Required passing checks

The smoke panel verifies that:

- public profiles render;
- knowledge matches render;
- match profile popup opens;
- meet invite can be created;
- incoming/outgoing inbox renders;
- confirmed meets render;
- learning circles render;
- trust score calculates;
- shared route can complete;
- shared quiz can complete;
- social timeline remains private;
- privacy guard detects forbidden fields.

## Privacy guard checks

History Go Social remains a knowledge graph social layer, not a location graph. Demo data must never include GPS, live location, visit history, last seen, nearby users, followers or public activity feed data.

The only intentional forbidden payload is isolated inside `runHGSocialSmokeTest()`:

```js
{
  userId: "bad_test_user",
  latitude: 59.91,
  longitude: 10.75,
  lastSeen: "now"
}
```

The smoke test passes only when `assertNoSocialPrivacyLeak()` rejects that payload and logs `HG_SOCIAL_PRIVACY_VIOLATION`.
