# Cook Book

Save recipes from anywhere on the web into your own cookbook. Each recipe is stored as a full copy
(ingredients, method, nutrition), so it survives the original page changing or disappearing.

Built with Next.js, hosted on Vercel, with Supabase for sign-in and the database. All three run on free tiers.

## First-time setup

1. **Supabase**: create a project at supabase.com. In the SQL editor, run
   `supabase/migrations/0001_init.sql`.
2. **Invite people**: sign-up is invite-only. Add each email in the SQL editor:
   ```sql
   insert into public.invites (email) values ('you@example.com');
   ```
3. **Auth redirect**: in Supabase > Authentication > URL Configuration, set the Site URL to your
   Vercel address and add `https://<your-site>/auth/callback` to the redirect URLs.
4. **Vercel**: import this GitHub repo at vercel.com/new and add the two variables from
   `.env.example` (found in Supabase > Project Settings > API).

## Local development

```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev
```
