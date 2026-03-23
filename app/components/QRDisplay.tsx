"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRDisplayProps {
  roomId: string;
  joinUrl: string;
}

export default function QRDisplay({ roomId, joinUrl }: QRDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 md:gap-8 w-full">
      {/* Premium QR Container */}
      <div className="relative group/qr">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-3xl blur-2xl opacity-20 group-hover/qr:opacity-30 transition-opacity" />
        <div className="relative bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-2xl transition-transform group-hover/qr:scale-[1.02]">
          <QRCodeSVG 
            value={joinUrl} 
            size={typeof window !== 'undefined' && window.innerWidth < 640 ? 140 : 180} 
            level="H" 
            includeMargin={false} 
          />
        </div>
      </div>

      <div className="w-full flex flex-col gap-3 md:gap-4">
        {/* Room ID Badge */}
        <div className="flex flex-col gap-1 md:gap-1.5 px-0.5 md:px-1">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Room Identifier</span>
            <div className="flex gap-2 items-center">
                <div className="flex-1 glass-pill bg-white/[0.03] border-white/5 px-4 py-2.5 md:px-5 md:py-3.5 font-mono text-xs md:text-sm text-secondary font-bold tracking-wider truncate">
                    {roomId || "Generating…"}
                </div>
                <button
                    onClick={() => copy(roomId)}
                    className={`
                        w-10 h-10 md:w-12 md:h-12 glass rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-lg transition-all border-white/5
                        ${copied ? 'text-green-400 bg-green-400/10' : 'text-white/40 hover:text-white/90 hover:bg-white/10'}
                    `}
                >
                    {copied ? "✓" : "📋"}
                </button>
            </div>
        </div>

        {/* Copy Link Option */}
        <button 
            onClick={() => copy(joinUrl)}
            className="w-full py-3 md:py-4 glass-pill border-white/5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
        >
            Copy Direct Link 🔗
        </button>
      </div>
    </div>
  );
}
