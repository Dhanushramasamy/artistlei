"use client";

import type { OverlayState } from "../hooks/useOverlay";

interface ControlPanelProps {
  overlay: OverlayState;
  onUpdate: (patch: Partial<OverlayState>) => void;
  onReset: () => void;
  onImageUpload: (src: string) => void;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, display, onChange }: SliderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/60 font-medium">{label}</span>
        <span className="text-xs text-white/80 font-mono tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export default function ControlPanel({ overlay, onUpdate, onReset, onImageUpload }: ControlPanelProps) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onImageUpload(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div
      className="glass control-panel flex flex-col"
      style={{
        position: "absolute",
        right: "clamp(8px, 2vw, 24px)",
        bottom: "clamp(8px, 2vw, 24px)",
        maxHeight: "calc(100dvh - 100px)",
        overflowY: "auto",
        zIndex: 40,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="gradient-text font-bold text-sm">Overlay Controls</span>
        <button
          onClick={onReset}
          className="text-xs text-white/40 hover:text-white/80 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
        >
          Reset
        </button>
      </div>

      {/* Upload */}
      <label className="block w-full mb-4 cursor-pointer">
        <div
          className="btn-glow w-full py-2.5 text-center rounded-xl text-sm font-semibold transition-all"
          style={{
            background: overlay.src
              ? "rgba(16,185,129,0.15)"
              : "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(6,182,212,0.3))",
            border: overlay.src
              ? "1px solid rgba(16,185,129,0.4)"
              : "1px solid rgba(124,58,237,0.4)",
            color: overlay.src ? "#10b981" : "#a78bfa",
          }}
        >
          {overlay.src ? "✓ Image Loaded" : "⊕ Upload Image"}
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleFile}
        />
      </label>

      {/* Sliders */}
      <div className="flex flex-col gap-4">
        <Slider
          label="Opacity"
          value={overlay.opacity}
          min={0} max={1} step={0.01}
          display={`${Math.round(overlay.opacity * 100)}%`}
          onChange={(v) => onUpdate({ opacity: v })}
        />
        <Slider
          label="Scale"
          value={overlay.scale}
          min={0.05} max={5} step={0.01}
          display={`${Math.round(overlay.scale * 100)}%`}
          onChange={(v) => onUpdate({ scale: v })}
        />
        <Slider
          label="Position X"
          value={overlay.x}
          min={-2000} max={2000} step={1}
          display={`${Math.round(overlay.x)}px`}
          onChange={(v) => onUpdate({ x: v })}
        />
        <Slider
          label="Position Y"
          value={overlay.y}
          min={-2000} max={2000} step={1}
          display={`${Math.round(overlay.y)}px`}
          onChange={(v) => onUpdate({ y: v })}
        />
        <Slider
          label="Rotation"
          value={overlay.rotation}
          min={0} max={360} step={1}
          display={`${overlay.rotation}°`}
          onChange={(v) => onUpdate({ rotation: v })}
        />
        
        {overlay.src && (
          <div className="text-xs text-center text-white/50 bg-white/5 py-2 rounded-lg mt-2">
            🖐️ Drag to move • Scroll to scale • Shift+Scroll to rotate
          </div>
        )}
      </div>

      {/* Lock toggle */}
      <button
        onClick={() => onUpdate({ locked: !overlay.locked })}
        className="mt-5 w-full py-2 rounded-xl text-sm font-semibold transition-all"
        style={{
          background: overlay.locked
            ? "rgba(239,68,68,0.15)"
            : "rgba(255,255,255,0.06)",
          border: overlay.locked
            ? "1px solid rgba(239,68,68,0.4)"
            : "1px solid rgba(255,255,255,0.08)",
          color: overlay.locked ? "#f87171" : "#fff",
        }}
      >
        {overlay.locked ? "🔒 Locked" : "🔓 Unlocked"}
      </button>
    </div>
  );
}
