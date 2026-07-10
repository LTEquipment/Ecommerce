import { COMPANY, telHref } from "@/lib/company";

export default function Locations() {
  return (
    <section id="locations" className="locations">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <span className="eyebrow">Visit or call</span>
            <h2>Two NYC showrooms, one line to call.</h2>
          </div>
        </div>
        <div className="locgrid">
          {COMPANY.locations.map((l) => (
            <div className="loc" key={l.name + l.address}>
              <div className="kind">{l.kind}</div>
              <div className="lname">{l.name}</div>
              <div className="laddr">{l.address}</div>
              <div className="lphone">
                <a href={telHref(l.phone)}>{l.phone}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
