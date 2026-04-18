# AHA Twitter

AHA Twitter is the MVP for a calm, structured knowledge feed where posts can connect to graph nodes (idea/place/person/topic).

## Current status (Commit 1: Project foundation)

This commit establishes baseline project scaffolding only:

- Next.js + TypeScript + Tailwind setup
- App shell and placeholder feed page
- Shared constants for post/node types
- Base TypeScript domain and database types
- Supabase client/server scaffolding
- SQL migrations for schema, RLS, and triggers

Not implemented yet in this commit:

- feed querying logic
- posting flow
- auth UI flow
- graph panel UI/data loading

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + RLS)

## Folder structure

- `app/` - routing and global app layout
- `components/` - reusable UI components
- `lib/` - constants and Supabase utilities
- `types/` - TypeScript types
- `supabase/migrations/` - SQL migrations

## Environment variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Database setup

Run SQL migrations in order:

1. `supabase/migrations/202604180001_schema.sql`
2. `supabase/migrations/202604180002_rls.sql`
3. `supabase/migrations/202604180003_triggers.sql`

## Security assumptions (MVP)

- Authenticated users can read feed entities.
- Users can create/update/delete only their own posts.
- Users can only create node links for posts they own.
- Graph nodes are readable by authenticated users.
