-- £5 a month subscriptions. People without one (or a free friends-and-family place) can read their
-- cookbook but not change it.

-- Friends and family get a free place. Everyone invited so far is friends and family.
alter table public.invites add column comped boolean not null default false;
update public.invites set comped = true;

create table public.accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- A free place: full access without paying.
  comped boolean not null default false,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  -- As Stripe reports it: active, trialing, past_due, canceled, unpaid, incomplete…
  subscription_status text,
  current_period_end timestamptz,
  -- True when the person has cancelled but the paid month hasn't run out yet.
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);
-- People can see their own account. Only the server (Stripe webhook, service role) changes it.
alter table public.accounts enable row level security;
create policy "Users read their own account" on public.accounts
  for select using (auth.uid() = user_id);

-- Everyone who already has an account keeps full access for free.
insert into public.accounts (user_id, comped)
select id, true from auth.users
on conflict (user_id) do nothing;

-- New people get an account row, free if their invite says so.
create or replace function public.create_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.accounts (user_id, comped)
  values (new.id, coalesce((select comped from public.invites where lower(email) = lower(new.email) limit 1), false))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger create_account_after_signup
  after insert on auth.users
  for each row execute function public.create_account();

-- Whether the signed-in person can add, change or delete things. past_due keeps access while
-- Stripe retries a failed payment.
create or replace function public.can_edit()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.accounts
    where user_id = auth.uid()
      and (comped or subscription_status in ('active', 'trialing', 'past_due'))
  );
$$;
revoke all on function public.can_edit() from public, anon;
grant execute on function public.can_edit() to authenticated;

-- Recipes: reading stays open to the owner; changes need access.
drop policy if exists "Users add their own recipes" on public.recipes;
drop policy if exists "Users edit their own recipes" on public.recipes;
drop policy if exists "Users delete their own recipes" on public.recipes;
create policy "Users add their own recipes" on public.recipes
  for insert with check (auth.uid() = user_id and public.can_edit());
create policy "Users edit their own recipes" on public.recipes
  for update using (auth.uid() = user_id and public.can_edit()) with check (auth.uid() = user_id);
create policy "Users delete their own recipes" on public.recipes
  for delete using (auth.uid() = user_id and public.can_edit());

-- Prices: the same.
drop policy if exists "Users add their own prices" on public.prices;
drop policy if exists "Users edit their own prices" on public.prices;
drop policy if exists "Users delete their own prices" on public.prices;
create policy "Users add their own prices" on public.prices
  for insert with check (auth.uid() = user_id and public.can_edit());
create policy "Users edit their own prices" on public.prices
  for update using (auth.uid() = user_id and public.can_edit()) with check (auth.uid() = user_id);
create policy "Users delete their own prices" on public.prices
  for delete using (auth.uid() = user_id and public.can_edit());

-- Recipe photos: the same.
drop policy if exists "People upload their own recipe photos" on storage.objects;
drop policy if exists "People replace their own recipe photos" on storage.objects;
drop policy if exists "People delete their own recipe photos" on storage.objects;
create policy "People upload their own recipe photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'recipe-images' and (storage.foldername(name))[1] = auth.uid()::text and public.can_edit());
create policy "People replace their own recipe photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'recipe-images' and (storage.foldername(name))[1] = auth.uid()::text and public.can_edit());
create policy "People delete their own recipe photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'recipe-images' and (storage.foldername(name))[1] = auth.uid()::text and public.can_edit());
