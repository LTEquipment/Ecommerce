import Breadcrumbs from "@/components/Breadcrumbs";
import EditorialHero from "@/components/EditorialHero";
import Locations from "@/components/Locations";
import JsonLd from "@/components/JsonLd";
import { storesLd } from "@/lib/seo";

export const metadata = {
  title: "Showrooms & Factory — L&T Restaurant Equipment",
  description: "Visit L&T Restaurant Equipment showrooms and factory across New York — Staten Island, Manhattan, Brooklyn and Flushing. See the Panda® line in person.",
  alternates: { canonical: "/locations" },
};

export default function LocationsPage() {
  return (
    <>
      <JsonLd data={storesLd()} />
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
