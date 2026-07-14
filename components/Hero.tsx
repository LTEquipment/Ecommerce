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
        <h1>
          The whole kitchen,
          <br />
          perfected in New&nbsp;York.
        </h1>
        <Link className="btn btn-primary btn-lg" href="/products">
          Shop all equipment <ArrowRight />
        </Link>
      </div>
      <a className="vhero-scroll" href="#catalog" aria-label="Scroll to catalog">
        <span className="vs-label">Scroll</span>
        <span className="vs-line" />
      </a>
    </section>
  );
}
