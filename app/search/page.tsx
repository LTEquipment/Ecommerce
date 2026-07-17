import { redirect } from "next/navigation";

// /search is a convenience alias — the canonical results page is /products?q=
// (also the schema.org SearchAction target).
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();
  redirect(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
}
