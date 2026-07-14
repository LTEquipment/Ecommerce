"use client";

import { useEffect, useState } from "react";
import { Heart } from "./icons";
import { isWished, toggleWish, WISH_EVENT } from "@/lib/wishlist";
import type { Product } from "@/lib/types";

/**
 * Heart toggle to save/unsave a product to the (localStorage) wishlist.
 * variant="pdp" shows a labelled button; variant="card" is an icon overlay.
 */
export default function WishlistButton({ p, variant = "pdp" }: { p: Product; variant?: "pdp" | "card" }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(isWished(p.slug));
    sync();
    window.addEventListener(WISH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(WISH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [p.slug]);

  const label = on ? "Saved to wishlist" : "Save to wishlist";

  return (
    <button
      type="button"
      className={`wish-btn wish-${variant}${on ? " on" : ""}`}
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOn(toggleWish(p));
      }}
    >
      <Heart />
      {variant === "pdp" && <span>{on ? "Saved" : "Save"}</span>}
    </button>
  );
}
