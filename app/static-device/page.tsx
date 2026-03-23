"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { MediaConnection } from "peerjs";
import { usePeer } from "../hooks/usePeer";
import { useOverlay } from "../hooks/useOverlay";
import VideoCanvas from "../components/VideoCanvas";
import ControlPanel from "../components/ControlPanel";
import Link from "next/link";
import { Suspense } from "react";

type Status = "idle" | "connecting" | "connected" | "error";

function StaticDeviceInner() {
  const searchParams = useSearchParams();
  const defaultRoom = searchParams.get("room") ?? "";

  const { peer, ready, error: peerError } = usePeer();
  const { overlay, update, reset } = useOverlay();

  const [roomId, setRoomId] = useState(defaultRoom);
  const [status, setStatus] = useState<Status>("idle");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [errorOverride, setErrorOverride] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const connRef = useRef<MediaConnection | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureStreamRef = useRef<MediaStream | null>(null);

  // Get camera stream locally
  const initCamera = useCallback(async (mode: "environment" | "user") => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }

    let stream: MediaStream | null = null;
    let fallbackError: Error | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: mode } },
        audio: false,
      });
    } catch (err) {
      console.warn(`Exact camera access for ${mode} failed, trying preference...`, err);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
          audio: false,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err3) {
          fallbackError = err3 instanceof Error ? err3 : new Error(String(err3));
        }
      }
    }

    if (!stream) {
      console.error("Camera access failed", fallbackError);
      setStatus("error");
      if (fallbackError) {
        setErrorOverride(`Camera error: ${fallbackError.name} - ${fallbackError.message}`);
      }
      return;
    }

    setCameraStream(stream);
    setErrorOverride(null);
  }, [cameraStream]);

  useEffect(() => {
    initCamera(facingMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called by VideoCanvas once the canvas element is ready
  const onCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    if (canvasRef.current === canvas) return;
    canvasRef.current = canvas;
    captureStreamRef.current = (canvas as HTMLCanvasElement & {
      captureStream(fps?: number): MediaStream;
    }).captureStream(30);
  }, []);

  const connect = useCallback(() => {
    if (!peer || !ready || !roomId.trim()) return;
    
    const streamToSend = captureStreamRef.current;
    if (!streamToSend) {
      console.warn("Canvas stream not ready yet.");
      return;
    }

    setStatus("connecting");

    // Call the handy device with our composited canvas stream
    const call = peer.call(roomId.trim(), streamToSend);
    connRef.current = call;

    call.on("stream", () => {
      // We don't expect a stream back, but we mark as connected
      setStatus("connected");
    });

    // PeerJS sometimes doesn't fire 'stream' if the other side doesn't send one
    // So we'll also mark connected on successful data connection or just after calling if we assume success
    const timer = setTimeout(() => {
        if (call.open) setStatus("connected");
    }, 2000);

    call.on("close", () => {
      setStatus("idle");
    });

    call.on("error", (err) => {
      console.error("PeerJS call error:", err);
      setStatus("error");
    });

    return () => clearTimeout(timer);
  }, [peer, ready, roomId]);

  useEffect(() => {
    if (!defaultRoom || !peer || !ready) return;
    if (canvasRef.current) {
      connect();
    }
  }, [peer, ready, defaultRoom, connect]);

  const toggleCamera = () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    initCamera(newMode);
  };

  const statusLabel: Record<Status, string> = {
    idle: "Connect to Lightbox",
    connecting: "Connecting…",
    connected: "Beaming to Lightbox ✓",
    error: "Connection error",
  };

  const statusClass: Record<Status, string> = {
    idle: "waiting",
    connecting: "waiting",
    connected: "connected",
    error: "error",
  };

  return (
    <div style={{ width: "100vw", height: "100dvh", display: "flex", flexDirection: "column", background: "#000" }}>
      {/* Canvas compositor */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <VideoCanvas
          stream={cameraStream}
          overlay={overlay}
          onCanvasReady={onCanvasReady}
          onOverlayUpdate={update}
        />

        {!cameraStream && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "rgba(255,255,255,0.2)",
              fontSize: 14,
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: 56 }}>📷</div>
            <p>Starting Camera...</p>
          </div>
        )}
      </div>

      {/* Top bar */}
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
          gap: 12,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)",
        }}
      >
        <Link href="/" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", flexShrink: 0 }}>
          ← Home
        </Link>

        {/* Status badge */}
        <div
          className="glass"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          <div className={`status-dot ${statusClass[status]}`} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{statusLabel[status]}</span>
        </div>

        {/* Local Camera Control */}
        <button
          onClick={toggleCamera}
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🔄 Flip Camera
        </button>

        {/* Room ID input + Connect */}
        {status !== "connected" && (
          <div style={{ display: "flex", gap: 8, flex: 1, maxWidth: 360 }}>
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Lightbox Room ID..."
              onKeyDown={(e) => e.key === "Enter" && connect()}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "7px 12px",
                color: "#fff",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={connect}
              disabled={!ready || !roomId.trim()}
              className="btn-glow"
              style={{
                padding: "7px 18px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                cursor: ready && roomId.trim() ? "pointer" : "not-allowed",
                opacity: ready && roomId.trim() ? 1 : 0.5,
                flexShrink: 0,
              }}
            >
              Connect
            </button>
          </div>
        )}
      </div>

      {/* Overlay control panel */}
      <ControlPanel
        overlay={overlay}
        onUpdate={update}
        onReset={reset}
        onImageUpload={(src) => update({ src })}
      />

      {(peerError || errorOverride) && (
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
          ⚠ {peerError || errorOverride}
        </div>
      )}
    </div>
  );
}

export default function StaticDevicePage() {
  return (
    <Suspense>
      <StaticDeviceInner />
    </Suspense>
  );
}
