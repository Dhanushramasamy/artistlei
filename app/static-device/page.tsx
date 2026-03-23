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
      setStatus("connected");
    });

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
    idle: "Ready",
    connecting: "Linking…",
    connected: "Beaming",
    error: "Error",
  };

  const statusClass: Record<Status, string> = {
    idle: "status-waiting",
    connecting: "status-waiting",
    connected: "status-connected",
    error: "status-error",
  };

  return (
    <div className="w-screen h-[100dvh] flex flex-col bg-black overflow-hidden selection:bg-primary/30">
      {/* Main Preview Area */}
      <div className="flex-1 relative overflow-hidden bg-[#050508]">
        <VideoCanvas
          stream={cameraStream}
          overlay={overlay}
          onCanvasReady={onCanvasReady}
          onOverlayUpdate={update}
        />

        {!cameraStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/20 select-none">
            <div className="w-16 h-16 md:w-20 md:h-20 glass rounded-3xl flex items-center justify-center text-4xl md:text-5xl animate-pulse">
              📷
            </div>
            <p className="brand-font text-sm md:text-lg font-bold tracking-widest uppercase opacity-50">Lens Readying...</p>
          </div>
        )}
      </div>

      {/* Condensed Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 px-3 md:px-6 py-2 md:py-4 flex items-center gap-2 md:gap-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <Link 
          href="/" 
          className="pointer-events-auto w-8 h-8 md:w-10 md:h-10 glass rounded-full flex items-center justify-center text-sm md:text-lg hover:bg-white/10 transition-colors border-white/5"
        >
          ←
        </Link>

        {/* Compact Status Bubble */}
        <div className={`pointer-events-auto px-3 py-1.5 md:px-4 md:py-2 rounded-full glass brand-font font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] flex items-center ${statusClass[status]}`}>
          <div className="status-dot-pulse w-1.5 h-1.5 md:w-2 md:h-2" />
          <span className="hidden sm:inline mr-1">{statusLabel[status]}</span>
          {status === "connected" ? "Sync ✓" : status === "error" ? "fail" : statusLabel[status]}
        </div>

        {/* Camera Flip - smaller on mobile */}
        <button
          onClick={toggleCamera}
          className="pointer-events-auto ml-auto px-3 py-1.5 md:px-5 md:py-2.5 rounded-full glass brand-font font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/70 hover:bg-white/10 transition-all active:scale-95 border-white/5"
        >
          <span className="hidden sm:inline">🔄 Flip Camera</span>
          <span className="sm:hidden">🔄</span>
        </button>

        {/* Compact Connection UI */}
        {status !== "connected" && (
          <div className="pointer-events-auto flex items-center gap-1.5 max-w-[140px] sm:max-w-sm ml-1">
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="ID"
              onKeyDown={(e) => e.key === "Enter" && connect()}
              className="w-full bg-white/5 border border-white/10 rounded-full px-3 py-1.5 md:px-5 md:py-2.5 text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-white outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
            />
            <button
              onClick={connect}
              disabled={!ready || !roomId.trim()}
              className="btn-primary px-3 py-1.5 md:px-6 md:py-2.5 rounded-full text-[10px] tracking-[0.2em] font-black uppercase disabled:opacity-30 disabled:pointer-events-none"
            >
              <span className="hidden sm:inline">Link</span>
              <span className="sm:hidden">→</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Panel (Responsive) */}
      <ControlPanel
        overlay={overlay}
        onUpdate={update}
        onReset={reset}
        onImageUpload={(src) => update({ src })}
      />

      {/* Slim Error Notifications */}
      {(peerError || errorOverride) && (
        <div className="fixed bottom-20 left-4 right-4 z-[60] glass border-red-500/20 bg-red-500/5 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="text-base text-red-500">⚠️</span>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[9px] font-black uppercase tracking-widest text-red-500/60 leading-none mb-1">Error</span>
            <span className="text-xs font-bold text-red-400 leading-tight truncate">{peerError || errorOverride}</span>
          </div>
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
