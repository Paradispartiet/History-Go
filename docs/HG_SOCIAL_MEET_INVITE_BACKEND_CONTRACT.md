# HG Social Meet invite backend contract

Date: 2026-06-30  
Status: Backend persistence and safety contract only. No backend implementation, runtime behavior, Civication behavior, GPS/live-location discovery, nearby discovery, followers/feed, free chat, or passive tracking is introduced by this document.

## 1. Purpose

Production Spotmeeting requires server-side invite persistence before real people can safely send or receive invites. The current client layer is local/demo-only, so it cannot provide durable delivery, cross-device state, server-side block/report enforcement, retention, export, moderation, or abuse prevention.

This contract defines the minimum backend invite model and API shape required after Social Meet identity and opt-in public profiles exist. It is intentionally limited to context-bound, preset-message Spotmeeting invites.

## 2. Why backend persistence is required

Backend persistence is required so production Spotmeeting can:

- create one durable invite record per sender, recipient, and History Go context;
- deliver recipient inbox entries across devices and browser sessions;
- sync sender and recipient state after accept, decline, cancel, complete, report, block, expiry, deletion, or moderation actions;
- enforce block/report decisions before candidate suggestion and invite delivery;
- validate preset message IDs server-side and reject free text;
- rate-limit spam, repeated invites, and abusive context targeting;
- provide participant-scoped export, deletion, and retention workflows;
- support moderation review without public feeds or passive tracking;
- keep a safety audit trail without collecting GPS, live location, nearby proximity, last-seen, public visit history, followers, or free-chat content.

A local browser store may remain useful for demo fixtures, but it is not a production source of truth.

## 3. Non-goals and hard exclusions

This contract does not implement a backend, database schema migration, runtime behavior, UI behavior, Civication behavior, recommendation algorithm, notifications provider, calendar scheduler, or analytics pipeline.

Spotmeeting invite persistence must never add, store, expose, infer, rank by, or API-return:

- GPS coordinates;
- live location;
- nearby users;
- distance-to-person;
- last-seen, online, presence, or availability status;
- followers, following, follower counts, popularity counts, or social graph ranking;
- public activity feed;
- free chat, free-text invite messages, or open direct messaging;
- public visit history, check-ins, recently visited places, or passive place trails;
- background movement, passive tracking, sensor-derived proximity, or co-presence inference;
- raw route history, raw observation history, raw quiz answers, or exact timestamped learning behavior as public invite fields;
- private email, phone number, auth provider subject, legal name, birth date, precise age, payment data, device identifiers, IP address, or moderation notes in participant/public invite APIs.

## 4. Invite lifecycle model

An invite is a participant-scoped request from one published Social Meet profile to another published Social Meet profile around a single allowed History Go context.

Required invite states:

| State | Meaning |
| --- | --- |
| `pending` | Sender created the invite and the recipient may accept, decline, block, or report. |
| `accepted` | Recipient accepted; participants may later complete, cancel, block, or report. |
| `declined` | Recipient declined. The invite is closed except for export, retention, deletion, report, or moderation handling. |
| `cancelled` | Sender or an authorized server/moderation process cancelled the invite before completion. |
| `completed` | A participant marked an accepted invite complete once. Completion must not produce trust farming, popularity boosts, or public activity. |
| `expired` | Server closed a stale pending or accepted invite after the configured expiry window. |
| `reported` | A participant reported the invite or the related profile/context. Moderation may keep evidence and suppress further actions. |
| `blocked` | A participant blocked the other participant, preventing new delivery and suppressing unsafe interaction. |

The backend may keep a separate immutable event log, but the participant-facing invite state must be one of these values.

## 5. Allowed transitions

| From | Allowed transitions | Actor / rule |
| --- | --- | --- |
| `pending` | `accepted` | Recipient only, if neither participant is blocked/suspended and the invite is not expired. |
| `pending` | `declined` | Recipient only. |
| `pending` | `cancelled` | Sender, eligible moderator/admin process, or account/profile deletion policy. |
| `pending` | `expired` | Server expiry job. |
| `pending` | `reported` | Either participant, moderation intake, or automated safety rule. |
| `pending` | `blocked` | Either participant blocks the other, or moderation applies an interaction block. |
| `accepted` | `completed` | Either participant once; idempotent repeats return the existing completed state with no rewards/trust delta. |
| `accepted` | `cancelled` | Either participant or eligible moderator/admin process before completion. |
| `accepted` | `expired` | Server expiry job if accepted meetings also have a stale coordination window. |
| `accepted` | `reported` | Either participant, moderation intake, or automated safety rule. |
| `accepted` | `blocked` | Either participant blocks the other, or moderation applies an interaction block. |
| `declined` | `reported`, `blocked` | Either participant may still report or block from the participant-scoped record. |
| `cancelled` | `reported`, `blocked` | Either participant may still report or block from the participant-scoped record. |
| `completed` | `reported`, `blocked` | Either participant may report or block after completion. |
| `expired` | `reported`, `blocked` | Either participant may report or block while the record is retained. |
| `reported` | `blocked` | Participant block or moderation action may further restrict contact. |
| `blocked` | none for the interaction | Final participant-facing contact-suppression state unless moderation retention creates private admin-only updates. |

Invalid transitions must return a stable error such as `invalid_invite_transition` without mutating state.

## 6. Context-bound invite schema

Every invite must be bound to one explicit History Go context. The server must reject invites without a valid context or with forbidden privacy fields.

Required participant-facing fields:

| Field | Required | Visibility | Notes |
| --- | --- | --- | --- |
| `inviteId` | Yes | Participants | Opaque stable ID. |
| `senderProfileId` | Yes | Participants | Public profile ID only; never account/auth ID. |
| `recipientProfileId` | Yes | Participants | Public profile ID only; never account/auth ID. |
| `context` | Yes | Participants | Sanitized context object. |
| `presetMessageId` | Yes | Participants | Must be one of the server allow-list values. |
| `state` | Yes | Participants | One lifecycle state from this contract. |
| `createdAt` | Yes | Participants | Invite creation timestamp. Not last-seen/presence. |
| `updatedAt` | Yes | Participants | Invite record update timestamp. Not last-seen/presence. |
| `expiresAt` | Yes | Participants | Configured expiry timestamp. |
| `actorCanAct` | Yes | Current participant | Derived booleans/allowed actions for the requesting participant. |

Required context fields:

| Field | Allowed values / rule |
| --- | --- |
| `contextType` | One of `place`, `quiz`, `route`, `observation`, `topic`, `circle`. |
| `contextId` | Stable opaque History Go content ID. |
| `title` | Sanitized display title for the selected context. |
| `reason` | Sanitized product reason/explanation for the invite context. |
| `sourceSurface` | Surface where the user manually initiated the invite. |

Allowed optional context fields must be coarse content metadata only, such as `themeTags`, `eraTags`, or `topicTags`. They must not include location telemetry, route traces, exact movement history, or user presence.

Forbidden schema fields include `gps`, `latitude`, `longitude`, `coords`, `liveLocation`, `nearby`, `distance`, `distanceToPerson`, `lastSeen`, `online`, `presence`, `followers`, `following`, `feed`, `chat`, `freeText`, `messageText`, `publicVisitHistory`, `visitedPlaces`, `checkins`, `deviceId`, `ipAddress`, and any equivalent casing or nesting.

## 7. Preset message validation only

The server must own the preset-message allow list. Invite creation accepts only `presetMessageId`; it must not accept free text, custom messages, or chat payloads.

Minimum validation rules:

- reject missing or unknown `presetMessageId` with `invalid_preset_message`;
- reject any `message`, `messageText`, `customMessage`, `freeText`, `chat`, or equivalent field with `forbidden_invite_field`;
- store a stable preset ID and resolve localized labels at read time or from a versioned preset table;
- log the preset ID for audit/moderation, not a user-authored message body.

## 8. Recipient delivery and inbox fan-out

Invite creation must write a durable source-of-truth record and participant-scoped inbox projections for sender and recipient.

Delivery rules:

- sender sees the invite in a sent/pending area immediately after creation;
- recipient sees the invite in their inbox on every device after sync;
- fan-out must occur only after identity, profile visibility, block/report, rate-limit, context, and preset validation pass;
- delivery must be idempotent using an invite creation idempotency key or duplicate suppression rule;
- notification payloads, if later added, must contain only participant-safe profile/context/preset metadata and no GPS, nearby, last-seen, follower, feed, or free-chat content.

## 9. Cross-device sync

The backend is the source of truth for invite state. Clients must be able to fetch the same participant-scoped inbox from multiple devices.

Required sync behavior:

- list invites by participant and state group;
- return deterministic pagination and stable cursors;
- include `updatedAt` and a monotonic version or event cursor for incremental sync;
- make accept, decline, cancel, complete, report, block, and expiry visible to both participants according to retention and safety rules;
- resolve concurrent actions deterministically, for example first valid terminal transition wins;
- never derive online/last-seen/presence from sync timestamps.

## 10. Server-side block/report enforcement

The server must enforce blocks and reports before suggestion, creation, delivery, and lifecycle mutation.

Block rules:

- if either participant blocks the other, no new invite may be created or delivered between them;
- blocked users must not be suggested to each other;
- existing participant-scoped records may remain visible only for safety, export, deletion, retention, or moderation reasons;
- block state is private and must not become a public profile field.

Report rules:

- reports bind to `reportId`, `inviteId`, reporter profile ID, reported profile ID, reason code, timestamps, and moderation state;
- reporting an invite may move it to `reported` and may suppress further non-safety actions;
- reporter account IDs, auth subjects, IP addresses, device details, and moderation notes are private moderation data;
- report outcomes may affect visibility, rate limits, suspension, or delivery, but must not create public scores or badges.

## 11. Rate limits and abuse prevention

Minimum server-side controls:

- per-sender invite creation limits by minute, hour, and day;
- per-recipient inbound invite limits by sender and globally;
- duplicate suppression for the same sender, recipient, context, and active state;
- cooldowns after decline, report, block, or repeated cancellation;
- stricter limits for new accounts, untrusted sessions, or profiles with unresolved reports;
- validation that sender and recipient are distinct, visible, consenting Social Meet profiles;
- abuse telemetry limited to operational safety data, not location tracking or public reputation.

Rate-limit errors should be stable and non-enumerating, such as `rate_limited`, `duplicate_active_invite`, or `recipient_unavailable`.

## 12. Retention, deletion, and export requirements

The backend must support:

- participant export of invite records involving the requesting user, including state history that is legally exportable;
- deletion or anonymization of participant-facing profile data after account/profile deletion;
- retention windows for active invites, closed invites, reports, moderation evidence, audit events, and deletion tombstones;
- suppression lists so deleted, blocked, suspended, or withdrawn profiles do not reappear through cached suggestions;
- legal/safety retention that is private to moderation/compliance and not repurposed for discovery, ranking, feeds, public visit history, or behavioral advertising.

Deletion must not silently expose one participant's private identity to the other. Participant views may show a safe tombstone such as `deleted_profile` when needed for retained records.

## 13. Moderation hooks

Minimum moderation hooks:

- create report from invite;
- attach reason code and optional structured safety category, not free-chat text;
- queue records for review with invite ID, context ID/type, preset ID, participant public profile IDs, relevant state transitions, and safety audit metadata;
- allow moderator/admin processes to cancel, suppress, expire, or block interaction according to policy;
- keep moderation notes private and outside participant/public APIs;
- expose only safe outcome states to participants, such as `reported`, `blocked`, `cancelled`, or `recipient_unavailable`.

## 14. Audit logging without tracking location

Audit logs should capture security and safety actions, not movement or presence.

Allowed audit fields:

- `auditEventId`;
- `inviteId`, `reportId`, and related profile IDs where needed;
- actor role (`sender`, `recipient`, `moderator`, `system`);
- action type and result;
- previous and next invite state;
- coarse service timestamp;
- request correlation ID;
- validation failure code;
- rate-limit bucket identifier that does not expose public data.

Forbidden audit uses:

- no GPS or precise coordinates;
- no live location or nearby inference;
- no distance-to-person;
- no last-seen/online/presence reconstruction;
- no public visit history or passive route trail;
- no feed/follower ranking;
- no free-chat content.

Private operational metadata such as IP address or device risk signals may exist only in security boundaries when legally appropriate. They must not be returned in invite APIs, public profiles, discovery responses, exports beyond legal requirements, or product analytics.

## 15. Backend API sketch

This sketch names endpoints and payload shapes only. It does not require current implementation.

### `GET /social-meet/spotmeeting/presets`

Returns server-supported preset message IDs and localized labels.

### `POST /social-meet/spotmeeting/invites`

Creates an invite after validating identity, profile visibility, context, preset ID, blocks/reports, duplicate suppression, and rate limits.

Request shape:

```json
{
  "recipientProfileId": "prof_recipient_123",
  "context": {
    "contextType": "place",
    "contextId": "factory_memory",
    "title": "Factory Memory",
    "reason": "Shared learning context",
    "sourceSurface": "place_card"
  },
  "presetMessageId": "compare_place_learning",
  "idempotencyKey": "client-generated-opaque-key"
}
```

Response shape:

```json
{
  "ok": true,
  "invite": {
    "inviteId": "inv_123",
    "senderProfileId": "prof_sender_456",
    "recipientProfileId": "prof_recipient_123",
    "context": {
      "contextType": "place",
      "contextId": "factory_memory",
      "title": "Factory Memory",
      "reason": "Shared learning context",
      "sourceSurface": "place_card"
    },
    "presetMessageId": "compare_place_learning",
    "state": "pending",
    "createdAt": "2026-06-30T00:00:00Z",
    "updatedAt": "2026-06-30T00:00:00Z",
    "expiresAt": "2026-07-14T00:00:00Z"
  }
}
```

### `GET /social-meet/spotmeeting/inbox`

Lists participant-scoped invites for the authenticated user with pagination, state filters, and an incremental sync cursor.

### `POST /social-meet/spotmeeting/invites/{inviteId}/accept`

Recipient accepts a pending invite.

### `POST /social-meet/spotmeeting/invites/{inviteId}/decline`

Recipient declines a pending invite.

### `POST /social-meet/spotmeeting/invites/{inviteId}/cancel`

Sender or authorized safety process cancels a pending or accepted invite.

### `POST /social-meet/spotmeeting/invites/{inviteId}/complete`

Either participant marks an accepted invite completed once. Repeated calls are idempotent and must not grant rewards or trust deltas.

### `POST /social-meet/spotmeeting/invites/{inviteId}/report`

Creates a moderation report and moves or projects the invite into `reported` for participant safety.

Request shape uses structured fields only:

```json
{
  "reasonCode": "unsafe_or_unwanted_contact",
  "safetyCategory": "invite_abuse"
}
```

### `POST /social-meet/spotmeeting/profiles/{profileId}/block`

Blocks a profile and prevents future suggestions or invite delivery between the participants.

### `GET /social-meet/spotmeeting/sync?cursor=...`

Returns changed participant-scoped invite records since the cursor. Sync timestamps must not be used as last-seen or online status.

### `GET /social-meet/spotmeeting/export`

Starts or returns an authenticated export of participant-scoped invite data according to retention and legal policy.

### `DELETE /social-meet/spotmeeting/invites/{inviteId}`

Requests participant-side deletion or hiding where policy allows. Moderation/legal retention may keep private evidence.

## 16. Failure modes

Required stable failure codes include:

| Code | Meaning |
| --- | --- |
| `backend_not_enabled` | Production backend is unavailable or disabled. |
| `unauthenticated` | Current user identity is missing. |
| `profile_not_published` | Sender has no active discoverable Social Meet profile. |
| `recipient_unavailable` | Recipient cannot receive invites due to visibility, deletion, suspension, block, report, or policy without revealing the exact private reason. |
| `missing_context` | Context is absent. |
| `invalid_context_type` | Context type is not one of the allowed types. |
| `incomplete_context` | Required context fields are missing. |
| `forbidden_invite_field` | Request contains forbidden privacy or free-text fields. |
| `invalid_preset_message` | Preset message ID is missing or unknown. |
| `duplicate_active_invite` | An active invite already exists for the sender, recipient, and context. |
| `rate_limited` | Sender, recipient, or context limit was exceeded. |
| `unknown_invite` | Invite does not exist or is not visible to the authenticated participant. |
| `not_invite_participant` | Current user is not authorized for the participant-scoped action. |
| `invalid_invite_transition` | Requested lifecycle transition is not allowed. |
| `invite_expired` | Invite can no longer be accepted or acted on except for safety/export/deletion actions. |
| `moderation_restricted` | Moderation policy suppresses the requested action. |
| `conflict` | Concurrent action already changed state. Client should refetch. |

Failure responses must not reveal block status, report status, suspension details, private account IDs, or non-participant profile data.

## 17. Test expectations

Before production Spotmeeting discovery is enabled, automated tests should verify:

- invite creation rejects unauthenticated users;
- sender and recipient must have active, consenting Social Meet profiles;
- allowed context types are exactly `place`, `quiz`, `route`, `observation`, `topic`, and `circle`;
- missing context fields are rejected;
- forbidden fields are rejected at any nesting level, including GPS, live location, nearby, distance, last-seen, followers, feed, free chat, public visit history, and passive tracking equivalents;
- invite creation accepts only known `presetMessageId` values;
- free-text invite fields are rejected;
- pending invites fan out to sender and recipient inboxes;
- inbox state sync works across two devices/sessions;
- allowed transitions succeed and invalid transitions fail without mutation;
- completion is idempotent and grants no trust or popularity delta;
- blocks prevent suggestions, creation, and delivery in both directions;
- reports create moderation records and suppress unsafe actions according to policy;
- rate limits and duplicate suppression produce stable failure codes;
- deletion/export/retention workflows include participant-scoped records without exposing private account fields;
- audit logs include safety events but no GPS, live-location, nearby, last-seen, public visit history, followers/feed, or free-chat content;
- API responses never include account IDs, auth subjects, email, phone, IP address, device IDs, or moderation notes.


## Related contracts

- `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md` defines authenticated identity and opt-in public profiles.
- `docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md` defines the server-side block/report/moderation enforcement contract that must gate suggestions, invite creation, invite delivery, inbox rendering, accepting, and completing.

## 18. Production prerequisite

The next backend prerequisite is durable authenticated Social Meet identity plus opt-in public profile publication. Invite persistence must not be enabled for real discovery until that identity layer, profile visibility, block/report enforcement, preset validation, retention/export/delete policy, and moderation hooks are implemented server-side and verified by tests.
