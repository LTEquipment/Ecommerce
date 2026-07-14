/**
 * Estimated lowest monthly payment for the product "as low as $X/mo" line.
 *
 * This is a DISPLAY ESTIMATE only — a representative term (36 months) at a
 * representative APR — shown until Affirm.js and live keys are wired (see
 * app/api/checkout/affirm/route.ts, currently a scaffold). Once Affirm is live,
 * swap this for Affirm's own `affirm-as-low-as` widget, which returns the real
 * figure from Affirm's program. The estimate is intentionally conservative so it
 * never understates the real "as low as" number.
 */
const TERM_MONTHS = 36;
const REPRESENTATIVE_APR = 0.15;

/** Below this order value we don't surface financing. */
export const FINANCE_MIN = 200;

/** Rounded estimated monthly payment for `price` over the representative term. */
export function estimateMonthly(price: number): number {
  const r = REPRESENTATIVE_APR / 12;
  const monthly = (price * r) / (1 - Math.pow(1 + r, -TERM_MONTHS));
  return Math.round(monthly);
}
