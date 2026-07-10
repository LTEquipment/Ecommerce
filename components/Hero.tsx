import Link from "next/link";
import { money } from "@/lib/format";
import { ArrowRight } from "./icons";

export default function Hero() {
  return (
    <div className="hero">
      <div className="wrap">
        <div>
          <span className="eyebrow">Panda® — made to inspire</span>
          <h1>
            The wok range,
            <br />
            perfected in New York.
          </h1>
          <p className="lede">
            Custom-built Panda® wok ranges, steamers, roasters and automation — engineered for
            high-output Oriental cooking and shipped nationwide from our 60,000 sq ft factory.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary btn-lg" href="/products">
              Shop all equipment <ArrowRight />
            </Link>
            <Link className="btn btn-line btn-lg" href="/register">
              Open a trade account
            </Link>
          </div>
        </div>
        <div className="hero-media">
          <span className="corner">Model 52527</span>
          <img src="/products/52527-1.png" alt="Panda Turbo Wok Range" />
          <div className="featom">
            <div>
              <div className="fn">Turbo Wok Range</div>
              <div className="fs">125,000 BTU · turbo jet chamber · stainless</div>
            </div>
            <div className="fp">
              {money(12177)}
              <small>In stock</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
