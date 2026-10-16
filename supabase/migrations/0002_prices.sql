-- Prices read from people's shopping receipts, used to estimate what a recipe costs.

create table public.prices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  -- As printed on the receipt, e.g. "Essential Chicken Thighs".
  item text not null,
  -- Pack size if known, e.g. "500g", "6 pack", "1 each".
  pack_size text,
  -- What one pack cost, after any per-item discount.
  price_pence integer not null check (price_pence >= 0),
  shop text,
  bought_on date,
  created_at timestamptz not null default now()
);
create index prices_user_id_idx on public.prices (user_id, created_at desc);

alter table public.prices enable row level security;
create policy "Users read their own prices" on public.prices
  for select using (auth.uid() = user_id);
create policy "Users add their own prices" on public.prices
  for insert with check (auth.uid() = user_id);
create policy "Users edit their own prices" on public.prices
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own prices" on public.prices
  for delete using (auth.uid() = user_id);

-- The latest cost estimate for a recipe, worked out from the price list:
-- {"total_pence": 640, "servings": 4, "priced_at": "...", "lines": [{"ingredient": "...", "item": "...", "cost_pence": 120}]}
alter table public.recipes add column cost jsonb;
