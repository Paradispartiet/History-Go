# HG Social Meet identity contract

Date: 2026-06-30  
Status: Contract only. No backend implementation, runtime behavior, Civication behavior, GPS/live-location discovery, followers/feed, free chat, or passive tracking is introduced by this document.

## 1. Purpose

Production Spotmeeting discovery cannot exist until Social Meet has a minimal, stable identity layer and an explicit opt-in public profile contract. Current Spotmeeting behavior is local/demo-only: invite discovery is disabled in production until a privacy-reviewed backend exists, and demo candidates must remain separate from production people/profile storage.

Identity is required before backend Spotmeeting because the backend must be able to:

- know which authenticated account is making a request;
- enforce profile visibility before a person appears in discovery;
- route an invite to a stable recipient without exposing private account data;
- apply block/report decisions consistently before suggestions or delivery;
- rate-limit abuse by account and public profile ID;
- support deletion, export, retention, and moderation workflows;
- avoid unsafe substitutes such as GPS, live location, nearby detection, public visit history, last-seen status, follower graphs, feeds, free chat, or passive tracking.

## 2. Non-goals and hard exclusions

This contract defines only stable IDs and opt-in profile fields. It does not define implementation code, persistence technology, discovery ranking algorithms, backend rollout steps, Civication behavior, or runtime UI changes.

Social Meet identity and Spotmeeting discovery must never add, store, expose, infer, rank by, or API-return:

- GPS coordinates;
- live location;
- nearby user discovery;
- distance-to-person;
- last seen, online, presence, or availability status;
- followers, following, follower counts, popularity counts, or social graph ranking;
- public activity feed;
- free chat, free-text invite messages, or open direct messaging;
- public visit history, recently visited places, check-ins, or passive place trails;
- background movement, passive tracking, sensor-derived proximity, or co-presence inference;
- raw quiz answer logs, raw route history, raw observation history, or exact timestamped learning behavior as public profile fields;
- private email, phone number, auth provider subject, legal name, birth date, precise age, payment data, device identifiers, IP address, or moderation notes in public profile responses.

## 3. Minimal current-user identity model

The current-user identity model is private account infrastructure. It is required so backend Spotmeeting can authenticate, authorize, and enforce safety rules without leaking account data to other users.

Required private current-user fields:

| Field | Visibility | Purpose |
| --- | --- | --- |
| `accountId` | Private | Stable internal account identifier for authentication, deletion, export, rate limits, and abuse controls. |
| `userId` | Private service boundary | Stable Social Meet user identifier used by backend services. It may map one-to-one with `accountId` but must not reveal auth-provider details. |
| `authSubject` | Private auth boundary | Provider-specific subject or credential binding. Never public. |
| `createdAt` | Private | Account lifecycle, retention, and audit support. |
| `deletedAt` | Private | Tombstone state for deletion and suppression. |
| `profileId` | Public only when visible | Stable public-profile identifier, created separately from the private account ID. |
| `profileVisibility` | Private control, public effect | One of the profile visibility states in this contract. |
| `consentVersion` | Private | Version of the Social Meet identity/profile consent accepted by the user. |
| `consentedAt` | Private | Timestamp of the latest active consent. |
| `blockedProfileIds` | Private | Profiles the current user has blocked. |
| `reportedProfileIds` | Private/moderation | Profiles the current user has reported. |

Rules:

- `accountId`, `authSubject`, email, phone, and device identifiers must never be returned in public discovery or public profile APIs.
- `profileId` is the only user-facing stable identifier that discovery and invite APIs may expose.
- A user without active consent and a visible profile must not appear as a Spotmeeting candidate.
- A user may use History Go without publishing a Social Meet profile.

## 4. Opt-in public profile model

A public Social Meet profile is an intentionally published, learning-oriented read model. It exists to help another user understand compatible historical interests before sending a preset Spotmeeting invite.

Allowed public profile fields:

| Field | Required | Notes |
| --- | --- | --- |
| `profileId` | Yes | Stable opaque public identifier. Not the same as `accountId` or auth provider ID. |
| `displayName` | Yes | User-chosen display name. Must be moderation-safe. |
| `avatarRef` | No | Moderated visual identity reference or generated avatar. No hidden location metadata. |
| `shortBio` | No | Short user-authored learning bio. Must be moderated and length-limited. |
| `preferredThemes` | No | Coarse historical themes selected by the user. |
| `favoriteEras` | No | Coarse eras/periods selected by the user. |
| `interestPlaces` | No | User-selected broad historical places or regions for learning interest, not visit history or current location. |
| `learningGoals` | No | Public learning goals selected or written by the user. |
| `knowledgeBadges` | No | Optional learning/contribution badges safe to display. Must not imply location, presence, or popularity. |
| `profileVisibility` | Yes | Current public visibility state. |
| `profileUpdatedAt` | Yes | Profile read-model freshness. Not last seen or online status. |

Public profile rules:

- Public fields must be user-entered, user-selected, or privacy-safe summaries the user explicitly opted to publish.
- Profiles must be editable, unpublishable, and deletable.
- `profileUpdatedAt` describes profile content freshness only; it must not be displayed or used as last-seen/online status.
- Public profile responses must be safe if cached, shared with invite participants, or used in a moderation queue.

## 5. Public vs private fields

Public fields are fields intentionally exposed to other opted-in Social Meet users. Private fields support authentication, safety, delivery, retention, and compliance.

Public by opt-in only:

- `profileId`
- `displayName`
- `avatarRef`
- `shortBio`
- `preferredThemes`
- `favoriteEras`
- `interestPlaces`
- `learningGoals`
- `knowledgeBadges`
- `knowledgeFingerprintSummary`
- `profileVisibility`
- `profileUpdatedAt`

Private only:

- `accountId`
- `userId` when not necessary for an internal service boundary
- `authSubject`
- email, phone, auth provider details, payment data, device IDs, IP addresses
- consent records
- block/report records
- invite delivery metadata
- moderation queues and reviewer notes
- raw learning events, raw quiz answers, raw routes, raw observations, raw timestamps
- deletion/export job records and retention tombstones

## 6. Knowledge fingerprint fields allowed for matching

A knowledge fingerprint is a coarse, explainable, editable matching summary. It may be used for Spotmeeting candidate suggestions only after profile opt-in.

Allowed matching inputs:

- explicit interest themes selected by the user;
- favorite eras, periods, or domains selected by the user;
- broad place/topic/route categories selected as interests, not visited places;
- quiz topics the user chooses to associate with the public profile;
- learning goals the user chooses to publish;
- learning circle categories where membership visibility permits the category to be used;
- optional public badges or contribution categories that do not reveal raw activity logs.

Allowed fingerprint output fields:

| Field | Purpose |
| --- | --- |
| `themeTags` | Coarse historical themes. |
| `eraTags` | Coarse eras/periods. |
| `topicTags` | Coarse topics or domains. |
| `routeCategoryTags` | Route categories, not route history. |
| `quizTopicTags` | Opted-in quiz topic categories, not raw answers. |
| `learningGoalTags` | Public learning goals. |
| `matchExplanation` | Human-readable explanation such as shared theme or compatible era. |

Fingerprint rules:

- The fingerprint must be explainable to the user.
- The user must be able to edit or disable the inputs.
- Matching must use coarse categories, not raw behavior logs.
- Matching must never use GPS, live location, nearby status, last seen, public visit history, followers, feeds, free chat content, passive tracking, or distance-to-person.

## 7. Consent flow

A user must complete an explicit Social Meet profile consent flow before becoming discoverable.

Required consent steps:

1. Show the Social Meet purpose: knowledge-based matching and preset Spotmeeting invites.
2. Show the hard exclusions: no GPS, no live location, no nearby users, no distance-to-person, no last seen, no followers/feed, no free chat, no public visit history, and no passive tracking.
3. Let the user choose public profile fields and knowledge-fingerprint inputs.
4. Let the user preview the public profile exactly as others will see it.
5. Require an explicit publish action.
6. Store `consentVersion`, `consentedAt`, selected fields, and visibility state.
7. Provide controls to edit, pause, unpublish, export, or delete the profile.

Consent must be revocable. Revocation must remove the user from discovery and prevent new invite delivery except for already-existing participant-scoped records required by retention or moderation policy.

## 8. Profile visibility states

Required states:

| State | Discovery behavior | Public profile behavior | Invite behavior |
| --- | --- | --- | --- |
| `draft` | Not discoverable. | Not public. | Cannot receive production Spotmeeting discovery invites. |
| `private` | Not discoverable. | Not public. | Existing participant-scoped invites may remain visible only to participants as policy allows. |
| `discoverable` | Eligible for knowledge-based candidate suggestions. | Public profile read model is visible to opted-in Social Meet users. | May receive preset, context-bound invites unless blocked/rate-limited. |
| `paused` | Not discoverable. | Existing participant-scoped records remain limited to participants. | No new discovery invites. Existing invites can be declined/cancelled/completed as policy allows. |
| `blocked_or_suspended` | Not discoverable. | Not public except moderation/admin boundaries. | No new invites; moderation rules determine existing records. |
| `deleted` | Not discoverable. | Not public. | Records are removed, anonymized, or retained only as required by retention/moderation policy. |

## 9. Account deletion, export, and retention requirements

Before production Spotmeeting discovery, the backend must support:

- account/profile export containing current-user identity metadata, public profile fields, consent history, blocks, reports submitted by the user when legally exportable, and participant-scoped invite records;
- profile unpublish that immediately removes the profile from discovery;
- account deletion that removes or anonymizes public profile data and prevents future discovery;
- retention windows for invite records, report records, moderation evidence, and deletion tombstones;
- deletion suppression so a deleted or suspended profile cannot reappear through cached discovery results;
- clear distinction between user-visible deletion and legally/safety-required moderation retention.

Retention must not become passive tracking. Retained records must not be repurposed for nearby discovery, public visit history, followers/feed, last-seen status, or behavioral advertising.

## 10. Block/report identity implications

Blocks and reports require stable identity, but they must remain private safety records.

Block rules:

- If profile A blocks profile B, neither profile should be suggested to the other.
- New invite delivery between blocked profiles must be prevented.
- Existing participant-scoped records may remain visible only as needed to let users manage safety, decline, cancel, export, or preserve moderation evidence.
- Block state must not be exposed as a public profile field.

Report rules:

- Reports must bind to stable `reportId`, reporter `profileId`, reported `profileId`, related invite/context IDs when present, reason code, timestamps, and moderation status.
- Reported users must not see reporter private identity beyond what is already visible from the participant-scoped interaction.
- Moderation notes, reporter account IDs, auth subjects, IPs, and device details must never appear in public APIs.
- Report outcomes may affect visibility, rate limits, or suspension but must not become public popularity/trust scores.

## 11. Backend API contract sketch

This is a contract sketch only. It does not require current implementation.

### Current user

`GET /social-meet/me`

Returns private current-user Social Meet state for the authenticated account:

```json
{
  "userId": "usr_opaque",
  "profileId": "prof_opaque_or_null",
  "profileVisibility": "draft",
  "consentVersion": "social_meet_identity_v1",
  "consentedAt": null,
  "canPublishProfile": true
}
```

### Publish or update profile

`PUT /social-meet/profile`

Accepts only opt-in public profile fields and selected fingerprint inputs. Must reject forbidden fields.

```json
{
  "displayName": "Ada",
  "avatarRef": "avatar_generated_01",
  "shortBio": "Interested in industrial history and local memory.",
  "preferredThemes": ["industrial_history"],
  "favoriteEras": ["late_1800s"],
  "interestPlaces": ["factory_towns"],
  "learningGoals": ["compare_sources"],
  "fingerprintInputs": {
    "themeTags": ["industrial_history"],
    "eraTags": ["late_1800s"],
    "topicTags": ["labor_history"]
  },
  "profileVisibility": "discoverable",
  "consentVersion": "social_meet_identity_v1"
}
```

### Public profile read model

`GET /social-meet/profiles/{profileId}`

Returns the public read model only when the profile is discoverable or participant-scoped access is allowed:

```json
{
  "profileId": "prof_opaque",
  "displayName": "Ada",
  "avatarRef": "avatar_generated_01",
  "shortBio": "Interested in industrial history and local memory.",
  "preferredThemes": ["industrial_history"],
  "favoriteEras": ["late_1800s"],
  "interestPlaces": ["factory_towns"],
  "learningGoals": ["compare_sources"],
  "knowledgeBadges": [],
  "knowledgeFingerprintSummary": {
    "themeTags": ["industrial_history"],
    "eraTags": ["late_1800s"],
    "topicTags": ["labor_history"]
  },
  "profileVisibility": "discoverable",
  "profileUpdatedAt": "2026-06-30T00:00:00Z"
}
```

### Candidate discovery

`POST /social-meet/spotmeeting/candidates`

Request must be authenticated, context-bound, and free of forbidden fields:

```json
{
  "context": {
    "contextType": "place",
    "contextId": "factory_memory",
    "title": "Factory Memory",
    "reason": "shared historical topic",
    "sourceSurface": "place_card"
  },
  "presetMessageIdsAllowed": true
}
```

Response returns only opted-in, discoverable, non-blocked public profiles with explanation-safe match reasons:

```json
{
  "candidates": [
    {
      "profileId": "prof_opaque",
      "displayName": "Ada",
      "avatarRef": "avatar_generated_01",
      "matchExplanation": ["Shared theme: industrial history"]
    }
  ]
}
```

### Invite creation

`POST /social-meet/spotmeeting/invites`

Must accept only preset message IDs and context-bound recipient IDs:

```json
{
  "recipientProfileId": "prof_opaque",
  "context": {
    "contextType": "quiz",
    "contextId": "factory_memory",
    "title": "Factory Memory",
    "reason": "quiz together",
    "sourceSurface": "place_card"
  },
  "presetMessageId": "quiz_together"
}
```

Must reject free text, forbidden fields, hidden location metadata, blocked recipients, suspended profiles, non-discoverable recipients, and rate-limit violations.

### Block/report/export/delete

Required endpoints before production discovery:

- `POST /social-meet/blocks`
- `DELETE /social-meet/blocks/{profileId}`
- `POST /social-meet/reports`
- `GET /social-meet/export`
- `DELETE /social-meet/account`
- `POST /social-meet/profile/unpublish`

All endpoints must preserve the public/private boundary in this contract.

## 12. Test expectations

Before production Spotmeeting discovery is enabled, automated checks should verify:

- production discovery remains disabled unless authenticated current-user identity, opt-in profile visibility, and backend safety enforcement are active;
- public profile APIs never return private identifiers or forbidden fields;
- profile publication requires explicit consent and a public-profile preview;
- unpublish, pause, suspension, deletion, and block states remove profiles from discovery;
- candidate discovery rejects contexts containing GPS, latitude, longitude, coordinates, live location, nearby, distance, last seen, followers, following, feed, chat, free text, public visit history, visited places, or passive tracking fields;
- invite creation accepts only allowed preset message IDs and context types;
- block/report enforcement happens before suggestions and before invite delivery;
- export/delete workflows include Social Meet identity/profile state without exposing private moderation notes to public APIs;
- existing Social Meet smoke coverage continues to confirm no forbidden UI for live location, nearby users, followers/feed, free chat, or last-seen behavior.

## 13. Next backend prerequisite

The next backend prerequisite is to implement authenticated current-user identity plus opt-in public profile publication, including visibility states, consent records, block/report enforcement, export/delete support, and static API validation for the forbidden fields listed above. Production Spotmeeting discovery must remain off until that prerequisite is complete.
