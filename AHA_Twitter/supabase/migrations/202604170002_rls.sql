alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.graph_nodes enable row level security;
alter table public.post_nodes enable row level security;
alter table public.follows enable row level security;

create policy "profiles are viewable by authenticated users"
on public.profiles for select
using (auth.uid() is not null);

create policy "users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = user_id);

create policy "users can update their own profile"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "posts are viewable by authenticated users"
on public.posts for select
using (auth.uid() is not null);

create policy "users can insert their own posts"
on public.posts for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = author_id
      and p.user_id = auth.uid()
  )
);

create policy "users can update their own posts"
on public.posts for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = author_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = author_id
      and p.user_id = auth.uid()
  )
);

create policy "graph nodes are viewable by authenticated users"
on public.graph_nodes for select
using (auth.uid() is not null);

create policy "authenticated users can create graph nodes"
on public.graph_nodes for insert
with check (auth.uid() is not null);

create policy "post-node links are viewable by authenticated users"
on public.post_nodes for select
using (auth.uid() is not null);

create policy "users can link nodes only to own posts"
on public.post_nodes for insert
with check (
  exists (
    select 1
    from public.posts po
    join public.profiles pr on pr.id = po.author_id
    where po.id = post_id
      and pr.user_id = auth.uid()
  )
);

create policy "follows are viewable by authenticated users"
on public.follows for select
using (auth.uid() is not null);

create policy "users can insert own follows"
on public.follows for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = follower_id
      and p.user_id = auth.uid()
  )
);

create policy "users can delete own follows"
on public.follows for delete
using (
  exists (
    select 1
    from public.profiles p
    where p.id = follower_id
      and p.user_id = auth.uid()
  )
);
