import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
            width: 112,
            height: 112,
            borderRadius: "50%",
            display: "flex",
            border: "3px solid rgba(255,157,61,0.55)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: "50%",
              display: "flex",
              background:
                "radial-gradient(circle at 50% 45%, #7fd4ff 0%, #4fc3ff 45%, rgba(79,195,255,0.15) 75%, rgba(79,195,255,0) 100%)",
              boxShadow: "0 0 40px 8px rgba(79,195,255,0.55)",
            }}
          />
        </div>
      </div>
    ),
    { width: 192, height: 192 },
  );
}
