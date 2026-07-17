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
 *
 * The same-origin check alone is ALSO not enough: `new URL("/..//evil.com", base)`
 * normalizes the `..` against root and yields pathname `//evil.com` while the
 * origin stays the dummy base, so the check passes but the returned value is a
 * protocol-relative URL that a downstream `redirect()`/`router.push()` resolves
 * off-site. So we additionally reject any resolved pathname that begins with two
 * or more slashes/backslashes — no legitimate route pathname does.
 */
export function safeInternalPath(rawNext: string | null | undefined, fallback = "/account"): string {
  if (!rawNext) return fallback;
  try {
    const base = "http://internal.invalid";
    const dest = new URL(rawNext, base);
    if (dest.origin !== base) return fallback;
    const path = dest.pathname + dest.search;
    // `//evil.com` (or `/\evil.com`) is protocol-relative once resolved again.
    return /^[/\\]{2,}/.test(path) ? fallback : path;
  } catch {
    return fallback;
  }
}
