import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="animated-bg min-h-screen flex flex-col items-center justify-center px-6"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          top: -100,
          left: -100,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
          bottom: -80,
          right: -80,
          pointerEvents: "none",
        }}
      />

      {/* Logo + Title */}
      <div className="flex flex-col items-center gap-3 mb-12 text-center">
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 20,
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            marginBottom: 4,
            boxShadow: "0 0 40px rgba(124,58,237,0.4)",
          }}
        >
          🎨
        </div>
        <h1
          className="gradient-text"
          style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.1 }}
        >
          ArtistLei
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, maxWidth: 320 }}>
          Stream your wall. Overlay your reference. Trace your art with precision.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-sm sm:max-w-2xl">
        {/* Handy */}
        <Link href="/handy" className="flex-1">
          <div
            className="glass btn-glow h-full cursor-pointer transition-all"
            style={{
              padding: "28px 24px",
              borderRadius: 20,
              border: "1px solid rgba(124,58,237,0.3)",
              background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
            <h2
              style={{ fontWeight: 700, fontSize: 20, color: "#a78bfa", marginBottom: 8 }}
            >
              Handy Device
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.6 }}>
              Your phone. Points the camera at the wall and receives the composited
              stream back for zooming and drawing.
            </p>
            <div
              style={{
                marginTop: 20,
                display: "inline-block",
                padding: "8px 20px",
                borderRadius: 999,
                background: "rgba(124,58,237,0.3)",
                border: "1px solid rgba(124,58,237,0.5)",
                color: "#a78bfa",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Start Camera →
            </div>
          </div>
        </Link>

        {/* Static */}
        <Link href="/static-device" className="flex-1">
          <div
            className="glass btn-glow btn-glow-cyan h-full cursor-pointer transition-all"
            style={{
              padding: "28px 24px",
              borderRadius: 20,
              border: "1px solid rgba(6,182,212,0.3)",
              background: "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(6,182,212,0.04))",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🖥️</div>
            <h2
              style={{ fontWeight: 700, fontSize: 20, color: "#67e8f9", marginBottom: 8 }}
            >
              Static Device
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.6 }}>
              Your laptop or tablet. Receives the camera stream, overlays your
              reference image, and streams the composite back.
            </p>
            <div
              style={{
                marginTop: 20,
                display: "inline-block",
                padding: "8px 20px",
                borderRadius: 999,
                background: "rgba(6,182,212,0.2)",
                border: "1px solid rgba(6,182,212,0.4)",
                color: "#67e8f9",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Open Compositor →
            </div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <p
        style={{
          marginTop: 48,
          color: "rgba(255,255,255,0.2)",
          fontSize: 12,
          textAlign: "center",
        }}
      >
        Works over the same WiFi or internet via PeerJS P2P WebRTC
      </p>
    </main>
  );
}
