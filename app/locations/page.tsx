import Breadcrumbs from "@/components/Breadcrumbs";
import Locations from "@/components/Locations";

export const metadata = { title: "Locations — L&T Restaurant Equipment" };

export default function LocationsPage() {
  return (
    <>
      <div className="wrap content" style={{ paddingBottom: 0 }}>
        <Breadcrumbs items={[{ label: "Locations" }]} />
        <div className="lede-head" style={{ marginBottom: 0 }}>
          <span className="eyebrow">Visit or call</span>
          <h1>Showrooms &amp; factory across New York.</h1>
          <p>See the equipment in person, or call the line for spec support and contract pricing.</p>
        </div>
      </div>
      <Locations hideHead />
    </>
  );
}
