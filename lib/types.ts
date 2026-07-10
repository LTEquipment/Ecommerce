export type ArtKey =
  | "range" | "fridge" | "fryer" | "table" | "rice"
  | "wok" | "lamp" | "sink" | "oven" | "rack";

export type Category = {
  id: string;
  name: string;
  /** SKU count shown on the department tile, e.g. "2,140" */
  code: string;
  art: ArtKey;
};

export type Product = {
  sku: string;
  name: string;
  cat: string;
  art: ArtKey;
  price: number;
  was?: number;
  rating: number;
  n: number;
  badge?: "Sale" | "New" | "";
  stock: "in" | "back";
};
