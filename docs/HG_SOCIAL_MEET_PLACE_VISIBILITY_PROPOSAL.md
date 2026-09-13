# Social Meet — opt-in place visibility

Status: **design contract only; not production-active**

## Collision check

History GO already has the building blocks that this feature must reuse:

- AHA/Supabase authenticated session as the bearer-token source;
- canonical Social Meet identity and public profile in `hg_profiles`;
- explicit `social_meet_identity_v1` profile consent;
- block, report and moderation suppression;
- server-owned Spotmeeting invite lifecycle;
- authenticated, rollout-gated Social Meet discovery.

There is currently **no canonical current-place/check-in state**. The private `hg_social_activity`
log is historical participant data and must not be reused as a public current-place source.

## Product contract

The user may explicitly choose **Vis at jeg er her** from a Place-context Social Meet surface.

The action means a self-declared, temporary Social Meet status for one canonical History GO
`place_id`. It is not automatic location detection and it is not proof of physical presence.

Default duration: **60 minutes**.

Required behavior:

1. The user must already have a current, discoverable Social Meet profile.
2. The UI must preview exactly what becomes visible before activation.
3. Activation requires a separate versioned consent, `social_meet_place_visibility_v1`.
4. Only one current place may be active per user. Choosing a new place replaces the old state.
5. The user can hide the state immediately.
6. The state expires automatically and must not become public visit history.
7. Other users may see the self-declared status only through authenticated Social Meet surfaces.
8. Block, report and moderation suppression must run before another profile is returned.
9. The status must never feed knowledge-match ranking, popularity, recommendations or advertising.

## Data minimization

Allowed server state:

- private auth binding;
- public Social Meet `profile_id`;
- canonical public History GO `place_id`;
- consent version;
- activation time;
- hard expiry time.

Forbidden:

- GPS coordinates;
- latitude/longitude;
- device location samples;
- distance-to-person;
- proximity radius;
- passive background tracking;
- online/last-seen state;
- public arrival/departure history;
- retained place history derived from expired visibility.

Expired or hidden state must be deleted or treated as nonexistent for participant-facing reads.

## Canonical UI split

`PlaceCard → Utforsk → Møtes` should expose two distinct concepts:

- **Folk her nå** — profiles that have explicitly and temporarily chosen to show themselves
  for this canonical place.
- **Folk å møte** — the existing knowledge/interest matching flow. This remains independent
  of current-place visibility.

Both may lead into the existing preset-only Spotmeeting invite lifecycle and then
`Mine møter / Social Meet`.

## Backend ownership

Do not create another auth owner, another Social Meet profile table or a direct browser-owned
presence database.

A production implementation must stay behind the existing FastAPI boundary and reuse the
existing Social Meet feature-gate, identity, safety and moderation infrastructure. Current-place
visibility must remain independently kill-switchable and fail closed when the server capability is
not active.

Do not expose a general unauthenticated "list everyone at place" endpoint. Participant reads belong
inside the authenticated Social Meet discovery boundary so existing suppression policy remains
authoritative.
