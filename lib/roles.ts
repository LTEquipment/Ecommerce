// One account, one login. "role" is just how the account adapts after sign-in:
// a customer buys; a dealer additionally sees contract pricing once L&T approves
// their trade request. After-sales (warranty, service, parts) is available to all.
export type AccountRole = "customer" | "dealer";
export type DealerStatus = "pending" | "approved" | null;
