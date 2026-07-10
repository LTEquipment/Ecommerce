import Breadcrumbs from "@/components/Breadcrumbs";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata = { title: "Admin — L&T" };
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <>
      <div className="wrap"><Breadcrumbs items={[{ label: "Admin" }]} /></div>
      <AdminDashboard />
    </>
  );
}
