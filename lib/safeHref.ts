/**
 * Returns the URL only if it uses a safe scheme, otherwise `undefined`.
 * Blocks `javascript:`, `data:`, `vbscript:` and other active-content schemes
 * that would execute when rendered as an <a href>. Allows http/https/mailto/tel
 * and site-relative paths (a single leading "/", never protocol-relative "//").
 *
 * Use at BOTH the store boundary (before persisting user/admin-entered URLs) and
 * the render boundary — never rely on React to strip dangerous hrefs.
 */
export function safeHref(u: string | null | undefined): string | undefined {
  if (!u) return undefined;
  const s = u.trim();
  // Site-relative, but reject protocol-relative "//host".
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const url = new URL(s);
    if (["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) return s;
  } catch {
    /* not an absolute URL */
  }
  return undefined;
}
