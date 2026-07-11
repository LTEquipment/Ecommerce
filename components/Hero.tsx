import Link from "next/link";
import { ArrowRight } from "./icons";

const HERO_VIDEO = "https://ltusa.s3.us-east-1.amazonaws.com/adv_videos/home/Video_1.mp4";

export default function Hero() {
  return (
    <section className="vhero">
      <video
        className="vhero-bg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className="vhero-scrim" />
      <div className="wrap vhero-inner">
        <span className="eyebrow">Panda® — made to inspire</span>
        <h1>
          The wok range,
          <br />
          perfected in New York.
        </h1>
        <p className="vhero-lede">
          Custom-built Panda® wok ranges, steamers, roasters and automation — engineered for
          high-output Oriental cooking and shipped nationwide from our 60,000 sq ft factory.
        </p>
        <div className="hero-cta">
          <Link className="btn btn-primary btn-lg" href="/products">
            Shop all equipment <ArrowRight />
          </Link>
          <Link className="btn btn-line-light btn-lg" href="/register">
            Open a trade account
          </Link>
        </div>
        <div className="vhero-meta">
          <span><b>40+</b> years made in New York</span>
          <span className="dot" />
          <span><b>NSF · CSA · ETL</b> listed</span>
          <span className="dot" />
          <span>Ships in <b>24–48h</b></span>
        </div>
      </div>
      <a className="vhero-scroll" href="#catalog" aria-label="Scroll to catalog">
        <span />
      </a>
    </section>
  );
}
