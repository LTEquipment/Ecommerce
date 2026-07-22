/**
 * Which hosts `next/image` will actually render.
 *
 * This exists because of a live 500. `next/image` does not degrade when it gets
 * a src on a host missing from `remotePatterns` — it *throws*, and the throw
 * propagates up through the server component into the error boundary, so one
 * unrecognised URL in one product row takes down the entire page. The catalog
 * is now fed by the ERP, which holds URLs on hosts nobody here chose, so that
 * is a standing hazard rather than a one-off.
 *
 * Keep this list in step with `images.remotePatterns` in next.config.mjs. If the
 * two ever drift, the failure is an image quietly falling back to placeholder
 * art — not a white screen.
 */
export const ALLOWED_IMAGE_HOSTS = [
  "*.supabase.co",
  "ltusa.s3.us-east-1.amazonaws.com",
] as const;

function hostAllowed(host: string): boolean {
  return ALLOWED_IMAGE_HOSTS.some((pattern) =>
    pattern.startsWith("*.")
      ? host.endsWith(pattern.slice(1)) && host.length > pattern.length - 1
      : host === pattern
  );
}

/**
 * Drops image URLs `next/image` would throw on. Relative paths are ours and
 * always pass; anything unparseable is dropped rather than trusted.
 *
 * A product left with no images renders its placeholder illustration, which is
 * the same thing it does before photography exists — a visibly incomplete
 * product page, but a page.
 */
export function renderableImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images.filter((src): src is string => {
    if (typeof src !== "string" || !src) return false;
    if (src.startsWith("/")) return true;
    try {
      return hostAllowed(new URL(src).hostname);
    } catch {
      return false;
    }
  });
}
