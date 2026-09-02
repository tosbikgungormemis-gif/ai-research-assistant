import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0d14",
        }}
      >
        <div
          style={{
            width: 108,
            height: 108,
            borderRadius: "50%",
            display: "flex",
            border: "3px solid rgba(255,157,61,0.55)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              display: "flex",
              background:
                "radial-gradient(circle at 50% 45%, #7fd4ff 0%, #4fc3ff 45%, rgba(79,195,255,0.15) 75%, rgba(79,195,255,0) 100%)",
              boxShadow: "0 0 36px 8px rgba(79,195,255,0.55)",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
