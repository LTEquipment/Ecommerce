import Breadcrumbs from "@/components/Breadcrumbs";
import EditorialHero from "@/components/EditorialHero";
import Locations from "@/components/Locations";

export const metadata = { title: "Locations — L&T Restaurant Equipment" };

export default function LocationsPage() {
  return (
    <>
      <EditorialHero
        kicker="Visit or call"
        title="Showrooms & factory across New York."
        lede="See the equipment in person, or call the line for spec support and contract pricing."
        stats={[{ value: "4", label: "NYC locations" }]}
      />

      <div className="wrap content" style={{ paddingBottom: 0 }}>
        <Breadcrumbs items={[{ label: "Locations" }]} />
      </div>

      <Locations hideHead split />
    </>
  );
}
