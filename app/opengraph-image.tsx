import { ImageResponse } from "next/og";

// Dynamic, branded default social card (Open Graph + Twitter) for the site.
// Product pages override this with the product photo via their metadata.
export const alt = "L&T Restaurant Equipment — commercial kitchen equipment built in New York";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#17191C",
          color: "#ffffff",
          padding: "76px 84px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              width: 66,
              height: 66,
              background: "#BE1E2D",
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            L&T
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: 2 }}>RESTAURANT EQUIPMENT</div>
            <div style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", letterSpacing: 3, marginTop: 2 }}>
              MADE TO INSPIRE · NYC
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 64, height: 5, background: "#BE1E2D", marginBottom: 30 }} />
          <div style={{ display: "flex", fontSize: 74, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 900 }}>
            Commercial kitchen equipment, built in New York.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22 }}>
          <div style={{ display: "flex", color: "rgba(255,255,255,0.72)" }}>
            Panda® · Wok ranges · Steamers · Roasters · Automation
          </div>
          <div style={{ display: "flex", fontWeight: 700 }}>ltfse.com</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
