# Social Meet — opt-in place status

Status: **implemented behind fail-closed rollout controls; not automatically production-enabled**

## Collision check

The implementation reuses the Social Meet stack that already existed:

- AHA/Supabase authenticated session as bearer-token source;
- canonical identity/public profile in `hg_profiles`;
- `social_meet_identity_v1` profile consent;
- block, report and moderation suppression;
- server-owned Spotmeeting invite lifecycle;
- authenticated, rollout-gated candidate discovery.

It does **not** reuse `hg_social_activity` as a public place source and does not create
another profile, auth owner, check-in history table or browser-owned social store.

## Canonical state

Migration `009_social_meet_place_status.sql` adds exactly one temporary status to the existing
`hg_profiles` row:

- `current_place_id` — canonical public History GO place id;
- `current_place_visible_until` — hard expiry;
- `current_place_consent_version` — `social_meet_place_status_v1`.

Setting another place overwrites the previous value. Hiding the status nulls all three fields.
Unpublishing or deleting Social Meet also nulls them. Expired values are treated as nonexistent
for current-user and participant-facing reads and never become a public visit history.

Default duration is **60 minutes**; the API accepts 15–120 minutes.

## Product contract

`PlaceCard → Utforsk → Møtes` exposes two separate concepts:

- **Folk her nå** — discoverable profiles that have explicitly chosen to show themselves for
  this canonical place and whose temporary status has not expired.
- **Folk å møte** — the existing knowledge/interest matching flow, independent of place status.

The place-status UI previews the effect before the user presses **Vis meg her i 60 min**.
**Skjul meg** removes it immediately. The status is self-declared; it is not proof that a
person is physically present.

Both flows reuse the existing preset-only Spotmeeting invitation lifecycle and
`Mine møter / Social Meet`.

## API and discovery ownership

No unauthenticated "everyone at this place" endpoint exists.

The existing authenticated discovery boundary owns both modes:

- `mode = match` — unchanged knowledge/interest ranking;
- `mode = place_status` — requires Place context, current place id, unexpired status and
  `social_meet_place_status_v1`; it does not add knowledge score.

Self-controlled mutation is exposed under the same authenticated discovery router:

- `PUT /api/v1/social-meet/spotmeeting/discovery/place-status`
- `DELETE /api/v1/social-meet/spotmeeting/discovery/place-status`

Both discovery modes retain the existing discoverable-profile, consent, block, report,
moderation, active-invite and cooldown suppression rules.

## Rollout

Place status fails closed unless:

1. deployment-level Spotmeeting discovery is enabled;
2. normal `spotmeeting_discovery` rollout admits the requester;
3. the separate private `social_meet_place_status` feature flag admits the requester.

The second flag can use the existing allowlist/percentage rollout mechanism and is disabled by
default.

## Permanent data-minimization boundary

Allowed state is limited to a canonical public place id, expiry and consent version attached to
the existing Social Meet profile.

The feature must not store, request, infer or rank by:

- GPS coordinates or device location samples;
- latitude/longitude;
- distance-to-person or proximity radius;
- passive/background movement;
- nearby scans or co-presence inference;
- online/last-seen status;
- arrival/departure history or retained public check-in history;
- follower/popularity signals or advertising profiles.

The place id is user-selected. History GO does not verify it from device location.
