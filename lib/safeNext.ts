/**
 * Returns `rawNext` only when it is a safe INTERNAL path (pathname + query),
 * else the fallback. It resolves the value against a dummy origin and asserts
 * the result stayed same-origin, so every open-redirect vector is rejected:
 * `//evil.com`, `/\evil.com`, `/%09/evil.com` (tab/newline stripping) and any
 * absolute URL. A legitimate internal path like `/account?tab=orders` is kept.
 *
 * A character-blacklist regex (e.g. /^\/(?!\/)/) is NOT enough — `new URL()`
 * normalizes backslashes and strips tab/newline, so those slip past a regex but
 * fail the same-origin assertion here.
 */
export function safeInternalPath(rawNext: string | null | undefined, fallback = "/account"): string {
  if (!rawNext) return fallback;
  try {
    const base = "http://internal.invalid";
    const dest = new URL(rawNext, base);
    return dest.origin === base ? dest.pathname + dest.search : fallback;
  } catch {
    return fallback;
  }
}
