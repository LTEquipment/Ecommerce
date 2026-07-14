"use client";

import { useEffect, useState } from "react";

type TocItem = { id: string; label: string };

/**
 * "On this page" navigation with scroll-spy: highlights the section currently in
 * view and gives an immediate active state on click. Anchor scrolling itself is
 * native (the [id]{scroll-margin-top} rule clears the sticky header).
 */
export default function DocToc({ sections }: { sections: TocItem[] }) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    const onScroll = () => {
      const line = 150; // detection line, just below the sticky header
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // At the very bottom, force the last section active.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = ids[ids.length - 1];
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <nav className="side-card doc-toc" aria-label="On this page">
      <div className="toc-t">On this page</div>
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={active === s.id ? "active" : ""}
          aria-current={active === s.id ? "true" : undefined}
          onClick={() => setActive(s.id)}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
