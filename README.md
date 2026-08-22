# Taskline

A task tracker for teams: staff log assigned and self-initiated work, managers get
a live team view and auto-generated performance reports. Installs like an app on
a phone (PWA). Runs entirely on free tiers.

Accounts are **admin-created only** — no public signup. An admin invites people
by email; they set their own password from that email.

## What's here

- **Next.js** (React) — the app itself
- **Supabase** — free database, login, and access rules (staff only see their
  own tasks; managers see their team; directors see everyone)
- **next-pwa** — makes it installable on a phone home screen

## 1. Create your free Supabase project

1. Go to https://supabase.com and sign up (free).
2. Click **New project**. Pick any name, a database password (save it somewhere),
   and a region close to you.
3. Once it's created, open **SQL Editor** in the left sidebar, click **New query**,
   paste in the entire contents of `supabase/schema.sql` from this project, and
   click **Run**. This creates the tables, roles, and security rules.
4. Go to **Authentication → Providers → Email** and turn **off** "Allow new
   users to sign up." This is what stops anyone from self-registering — from
   now on, only an admin can create accounts.
5. Go to **Authentication → URL Configuration**. Set **Site URL** to
   `http://localhost:3000` for now (you'll change this to your real deployed
   URL later). Under **Redirect URLs**, add `http://localhost:3000/set-password`
   — this is required or invite emails will fail to log people in correctly.
   Once you deploy, come back and add your live URL's `/set-password` here too
   (e.g. `https://yourapp.vercel.app/set-password`), and update Site URL to match.
6. Go to **Settings → API**. You'll need three values from this page:
   - **Project URL**
   - **anon public** key
   - **service_role** key (click "Reveal") — keep this one secret, it has
     full access to your database

## 2. Create yourself as the first admin (one-time, manual)

Since there's no public signup, the very first account has to be created by
hand — after that, you do everything from inside the app.

1. In Supabase, go to **Authentication → Users → Add user**. Enter your email
   and a password, and check **Auto Confirm User**.
2. Go to **Table Editor → profiles**. You'll see a row was created for you
   automatically. Click into it and set:
   - `full_name` → your name
   - `role` → `director`
   - `is_admin` → `true`

That's it — you can now log in and you'll have access to the admin panel.

## 3. Run it locally (optional, to test before deploying)

```bash
npm install
cp .env.local.example .env.local
# open .env.local and paste in your Project URL, anon key, and service role key
npm run dev
```

Visit http://localhost:3000, log in with the account you just created, and
use the **vertical sidebar** on the left — staff see only "My Tasks"; managers
and directors also see "Team" (each person's status, tap to expand their task
list) and "Reports" (the performance report generator); admins additionally
see "Users," where you can invite, edit, and delete accounts, all without
leaving the app.

Invited people get an email from Supabase with a link that lands on a
**"Set your password"** page before they can use the app — you never see or
set anyone else's password.

## 4. Deploy for free

1. Push this project to a GitHub repository.
2. Go to https://vercel.com, sign up free, click **Add New → Project**, and
   import your repo.
3. In the Vercel project settings, add all four environment variables from
   your `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SITE_URL` (set this one to your
   real `https://yourapp.vercel.app` URL, not localhost).
4. Click **Deploy**. You'll get a free `yourapp.vercel.app` URL.
5. Back in Supabase, go to **Authentication → URL Configuration** and update
   **Site URL** to your real Vercel URL, and add
   `https://yourapp.vercel.app/set-password` to **Redirect URLs**. Invites sent
   before this step will still point at localhost, so do this before inviting
   your real team.
6. On a phone, visit that URL and choose **Add to Home Screen** (Safari) or
   **Install app** (Chrome) — it now behaves like a native app.

## Notes on the current build

- Only accounts marked `is_admin = true` can create, edit, or delete accounts,
  or see the "Users" tab. You can promote a second person to admin from
  inside that same tab (edit a person, check "Can manage accounts").
- Deleting a person deletes their tasks too (the app warns you before this
  happens). If you'd rather keep a departing person's history for reporting,
  let me know and I can change deletion to an "archive" instead.
- Supabase's free tier sends invite emails out of the box, with a rate limit
  generous enough for small teams. If invite emails don't arrive, check
  **Authentication → Logs** in Supabase for the reason.
- Icons in `public/` are placeholders — swap `icon-192.png` and `icon-512.png`
  for your own logo whenever you have one.
