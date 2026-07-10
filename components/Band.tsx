export default function Band() {
  return (
    <div className="band">
      <div className="wrap">
        <div>
          <span className="eyebrow">Why operators buy from us</span>
          <h2>One supplier for the whole line.</h2>
          <p>
            We started on the floor of a restaurant depot, watching owners chase a single
            kitchen across five vendors and three back-orders. L&amp;T consolidates it — the
            range, the reach-in, the tables and the wares — bought once, delivered together,
            backed by one account team.
          </p>
          <p>
            No membership fees. Transparent freight. Volume pricing for multi-unit operators
            and one number to call when a spec question comes up.
          </p>
          <div className="stats">
            <div className="s">
              <div className="n">12,400+</div>
              <div className="l">SKUs in stock</div>
            </div>
            <div className="s">
              <div className="n">6</div>
              <div className="l">Regional depots</div>
            </div>
            <div className="s">
              <div className="n">18,000+</div>
              <div className="l">Kitchens outfitted</div>
            </div>
          </div>
        </div>
        <div className="certs">
          <div className="ct">Every product, certified &amp; listed</div>
          <div className="certgrid">
            <div className="cert">
              <div className="cbadge">NSF</div>
              <div>
                <div className="cn">NSF/ANSI 4</div>
                <div className="cs">Sanitation certified</div>
              </div>
            </div>
            <div className="cert">
              <div className="cbadge">CSA</div>
              <div>
                <div className="cn">CSA Approved</div>
                <div className="cs">Gas &amp; electrical safety</div>
              </div>
            </div>
            <div className="cert">
              <div className="cbadge">ETL</div>
              <div>
                <div className="cn">ETL Listed</div>
                <div className="cs">Intertek verified</div>
              </div>
            </div>
            <div className="cert">
              <div className="cbadge" style={{ fontSize: 9 }}>
                E★
              </div>
              <div>
                <div className="cn">Energy Star</div>
                <div className="cs">On qualifying models</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
