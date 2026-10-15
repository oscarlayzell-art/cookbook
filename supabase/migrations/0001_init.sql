-- Cookbook schema: invite-only sign-up and per-user recipes.

-- Emails allowed to sign up while the site is friends-and-family only.
create table public.invites (
  email text primary key,
  invited_at timestamptz not null default now()
);
alter table public.invites enable row level security;
-- No policies: only the service role (Supabase dashboard / SQL editor) can manage invites.

-- Reject sign-ups from emails that have not been invited.
create or replace function public.enforce_invite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.invites where lower(email) = lower(new.email)) then
    raise exception 'This cookbook is invite-only for now.';
  end if;
  return new;
end;
$$;

create trigger enforce_invite_before_signup
  before insert on auth.users
  for each row execute function public.enforce_invite();

-- A saved copy of a recipe, so it survives the source page changing or disappearing.
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  source_url text,
  title text not null,
  description text,
  image_url text,
  servings text,
  prep_time text,
  cook_time text,
  total_time text,
  ingredients text[] not null default '{}',
  method text[] not null default '{}',
  -- e.g. {"calories": "481 kcal", "fat": "13 g", "protein": "30 g"}
  nutrition jsonb not null default '{}',
  tags text[] not null default '{}',
  -- The structured data exactly as the source site published it, kept for re-processing later.
  source_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index recipes_user_id_idx on public.recipes (user_id);
create unique index recipes_user_source_idx on public.recipes (user_id, source_url) where source_url is not null;

alter table public.recipes enable row level security;
create policy "Users read their own recipes" on public.recipes
  for select using (auth.uid() = user_id);
create policy "Users add their own recipes" on public.recipes
  for insert with check (auth.uid() = user_id);
create policy "Users edit their own recipes" on public.recipes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own recipes" on public.recipes
  for delete using (auth.uid() = user_id);
