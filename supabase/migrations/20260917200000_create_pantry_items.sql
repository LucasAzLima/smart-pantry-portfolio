-- pantry_items: per-user inventory with RLS
-- Apply via Supabase SQL editor or `supabase db push`.

create table if not exists public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  quantity numeric not null default 1 check (quantity > 0),
  unit text not null default 'units',
  category text not null default 'pantry',
  expiry_date date,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists pantry_items_user_id_idx
  on public.pantry_items (user_id);

alter table public.pantry_items enable row level security;

create policy "Users can select their own pantry items"
  on public.pantry_items
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own pantry items"
  on public.pantry_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own pantry items"
  on public.pantry_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own pantry items"
  on public.pantry_items
  for delete
  to authenticated
  using (auth.uid() = user_id);
