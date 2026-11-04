import { ImageResponse } from "next/og";
import { profile } from "@/lib/content";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const paper = "#f4f2ed";
const ink = "#0f0f0e";
const muted = "#6b6964";
const accent = "#2b44ff";
const line = "rgba(15,15,14,0.14)";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: paper,
          color: ink,
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: muted,
            borderBottom: `1px solid ${line}`,
            paddingBottom: 22,
          }}
        >
          <span>{profile.role}</span>
          <span>{profile.location}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-end", fontSize: 168, fontWeight: 600, letterSpacing: -9, lineHeight: 0.9 }}>
            <span>{profile.firstName}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", fontSize: 168, fontWeight: 600, letterSpacing: -9, lineHeight: 0.9 }}>
            <span>{profile.lastName}</span>
            <span style={{ width: 30, height: 30, borderRadius: 999, background: accent, marginLeft: 18, marginBottom: 26 }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 28 }}>
          <span style={{ maxWidth: 760, lineHeight: 1.3, color: "#3a3936" }}>
            Backend systems, APIs and full-stack products — shipped to production.
          </span>
          <span style={{ color: accent, fontSize: 24 }}>kavin.codegarage.dev</span>
        </div>
      </div>
    ),
    size,
  );
}
