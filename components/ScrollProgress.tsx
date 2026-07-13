"use client";

import { useEffect } from "react";

/** Thin reading-progress bar at the very top + a scroll-condensed header shadow. */
export default function ScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById("scroll-progress");
    let raf = 0;

    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const y = window.scrollY || doc.scrollTop;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      // scaleX is GPU-composited — tracks scroll 1:1 with no layout/paint lag.
      if (bar) bar.style.transform = `scaleX(${p})`;
      document.body.classList.toggle("scrolled", y > 8);
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div id="scroll-progress" aria-hidden="true" />;
}
