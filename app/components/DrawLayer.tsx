"use client";

import { useRef, useState } from "react";
import { useDrawing } from "../hooks/useDrawing";

interface DrawLayerProps {
  width: number;
  height: number;
}

const COLORS = ["#ffffff", "#ff4757", "#ffa502", "#2ed573", "#1e90ff", "#a29bfe", "#fd79a8"];

export default function DrawLayer({ width, height }: DrawLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { onPointerDown, onPointerMove, onPointerUp, clear } = useDrawing(canvasRef);
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(4);
  const [mode, setMode] = useState<"pen" | "eraser">("pen");
  const [showToolbar, setShowToolbar] = useState(true);

  const opts = { color, lineWidth, mode };

  return (
    <>
      {/* Drawing canvas (transparent, sits above video) */}
      <canvas
        ref={canvasRef}
        width={width || window.innerWidth}
        height={height || window.innerHeight}
        className="draw-layer"
        style={{ position: "absolute", inset: 0, zIndex: 10 }}
        onPointerDown={(e) => onPointerDown(e, opts)}
        onPointerMove={(e) => onPointerMove(e, opts)}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />

      {/* Floating toolbar */}
      {showToolbar && (
        <div
          className="glass"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 999,
          }}
        >
          {/* Pen / Eraser toggle */}
          <button
            title="Pen"
            onClick={() => setMode("pen")}
            style={{
              fontSize: 18,
              opacity: mode === "pen" ? 1 : 0.4,
              transition: "opacity 0.2s",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✏️
          </button>
          <button
            title="Eraser"
            onClick={() => setMode("eraser")}
            style={{
              fontSize: 18,
              opacity: mode === "eraser" ? 1 : 0.4,
              transition: "opacity 0.2s",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            🧽
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />

          {/* Color swatches */}
          {COLORS.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => { setColor(c); setMode("pen"); }}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: c,
                border: color === c && mode === "pen" ? "2px solid #fff" : "2px solid transparent",
                cursor: "pointer",
                transition: "border 0.15s",
                flexShrink: 0,
              }}
            />
          ))}

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />

          {/* Stroke width */}
          <input
            type="range"
            min={2}
            max={24}
            step={1}
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            style={{ width: 64 }}
          />

          {/* Clear */}
          <button
            title="Clear drawings"
            onClick={clear}
            style={{
              fontSize: 16,
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: 0.7,
            }}
          >
            🗑️
          </button>
        </div>
      )}

      {/* Toggle toolbar */}
      <button
        onClick={() => setShowToolbar((v) => !v)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 16,
          zIndex: 21,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(12px)",
        }}
      >
        {showToolbar ? "✕" : "✏️"}
      </button>
    </>
  );
}
