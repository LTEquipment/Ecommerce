"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { COMPANY, telHref } from "@/lib/company";

const RED = "#BE1E2D";
const INK = "#17191C";

// A teardrop map pin — universally read as "location", unlike a plain dot.
const pinSvg = (color: string) =>
  `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">` +
  `<path d="M13 1C7 1 2 6 2 12c0 7.7 9.4 18.6 10.6 19.9a.6.6 0 0 0 .8 0C14.6 30.6 24 19.7 24 12 24 6 19 1 13 1z" fill="${color}"/>` +
  `<circle cx="13" cy="12" r="4.6" fill="#fff"/></svg>`;

export default function LocationsMap() {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !elRef.current || mapRef.current) return;

      const map = L.map(elRef.current, {
        center: [40.7, -73.95], // NYC fallback until we fit to the pins
        zoom: 11,
        scrollWheelZoom: false,
        attributionControl: false, // replaced by our own subtle credit
      });
      mapRef.current = map;

      // CARTO Positron: a clean, light, low-colour basemap that matches the site.
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      const icon = (hq: boolean) =>
        L.divIcon({
          className: "lt-pin",
          html: pinSvg(hq ? INK : RED),
          iconSize: [26, 34],
          iconAnchor: [13, 32],
          popupAnchor: [0, -28],
        });

      const markers = COMPANY.locations.map((l) =>
        L.marker([l.lat, l.lng], { icon: icon(/HQ|Factory/i.test(l.kind)), title: l.name })
          .addTo(map)
          .bindPopup(
            `<b>${l.name}</b><br>${l.address}<br><a href="${telHref(l.phone)}">${l.phone}</a>` +
              `<br><a href="https://maps.google.com/?q=${encodeURIComponent(l.address)}" target="_blank" rel="noopener noreferrer">Get directions →</a>`
          )
      );

      // Fit once the container has its real size, otherwise Leaflet computes a
      // world-level zoom from a 0×0 box.
      const bounds = L.featureGroup(markers).getBounds().pad(0.2);
      const fit = () => {
        if (!mapRef.current) return;
        map.invalidateSize();
        map.fitBounds(bounds);
      };
      requestAnimationFrame(fit);
      setTimeout(fit, 250);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="locmap-wrap">
      <div ref={elRef} className="locmap" role="application" aria-label="Map of L&T NYC showrooms and factory" />
      <div className="locmap-legend" aria-hidden="true">
        <span><i style={{ background: INK }} /> HQ &amp; Factory</span>
        <span><i style={{ background: RED }} /> Showrooms</span>
      </div>
      <div className="locmap-credit">
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>
        {" · "}
        <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>
      </div>
    </div>
  );
}
