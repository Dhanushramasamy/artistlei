"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaConnection } from "peerjs";
import { usePeer } from "../hooks/usePeer";
import QRDisplay from "../components/QRDisplay";
import Link from "next/link";

type Status = "idle" | "waiting" | "connected" | "error";

export default function HandyPage() {
  const { peer, peerId, ready, error: peerError } = usePeer();
  const [status, setStatus] = useState<Status>("waiting");
  const [compositeStream, setCompositeStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const connRef = useRef<MediaConnection | null>(null);

  // Once peer is ready, wait for the Static Device (Phone) to call us with the composited stream
  useEffect(() => {
    if (!peer || !ready) return;

    const handleCall = (call: MediaConnection) => {
      connRef.current = call;
      console.log("Handy Lightbox received call from Static Device!");
      
      // We answer without sending any stream back
      call.answer();

      call.on("stream", (remoteStream: MediaStream) => {
        console.log("Handy Lightbox received stream:", remoteStream.getVideoTracks());
        setCompositeStream(remoteStream);
        setStatus("connected");
      });

      call.on("close", () => {
        console.log("Handy call closed");
        setStatus("waiting");
        setCompositeStream(null);
      });

      call.on("error", (err) => {
        console.error("Handy call error:", err);
      });
    };

    peer.on("call", handleCall);

    return () => {
      peer.off("call", handleCall);
    };
  }, [peer, ready]);

  // Attach composite stream to video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (compositeStream) {
      video.srcObject = compositeStream;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [compositeStream]);

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/static-device?room=${peerId}`
      : "";

  return (
    <div style={{ width: "100vw", height: "100dvh", background: "#000", position: "relative", overflow: "hidden" }}>
      {/* Fullscreen Video Receiver */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={true}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />

      {/* Top bar (only visible when not connected, so it doesn't get in the way of tracing) */}
      {status !== "connected" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
          }}
        >
          <Link href="/" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>
            ← Home
          </Link>
          <div
            className="glass"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 999,
            }}
          >
            <div className={`status-dot waiting`} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Waiting for Camera Control...</span>
          </div>
        </div>
      )}

      {/* QR / Room ID panel — shown until connected */}
      {status !== "connected" && peerId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p
            className="gradient-text"
            style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", textAlign: "center" }}
          >
             Tracing Lightbox Ready
          </p>
          <QRDisplay roomId={peerId} joinUrl={joinUrl} />
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, textAlign: "center", maxWidth: 280, lineHeight: 1.5 }}>
            Open the <b>Static Device</b> on your phone to access the camera and controls. Provide this Room ID to beam the composited image here!
          </p>
        </div>
      )}

      {/* Peer Errors */}
      {peerError && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: 16,
            right: 16,
            zIndex: 50,
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: 12,
            padding: "12px 16px",
            color: "#f87171",
            fontSize: 13,
          }}
        >
          ⚠ {peerError}
        </div>
      )}
    </div>
  );
}
