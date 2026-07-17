import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

export default function RelatedProducts({
  products,
  heading = "You might also need",
  sub,
}: {
  products: Product[];
  heading?: string;
  sub?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="related">
      <div className="wrap">
        <div className="sec-head"><h2>{heading}</h2>{sub && <p className="sec-sub">{sub}</p>}</div>
        <div className="grid grid-4">
          {products.map((p) => (
            <ProductCard p={p} key={p.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
