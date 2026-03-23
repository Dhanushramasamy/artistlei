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
    <div className="w-screen h-[100dvh] bg-black overflow-hidden relative selection:bg-primary/30">
      {/* Fullscreen Video Monitor */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={true}
        className="w-full h-full object-contain bg-black"
      />

      {/* Persistent Status Layer (only when not connected) */}
      {status !== "connected" && (
        <div className="absolute inset-0 z-40 bg-[#020205] flex flex-col items-center justify-center p-4 md:p-8 text-center overflow-y-auto">
          {/* Animated Background Blobs for Monitoring Screen */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] md:w-[80%] md:h-[80%] rounded-full bg-primary/10 blur-[80px] md:blur-[150px] animate-pulse pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center max-w-sm md:max-w-md w-full my-auto">
             <Link 
               href="/" 
               className="absolute -top-4 -left-4 md:top-0 md:left-0 w-8 h-8 md:w-10 md:h-10 glass rounded-full flex items-center justify-center text-white/40 hover:text-white/80 transition-colors border-white/5"
             >
               ←
             </Link>

             <div className="w-12 h-12 md:w-16 md:h-16 glass rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-8 border-white/10 shadow-2xl mt-8 md:mt-0">
               🖼️
             </div>

             <h1 className="brand-font text-2xl md:text-3xl font-black mb-1 md:mb-2 tracking-tight">Tracing <span className="gradient-text">Monitor</span></h1>
             <p className="text-[10px] md:text-sm text-white/40 mb-6 md:mb-10 font-medium">Ready to receive your camera hub feed.</p>
             
             <div className="p-6 md:p-10 glass rounded-[32px] md:rounded-[40px] border-white/5 relative group mb-6 md:mb-10 bg-white/[0.02] w-full max-w-[280px] md:max-w-none">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-[32px] md:rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <QRDisplay roomId={peerId} joinUrl={joinUrl} />
             </div>

             <div className="flex flex-col gap-3 md:gap-4 text-center">
                <div className="px-3 py-1.5 md:px-4 md:py-2 glass-pill brand-font font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-secondary border-secondary/20 inline-flex items-center mx-auto">
                   <div className="status-dot-pulse bg-secondary shadow-[0_0_8px_var(--secondary)] w-1.5 h-1.5 md:w-2 md:h-2" />
                   Awaiting Connection
                </div>
                <p className="text-[10px] md:text-xs text-white/20 italic max-w-[240px] md:max-w-[280px]">
                  Scan from your phone or enter the ID in the Control Hub to begin tracing.
                </p>
             </div>
          </div>
        </div>
      )}

      {/* Connected Success Indicator (fades out) */}
      {status === "connected" && (
         <div className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 px-4 py-2 md:px-6 md:py-3 glass rounded-full border-secondary/20 bg-secondary/5 flex items-center gap-2 md:gap-3 animate-out fade-out fill-mode-forwards duration-1000 delay-2000 pointer-events-none z-50">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-secondary shadow-[0_0_8px_var(--secondary)]" />
            <span className="brand-font font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-secondary">Monitor Synced ✓</span>
         </div>
      )}

      {/* Error Notifications */}
      {peerError && (
        <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto z-[60] glass border-red-500/20 bg-red-500/5 px-4 py-3 md:px-6 md:py-4 rounded-2xl flex items-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="text-lg md:text-xl">⚠️</span>
          <div className="flex flex-col">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500/60 mb-0.5 md:mb-1 leading-none">Peer Error</span>
            <span className="text-xs md:text-sm font-bold text-red-400 leading-tight">{peerError}</span>
          </div>
        </div>
      )}
    </div>
  );
}
