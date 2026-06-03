# AHA Data Contract Matrix

This document records data-contract expectations for AHA modules before runtime sync code is added.

## List contract

AHA Lists is an organization module, not an insight-production module. Creating lists, editing lists, adding list items, and removing list items do not create source events in the current model, and Lists must not be treated as an insight producer.

Current Lists storage is local-first and uses the localStorage key `aha_lists_v1`.

Lists use camelCase base fields in the local contract:

- `createdAt`
- `updatedAt`
- `deletedAt`

If Supabase sync is built later, the field mapping must be decided explicitly before code is added:

- local `createdAt` -> remote `created_at`
- local `updatedAt` -> remote `updated_at`
- local `deletedAt` -> remote `deleted_at`

List items are embedded in `list.items` in today's localStorage model. A future Supabase model must choose between these schema options before runtime implementation:

1. one table with embedded items JSON
2. two tables: `lists` + `list_items`

This PR does not choose a runtime implementation when that choice requires Supabase schema work. A minimal future sync model may start with embedded items JSON, but that recommendation must be verified against the actual Supabase table/schema before code is written.
