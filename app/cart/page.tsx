import Breadcrumbs from "@/components/Breadcrumbs";
import CartView from "@/components/CartView";

export const metadata = { title: "Cart — L&T" };

export default function CartPage() {
  return (
    <>
      <div className="wrap"><Breadcrumbs items={[{ label: "Cart" }]} /></div>
      <CartView />
    </>
  );
}
