/** Carrier options for admin entry + a client-built tracking deep-link. */
export const CARRIERS = ["UPS", "FedEx", "USPS", "Freight / LTL", "Other"] as const;

export function trackingUrl(carrier: string | null | undefined, num: string | null | undefined): string | null {
  if (!num) return null;
  const n = encodeURIComponent(num.trim());
  switch ((carrier || "").toLowerCase()) {
    case "ups":
      return `https://www.ups.com/track?tracknum=${n}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
    default:
      return null; // freight / LTL / other: no universal consumer URL
  }
}
