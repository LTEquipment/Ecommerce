import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { TrendingUp } from "./icons";

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="wrap">
        <div>
          Designed &amp; built in New York · <strong>40+ years</strong> · NSF · CSA · ETL Listed
        </div>
        <div className="tb-r">
          <Link className="tb-ir" href="/investors">
            <TrendingUp /> Investor Relations
          </Link>
          <Link href="/about">Our story</Link>
          <Link href="/contact">
            Spec support: <strong>{COMPANY.mainPhone}</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}
