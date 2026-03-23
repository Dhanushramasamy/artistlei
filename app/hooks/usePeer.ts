"use client";
import { useEffect, useRef, useState } from "react";
import type { Peer as PeerType } from "peerjs";

export interface UsePeerReturn {
  peer: PeerType | null;
  peerId: string;
  ready: boolean;
  error: string | null;
}

export function usePeer(): UsePeerReturn {
  const [peerId, setPeerId] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const peerRef = useRef<PeerType | null>(null);
  const [peer, setPeer] = useState<PeerType | null>(null);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      try {
        const { Peer } = await import("peerjs");
        // Adding Google STUN servers for robust NAT traversal across different networks
        const p = new Peer({
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
            sdpSemantics: 'unified-plan'
          }
        });

        peerRef.current = p;

        p.on("open", (id) => {
          if (destroyed) return;
          setPeerId(id);
          setReady(true);
          setPeer(p);
        });

        p.on("error", (err) => {
          if (destroyed) return;
          setError(err.message);
        });
      } catch (e: unknown) {
        if (!destroyed) setError((e as Error).message);
      }
    }

    init();

    return () => {
      destroyed = true;
      peerRef.current?.destroy();
    };
  }, []);

  return { peer, peerId, ready, error };
}
