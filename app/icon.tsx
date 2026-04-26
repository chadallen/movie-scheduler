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
          background: "#111111",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Camera body */}
        <div
          style={{
            position: "absolute",
            left: 4,
            top: 10,
            width: 18,
            height: 12,
            background: "#c9a84c",
            borderRadius: 2,
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-around",
            paddingTop: 0,
          }}
        >
          {/* Film strip notches — dark squares along the top */}
          <div
            style={{
              width: 3,
              height: 3,
              background: "#111111",
              borderRadius: 0,
              marginTop: 1,
            }}
          />
          <div
            style={{
              width: 3,
              height: 3,
              background: "#111111",
              borderRadius: 0,
              marginTop: 1,
            }}
          />
          <div
            style={{
              width: 3,
              height: 3,
              background: "#111111",
              borderRadius: 0,
              marginTop: 1,
            }}
          />
        </div>

        {/* Lens — circle on the right side of the body */}
        <div
          style={{
            position: "absolute",
            right: 4,
            top: 12,
            width: 8,
            height: 8,
            background: "#c9a84c",
            borderRadius: 4,
            border: "2px solid #111111",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
