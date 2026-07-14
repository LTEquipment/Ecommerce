/** @type {import('next').NextConfig} */

// Next.js dev/HMR (React Refresh) needs 'unsafe-eval'; production does not.
const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy. Baseline uses 'unsafe-inline' for script/style because
// Next injects inline hydration/bootstrap scripts and Leaflet injects inline styles.
// Post-launch upgrade: emit a per-request nonce from middleware and drop 'unsafe-inline'
// from script-src. Add Stripe/Affirm script + connect origins here when those go live.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Supabase Storage (product images/avatars), the brand S3 bucket, and CARTO map tiles.
  "img-src 'self' data: blob: https://*.supabase.co https://ltusa.s3.us-east-1.amazonaws.com https://*.basemaps.cartocdn.com",
  // Homepage hero video is served from the brand S3 bucket.
  "media-src 'self' https://ltusa.s3.us-east-1.amazonaws.com",
  "font-src 'self'",
  // Supabase REST/Auth over https + Realtime over wss.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
