"use client";

import { useEffect, useState } from "react";
import { useStore } from "./StoreProvider";
import { Compare } from "./icons";
import { isCompared, toggleCompare, COMPARE_EVENT, COMPARE_MAX } from "@/lib/compare";
import type { Product } from "@/lib/types";

/** Toggle a product in the compare set. variant="pdp" is labelled; "card" is compact. */
export default function CompareButton({ p, variant = "pdp" }: { p: Product; variant?: "pdp" | "card" }) {
  const { toast } = useStore();
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(isCompared(p.slug));
    sync();
    window.addEventListener(COMPARE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COMPARE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [p.slug]);

  const click = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const r = toggleCompare(p);
    if (r === "full") {
      toast(`Compare holds up to ${COMPARE_MAX} products.`);
      return;
    }
    setOn(r === "added");
  };

  return (
    <button
      type="button"
      className={`cmp-btn cmp-btn-${variant}${on ? " on" : ""}`}
      aria-pressed={on}
      title={on ? "Remove from compare" : "Add to compare"}
      onClick={click}
    >
      <Compare />
      <span>{on ? "Comparing" : "Compare"}</span>
    </button>
  );
}
