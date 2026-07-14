import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { getSiteSettings } from "@/lib/settings";
import { TrendingUp } from "./icons";

export default async function TopBar() {
  const { investorRelationsEnabled } = await getSiteSettings();
  return (
    <div className="topbar">
      <div className="wrap">
        <div>
          Designed and built in New York · Serving professional kitchens <strong>nationwide</strong>
        </div>
        <div className="tb-r">
          {investorRelationsEnabled && (
            <Link className="tb-ir" href="/investors">
              <TrendingUp /> Investor Relations
            </Link>
          )}
          <Link href="/financing">Financing</Link>
          <Link href="/contact">
            Spec support: <strong>{COMPANY.mainPhone}</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}
