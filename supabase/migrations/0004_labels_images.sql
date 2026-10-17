-- A key label shown as a badge on the cookbook, and a person's own photo for a recipe.

alter table public.recipes
  -- One of the recipe's tags, picked to show as a badge on its tile.
  add column key_label text,
  -- A photo the person uploaded to replace the one from the recipe site (image_url stays as the original).
  add column custom_image_url text;

-- Photos people upload. Public so they show without signing each link; each person writes only their own folder.
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

create policy "People upload their own recipe photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'recipe-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "People replace their own recipe photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'recipe-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "People delete their own recipe photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'recipe-images' and (storage.foldername(name))[1] = auth.uid()::text);
