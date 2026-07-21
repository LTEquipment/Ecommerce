"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Category } from "@/lib/types";

/**
 * Carries the live category list to the chrome.
 *
 * Header, Footer and the nav drawer used to import a hard-coded list, so the
 * departments in the navigation were whatever was true when the bundle was
 * built — renaming or adding one in the admin changed the shop but not the menu
 * pointing at it. The layout is a server component and already reads settings,
 * so it reads categories too and hands them down here.
 */
const Ctx = createContext<Category[]>([]);

export function CategoriesProvider({ value, children }: { value: Category[]; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCategories(): Category[] {
  return useContext(Ctx);
}
