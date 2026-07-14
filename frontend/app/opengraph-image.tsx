import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f2e2a 0%, #146353 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "#0f2e2a",
            border: "4px solid rgba(255,255,255,0.15)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <svg width="84" height="84" viewBox="0 0 40 40">
            <path
              d="M9 25c3-8.5 8-13 15-11.5"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M13 14c4 7.5 8.5 10.5 16 8.5"
              stroke="white"
              strokeOpacity="0.5"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="27.5" cy="13.5" r="2.3" fill="white" />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.02em",
          }}
        >
          Movilidad Total
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 30,
            color: "#ffb648",
            fontWeight: 600,
          }}
        >
          Programa #1 en movilidad para adultos
        </div>
      </div>
    ),
    { ...size }
  );
}
