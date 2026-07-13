import { BRAND } from "@/lib/brand";

// Certification marks. The images live in /public/certs — replace those SVGs
// with the OFFICIAL logo files from each body's brand portal (NSF, CSA Group,
// Intertek ETL, Energy Star). The layout picks them up automatically.
const CERTS = [
  { key: "nsf", name: "NSF/ANSI 4", sub: "Sanitation certified" },
  { key: "csa", name: "CSA Approved", sub: "Gas & electrical safety" },
  { key: "etl", name: "ETL Listed", sub: "Intertek verified" },
  { key: "energy-star", name: "Energy Star", sub: "On qualifying models" },
];

export default function Band() {
  return (
    <div className="band">
      <div className="wrap">
        <div>
          <span className="eyebrow">Why operators buy from us</span>
          <h2>Designed, built and serviced in New York.</h2>
          <p>{BRAND.story}</p>
          <p>
            From the first spec conversation to the end of a product&apos;s lifetime, one account
            team stays with you — bespoke wok chambers, transparent freight, and volume pricing
            for multi-unit operators.
          </p>
          <div className="stats">
            {BRAND.stats.map((s) => (
              <div className="s" key={s.label}>
                <div className="n">{s.value}</div>
                <div className="l">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="certs">
          <div className="ct">Every product, certified &amp; listed</div>
          <div className="certgrid">
            {CERTS.map((c) => (
              <div className="cert" key={c.key}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="clogo" src={`/certs/${c.key}.svg`} alt={`${c.name} — ${c.sub}`} width={52} height={25} />
                <div><div className="cn">{c.name}</div><div className="cs">{c.sub}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
