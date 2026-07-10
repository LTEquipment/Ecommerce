import { HERO_DRAW } from "@/lib/illus";
import { ArrowRight } from "./icons";

export default function Hero() {
  return (
    <div className="hero">
      <div className="wrap">
        <div>
          <span className="eyebrow">Commercial kitchen equipment &amp; supply</span>
          <h1>
            Equip your kitchen.
            <br />
            Ship it this week.
          </h1>
          <p className="lede">
            Over 12,000 stocked SKUs — ranges, refrigeration, prep tables and smallwares.
            NSF-certified, spec&apos;d right, and shipped from six regional depots in 24–48 hours.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary" href="#catalog">
              Shop all equipment <ArrowRight />
            </a>
            <a className="btn btn-line" href="#">
              Open a trade account
            </a>
          </div>
        </div>
        <div className="hero-spec">
          <span className="corner">Model PR-WR24</span>
          <div className="draw" dangerouslySetInnerHTML={{ __html: HERO_DRAW }} />
          <div className="featom">
            <div>
              <div className="fn">Wok Range, 2-Burner Gas</div>
              <div className="fs">120,000 BTU · 16-ga stainless · NSF</div>
            </div>
            <div className="fp">
              $1,749<small>In stock</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
