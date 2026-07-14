// Shared guards for the file-upload routes (avatar, product-image, product-doc).
// Goals: reject active content (SVG/HTML/XML) that would execute inline when
// served from a public bucket, pin the stored Content-Type to a safe value
// (never trust the client's file.type), and reject oversized bodies BEFORE we
// buffer them into memory.

/** Raster image types only — SVG is deliberately excluded (it can carry script). */
export const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/**
 * True if the request body is larger than the cap (plus a small margin for
 * multipart overhead). Checked against Content-Length before req.formData(),
 * so an oversized upload is rejected without being read into memory.
 */
export function overSizeLimit(req: Request, capBytes: number): boolean {
  const len = Number(req.headers.get("content-length") || 0);
  return len > capBytes + 512 * 1024;
}

/** A file whose first bytes are the "%PDF-" signature. */
export function looksLikePdf(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 && // F
    bytes[4] === 0x2d // -
  );
}
