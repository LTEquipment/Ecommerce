import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BRAND } from "@/lib/brand";
import { ArrowRight } from "@/components/icons";

export const metadata = { title: "About — L&T Restaurant Equipment" };

export default function AboutPage() {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "About" }]} />
      <div className="lede-head">
        <span className="eyebrow">Panda® — {BRAND.tagline}</span>
        <h1>Empowering chefs with the finest cooking equipment.</h1>
        <p>{BRAND.vision}</p>
      </div>

      <div className="prose">
        <p>{BRAND.story}</p>
      </div>

      <div className="valuegrid">
        {BRAND.values.map((v) => (
          <div className="valuecard" key={v.title}>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="band" style={{ borderRadius: "var(--rl)", border: "1px solid var(--line)" }}>
        <div className="wrap" style={{ padding: "var(--s6) var(--s5)" }}>
          <div>
            <span className="eyebrow">By the numbers</span>
            <h2 style={{ margin: "10px 0 0" }}>Four decades on the line.</h2>
          </div>
          <div className="stats" style={{ marginTop: 0 }}>
            {BRAND.stats.map((s) => (
              <div className="s" key={s.label}>
                <div className="n">{s.value}</div>
                <div className="l">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section style={{ padding: "var(--s6) 0 0" }}>
        <div className="sec-head"><h2>Trusted by the kitchens you know</h2></div>
        <div className="clientwall">
          {BRAND.clients.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </section>

      <section style={{ paddingBottom: 0 }}>
        <Link className="btn btn-primary btn-lg" href="/products">
          Explore the equipment <ArrowRight />
        </Link>
      </section>
    </div>
  );
}
