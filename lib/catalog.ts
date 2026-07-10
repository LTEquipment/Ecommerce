import type { Category, Product } from "./types";

/**
 * DATA LAYER
 * ----------
 * Right now these return mock data. When Supabase is wired, replace ONLY the
 * bodies of getCategories() / getProducts() with queries — the function
 * signatures stay the same, so no page or component needs to change.
 *
 * Example (later):
 *   import { supabase } from "./supabase/client";
 *   export async function getProducts(): Promise<Product[]> {
 *     const { data, error } = await supabase.from("products").select("*");
 *     if (error) throw error;
 *     return data as Product[];
 *   }
 */

const CATEGORIES: Category[] = [
  { id: "cooking", name: "Cooking Equipment", code: "2,140", art: "range" },
  { id: "cold", name: "Refrigeration", code: "1,880", art: "fridge" },
  { id: "prep", name: "Prep & Work Tables", code: "3,050", art: "table" },
  { id: "smallware", name: "Smallwares", code: "4,600", art: "wok" },
  { id: "warming", name: "Warming & Holding", code: "720", art: "lamp" },
  { id: "sink", name: "Sinks & Sanitation", code: "910", art: "sink" },
];

const PRODUCTS: Product[] = [
  { sku: "PR-WR24", name: 'Wok Range, 2-Burner Gas, 24"', cat: "cooking", art: "range", price: 1749, was: 1990, rating: 4.8, n: 212, badge: "Sale", stock: "in" },
  { sku: "PR-RF48", name: 'Reach-In Refrigerator, 2-Door, 48"', cat: "cold", art: "fridge", price: 2290, rating: 4.7, n: 158, badge: "", stock: "in" },
  { sku: "PR-FR15", name: "Countertop Deep Fryer, 15 lb", cat: "cooking", art: "fryer", price: 389, was: 449, rating: 4.6, n: 301, badge: "Sale", stock: "in" },
  { sku: "PR-WT60", name: 'Stainless Prep Table, 60" × 30"', cat: "prep", art: "table", price: 319, rating: 4.9, n: 540, badge: "New", stock: "in" },
  { sku: "PR-RC55", name: "Commercial Rice Warmer, 55-Cup", cat: "warming", art: "rice", price: 279, rating: 4.8, n: 190, badge: "", stock: "in" },
  { sku: "PR-CW14", name: 'Carbon Steel Wok, 14" (Case of 6)', cat: "smallware", art: "wok", price: 174, was: 210, rating: 4.7, n: 420, badge: "Sale", stock: "in" },
  { sku: "PR-HL30", name: 'Strip Heat Lamp, 30" Pass-Through', cat: "warming", art: "lamp", price: 229, rating: 4.5, n: 88, badge: "", stock: "back" },
  { sku: "PR-SK3", name: '3-Compartment Prep Sink, 90"', cat: "sink", art: "sink", price: 645, rating: 4.8, n: 126, badge: "", stock: "in" },
  { sku: "PR-CO12", name: "Convection Oven, Half-Size, Electric", cat: "cooking", art: "oven", price: 1580, was: 1799, rating: 4.6, n: 143, badge: "Sale", stock: "in" },
  { sku: "PR-SP20", name: "Sheet Pan Rack, 20-Tier, Mobile", cat: "prep", art: "rack", price: 159, rating: 4.9, n: 610, badge: "New", stock: "in" },
  { sku: "PR-WT96", name: 'Stainless Prep Table, 96" × 30"', cat: "prep", art: "table", price: 459, rating: 4.8, n: 210, badge: "", stock: "in" },
  { sku: "PR-WK16", name: 'Carbon Steel Wok, 16" (Case of 6)', cat: "smallware", art: "wok", price: 198, rating: 4.7, n: 172, badge: "", stock: "back" },
];

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
}

export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}
