import Breadcrumbs from "@/components/Breadcrumbs";
import WishlistView from "@/components/WishlistView";

export const metadata = { title: "Wishlist — L&T Restaurant Equipment" };

export default function WishlistPage() {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <header className="wish-head">
        <h1>Saved items</h1>
        <p>Equipment you&apos;ve saved to spec or share. Stored on this device.</p>
      </header>
      <WishlistView />
    </div>
  );
}
