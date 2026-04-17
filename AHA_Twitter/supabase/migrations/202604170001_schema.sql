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
  post_type text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.graph_nodes (
  id uuid primary key default gen_random_uuid(),
  node_type text not null,
  source_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.graph_edges (
  id uuid primary key default gen_random_uuid(),
  from_node_id uuid not null references public.graph_nodes(id) on delete cascade,
  to_node_id uuid not null references public.graph_nodes(id) on delete cascade,
  relation text not null,
  created_at timestamptz not null default now()
);
