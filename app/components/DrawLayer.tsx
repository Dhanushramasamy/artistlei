"use client";

import { useRef, useState } from "react";
import { useDrawing } from "../hooks/useDrawing";

interface DrawLayerProps {
  width?: number;
  height?: number;
}

const COLORS = [
  { hex: "#ffffff", label: "Pure White" },
  { hex: "#ef4444", label: "Ruby Red" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#10b981", label: "Emerald" },
  { hex: "#06b6d4", label: "Cyan" },
  { hex: "#7c3aed", label: "Violet" },
  { hex: "#ec4899", label: "Pink" }
];

export default function DrawLayer({ width, height }: DrawLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { onPointerDown, onPointerMove, onPointerUp, clear } = useDrawing(canvasRef);
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(4);
  const [mode, setMode] = useState<"pen" | "eraser">("pen");
  const [showToolbar, setShowToolbar] = useState(true);

  const opts = { color, lineWidth, mode };

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Drawing canvas */}
      <canvas
        ref={canvasRef}
        width={width || (typeof window !== 'undefined' ? window.innerWidth : 1920)}
        height={height || (typeof window !== 'undefined' ? window.innerHeight : 1080)}
        className="draw-layer pointer-events-auto"
        onPointerDown={(e) => onPointerDown(e, opts)}
        onPointerMove={(e) => onPointerMove(e, opts)}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />

      {/* Premium Draw Toolbar */}
      {showToolbar && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-6 py-4 rounded-[32px] glass shadow-2xl border-white/10 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Tool Modes */}
          <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setMode("pen")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mode === "pen" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:bg-white/5'}`}
            >
              ✏️
            </button>
            <button
              onClick={() => setMode("eraser")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mode === "eraser" ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:bg-white/5'}`}
            >
              🧽
            </button>
          </div>

          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Color Pallette */}
          <div className="flex items-center gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => { setColor(c.hex); setMode("pen"); }}
                className={`w-6 h-6 rounded-full transition-all hover:scale-125 ${color === c.hex && mode === "pen" ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : ''}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Size Slider */}
          <div className="flex items-center gap-3 w-32">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Size</span>
            <input
              type="range"
              min={2}
              max={40}
              step={1}
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="accent-primary"
            />
          </div>

          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Actions */}
          <button
            onClick={clear}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Clear All"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Toolbar Visibility Toggle */}
      <button
        onClick={() => setShowToolbar((v) => !v)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl flex items-center justify-center glass border-white/10 text-xl text-white/60 hover:text-white hover:bg-white/5 transition-all pointer-events-auto shadow-2xl group"
      >
        <div className={`transition-transform duration-300 ${showToolbar ? 'rotate-90' : 'rotate-0'}`}>
            {showToolbar ? "✕" : "✏️"}
        </div>
      </button>
    </div>
  );
}
