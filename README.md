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
   People then sign in with their email: we email them a link and a code, no password.
3. **Auth redirect**: in Supabase > Authentication > URL Configuration, set the Site URL to your
   Vercel address and add `https://<your-site>/auth/callback` to the redirect URLs.
4. **Vercel**: import this GitHub repo at vercel.com/new and add the two variables from
   `.env.example` (found in Supabase > Project Settings > API).
5. **Paste a recipe** (optional): add `ANTHROPIC_API_KEY` in Vercel, from console.anthropic.com.
   It reads recipes people paste in, at a few pence each.
6. **Receipts and recipe costs** (needs the key from step 5): in the Supabase SQL editor, run
   `supabase/migrations/0002_prices.sql`. People can then upload receipts on the My prices page
   and see a cost per portion on each recipe.
7. **Ratings, saved portions and optional ingredients**: in the Supabase SQL editor, run
   `supabase/migrations/0003_rating_portions.sql`.
8. **Key labels and your own photos**: in the Supabase SQL editor, run
   `supabase/migrations/0004_labels_images.sql`. It also creates the `recipe-images` storage bucket.

9. **AI allowance**: in the Supabase SQL editor, run `supabase/migrations/0005_ai_usage.sql`.
   Each person can then spend up to £1 of AI in any 7 days (change it with `AI_WEEKLY_LIMIT_PENCE`
   in Vercel). They can see what they've used on the My account page.
10. **Sign-in emails**: Supabase's built-in email only sends a few emails an hour, so connect your
    own sender. Sign up at resend.com, add and verify your domain there, create an API key, then
    in Supabase > Authentication > Emails > SMTP Settings turn on custom SMTP with host
    `smtp.resend.com`, port `465`, username `resend`, the API key as the password, and a sender
    like `hello@yourdomain`. Then in Supabase > Authentication > Emails > Templates > Magic Link,
    add the code to the email, e.g. `<p>Or type this code: {{ .Token }}</p>`, so people can sign
    in on a different device from the one that got the email.

## Local development

```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev
```
