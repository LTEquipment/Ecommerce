"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteSettings } from "@/lib/settings";

const DEFAULTS: SiteSettings = {
  investorRelationsEnabled: false,
  freightThreshold: 999,
  freightFee: 89,
  taxRate: 0.08875,
  dealerDiscountPct: 0,
  announcement: "",
};

const Ctx = createContext<SiteSettings>(DEFAULTS);

/** Hydrated once from server settings in the root layout so client components
 *  (cart, checkout) show freight/tax that match the authoritative server total. */
export function SiteSettingsProvider({ value, children }: { value: SiteSettings; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteSettings(): SiteSettings {
  return useContext(Ctx);
}
