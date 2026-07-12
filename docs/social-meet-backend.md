# Social Meet backend (Supabase)

Status: **Backend foundation + frontend adapter.** The schema/RLS contract lives
in `supabase/migrations/001_social_meet.sql`, and the frontend adapter layer now
lives in `js/social/HGSocialMeetSupabaseClient.js` and
`js/social/HGSocialMeetAdapter.js`.

The original Supabase PR established a safe, privacy-governed database contract.
This follow-up adds the frontend adapter layer while still avoiding committed
Supabase credentials, service-role keys, edge functions, and message/chat
tables.

Related, more detailed contracts already in the repo:

- `docs/HG_SOCIAL_ARCHITECTURE.md` — overall knowledge-based social model.
- `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md` — full invite lifecycle and
  API sketch.
- `docs/HG_SOCIAL_MEET_BACKEND_ROADMAP.md` — phased production rollout gates.
- `docs/HG_SOCIAL_DEMO_MODE.md` — local demo/seed layer used today.

---

## 1. Product model

History Go's social layer is **knowledge-based, not location-based**. The three
surfaces map to responsibilities like this:

| Surface | Responsibility |
| --- | --- |
| **På stedet** (on the place card) | A link/status entry point into Social Meet — "start a Kunnskapsmøte here", or show the status of an existing one. |
| **Kunnskapsmøte** | The popup/flow for **starting a meeting proposal** — pick a context and a preset message, send an invite. |
| **Social Meet** | The popup for **following up** proposals: pending/accepted/completed invites, agreements, learning circles, and social learning history. |
| **Profil** | Settings, privacy and history controls. |

In one line:

- **Kunnskapsmøte = start a meeting proposal.**
- **Social Meet = follow up proposals, agreements, history and learning circles.**
- **Profil = settings / privacy.**

Every social object is **context-bound** and **participant-scoped**. A meeting
proposal always refers to exactly one History Go context — a place, quiz,
route, observation, topic, or circle — and is only ever visible to the people
taking part in it.

---

## 2. Tables

All tables live in the `public` schema and are created by
`supabase/migrations/001_social_meet.sql`.

### `hg_profiles`

Links a Supabase auth user to their History Go profile.

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | `uuid` PK → `auth.users(id)` on delete cascade | The Supabase user. |
| `display_name` | `text` | |
| `avatar_url` | `text` | |
| `public_home_place_id` | `text` | A **public** History Go place id (e.g. a landmark the user picks as a home base). **Never a private address.** |
| `created_at` | `timestamptz` default `now()` | |
| `updated_at` | `timestamptz` default `now()` | Maintained by trigger. |

### `hg_spotmeeting_invites`

The core Kunnskapsmøte / Social Meet table — one row per meeting proposal.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK default `gen_random_uuid()` | |
| `created_by` | `uuid` → `auth.users(id)` | The proposer. |
| `target_user_id` | `uuid` → `auth.users(id)` | The recipient. |
| `context_type` | `text` | One of `place`, `quiz`, `route`, `observation`, `topic`, `circle`. |
| `context_id` | `text` | Stable History Go content id. |
| `context_title` | `text` | Display title (optional). |
| `source_surface` | `text` | Where the invite was started (optional). |
| `preset_message_id` | `text` | Id of a **server-owned preset message**. There is no free-text field. |
| `status` | `text` default `pending` | One of `pending`, `accepted`, `declined`, `cancelled`, `completed`. |
| `created_at` / `updated_at` | `timestamptz` | `updated_at` maintained by trigger. |

There is deliberately **no** `message`, `body`, `chat_text`, or `comment`
column. Communication is limited to a preset id.

### `hg_learning_circles`

Small learning circles (læringssirkler) for later group features.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `created_by` | `uuid` → `auth.users(id)` | Owner/creator. |
| `title` | `text` not null | |
| `context_type` | `text` nullable | If present, one of the allowed context types. |
| `context_id` | `text` nullable | |
| `created_at` / `updated_at` | `timestamptz` | `updated_at` maintained by trigger. |

### `hg_learning_circle_members`

Explicit membership in a learning circle.

| Column | Type | Notes |
| --- | --- | --- |
| `circle_id` | `uuid` → `hg_learning_circles(id)` on delete cascade | |
| `user_id` | `uuid` → `auth.users(id)` on delete cascade | |
| `role` | `text` default `member` | One of `owner`, `member`. |
| `created_at` | `timestamptz` | |
| PK | `(circle_id, user_id)` | One membership row per user per circle. |

### `hg_social_activity`

Read-only per-user history/log.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` PK | |
| `user_id` | `uuid` → `auth.users(id)` | Whose history row this is. |
| `activity_type` | `text` | One of `invite_created`, `invite_accepted`, `invite_declined`, `invite_cancelled`, `invite_completed`, `circle_created`, `circle_joined`, `circle_left`. |
| `invite_id` | `uuid` → `hg_spotmeeting_invites(id)` on delete set null | Optional link. |
| `circle_id` | `uuid` → `hg_learning_circles(id)` on delete set null | Optional link. |
| `context_type` / `context_id` | `text` | Optional context echo. |
| `created_at` | `timestamptz` | |

### Indexes

- `hg_spotmeeting_invites`: `created_by`, `target_user_id`, `status`,
  `(context_type, context_id)`, `created_at desc`.
- `hg_learning_circles`: `created_by`, `(context_type, context_id)`.
- `hg_social_activity`: `(user_id, created_at desc)`.

### `updated_at` trigger

A single reusable function `public.set_updated_at()` sets `updated_at = now()`
on update. It is attached to `hg_profiles`, `hg_spotmeeting_invites`, and
`hg_learning_circles`. If the repo later adopts a shared trigger function,
reuse that one instead of duplicating this.

---

## 3. RLS rules

Row Level Security is **enabled on every table**. All policies are scoped to
the `authenticated` role and use `auth.uid()`. There is no anonymous access.

**`hg_profiles`** — a user can `select`, `insert`, and `update` only their own
row (`auth.uid() = user_id`).

**`hg_spotmeeting_invites`**
- `select`: either participant (`created_by = auth.uid()` **or**
  `target_user_id = auth.uid()`).
- `insert`: only as the creator (`created_by = auth.uid()`).
- `update`: either participant. The database only guarantees that a
  non-participant can never touch the row — **which** participant may move to
  **which** status is intentionally left to the adapter (see below). No delete
  policy.

**`hg_learning_circles`**
- `select`: the creator, or any member of the circle.
- `insert`: only as the creator.
- `update`: creator only. No delete policy in this first cut.

**`hg_learning_circle_members`**
- `select`: your own membership rows, or any membership of a circle you own.
- `insert`: you may add yourself as a plain `member` (self-join), or the circle
  owner may add members.
- `delete`: you may remove your own membership (leave), or the circle owner may
  remove members. No update policy.

**`hg_social_activity`**
- `select`: your own rows only (`user_id = auth.uid()`).
- `insert`: allowed only for your own rows (`user_id = auth.uid()`).
- **No update and no delete policy** — history is read-only from the client.

### Design choice: activity-log inserts

For the log, the simplest safe option was chosen: the client may insert its own
activity rows (`user_id = auth.uid()`) but can never update or delete them, so
history stays append-only from the client's perspective. If we later want the
log to be fully server-authoritative, a server/edge function (using the service
role, which bypasses RLS) can take over inserts and the client insert policy can
be dropped. This is documented here so the choice is explicit.

### Design choice: invite status state-machine

The `status` CHECK constraint only limits the *set* of allowed values. The
transition rules are enforced by the future adapter, not the DB:

- the **creator** may `cancel` a pending/accepted invite;
- the **target** may `accept` / `decline` a pending invite;
- **both** participants may later mark an accepted invite `completed`, if the
  product allows it.

RLS guarantees only that non-participants cannot read or write the row.

---

## 4. What is deliberately not supported

This schema intentionally cannot express any of the following, and future
changes must keep it that way:

- **No chat.**
- **No free-text messages** — no `message` / `body` / `chat_text` / `comment`
  columns; communication is a server-owned `preset_message_id` only.
- **No live position** and no GPS/coordinate fields.
- **No public nearby-users feed** and no proximity/distance-to-person.
- **No followers / following / feed** and no popularity counters.
- **No dating logic** and no automatic discovery/matching in the schema.
- **No private home address** — `public_home_place_id` is a *public* place id.

If a future request asks for any of these, treat it as out of contract and
revisit `docs/HG_SOCIAL_ARCHITECTURE.md` first.

---

## 5. How the frontend connects later (adapter step)

The frontend must go through a thin **adapter** rather than calling Supabase from
UI files directly, keeping History Go's rule that UI never owns truth. The
adapter has now landed with this shape:

1. `js/social/HGSocialMeetSupabaseClient.js` reads a **public** anon key +
   project URL from runtime config (`window.HG_SOCIAL_MEET_SUPABASE`,
   `window.HG_SUPABASE_CONFIG`, or meta tags) — never committed, never a
   service-role key.
2. `js/social/HGSocialMeetAdapter.js` exposes the small typed surface:
   `getMyProfile()`, `upsertMyProfile()`, `createInvite(context, targetUserId, presetId)`,
   `listInvites()`, `acceptInvite(id)`, `declineInvite(id)`, `cancelInvite(id)`,
   `completeInvite(id)`, `listCircles()`, `joinCircle(id)`, `leaveCircle(id)`,
   `listActivity()`.
3. The adapter enforces the **status state-machine** (creator cancels; target
   accepts/declines; completion rules) and rejects free-text/chat/location/feed
   fields before they reach the network.
4. `HGSpotmeetingUI` (Kunnskapsmøte — start a proposal) and `HGSocialMeetUI`
   (Social Meet — follow-ups/history/circles) call the adapter, not Supabase
   directly.
5. The adapter maps preset message ids to localized Norwegian labels at read
   time; the database only ever stores the id.

### 5.1 Enabling the Supabase backend (runtime config)

The adapter stays on the local/demo backend until a runtime config supplies a
**public** project URL + anon (publishable) key. Configuration mirrors the
existing `js/config.js` / `js/config.example.js` pattern:

1. Copy `js/config-supabase.example.js` to `js/config-supabase.js` and fill in
   the History Go project's **public** values (Supabase dashboard → project
   **AHA** → *Connect* → Project URL + Publishable key). `js/config-supabase.js`
   is **gitignored**, so the key is never committed. Only ever use the anon /
   publishable key here — never the `service_role` key.
2. On the owning page (`profile.html`), load, in this order, **before**
   `js/social/HGSocialMeetSupabaseClient.js`:
   - the `supabase-js` SDK (exposing `window.supabase.createClient`), and
   - `js/config-supabase.js`.
3. With `HG_SOCIAL_MEET_BACKEND = "supabase"` and valid credentials present,
   `HG_SocialMeetAdapter.backendMode()` returns `"supabase"` and
   `HG_SocialMeetSupabaseClient.health()` reports `hasCredentials: true`. With no
   config file present, both stay on `local` and the app behaves exactly as
   today.

The schema those calls hit is already live on the AHA project
(`supabase/migrations/001_social_meet.sql`), so once the config + SDK are loaded
and a user is authenticated, `getMyProfile()` / `createInvite()` / `listInvites()`
work against the real tables under RLS.

---

## 6. Local fallback / demo mode

History Go already ships a local demo layer (`docs/HG_SOCIAL_DEMO_MODE.md`,
`js/hgSocialDemoData.js`) that seeds mock profiles, invites, and circles into
localStorage behind the `HG_SOCIAL_DEMO_MODE` flag. That remains the default
for demo/QA and does not require Supabase.

The adapter should therefore support two backends behind the same interface:

- **`local`** — the existing demo/localStorage layer (default; no credentials).
- **`supabase`** — this schema, enabled only when a public anon key + URL are
  configured at runtime.

Selecting the backend must be an explicit runtime decision. With no Supabase
config present, History Go keeps working exactly as today on the local layer.

---

## 7. Realtime plan

Realtime is **not** enabled in this PR. When follow-up sync is needed, the plan
is:

- Subscribe (via Supabase Realtime) only to rows the current user is already
  allowed to see — RLS also governs Realtime, so a user only receives changes
  for invites where they are a participant, circles they own or belong to, and
  their own activity rows.
- Use Realtime purely to refresh participant-scoped invite/circle state across
  the user's own devices. It must **never** be used to derive presence,
  online/last-seen, live location, or a public activity feed.
- Prefer a coarse "records changed, refetch" signal over streaming derived
  presence data, matching the sync-cursor guidance in
  `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md` §9.

---

## Applying the migration

The migration is standard PostgreSQL and runs on Supabase or plain Postgres:

```bash
# Supabase CLI (local stack or linked project)
supabase db push

# or apply the file directly
psql "$DATABASE_URL" -f supabase/migrations/001_social_meet.sql
```

After applying, verify RLS is on for all five tables and that only the
`authenticated`-scoped policies above exist. No Supabase URL or key is stored in
the repo — configure those at runtime when the adapter lands.
