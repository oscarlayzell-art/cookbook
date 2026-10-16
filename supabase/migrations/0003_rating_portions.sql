-- How often someone cooks a recipe, the portions they usually make, and ingredients they mark optional.

alter table public.recipes
  add column rating text check (rating in ('daily', 'weekly', 'monthly', 'annually')),
  -- Portions the person usually makes, when different from the original recipe.
  add column portions integer check (portions > 0),
  -- "cook": scale the ingredients to the portions. "split": same food, shared into more or fewer portions.
  add column portion_mode text not null default 'cook' check (portion_mode in ('cook', 'split')),
  -- Positions (from 0) in the ingredients list of the ones the person leaves out.
  add column optional_ingredients integer[] not null default '{}';
