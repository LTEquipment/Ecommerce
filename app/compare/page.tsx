import Breadcrumbs from "@/components/Breadcrumbs";
import CompareView from "@/components/CompareView";

export const metadata = { title: "Compare — L&T Restaurant Equipment" };

export default function ComparePage() {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "Compare" }]} />
      <header className="wish-head">
        <h1>Compare equipment</h1>
        <p>Line up specs, price and availability side by side. Stored on this device.</p>
      </header>
      <CompareView />
    </div>
  );
}
