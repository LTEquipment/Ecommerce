import { COMPANY } from "@/lib/company";

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="wrap">
        <div>
          Serving commercial kitchens since <strong>2006</strong> · NSF · CSA · ETL Listed
        </div>
        <div className="tb-r">
          <a href="#">Track order</a>
          <a href="#">Bulk &amp; contract pricing</a>
          <a href="#locations">
            Spec support: <strong>{COMPANY.mainPhone}</strong>
          </a>
        </div>
      </div>
    </div>
  );
}
