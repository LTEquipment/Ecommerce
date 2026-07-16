/**
 * User-facing copy for when Supabase isn't configured (no env vars).
 *
 * In development we point the developer at .env.local. In production real
 * visitors must never see setup internals, so we show a neutral message —
 * `process.env.NODE_ENV` is inlined at build time, so this resolves to the
 * production branch in a deployed build.
 */
const isDev = process.env.NODE_ENV === "development";

/** Shown to shoppers on the sign-in / account surfaces. */
export const BACKEND_OFFLINE = isDev
  ? "Backend not connected. Add your Supabase keys to .env.local (see README) to enable sign-in."
  : "Accounts are temporarily unavailable. Please try again later.";

/** Shown in the admin console (dev vs. a deployed hosting environment). */
export const BACKEND_OFFLINE_ADMIN = isDev
  ? "Connect Supabase — add keys to .env.local — to use the admin console."
  : "Set the Supabase environment variables in your hosting settings and redeploy to enable the admin console.";
