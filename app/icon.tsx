import { ImageResponse } from "next/og";

// Next.js App Router picks this up automatically as the site favicon.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#f5f5f0",
          border: "2px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          fontWeight: 700,
          fontSize: 20,
          color: "#1a1a1a",
        }}
      >
        M
      </div>
    ),
    { ...size }
  );
}
