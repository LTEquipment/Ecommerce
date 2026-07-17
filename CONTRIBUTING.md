# Contributing

Thanks for helping improve the L&T Restaurant Equipment storefront.

## Getting started

```bash
npm install
npm run dev
```

Copy the required environment variables (Supabase URL + keys, etc.) into `.env.local`
before running the dev server.

## Before you open a pull request

- `npx tsc --noEmit` — no type errors
- `npm run build` — the production build succeeds
- Verify any user-visible change in the browser

## Conventions

- Next.js 16 App Router + TypeScript + Supabase.
- Match the surrounding code's style; the design language is flat, editorial and industrial.
- Some features ship their schema as `supabase/*.sql` files that are run manually — call
  these out in your PR description so they aren't missed.
- Keep secrets out of the repo; the Supabase service-role key is server-only.

## Pull requests

Use the PR template, keep each change focused, and note any migrations or follow-ups.
