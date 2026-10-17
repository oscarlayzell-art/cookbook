-- What each person's AI requests cost, so we can cap spending at a weekly allowance.

create table public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  -- Which feature used it: "paste", "receipt" or "cost".
  feature text not null,
  model text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  cache_write_tokens integer not null default 0 check (cache_write_tokens >= 0),
  cache_read_tokens integer not null default 0 check (cache_read_tokens >= 0),
  -- In pence, to four decimal places.
  cost_pence numeric(12, 4) not null check (cost_pence >= 0),
  created_at timestamptz not null default now()
);
create index ai_usage_user_time_idx on public.ai_usage (user_id, created_at desc);

-- People can see their own usage but not change or delete it (that would reset their allowance).
alter table public.ai_usage enable row level security;
create policy "Users read their own AI usage" on public.ai_usage
  for select using (auth.uid() = user_id);

-- Usage is added only through this function, always for the signed-in person.
create or replace function public.record_ai_usage(
  p_feature text,
  p_model text,
  p_input_tokens integer,
  p_output_tokens integer,
  p_cache_write_tokens integer,
  p_cache_read_tokens integer,
  p_cost_pence numeric
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  insert into public.ai_usage (user_id, feature, model, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens, cost_pence)
  values (auth.uid(), p_feature, p_model, p_input_tokens, p_output_tokens, p_cache_write_tokens, p_cache_read_tokens, p_cost_pence);
end;
$$;
revoke all on function public.record_ai_usage(text, text, integer, integer, integer, integer, numeric) from public, anon;
grant execute on function public.record_ai_usage(text, text, integer, integer, integer, integer, numeric) to authenticated;

-- What the signed-in person has spent on AI in the last 7 days, in pence.
create or replace function public.ai_spend_last_7_days()
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(cost_pence), 0)
  from public.ai_usage
  where user_id = auth.uid() and created_at > now() - interval '7 days';
$$;
revoke all on function public.ai_spend_last_7_days() from public, anon;
grant execute on function public.ai_spend_last_7_days() to authenticated;
