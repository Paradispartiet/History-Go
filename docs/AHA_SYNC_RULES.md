# AHA Sync Rules

This document records sync rules and module contracts that must be locked before adding runtime sync code.

## Modules without sync / future sync

Modules that are localStorage-only must not receive sync code until their module contract, storage keys, field mapping, conflict behavior, tombstone behavior, and fallback behavior are documented.

### Lists future sync contract

#### Current status

- Lists is localStorage-only today.
- Lists has no `AHARepository.saveList` or `AHARepository.loadLists` support yet.
- No Supabase table is documented for Lists yet.
- Lists is a write-module, not a read-only module.
- Lists tombstone filtering was fixed in PR #318.

#### Decisions required before Lists sync can be built

Before Lists sync code is added, these decisions must be locked:

- remote table name, for example `aha_lists`
- field mapping between local camelCase and remote snake_case
- whether `list.items` is stored as JSON or in a separate `list_items` table
- conflict rule
- tombstone rule
- push-before-pull behavior
- invalid remote fallback behavior

#### Temporary conflict rule for later code

The recommended temporary conflict rule for a future implementation is:

- push local lists before pulling remote lists
- merge by `id`
- action time is the newest of `deletedAt`/`deleted_at`, `updatedAt`/`updated_at`, and `createdAt`/`created_at`
- `deletedAt`/`deleted_at` counts as an action time
- remote wins when action time is equal
- invalid remote payload must not clear localStorage
- localStorage remains the fallback/cache

#### Tombstone rule

- The local canonical Lists tombstone field is `deletedAt` today.
- The Supabase-facing future tombstone field should be `deleted_at` if repository support is added.
- Mapping between `deletedAt` and `deleted_at` must be explicit.
- Lists sync must not hard-delete list tombstones during sync.

#### Do-not-break rules

- Lists sync must not create insights.
- Lists sync must not create source events.
- Lists sync must not change referenced objects.
- Lists sync must not mutate Notes, Feed, Gallery, or Insta.
- Lists sync must not make Supabase mandatory.
- Lists sync must not remove the localStorage fallback.

#### Next safe code candidate

After this contract, the next safe code candidate is adding `AHARepository.saveList` and `AHARepository.loadLists` with no UI changes. Do not add `syncFromDatabase` yet. Do not add Supabase schema unless the table already exists or a migration is explicitly included in a separate PR.
