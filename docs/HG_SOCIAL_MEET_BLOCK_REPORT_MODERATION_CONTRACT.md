# HG Social Meet block/report and moderation contract

Date: 2026-06-30  
Status: Documentation/API contract only. No backend implementation, runtime behavior, Civication behavior, GPS/live-location discovery, nearby discovery, followers/feed, free chat, public visit history, or passive tracking is introduced by this document.

## 1. Purpose

Production Spotmeeting discovery must not be enabled until Social Meet has server-side block, report, moderation, retention, deletion, export, abuse-prevention, and audit contracts. Client-only blocking is useful for demos, but it cannot protect a real recipient across devices, cached candidate suggestions, inbox fan-out, notifications, or backend lifecycle transitions.

This contract extends the Social Meet identity and invite backend contracts with the minimum safety layer required before real people can appear in production discovery.

## 2. Why block/report must exist before production discovery

Block/report must exist before production discovery because production discovery creates real person-to-person contact risk. The backend must be able to:

- prevent a blocked profile from appearing in future suggestions;
- prevent invite creation and delivery between profiles when either side has blocked the other;
- let a user report unsafe behavior without revealing the reporter identity to the reported user;
- suppress abusive accounts before inbox rendering, accepting, completing, or further contact;
- preserve moderation evidence without exposing private account data;
- enforce cooldowns and rate limits after reports, declines, repeated invites, or blocks;
- support cross-device consistency, deletion, export, and retention;
- avoid unsafe substitutes such as GPS, live location, nearby users, distance-to-person, last-seen status, followers, feeds, public visit history, passive tracking, or free chat.

## 3. Non-goals and hard exclusions

This contract does not implement a backend, database schema, runtime UI, notifications provider, ranking algorithm, Civication behavior, or analytics pipeline.

Social Meet block/report/moderation APIs must never add, store, expose, infer, rank by, or API-return:

- GPS coordinates;
- live location;
- nearby users;
- distance-to-person;
- last-seen, online, presence, or availability status;
- followers, following, follower counts, popularity counts, or social graph ranking;
- public activity feed;
- public visit history, recently visited places, check-ins, or passive place trails;
- background movement, passive tracking, sensor-derived proximity, or co-presence inference;
- free chat, free-text invite messages, open direct messaging, or custom report messages visible to the reported user;
- private email, phone number, auth provider subject, legal name, birth date, precise age, payment data, device identifiers, IP address, or moderator notes in public or participant APIs.

## 4. Block model

A block is a private safety relationship initiated by one profile against another profile.

Required block fields:

| Field | Visibility | Notes |
| --- | --- | --- |
| `blockId` | Private/current blocker/export as allowed | Opaque stable ID. |
| `blockerProfileId` | Private/current blocker/moderation | Public profile ID of the user who created the block. |
| `blockedProfileId` | Private/current blocker/moderation | Public profile ID of the user being blocked. |
| `scope` | Private/moderation | `social_meet` by default; may include `spotmeeting_invites` when invite-specific enforcement is required. |
| `relatedInviteId` | Private/current blocker/moderation | Optional invite that caused the block. |
| `relatedContext` | Private/current blocker/moderation | Optional sanitized context reference only. No GPS or presence data. |
| `status` | Private/current blocker/moderation | `active`, `removed_by_blocker`, `expired_by_policy`, or `superseded_by_moderation`. |
| `createdAt` | Private/current blocker/export as allowed | Safety timestamp. Not presence or last-seen. |
| `updatedAt` | Private/current blocker/export as allowed | Record timestamp. Not presence or last-seen. |
| `removedAt` | Private/current blocker/export as allowed | Present only when unblocked. |
| `sourceSurface` | Private/moderation | Surface where the user intentionally blocked. |

Block rules:

- Blocking must prevent future suggestions in both directions.
- Blocking must prevent new invite creation and invite delivery in both directions.
- Blocking must be enforced server-side even if a cached client still displays a stale candidate.
- Blocking must not notify the blocked user with the blocker identity or block reason.
- Blocking must not become a public profile field, public trust score, follower-like edge, or feed event.
- Existing participant-scoped invites may remain visible only for safety actions, export, deletion, retention, or moderation evidence.
- Unblocking may remove the relationship for future interactions, but it must not automatically resend old invites or bypass cooldown/rate-limit policy.

## 5. Report model

A report is a private safety submission from a reporter about another profile, invite, context, or interaction.

Required report fields:

| Field | Visibility | Notes |
| --- | --- | --- |
| `reportId` | Reporter/moderation/export as allowed | Opaque stable ID. |
| `reporterProfileId` | Private reporter/moderation | Never revealed to the reported user by report APIs. |
| `reportedProfileId` | Reporter/moderation | Public profile ID being reported. |
| `relatedInviteId` | Reporter/moderation | Optional participant-scoped invite ID. |
| `relatedContext` | Reporter/moderation | Sanitized context reference only. |
| `reasonCode` | Reporter/moderation | Allow-list value such as `harassment`, `spam`, `unsafe_behavior`, `impersonation`, `minor_safety`, `other_policy_violation`. |
| `structuredDetails` | Reporter/moderation | Optional bounded checklist or enum details. No free chat to the reported user. |
| `status` | Reporter/moderation | `submitted`, `queued`, `under_review`, `actioned`, `no_action`, `appealed`, `closed`, or `retained_for_safety`. |
| `createdAt` | Reporter/moderation/export as allowed | Safety timestamp. Not presence or last-seen. |
| `updatedAt` | Reporter/moderation/export as allowed | Record timestamp. Not presence or last-seen. |
| `evidenceRefs` | Moderation only | References to participant-scoped invite/profile/context records. |

Report rules:

- Reporting must not reveal reporter identity to the reported user.
- Reported users may receive only safe outcome copy, such as account restriction or content removal, when policy requires notice.
- Reporter account IDs, auth subjects, email, phone, device identifiers, IP addresses, moderator notes, and internal risk scores must never appear in participant/public APIs.
- Reports may trigger moderation review, rate limits, candidate suppression, delivery suppression, account suspension, or content removal.
- Reports must not create public scores, badges, popularity counters, feeds, or follower-like reputation.

## 6. Moderation queue model

The moderation queue is a private operational work queue derived from reports, automated safety rules, and admin actions.

Required queue fields:

| Field | Visibility | Notes |
| --- | --- | --- |
| `queueItemId` | Moderator/admin only | Opaque stable ID. |
| `reportId` | Moderator/admin only | Optional linked report. |
| `subjectProfileId` | Moderator/admin only | Profile under review. |
| `reporterProfileId` | Moderator/admin only | Optional reporter; hidden from reported user. |
| `relatedInviteId` | Moderator/admin only | Optional invite. |
| `relatedContext` | Moderator/admin only | Sanitized context reference. |
| `priority` | Moderator/admin only | `low`, `normal`, `high`, `urgent`. |
| `category` | Moderator/admin only | Policy category. |
| `state` | Moderator/admin only | `queued`, `triaged`, `under_review`, `needs_more_info`, `actioned`, `no_action`, `appealed`, `closed`. |
| `assignedModeratorId` | Moderator/admin only | Internal staff/admin identifier. |
| `reviewNotes` | Moderator/admin only | Private notes. Never public. |
| `actionsTaken` | Moderator/admin only | Structured action log. |
| `createdAt` / `updatedAt` / `closedAt` | Moderator/admin only | Queue timestamps. Not presence. |

Moderator actions may include `suppress_profile`, `suspend_profile`, `cancel_invite`, `expire_invite`, `apply_interaction_block`, `remove_public_profile_field`, `uphold_report`, `reject_report`, `escalate`, or `restore_after_review`.

## 7. Enforcement points

The backend must enforce block/report/moderation state at these points:

1. **Before candidate suggestions**: remove candidates where either profile has blocked the other, either profile is suspended, either profile is not discoverable, or moderation has suppressed the pair/context.
2. **Before invite creation**: reject creation when block, report-derived restriction, duplicate suppression, visibility, consent, context validation, preset validation, or rate limits fail.
3. **Before invite delivery**: perform a final server-side check immediately before writing recipient inbox projections or notification payloads.
4. **Before inbox rendering**: filter or tombstone records based on block, deletion, suspension, retention, and participant authorization.
5. **Before accepting/completing**: prevent lifecycle actions when the other participant is blocked, the invite is restricted/reported, the actor is suspended, the invite is expired, or the transition is invalid.

Stable errors should be non-enumerating: `recipient_unavailable`, `interaction_blocked`, `moderation_restricted`, `rate_limited`, `invalid_invite_transition`, `forbidden_invite_field`, or `backend_not_enabled`.

## 8. Required user controls

Production Social Meet must provide user controls to:

- block a profile from a public profile, candidate card, invite card, retained participant record, and report outcome surface;
- unblock from a private safety/settings surface;
- report a profile or invite with reason-code choices;
- hide or delete participant-side invite records when policy allows;
- cancel, decline, or stop interaction without needing to report;
- pause/unpublish/delete the user's public Social Meet profile;
- export the user's profile, blocks, reports submitted by the user when legally exportable, and participant-scoped invite records;
- see clear safety copy explaining that reports are confidential and that Spotmeeting has no GPS, live location, nearby users, distance-to-person, last-seen status, followers/feed, public visit history, passive tracking, or free chat.

## 9. Required admin/moderator controls

Moderator/admin tools must support:

- queue triage by report category, age, priority, involved profile IDs, and related invite/context;
- reviewing sanitized public profile fields, invite metadata, preset message ID, lifecycle events, block/report history, and audit events;
- applying account/profile suspension, profile suppression, interaction block, invite cancellation/expiry, content removal, cooldown, or rate-limit escalation;
- resolving, closing, reopening, and escalating reports;
- viewing private reporter identity only within authorized moderation boundaries;
- writing private notes that never leave moderator/admin APIs;
- exporting audit/action history for compliance without location/presence tracking;
- restoring access after successful review or appeal.

## 10. Abuse and rate-limit interactions

Block/report events must feed abuse controls without becoming public reputation:

- stricter invite creation limits after repeated reports, declines, cancellations, duplicate attempts, or blocks;
- per-sender and per-recipient invite limits by minute, hour, and day;
- duplicate suppression by sender, recipient, context, and active invite state;
- cooldowns after a recipient declines, reports, or blocks;
- temporary candidate suppression for profiles with unresolved high-severity reports;
- non-enumerating errors so attackers cannot test who blocked or reported them;
- audit events for enforcement decisions, not public scores or feeds.

## 11. Retention, deletion, and export requirements

The backend must define retention windows for blocks, reports, moderation queue records, invite evidence, audit logs, deletion tombstones, and appeal records.

Requirements:

- user export must include the user's active/removed blocks, reports submitted by the user when legally exportable, report statuses safe to disclose, and participant-scoped invite records;
- deletion must remove or anonymize public profile data while retaining private safety evidence only when legally or operationally required;
- deleted, blocked, suspended, or withdrawn profiles must stay on suppression lists long enough to prevent cached rediscovery;
- retained moderation records must not be repurposed for discovery, ranking, behavioral ads, feeds, public visit history, or passive tracking;
- participant views should use safe tombstones such as `deleted_profile` or `recipient_unavailable` when a retained record references deleted data.

## 12. Appeal and review states

If account/profile restrictions are applied, the backend should support appeal/review states:

- `not_appealable` for low-impact or expired actions;
- `appeal_available` when the user may request review;
- `appeal_submitted` after user submission;
- `appeal_under_review` during moderator review;
- `appeal_upheld` when the action remains;
- `appeal_granted` when the action is reversed or reduced;
- `closed` after final disposition.

Appeal APIs must not disclose reporter identity, private evidence from other users, device/IP details, moderator notes, or internal risk scoring.

## 13. Audit logging without tracking location or presence

Audit logs should capture security and safety decisions only.

Allowed audit fields:

- `auditEventId`;
- `actorType` such as `user`, `moderator`, `admin`, or `system`;
- `actorProfileId` when user-facing and allowed;
- `actorAdminId` for authorized staff actions;
- `targetProfileId`;
- `actionType`;
- `relatedBlockId`, `relatedReportId`, `relatedInviteId`, or sanitized `contextId`;
- `policyVersion`;
- `decision` and stable `reasonCode`;
- `createdAt`.

Forbidden audit fields include GPS, latitude, longitude, live location, nearby status, distance-to-person, last-seen, online/presence, public visit history, route traces, passive movement, followers/following, feed identifiers, free-chat contents, raw IP/device identifiers in general moderator views, and any equivalent nested field.

## 14. API sketch

All endpoints require authenticated Social Meet identity and must use public `profileId` values at participant boundaries.

```http
GET /social-meet/blocks
POST /social-meet/blocks
DELETE /social-meet/blocks/{blockId}

POST /social-meet/reports
GET /social-meet/reports/submitted
GET /social-meet/reports/{reportId}

GET /social-meet/moderation/queue
GET /social-meet/moderation/queue/{queueItemId}
POST /social-meet/moderation/queue/{queueItemId}/actions
POST /social-meet/moderation/reports/{reportId}/resolve
POST /social-meet/moderation/profiles/{profileId}/suspend
POST /social-meet/moderation/profiles/{profileId}/restore

GET /social-meet/appeals
POST /social-meet/appeals
POST /social-meet/appeals/{appealId}/decision
```

Example block request:

```json
{
  "blockedProfileId": "prof_opaque_recipient",
  "relatedInviteId": "inv_opaque_optional",
  "sourceSurface": "spotmeeting_inbox"
}
```

Example report request:

```json
{
  "reportedProfileId": "prof_opaque_subject",
  "relatedInviteId": "inv_opaque_optional",
  "reasonCode": "unsafe_behavior",
  "structuredDetails": ["repeated_unwanted_invites"],
  "sourceSurface": "spotmeeting_inbox"
}
```

Example participant-safe report response:

```json
{
  "reportId": "rep_opaque",
  "status": "submitted",
  "createdAt": "2026-06-30T00:00:00.000Z"
}
```

The response intentionally omits reporter account data, reporter private identity, moderator notes, IP/device data, and any location/presence fields.

## 15. Failure modes

Required failure behavior:

- stale candidate caches must be revalidated before invite creation and delivery;
- block/report write failures must fail closed for contact creation;
- moderation queue write failures after report submission must keep the report durable for retry;
- notification fan-out must not occur until final block/moderation/rate-limit checks pass;
- inbox rendering must use tombstones instead of leaking deleted or suspended profile details;
- API errors must not reveal whether the recipient blocked or reported the actor;
- client-supplied forbidden fields must be rejected at any nesting level;
- backend outages must not enable production discovery by fallback.

## 16. Test expectations

Before production discovery is enabled, automated tests must verify:

- blocks prevent future suggestions in both directions;
- blocks prevent invite creation and delivery in both directions;
- stale candidate results are rejected at creation/delivery time;
- reports can be submitted without revealing reporter identity to the reported user;
- report and moderation responses omit private account IDs, auth subjects, IPs, device IDs, and notes;
- moderation restrictions prevent suggestions, creation, delivery, inbox actions, accept, and complete;
- inbox rendering filters or tombstones blocked, deleted, suspended, or restricted records safely;
- rate limits and cooldowns activate after repeated invites, reports, declines, cancellations, and blocks;
- export/deletion/retention behavior follows policy and preserves safety tombstones;
- appeal states do not reveal reporter identity or private evidence;
- forbidden fields are rejected at any nesting level in block, report, invite, audit, queue, and export APIs;
- audit logs contain safety actions but no GPS, live location, nearby users, distance-to-person, last-seen, online status, followers/following, feeds, public visit history, passive tracking, or free chat.

## 17. Production enablement gate

Production Spotmeeting discovery may be enabled only after backend identity, opt-in profile publication, invite persistence, block/report enforcement, moderation queue, rate limits, retention/deletion/export, appeal/review policy, and no-forbidden-field tests are implemented and verified server-side.
