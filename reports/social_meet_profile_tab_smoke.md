# Social Meet profile tab smoke report

Date: 2026-06-30
Scope: Social Meet / Spotmeeting only. Civication runtime was not changed.

## Pull latest main

- Attempted `git pull origin main` before smoke verification.
- Blocker/warning: repository has no `origin` remote configured in this checkout, so the pull could not be completed:
  - `fatal: 'origin' does not appear to be a git repository`
  - `fatal: Could not read from remote repository.`

## What worked

- `profile.html` contains `Social Meet` as its own top-level profile tab (`data-tab="socialmeet"`).
- `profile.html` contains a matching Social Meet tab panel (`data-panel="socialmeet"`) with `profileSocialLayer` and the expected Social Meet copy.
- Social Meet was not moved into settings. The Social Meet tab owns the social runtime mounts, while settings owns the privacy mount.
- The following Social Meet mounts are present in the Social Meet panel:
  - `meet-invite-inbox`
  - `spotmeeting-inbox`
  - `confirmed-meets`
  - `social-progression`
  - `learning-circles`
  - `social-history`
  - `hg-social-smoke-panel`
- `spotmeeting-inbox` has a profile-page renderer wired in `profile.html` through `window.renderSpotmeetingInbox`.
- `meet-invite-inbox`, `confirmed-meets`, `social-progression`, `learning-circles`, and `social-history` are rendered by `js/knowledgeMatch.js` render helpers.
- `hg-social-smoke-panel` renders through `js/hgSocialSmokePanel.js` when the mount exists.
- Duplicate ID scan of `profile.html` passed: 116 IDs scanned, no duplicates found.
- Required syntax checks and Social Meet / Spotmeeting tests passed.

## Privacy/settings result

- The ⚙️ profile settings dialog still opens the profile/settings shell, but the social section inside settings is privacy-specific.
- The hidden `profileSettingsSocialMount` contains `profilePrivacyLayer` and `social-privacy-settings` only for Social Meet privacy controls.
- `openProfileSettings()` moves `profilePrivacyLayer` into `hgProfileSettingsSocial` and calls `renderSettingsSocialSections()`, which delegates to `window.renderPrivacySettings?.()`.
- Result: Social Meet remains a top-level tab; settings only hosts Social Meet privacy controls.

## Spotmeeting → Social Meet result

- TEST_MODE Spotmeeting demo flow is covered by `node tests/hg-spotmeeting.test.js`:
  - Enables `HG_TEST_MODE`.
  - Seeds Social Demo candidates.
  - Gets Spotmeeting suggestions for a place context.
  - Creates a preset-only Spotmeeting invite.
  - Verifies privacy-forbidden fields are not present in the Spotmeeting payload.
- PlaceCard demo wiring is covered by `node tests/hg-spotmeeting-placecard-demo.test.js`:
  - Confirms `HGSpotmeetingPlaceCardDemo` is present.
  - Confirms the send button hook exists.
  - Confirms the demo uses `createSpotmeetingInvite`.
  - Confirms UI demo is gated to `HG_TEST_MODE`.
  - Confirms the app loads `js/social/HGSpotmeetingPlaceCardDemo.js`.
- Profile Social Meet tab includes `spotmeeting-inbox`, whose renderer reads `HG_Spotmeeting.getSpotmeetingInbox()` and displays pending, accepted, and completed counts. Therefore a PlaceCard-created TEST_MODE invite should appear as a pending count update in Social Meet.

## Warnings

- Could not pull latest main because this checkout has no `origin` remote. Verification was run against the current branch/worktree.
- `npm run test:social-review` emitted `npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.` The test itself passed.
- I did not add backend behavior and did not add new social features.
- I did not change Civication files.

## Blockers

- Pulling latest main is blocked by missing git remote configuration in this environment.
- No runtime blocker was found in Social Meet / Spotmeeting smoke scope.

## Next recommended fix

- Configure the repository remote (for example, add a valid `origin`) and rerun `git pull origin main` before the next smoke pass.
- If a browser automation pass is available in CI, add a small profile smoke that opens `profile.html` with `HG_TEST_MODE=1`, clicks Social Meet, sends a PlaceCard Spotmeeting preset invite, and asserts that `spotmeeting-inbox` pending count increments.
