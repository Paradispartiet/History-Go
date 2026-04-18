-- Enable RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.graph_nodes enable row level security;
alter table public.post_nodes enable row level security;
alter table public.follows enable row level security;

-- profiles
create policy "profiles are readable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- posts
create policy "posts are readable by authenticated users"
  on public.posts
  for select
  to authenticated
  using (true);

create policy "users can create own posts"
  on public.posts
  for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "users can update own posts"
  on public.posts
  for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "users can delete own posts"
  on public.posts
  for delete
  to authenticated
  using (auth.uid() = author_id);

-- graph_nodes
create policy "graph nodes are readable by authenticated users"
  on public.graph_nodes
  for select
  to authenticated
  using (true);

create policy "authenticated users can create graph nodes"
  on public.graph_nodes
  for insert
  to authenticated
  with check (auth.uid() = created_by or created_by is null);

-- post_nodes
create policy "post node links are readable by authenticated users"
  on public.post_nodes
  for select
  to authenticated
  using (true);

create policy "users can create links for own posts"
  on public.post_nodes
  for insert
  to authenticated
  with check (
    auth.uid() = created_by
    and exists (
      select 1
      from public.posts p
      where p.id = post_id
        and p.author_id = auth.uid()
    )
  );

create policy "users can delete links for own posts"
  on public.post_nodes
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.posts p
      where p.id = post_id
        and p.author_id = auth.uid()
    )
  );

-- follows
create policy "follows readable by authenticated users"
  on public.follows
  for select
  to authenticated
  using (true);

create policy "users can follow as self"
  on public.follows
  for insert
  to authenticated
  with check (auth.uid() = follower_id);

create policy "users can unfollow as self"
  on public.follows
  for delete
  to authenticated
  using (auth.uid() = follower_id);
