import Link from "next/link";
import { ILLUS } from "@/lib/illus";
import { ArrowRight } from "./icons";
import type { Category } from "@/lib/types";

export default function Departments({ categories }: { categories: Category[] }) {
  return (
    <section>
      <div className="wrap">
        <div className="sec-head">
          <h2>Shop by department</h2>
          <Link className="link-arrow" href="/products">
            View all <ArrowRight />
          </Link>
        </div>
        <div className="depts">
          {categories.map((c) => (
            <Link className="dept" key={c.id} href={`/category/${c.id}`}>
              <div className="di" dangerouslySetInnerHTML={{ __html: ILLUS[c.art] }} />
              <div>
                <div className="dn">{c.name}</div>
                <div className="dc">{c.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
