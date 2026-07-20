# History GO Social Meet abuse controls backend

Status: **Implemented server-side invite preflight policy. Production Spotmeeting invite creation and discovery remain disabled.**

Canonical product and safety requirements remain defined by:

- `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_MODERATION_BACKEND.md`

This document records the concrete FastAPI/PostgreSQL abuse-prevention boundary that the future server-owned Spotmeeting invite lifecycle must call before creating an invite.

## Scope

This slice implements a reusable `SocialMeetInviteAbuseService` preflight gate. It does **not** create or deliver production invites and it does not introduce a second invite model.

The guard reuses the existing canonical sources of truth:

- `hg_profiles`
- `hg_spotmeeting_invites`
- `hg_social_meet_blocks`
- `hg_social_meet_reports`
- the existing server interaction gate for active blocks and moderation restrictions

No standalone rate-limit or reputation table is introduced in this slice.

`supabase/migrations/005_social_meet_abuse_indexes.sql` only adds query indexes needed to make the server-side checks efficient.

## Invite creation preflight

Before a future invite insert may proceed, the abuse guard verifies:

1. the context type is allow-listed and the context ID is bounded;
2. the sender has a current `discoverable` Social Meet profile and current consent;
3. the recipient has a current `discoverable` Social Meet profile and current consent;
4. sender and recipient are different profiles;
5. the shared interaction gate permits contact, including active block and moderation checks;
6. no active duplicate invite exists for the same sender, recipient and context;
7. no private report/block cooldown suppresses contact;
8. no decline or repeated-cancellation cooldown applies;
9. sender, pair and recipient rate buckets remain below policy limits.

A missing or inconsistent server snapshot fails closed.

## Rate policy

The current policy is intentionally conservative and server-owned.

### Standard tier

- sender: 3 invite creations per rolling minute;
- sender: 15 per rolling hour;
- sender: 40 per rolling 24 hours;
- sender/recipient pair: 5 per rolling 24 hours;
- recipient: 80 inbound invites per rolling 24 hours.

### Restricted tier

The stricter tier applies when the sender is within the first seven days of Social Meet opt-in or has unresolved reports under review.

- sender: 1 invite creation per rolling minute;
- sender: 5 per rolling hour;
- sender: 12 per rolling 24 hours;
- sender/recipient pair: 2 per rolling 24 hours;
- recipient: 50 inbound invites per rolling 24 hours.

These values are policy constants, not client-configurable inputs. Changing them requires a backend policy change and tests.

A future trusted session-risk system may tighten the policy further. No device fingerprint, raw IP, GPS, location or presence signal is introduced by this implementation.

## Cooldowns and duplicate suppression

The preflight gate enforces:

- duplicate suppression while the same pair/context has a `pending` or `accepted` invite;
- 24-hour cooldown after a decline between the same sender and recipient;
- seven-day non-enumerating suppression after the recipient reports the sender;
- seven-day non-enumerating suppression after a recent block relationship between the pair, including after an unblock;
- rate limiting after three cancellations for the pair within a rolling 24-hour window.

Active blocks are enforced separately and earlier by the shared bidirectional interaction gate.

Private safety causes intentionally collapse to participant-safe errors. A sender must not be told whether suppression was caused by a report or a previous block.

## Stable failure codes

The guard uses the existing `SocialMeetDomainError` boundary with stable codes:

- `invalid_invite_context`
- `profile_not_published`
- `recipient_unavailable`
- `invalid_invite_target`
- `interaction_blocked` / `moderation_restricted` from the shared interaction guard
- `duplicate_active_invite`
- `rate_limited`

The implementation must not return counters, report existence, block existence, moderator state, recipient inbound volume or other private abuse-policy details to participants.

## Rolling-window implementation

Rate windows are rolling from the server evaluation timestamp:

- one minute;
- one hour;
- 24 hours.

The restricted-profile age is measured from Social Meet consent/opt-in when available, with the underlying profile creation timestamp used only as a compatibility fallback for older rows.

The snapshot query reads existing canonical records only. It does not write tracking events and does not collect location or presence data.

## Required invite integration rule

The current service is a **preflight policy layer**, not an atomic invite insert.

The durable Spotmeeting invite implementation must:

1. call the guard before attempting creation;
2. re-check duplicate/rate/cooldown invariants inside the authoritative creation transaction or equivalent serialized boundary;
3. insert the invite only after all identity, visibility, interaction, preset, context and abuse checks pass;
4. make duplicate/retry behavior idempotent;
5. never enable client-side fallback when the backend check is unavailable.

This transaction-level recheck is required to prevent concurrent requests from racing through the same preflight snapshot.

## Privacy constraints

The abuse layer must never store, infer or expose:

- GPS or coordinates;
- live location, nearby status or distance-to-person;
- last-seen, online or presence;
- public visit history or route traces;
- followers, feeds or popularity scores;
- free-chat content;
- raw device identifiers or IP addresses in participant APIs.

The policy uses only operational counts and structured safety state already required for Social Meet safety.

## Validation coverage

Automated tests cover:

- rolling window parameters;
- canonical-source-only repository reads;
- standard and restricted policy tiers;
- every rate bucket;
- duplicate active invites;
- decline and repeated-cancellation cooldowns;
- report and block suppression without enumeration;
- sender/recipient publication and consent requirements;
- self-invite rejection;
- shared block/moderation interaction enforcement;
- fail-closed behavior when the server snapshot is unavailable.

## Remaining production gate

This slice does **not** enable production Spotmeeting discovery or invite delivery.

The next server-owned slice should implement the durable Spotmeeting invite lifecycle behind FastAPI while reusing:

- `hg_spotmeeting_invites`;
- opaque public `profile_id` participant boundaries;
- the shared interaction guard;
- this abuse-control preflight;
- the existing moderation and participant-safety layers.

After durable invites are server-owned, remaining major work includes candidate discovery with stale-result revalidation, cross-device sync, frontend migration away from direct writes, and production rollout controls.
