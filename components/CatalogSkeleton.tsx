/** Streaming placeholder for dynamic catalog routes (products/category/brand). */
export default function CatalogSkeleton() {
  return (
    <div className="wrap cat-skel">
      <div className="cat-skel-head">
        <div className="skel skel-b" style={{ width: 120, height: 12 }} />
        <div className="skel skel-b" style={{ width: "min(420px,70%)", height: 44, marginTop: 14 }} />
        <div className="skel skel-b" style={{ width: "min(560px,90%)", height: 16, marginTop: 16 }} />
      </div>
      <div className="grid cat-skel-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="skel skel-b cat-skel-card" key={i} />
        ))}
      </div>
    </div>
  );
}
