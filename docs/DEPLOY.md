# Production deploy checklist — connecting the backend

The site is live on Vercel at **www.ltfse.com**, but sign-in / admin / orders only
work once Supabase is wired into the **production** environment. `.env.local` is
git-ignored and never deploys, so the keys must be set in Vercel directly.

Supabase project in use: **`mrfcfjsmossulfrbwoml`** (same one as local — it already
has all tables, so **no SQL migrations are needed**).

---

## 1. Add the environment variables in Vercel

Vercel → your project → **Settings → Environment Variables**. Add these three,
scoped to **Production** (add to **Preview** too if you want preview deploys to
work). Copy the values from your local `.env.local` — they're the same project.

| Variable | Where it comes from (Supabase → Project Settings → API) | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / Publishable key | public |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` / Secret key | **SECRET — server only, never expose** |

## 2. Redeploy

Environment-variable changes do **not** apply to existing builds. Trigger a fresh
deploy: Vercel → **Deployments → ⋯ → Redeploy** (or push any commit to `main`).

## 3. Point Supabase Auth at the live domain

Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://www.ltfse.com`
- **Redirect URLs:** add `https://www.ltfse.com/**`
  (covers `/auth/callback`, used by OAuth / magic-link / email confirmation)

That's it. After the redeploy, the "Accounts are temporarily unavailable" notice on
the sign-in page disappears and login works.

---

## Optional: do it from the CLI instead of the dashboard

```bash
npm i -g vercel
vercel login            # opens the browser to authenticate as you
vercel link             # link this folder to the Vercel project
vercel env add NEXT_PUBLIC_SUPABASE_URL production        # paste value at the prompt
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production   # paste value at the prompt
vercel env add SUPABASE_SERVICE_ROLE_KEY production       # paste the SECRET at the prompt
vercel --prod           # redeploy
```

You enter each value at the interactive prompt (the secret never lands in a file
or shell history).

---

## Verify it worked

1. Open `https://www.ltfse.com/login` — the yellow "temporarily unavailable" notice
   should be gone.
2. Try signing in with a wrong password — a real **"Invalid login credentials"**
   error means the request reached Supabase (good). A "temporarily unavailable"
   message means the env vars still aren't set / the deploy didn't pick them up.

Once you've deployed, ping me and I'll verify the live site end-to-end for you.

---

## Related — other production env vars (later, when those features go live)

Not needed for sign-in, but the same "set in Vercel" applies when you turn these on:

- **Affirm** (BNPL): `AFFIRM_PUBLIC_KEY`, `AFFIRM_PRIVATE_KEY`, `AFFIRM_ENV`
- **Stripe** (card payments): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
