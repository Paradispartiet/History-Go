alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.graph_nodes enable row level security;
alter table public.graph_edges enable row level security;

create policy "profiles are viewable by everyone"
on public.profiles for select
using (true);

create policy "posts are viewable by everyone"
on public.posts for select
using (true);

create policy "graph nodes are viewable by everyone"
on public.graph_nodes for select
using (true);

create policy "graph edges are viewable by everyone"
on public.graph_edges for select
using (true);
