import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

export default function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section>
      <div className="wrap">
        <div className="sec-head"><h2>You might also need</h2></div>
        <div className="grid">
          {products.map((p) => (
            <ProductCard p={p} key={p.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
