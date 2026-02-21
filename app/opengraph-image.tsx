import { ImageResponse } from "next/og";

export const alt = "IntraWeb Technologies – AI Implementation That Actually Works";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          padding: 48,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 16 }}>
          IntraWeb Technologies
        </div>
        <div style={{ fontSize: 32, opacity: 0.9, textAlign: "center" }}>
          AI Implementation That Actually Works
        </div>
        <div
          style={{
            fontSize: 24,
            opacity: 0.7,
            marginTop: 24,
            textAlign: "center",
          }}
        >
          We help SMBs turn AI tool adoption into actual operational savings
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
