"use client";

import { useStore } from "./StoreProvider";
import { ILLUS } from "@/lib/illus";
import { ArrowRight } from "./icons";
import type { Category } from "@/lib/types";

export default function Departments({ categories }: { categories: Category[] }) {
  const { setActiveCat } = useStore();
  const go = (id: string) => {
    setActiveCat(id);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section>
      <div className="wrap">
        <div className="sec-head">
          <h2>Shop by department</h2>
          <a className="link-arrow" href="#catalog">
            View all <ArrowRight />
          </a>
        </div>
        <div className="depts">
          {categories.map((c) => (
            <button className="dept" type="button" key={c.id} onClick={() => go(c.id)}>
              <div className="di" dangerouslySetInnerHTML={{ __html: ILLUS[c.art] }} />
              <div>
                <div className="dn">{c.name}</div>
                <div className="dc">{c.code} products</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
