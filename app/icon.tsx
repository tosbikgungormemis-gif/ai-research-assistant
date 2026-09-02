import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            background:
              "radial-gradient(circle at 50% 45%, #7fd4ff 0%, #4fc3ff 45%, rgba(79,195,255,0.15) 75%, rgba(79,195,255,0) 100%)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
