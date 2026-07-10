export type ArtKey =
  | "range" | "fridge" | "fryer" | "table" | "rice"
  | "wok" | "lamp" | "sink" | "oven" | "rack";

export type Category = {
  id: string;
  name: string;
  /** Fallback illustration when a product has no photo */
  art: ArtKey;
  /** Short marketing blurb shown on department tiles / category headers */
  blurb: string;
  /** Display SKU count, e.g. "24 models" */
  count?: string;
};

export type Product = {
  /** URL-safe id used in routes: /products/[slug] */
  slug: string;
  /** Display model number, e.g. "52527" or "DCHPA48" */
  sku: string;
  name: string;
  /** Category id */
  cat: string;
  /** Fallback illustration key */
  art: ArtKey;
  price: number;
  was?: number;
  /** Local photo paths under /public, e.g. "/products/52527-1.png" */
  images: string[];
  /** Key → value spec sheet */
  specs: Record<string, string>;
  description?: string;
  /** Manufacturer / brand, e.g. "Panda®", "Dukers" */
  brand?: string;
  rating: number;
  n: number;
  badge?: "Sale" | "New" | "";
  stock: "in" | "back";
};
