# Social Meet / Spotmeeting backend implementation roadmap

Date: 2026-07-01  
Scope: Documentation/planning only. This roadmap does not implement backend behavior, does not change runtime code, does not touch Civication, and does not add GPS, live location, nearby users, followers, feeds, public visit history, passive tracking, or free chat.

## 1. Purpose

This roadmap turns the existing Social Meet identity, invite backend, and block/report/moderation contracts into a practical production backend sequence for Spotmeeting. It assumes the current client/demo layer remains privacy-safe and demo-only until every production enablement gate in this document is satisfied.

The backend should support intentional, context-bound meet invites between opted-in History Go players. It must not become a location network, social graph, public feed, chat product, or passive tracking system.

## 2. Source contracts and status inputs

This roadmap is based on:

- `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`
- `reports/social_meet_identity_contract_status.md`
- `reports/social_meet_invite_backend_contract_status.md`
- `reports/social_meet_block_report_moderation_contract_status.md`
- `reports/social_meet_spotmeeting_product_status.md`

## 3. Non-goals and forever-forbidden behavior

The production backend must permanently forbid the following, even if future product requests ask for them:

- GPS coordinates or precise device location.
- Live location sharing.
- Nearby users, proximity lists, co-presence detection, or sensor-derived proximity.
- Distance-to-person, distance-ranked people, or map pins for people.
- Last-seen, online, active-now, typing, availability, or presence status.
- Followers, following, friend counts, popularity counters, or social graph ranking.
- Public activity feeds.
- Public visit history, check-ins, recently visited places, or passive place trails.
- Passive tracking, background movement collection, or behavioral movement profiles.
- Free chat, free-text invite messages, open comments, or arbitrary user-to-user messaging.
- Public exposure of raw quiz answers, route histories, observation histories, account IDs, auth subjects, emails, phone numbers, IP addresses, device IDs, or moderation notes.

## 4. Production enablement gates

Production Spotmeeting discovery must remain disabled until all gates below pass:

1. **Identity gate:** authenticated account binding exists, profile IDs are stable public identifiers, and account-private identifiers never appear in public/profile/invite APIs.
2. **Opt-in profile gate:** players explicitly publish a Social Meet profile, can withdraw it, and unpublished/suspended/deleted profiles are suppressed everywhere.
3. **Forbidden-field gate:** backend request validators, response serializers, database schemas, logs, analytics, and exports reject or omit forbidden location, presence, social graph, feed, visit-history, passive-tracking, and free-chat fields.
4. **Invite durability gate:** invite source-of-truth persistence, participant inbox projections, idempotency, duplicate suppression, expiration, and cross-device sync are implemented and tested.
5. **Block/report gate:** block and report state is enforced before suggestions, invite creation, invite delivery, inbox rendering, accepting, completing, and notifications.
6. **Moderation gate:** reports enter a private review queue, authorized moderators can apply policy actions, audit trails exist, and moderation notes never leak to participant APIs.
7. **Rate-limit gate:** sender, recipient, context, and abuse-throttle limits exist with stable failure codes and no private-reason leakage.
8. **Retention/privacy gate:** export, deletion/hiding, tombstones, retention windows, legal/safety holds, and suppression lists are documented, implemented, and tested.
9. **Observability gate:** health checks and metrics prove service safety without reconstructing presence, movement, public visit history, popularity, or social graph behavior.
10. **Rollout gate:** production discovery is behind a kill switch, cohort allowlist, staged rollout controls, and rollback playbooks.

## 5. Phase 0: keep demo-only disabled in production

**Goal:** Preserve the current safe state while backend work begins.

**Implementation tasks:**

- Keep production discovery returning `backend_not_enabled` until all later gates pass.
- Keep demo candidates restricted to test/demo mode only.
- Keep demo social data out of production `PEOPLE`, public profile storage, and invite persistence.
- Add backend feature flags before any production endpoint is exposed: `socialMeetBackendEnabled`, `spotmeetingDiscoveryEnabled`, `spotmeetingInviteWritesEnabled`, and `spotmeetingModerationActionsEnabled`.
- Add CI/static checks that fail if forbidden fields or endpoint names are introduced.

**Required tests:**

- Production-mode discovery returns `backend_not_enabled`.
- Test/demo suggestions are impossible without explicit test mode.
- Forbidden keywords and payload fields are rejected in backend schemas and API snapshots.
- Existing browser smoke tests still show no forbidden UI surfaces.

**Exit gate:** No production user can discover, invite, or infer another real user through backend Spotmeeting.

## 6. Phase 1: identity + opt-in profile backend

**Goal:** Establish safe, explicit identity and profile publication before any real people appear.

**Implementation tasks:**

- Create account-bound Social Meet profile records with opaque `profileId` values distinct from account/auth IDs.
- Add profile publication states: `draft`, `published`, `withdrawn`, `suspended`, and `deleted`.
- Store only approved public profile fields: display name/handle, avatar token or approved asset reference, optional short bio from controlled policy, knowledge fingerprints, supported context interests, locale/region coarse enough not to locate a person, and safety/settings metadata needed for eligibility.
- Add profile create/read/update/publish/withdraw/delete APIs.
- Build a profile read model that exposes only opted-in public fields.
- Add suppression lists for withdrawn, suspended, deleted, blocked, or policy-restricted profiles.

**Required tests:**

- Unauthenticated profile actions fail.
- Public profile APIs never return account IDs, auth subjects, email, phone, IP address, device IDs, or moderation notes.
- Withdrawn/suspended/deleted profiles disappear from discovery candidates and invite eligibility.
- Forbidden location/presence/social graph/feed/free-chat fields fail at any nesting level.
- Profile export/delete workflows honor retention and safe tombstone policy.

**Exit gate:** A user can safely publish or withdraw an opt-in profile, but production discovery remains disabled.

## 7. Phase 2: invite persistence + inbox sync

**Goal:** Replace local-only invite behavior with durable, participant-scoped backend state.

**Implementation tasks:**

- Create invite source-of-truth records with states `pending`, `accepted`, `declined`, `cancelled`, `completed`, `expired`, `reported`, and `blocked`.
- Validate allowed contexts exactly: `place`, `quiz`, `route`, `observation`, `topic`, and `circle`.
- Store preset message IDs only; reject free text.
- Implement idempotent invite creation with duplicate suppression per sender/recipient/context.
- Fan out safe participant inbox projections for sender and recipient.
- Add incremental sync cursors that represent record changes only and cannot be used as presence or last-seen.
- Implement accept, decline, cancel, complete, expire, export, and participant-side hide/delete actions.

**Required tests:**

- Invite creation requires authenticated users and active published profiles for both participants.
- Invalid context types, missing context fields, and forbidden nested fields fail with stable codes.
- Pending invites appear in both sender and recipient inboxes across devices.
- Allowed lifecycle transitions succeed; invalid transitions fail without mutation.
- Completion is idempotent and grants no trust, popularity, follower, or feed effect.
- Export/delete/hide behavior is participant-scoped and does not reveal private data.

**Exit gate:** Durable invite sync works in a backend-only staging cohort, but real discovery remains cohort-disabled until block/report enforcement is complete.

## 8. Phase 3: block/report enforcement

**Goal:** Enforce participant safety before any production discovery or invite delivery.

**Implementation tasks:**

- Add bidirectional block records using public profile IDs and private actor account binding.
- Add structured report records with reason codes and safety categories only.
- Enforce block/report state before suggestions, invite creation, invite delivery, inbox rendering, accepting, completing, notifications, exports, and profile reads where policy requires suppression.
- Use safe generic failure codes such as `recipient_unavailable` and `moderation_restricted` without revealing private block/report/suspension reasons.
- Add abuse throttles for repeated invites, reports, and block evasion.
- Add audit events for safety actions without location, presence, social graph, feed, or free-chat data.

**Required tests:**

- Blocks suppress discovery and invite delivery in both directions.
- Reports create moderation records and suppress unsafe lifecycle actions according to policy.
- Failure responses do not reveal who blocked, reported, or was suspended.
- Blocked/reported users cannot infer private state through inbox, sync, notification, export, or retry timing.
- Rate limits and cooldowns return stable non-leaking failure codes.

**Exit gate:** Safety enforcement is mandatory in every backend path before limited discovery can start.

## 9. Phase 4: moderation/admin tooling

**Goal:** Provide private operational tools for reports, abuse response, retention, and policy enforcement.

**Implementation tasks:**

- Build moderator-only report queues with role-based access control.
- Add moderation actions: dismiss, warn, suppress profile, cancel invite, expire invite, restrict invite sending, restrict invite receiving, suspend profile, and escalate for legal/safety review.
- Keep moderator notes, evidence, private account metadata, and operational risk signals out of participant/public APIs.
- Add audit trails for moderator actions and policy outcomes.
- Add privacy-safe dashboards for queue health, action latency, error rates, rate-limit hits, and rollout status.
- Add retention jobs for closed invites, deleted profiles, reports, tombstones, and legal/safety holds.

**Required tests:**

- Only authorized moderators can access queues and actions.
- Participant APIs expose only safe outcome states.
- Moderation notes and private operational metadata never appear in profile, invite, discovery, sync, export, or analytics surfaces except where legally required.
- Retention jobs preserve suppression/tombstone safety while deleting or anonymizing expired participant data.
- Admin actions are audited without forbidden tracking fields.

**Exit gate:** Moderators can review and act on reports before any production discovery cohort expands.

## 10. Phase 5: limited production discovery rollout

**Goal:** Enable real discovery cautiously after safety, privacy, and rollback controls are proven.

**Implementation tasks:**

- Launch behind cohort allowlists and remote kill switches.
- Return candidates only from opted-in, published, eligible profiles.
- Rank by explicit knowledge/activity/context compatibility only; do not use location, presence, followers, popularity, public visits, or passive behavior.
- Limit candidate count, invite rate, repeated exposure, and repeated contact attempts.
- Add holdback cohorts and staged ramp percentages.
- Monitor privacy-safe metrics: endpoint errors, validation failures, invite state transitions, report rates, block rates, moderation latency, and kill-switch health.
- Run manual privacy and safety review before each rollout expansion.

**Required tests:**

- Discovery returns only eligible published profiles and never returns blocked, withdrawn, suspended, deleted, or policy-restricted profiles.
- Candidate responses contain no forbidden fields.
- Ranking tests prove no GPS/live-location/nearby/distance/presence/follower/feed/public-visit/free-chat inputs are used.
- Kill switch disables discovery and invite writes immediately without data corruption.
- Rollback preserves participant inbox consistency and report queues.

**Exit gate:** Production discovery can expand only when metrics, moderation capacity, privacy review, and rollback rehearsal are green.

## 11. Database and read-model sketch

Recommended source-of-truth tables/collections:

- `social_meet_profiles`: `profile_id`, private `account_id` reference, publication state, approved public fields, settings, timestamps, deletion/tombstone state.
- `social_meet_profile_public_read_model`: public profile projection keyed by `profile_id`, containing only opted-in display fields and compatibility metadata.
- `social_meet_profile_suppression`: suppressed `profile_id`, reason category, policy scope, timestamps, private moderator/action reference.
- `spotmeeting_invites`: `invite_id`, sender/recipient profile IDs, context type/id/title/reason/source surface, preset message ID, state, idempotency key hash, timestamps, expiration, version.
- `spotmeeting_invite_events`: append-only participant-safe state transitions and system events.
- `spotmeeting_inbox_items`: participant projection keyed by participant profile ID and invite ID, safe visible state, sync version, hidden/deleted marker.
- `spotmeeting_blocks`: actor profile ID, target profile ID, state, timestamps, private account binding for enforcement.
- `spotmeeting_reports`: report ID, reporter/reported profile IDs, invite/context references, structured reason code, safety category, queue state, retention metadata.
- `spotmeeting_moderation_actions`: moderator/system actions, policy outcome, private notes/evidence references, audit correlation ID.
- `spotmeeting_rate_limits`: opaque bucket keys and counters that do not expose public data.
- `spotmeeting_audit_events`: security/safety events with coarse service timestamps and no movement, presence, public visit, follower/feed, or chat content.

Read-model rules:

- Public/discovery read models must be rebuildable from approved profile state and suppression policy.
- Inbox read models are participant-scoped and must not be globally queryable as social activity.
- Sync cursors are per participant and must never be exposed as last-seen or online status.
- Analytics aggregates must be privacy-reviewed and must not enable re-identification, movement reconstruction, popularity ranking, or social graph inference.

## 12. API endpoint list

Profile and identity endpoints:

- `GET /social-meet/me`
- `POST /social-meet/profiles`
- `GET /social-meet/profiles/me`
- `PATCH /social-meet/profiles/me`
- `POST /social-meet/profiles/me/publish`
- `POST /social-meet/profiles/me/withdraw`
- `DELETE /social-meet/profiles/me`
- `GET /social-meet/profiles/{profileId}`

Discovery endpoints, disabled until Phase 5 gates pass:

- `POST /social-meet/spotmeeting/discovery/context-candidates`

Invite endpoints:

- `GET /social-meet/spotmeeting/presets`
- `POST /social-meet/spotmeeting/invites`
- `GET /social-meet/spotmeeting/inbox`
- `GET /social-meet/spotmeeting/sync?cursor=...`
- `POST /social-meet/spotmeeting/invites/{inviteId}/accept`
- `POST /social-meet/spotmeeting/invites/{inviteId}/decline`
- `POST /social-meet/spotmeeting/invites/{inviteId}/cancel`
- `POST /social-meet/spotmeeting/invites/{inviteId}/complete`
- `DELETE /social-meet/spotmeeting/invites/{inviteId}`
- `GET /social-meet/spotmeeting/export`

Safety endpoints:

- `POST /social-meet/spotmeeting/profiles/{profileId}/block`
- `DELETE /social-meet/spotmeeting/profiles/{profileId}/block`
- `GET /social-meet/spotmeeting/blocks`
- `POST /social-meet/spotmeeting/invites/{inviteId}/report`
- `POST /social-meet/spotmeeting/profiles/{profileId}/report`

Moderator/admin endpoints, private and role-gated:

- `GET /admin/social-meet/reports`
- `GET /admin/social-meet/reports/{reportId}`
- `POST /admin/social-meet/reports/{reportId}/actions`
- `GET /admin/social-meet/profiles/{profileId}/safety-summary`
- `POST /admin/social-meet/profiles/{profileId}/suppress`
- `POST /admin/social-meet/profiles/{profileId}/unsuppress`
- `POST /admin/social-meet/invites/{inviteId}/cancel`
- `POST /admin/social-meet/invites/{inviteId}/expire`
- `GET /admin/social-meet/audit-events`

## 13. Rollback plan

- Keep all production behavior behind remotely controlled feature flags.
- Prefer disabling discovery first, then invite writes, then lifecycle writes if incident severity requires it.
- Preserve read-only inbox access during most rollbacks so participants can see existing safe state.
- Keep block/report submission available during safety incidents unless the incident is in those write paths.
- If schema migration rollback is required, maintain forward-compatible tombstone/suppression records so blocked, deleted, or suspended users do not reappear.
- Rebuild participant inbox projections from `spotmeeting_invites` and `spotmeeting_invite_events` after any projection fault.
- Re-run forbidden-field scans, block/report enforcement tests, retention tests, and kill-switch tests before re-enabling.
- Document incident timeline using audit events that do not include location, presence, public visit history, social graph, or chat content.

## 14. Privacy review checklist

Before enabling or expanding production discovery, reviewers must confirm:

- No GPS, live location, nearby-user, distance-to-person, or co-presence fields exist in schemas, APIs, logs, analytics, exports, or admin screens.
- No last-seen, online, active-now, typing, availability, or presence feature exists.
- No followers/following, popularity score, public activity feed, or public visit history exists.
- No free-chat or free-text invite/report content exists; only controlled presets and structured reason codes are accepted.
- Profile publication is explicit opt-in and withdrawal is honored quickly.
- Candidate eligibility excludes blocked, reported according to policy, withdrawn, suspended, deleted, and suppressed profiles.
- Failure codes do not reveal private block/report/suspension/deletion reasons.
- Public profile IDs cannot be joined to account IDs through public APIs.
- Sync cursors, timestamps, and notifications cannot reconstruct online status or movement.
- Moderation notes, private evidence, IP addresses, device IDs, and risk signals are excluded from participant APIs.
- Export, deletion, retention, tombstone, and legal/safety hold behavior is documented and tested.
- Kill switches and staged rollout controls have been rehearsed.

## 15. Next implementable backend task

The next implementable backend task is **Phase 0 backend safety scaffolding**: add backend feature flags, production-disabled discovery responses, and forbidden-field contract tests without enabling any real user discovery or changing runtime user behavior. This prepares the codebase for Phase 1 identity work while preserving the current demo-only safety boundary.
