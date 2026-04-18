-- AHA Twitter MVP schema
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  post_type text not null check (post_type in ('thought', 'insight', 'question')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.graph_nodes (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  normalized_label text generated always as (lower(trim(label))) stored,
  node_type text not null check (node_type in ('idea', 'place', 'person', 'topic')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (normalized_label, node_type)
);

create table if not exists public.post_nodes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  node_id uuid not null references public.graph_nodes(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, node_id)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists idx_posts_author_created_at
  on public.posts (author_id, created_at desc);

create index if not exists idx_posts_created_at
  on public.posts (created_at desc);

create index if not exists idx_graph_nodes_type_label
  on public.graph_nodes (node_type, normalized_label);

create index if not exists idx_post_nodes_post_id
  on public.post_nodes (post_id);

create index if not exists idx_post_nodes_node_id
  on public.post_nodes (node_id);
