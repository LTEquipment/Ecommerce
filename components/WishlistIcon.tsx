"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "./icons";
import { wishCount, WISH_EVENT } from "@/lib/wishlist";

/** Header wishlist link. Labeled peer of Account/Cart on desktop; icon on mobile. */
export default function WishlistIcon() {
  const [n, setN] = useState(0);

  useEffect(() => {
    const sync = () => setN(wishCount());
    sync();
    window.addEventListener(WISH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(WISH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const label = n ? `Wishlist (${n} saved)` : "Wishlist";

  return (
    <>
      {/* desktop: compact icon (pairs with the cart icon) */}
      <Link className="hact hact-wish" href="/wishlist" aria-label={label} title={label}>
        <Heart />
        {n > 0 && <span className="cart-count">{n}</span>}
      </Link>
      {/* mobile: icon in the compact bar */}
      <Link className="icon-btn hact-wish" href="/wishlist" aria-label={label}>
        <Heart />
        {n > 0 && <span className="cart-count">{n}</span>}
      </Link>
    </>
  );
}
