import Breadcrumbs from "@/components/Breadcrumbs";
import Locations from "@/components/Locations";
import PageHeader, { StatMeta } from "@/components/PageHeader";

export const metadata = { title: "Locations — L&T Restaurant Equipment" };

export default function LocationsPage() {
  return (
    <>
      <div className="wrap content" style={{ paddingBottom: 0 }}>
        <Breadcrumbs items={[{ label: "Locations" }]} />
        <PageHeader
          eyebrow="Visit or call"
          title="Showrooms & factory across New York."
          intro="See the equipment in person, or call the line for spec support and contract pricing."
          meta={<StatMeta n="4" label="NYC locations" />}
        />
      </div>
      <Locations hideHead split />
    </>
  );
}
