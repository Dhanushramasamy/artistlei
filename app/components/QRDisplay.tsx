"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRDisplayProps {
  roomId: string;
  joinUrl: string;
}

export default function QRDisplay({ roomId, joinUrl }: QRDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass p-5 flex flex-col items-center gap-4 w-72">
      <p className="text-xs text-white/50 uppercase tracking-widest font-semibold">Room ID</p>

      {/* QR Code */}
      <div className="bg-white rounded-xl p-3">
        <QRCodeSVG value={joinUrl} size={160} />
      </div>

      {/* Room ID text */}
      <div className="w-full flex gap-2 items-center">
        <span className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-sm text-white/80 truncate">
          {roomId || "Generating…"}
        </span>
        <button
          onClick={copy}
          className="btn-glow px-3 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: copied
              ? "rgba(16, 185, 129, 0.2)"
              : "rgba(124, 58, 237, 0.25)",
            border: copied ? "1px solid #10b981" : "1px solid rgba(124,58,237,0.4)",
            color: copied ? "#10b981" : "#a78bfa",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <p className="text-xs text-white/35 text-center">
        Scan the QR or share the Room ID with the Static device
      </p>
    </div>
  );
}
