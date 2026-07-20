# Social Meet candidate discovery backend

Status: **implemented behind fail-closed rollout controls; production discovery remains disabled by default.**

## Purpose

This slice moves Spotmeeting candidate discovery behind the canonical Python/FastAPI backend without creating a location network, social graph or parallel profile model.

The discovery source of truth remains the existing Social Meet state:

- `hg_profiles` for explicit opt-in public learning/profile fields;
- `hg_social_meet_blocks` for bidirectional suppression and block cooldowns;
- `hg_social_meet_reports` for confidential report suppression;
- `hg_social_meet_profile_restrictions` for active moderation restrictions;
- `hg_spotmeeting_invites` for active-invite and recent-decline suppression.

No discovery exposure history, nearby-user table, presence state, popularity score or behavioral activity profile is introduced.

## API

```text
POST /api/v1/social-meet/spotmeeting/discovery/context-candidates
```

The request contains only an explicit History GO context and coarse knowledge signals:

- context type and canonical context ID;
- theme tags;
- era tags;
- topic tags;
- route-category tags;
- quiz-topic tags;
- learning-goal tags;
- bounded candidate limit.

The HTTP boundary recursively rejects forbidden privacy/tracking fields before Pydantic domain validation.

## Eligibility and suppression

The requester must currently have:

- a public `profile_id`;
- `profile_visibility = 'discoverable'`;
- the current Social Meet consent version;
- no active moderation restriction.

A candidate is removed before ranking when any of the following is true:

- the profile is not currently discoverable/consenting;
- the profile is deleted or moderation-restricted;
- either participant has an active or recently removed block relationship;
- a confidential recent or unresolved report exists between the pair;
- the pair already has a pending or accepted invite;
- the pair is inside the decline cooldown window.

Private suppression reasons are never returned to the requester.

## Ranking contract

Ranking happens in PostgreSQL after eligibility/suppression filtering.

Only explicit compatibility inputs are used:

- candidate interest in the current canonical context;
- current context theme/era/topic/route/quiz/learning-goal overlap;
- shared explicit preferred themes, favorite eras and learning goals.

Internal compatibility scores are never returned by the API. Public responses expose only safe reason categories such as `contextTheme` or `sharedLearningGoal`.

The ranking contract permanently excludes:

- GPS or precise location;
- nearby/proximity/distance;
- live presence, online state or last seen;
- followers, popularity or social-graph signals;
- public visit/check-in history;
- passive behavior or movement history;
- free chat or arbitrary user messages.

## Rollout controls

Discovery requires two independent gates:

1. deployment kill switch: `HG_BACKEND_SPOTMEETING_DISCOVERY_ENABLED=true`;
2. private PostgreSQL feature flag: `spotmeeting_discovery` in `hg_social_meet_feature_flags`.

The database flag supports:

- explicit public-profile cohort allowlisting;
- deterministic percentage rollout;
- immediate fail-closed disablement.

Migration:

- `supabase/migrations/007_social_meet_candidate_discovery.sql`

The feature-flag table is private to the server role. Browser roles receive no direct access.

## Stale-result revalidation

A discovery result is an advisory snapshot, never an authorization to contact another participant.

Responses include `generatedAt` and `staleAfterSeconds` only to tell the client when to refresh the suggestion list. These timestamps must never be interpreted as participant presence or availability.

When the user later creates an invite, the durable Spotmeeting create path independently revalidates current state before insert:

1. sender and recipient profile identity/publication/consent;
2. active blocks and moderation restrictions;
3. current abuse/cooldown/rate-limit policy;
4. active duplicate state;
5. database uniqueness and idempotency.

The authoritative insert runs inside the existing serializable creation transaction. A candidate that became withdrawn, blocked, restricted or otherwise ineligible after discovery therefore fails closed at invite creation even when the old discovery card is still visible in the client.

Discovery state itself is not persisted as a permission token or social relationship.

## Production state

This slice does not automatically enable real production discovery.

Production rollout still requires an explicit operational decision, a non-zero/private cohort or rollout percentage, tested moderation capacity, privacy-safe observability and a rollback/kill-switch procedure. The existing local/demo candidate behavior remains separate until the frontend is intentionally migrated to this FastAPI endpoint.
