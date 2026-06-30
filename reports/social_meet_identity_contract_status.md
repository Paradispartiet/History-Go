# Social Meet identity contract status

Date: 2026-06-30  
Scope: Documentation/status only. No backend implementation, runtime behavior, Civication files, GPS/live-location features, nearby discovery, followers/feed, free chat, or passive tracking were changed.

## What was added

Added `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md` to define the minimum identity and opt-in public profile contract required before production Spotmeeting discovery can exist.

## Identity model summary

The contract separates private current-user identity from the public Social Meet profile read model:

- Private account identity supports authentication, account binding, consent, deletion/export, rate limits, block/report enforcement, and moderation.
- Public discovery may expose only an opaque `profileId` plus user-approved learning-profile fields.
- `accountId`, auth provider subjects, email, phone, device identifiers, raw learning logs, moderation notes, and delivery metadata remain private.
- A user must explicitly publish a Social Meet profile before appearing in production Spotmeeting discovery.

## Opt-in public profile summary

The public profile is learning-oriented and limited to fields such as:

- `profileId`
- `displayName`
- optional `avatarRef`
- optional `shortBio`
- preferred themes
- favorite eras
- broad interest places or regions selected as learning interests
- learning goals
- optional safe knowledge badges
- coarse knowledge fingerprint summary
- profile visibility and profile content update timestamp

The profile contract requires preview, explicit consent, edit/unpublish controls, export, deletion, and visibility states including draft, private, discoverable, paused, blocked/suspended, and deleted.

## Forbidden fields and behaviors

The contract explicitly forbids using or exposing:

- GPS coordinates
- live location
- nearby user discovery
- distance-to-person
- last seen, online, presence, or availability status
- followers/following and popularity counts
- public activity feed
- free chat or free-text invite messages
- public visit history, check-ins, or recently visited places
- passive tracking or sensor-derived proximity
- raw quiz answers, raw route history, raw observation history, or exact timestamped learning logs as public fields
- account IDs, auth subjects, email, phone, device IDs, IP addresses, and moderation notes in public APIs

## Backend prerequisite

Before production Spotmeeting discovery is enabled, the backend must provide authenticated current-user identity, explicit opt-in profile publication, profile visibility states, public/private field separation, block/report enforcement before suggestion and invite delivery, export/delete/retention workflows, and API/static validation that rejects forbidden fields.

## Checks run

- Attempted to pull latest `main`, but the repository has no configured `origin` remote in this environment.
- Ran available Social Meet / Spotmeeting browser smoke coverage after adding documentation.
