import { getCategories, getProducts } from "@/lib/catalog";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Departments from "@/components/Departments";
import Catalog from "@/components/Catalog";
import Band from "@/components/Band";
import Locations from "@/components/Locations";
import Signup from "@/components/Signup";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";

export default async function Home() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <>
      <TopBar />
      <Header />
      <Hero />
      <TrustBar />
      <Departments categories={categories} />
      <Catalog categories={categories} products={products} />
      <Band />
      <Locations />
      <Signup />
      <Footer />
      <CartDrawer />
      <Toast />
    </>
  );
}
