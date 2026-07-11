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
            <div className="locgrid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
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
          <div className="sec-head">
            <div>
              <span className="eyebrow">Visit or call</span>
              <h2>NYC showrooms &amp; factory, one line to call.</h2>
            </div>
          </div>
        )}
        <div className="locgrid">
          {COMPANY.locations.map((l) => (
            <LocCard l={l} key={l.name + l.address} />
          ))}
        </div>
        <LocationsMap />
      </div>
    </section>
  );
}
