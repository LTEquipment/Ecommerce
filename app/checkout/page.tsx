import Breadcrumbs from "@/components/Breadcrumbs";
import CheckoutFlow from "@/components/CheckoutFlow";

export const metadata = { title: "Checkout — L&T" };

export default function CheckoutPage() {
  return (
    <>
      <div className="wrap"><Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} /></div>
      <CheckoutFlow />
    </>
  );
}
