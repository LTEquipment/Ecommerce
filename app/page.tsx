import { getCategories, getProducts } from "@/lib/catalog";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Departments from "@/components/Departments";
import Catalog from "@/components/Catalog";
import Band from "@/components/Band";
import Locations from "@/components/Locations";
import Signup from "@/components/Signup";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <Hero />
      <TrustBar />
      <Departments categories={categories} />
      <Catalog categories={categories} products={products} anchor="catalog" />
      <Band />
      <Locations />
      <Signup />
    </>
  );
}
