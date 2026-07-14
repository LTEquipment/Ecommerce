"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "./icons";
import { wishCount, WISH_EVENT } from "@/lib/wishlist";

/** Header heart linking to the wishlist, with a saved-count badge. */
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

  return (
    <Link className="hact-wish" href="/wishlist" aria-label={n ? `Wishlist (${n} saved)` : "Wishlist"}>
      <Heart />
      {n > 0 && <span className="cart-count">{n}</span>}
    </Link>
  );
}
