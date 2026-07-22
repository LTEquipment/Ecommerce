/**
 * Rules about what the shop may display, shared by the code that writes the
 * catalog and the code that reads it.
 *
 * Its own module because the two sides must not drift, and because the writer
 * (lib/erpCatalog.ts) is server-only — importing it from the read path would
 * pull a service-role Supabase client toward anything that renders a product.
 * Nothing here has dependencies.
 */

/**
 * Below this, the ERP's price is a placeholder rather than a price.
 *
 * Measured, not assumed: 21 of 262 products sit at exactly $1.00 and nothing
 * whatsoever falls between $1.00 and $1.01. The median is $10,538 and 233
 * products are over $1,000. A sentinel, not a cheap product.
 *
 * It has to be a price check rather than a name check. Five of the 21 carry
 * perfectly ordinary names — CRH-P-1 through CRH-P-4 are wok ranges — so
 * nothing about them looks wrong on a listing page.
 */
export const PLACEHOLDER_PRICE = 1;
