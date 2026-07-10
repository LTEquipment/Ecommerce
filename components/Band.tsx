import { BRAND } from "@/lib/brand";

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
            <div className="cert">
              <div className="cbadge">NSF</div>
              <div><div className="cn">NSF/ANSI 4</div><div className="cs">Sanitation certified</div></div>
            </div>
            <div className="cert">
              <div className="cbadge">CSA</div>
              <div><div className="cn">CSA Approved</div><div className="cs">Gas &amp; electrical safety</div></div>
            </div>
            <div className="cert">
              <div className="cbadge">ETL</div>
              <div><div className="cn">ETL Listed</div><div className="cs">Intertek verified</div></div>
            </div>
            <div className="cert">
              <div className="cbadge" style={{ fontSize: 9 }}>E★</div>
              <div><div className="cn">Energy Star</div><div className="cs">On qualifying models</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
