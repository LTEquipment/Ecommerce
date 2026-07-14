import { COMPANY, telHref, type Location } from "@/lib/company";
import { ArrowRight } from "./icons";
import LocationsMap from "./LocationsMap";

function LocCard({ l }: { l: Location }) {
  const isHq = /HQ|Factory/i.test(l.kind);
  const dir = "https://maps.google.com/?q=" + encodeURIComponent(l.address);
  return (
    <div className={`loc${isHq ? " hq" : ""}`}>
      <div className="kind">{l.kind}</div>
      <div className="lname">{l.name}</div>
      <div className="laddr">{l.address}</div>
      <div className="lhours">Mon–Fri 8–6 · Sat 9–2</div>
      <div className="lphone"><a href={telHref(l.phone)}>{l.phone}</a></div>
      <a className="ldir" href={dir} target="_blank" rel="noopener noreferrer">
        Get directions <ArrowRight />
      </a>
    </div>
  );
}

function LocRow({ l, n }: { l: Location; n: number }) {
  const isHq = /HQ|Factory/i.test(l.kind);
  const dir = "https://maps.google.com/?q=" + encodeURIComponent(l.address);
  return (
    <li className={`locrow${isHq ? " hq" : ""}`}>
      <span className="locrow-n">{String(n).padStart(2, "0")}</span>
      <div className="locrow-body">
        <span className="kind">{l.kind}</span>
        <h3 className="lname">{l.name}</h3>
        <p className="laddr">{l.address}</p>
        <p className="lhours">Mon–Fri 8–6 · Sat 9–2</p>
        <div className="locrow-actions">
          <a className="lphone" href={telHref(l.phone)}>{l.phone}</a>
          <a className="ldir" href={dir} target="_blank" rel="noopener noreferrer">
            Get directions <ArrowRight />
          </a>
        </div>
      </div>
    </li>
  );
}

export default function Locations({
  hideHead = false,
  split = false,
}: {
  hideHead?: boolean;
  split?: boolean;
}) {
  if (split) {
    return (
      <section className="locations">
        <div className="wrap">
          <div className="loc-split">
            <div className="locgrid">
              {COMPANY.locations.map((l) => (
                <LocCard l={l} key={l.name + l.address} />
              ))}
            </div>
            <div className="loc-map">
              <LocationsMap />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="locations" className="locations">
      <div className="wrap">
        {!hideHead && (
          <div className="sec-head loc-head">
            <div>
              <span className="eyebrow">Visit or call</span>
              <h2>NYC showrooms &amp; factory, one line to call.</h2>
            </div>
          </div>
        )}
        <div className="loc-atlas">
          <ol className="loc-list">
            {COMPANY.locations.map((l, i) => (
              <LocRow l={l} n={i + 1} key={l.name + l.address} />
            ))}
          </ol>
          <div className="loc-atlas-map">
            <LocationsMap />
          </div>
        </div>
      </div>
    </section>
  );
}
