create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  post_type text not null check (post_type in ('thought', 'insight', 'question')),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.graph_nodes (
  id uuid primary key default gen_random_uuid(),
  node_type text not null check (node_type in ('idea', 'place', 'person', 'topic')),
  label text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.post_nodes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  node_id uuid not null references public.graph_nodes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, node_id)
);

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);
