"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Non-rendering UX effects hub (storefront only):
 *  - scroll to top on route change (preserves #anchor navigation)
 *  - subtle reveal-on-scroll for content sections
 *  - fade images in as they load
 *  - press "/" to focus the search box
 * All motion respects prefers-reduced-motion.
 */
export default function SiteFx() {
  const pathname = usePathname();

  // Start each new page at the top (unless navigating to an anchor).
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  // Reveal-on-scroll + image fade-in. Re-run per route so new DOM is wired.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // Reveal sections as they enter the viewport; above-fold ones show at once.
    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io!.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px 12% 0px", threshold: 0 }); // fire slightly early so fast scrolls never show a blank
      document.querySelectorAll("main section, main .band").forEach((el) => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight * 0.92) el.classList.add("reveal", "in"); // already visible → no motion, no flicker
        else { el.classList.add("reveal"); io!.observe(el); }
      });
    }

    // Fade images in when they finish loading (cached ones show immediately).
    const fade = (img: HTMLImageElement) => {
      if (img.dataset.fx) return;
      img.dataset.fx = "1";
      if (img.complete && img.naturalWidth > 0) { img.classList.add("fx-img", "in"); return; }
      img.classList.add("fx-img");
      const done = () => img.classList.add("in");
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    };
    document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach(fade);
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) => m.addedNodes.forEach((n) => {
        if (n instanceof HTMLImageElement) { if (n.loading === "lazy") fade(n); }
        else if (n instanceof HTMLElement) n.querySelectorAll('img[loading="lazy"]').forEach((im) => fade(im as HTMLImageElement));
      }));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io?.disconnect(); mo.disconnect(); };
  }, [pathname]);

  // "/" focuses the search box (unless already typing somewhere).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable)) return;
      const search = document.querySelector<HTMLInputElement>('input[aria-label*="Search" i], input[placeholder*="Search" i]');
      if (search) { e.preventDefault(); search.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
