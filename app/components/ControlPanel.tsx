"use client";

import { useState } from "react";
import type { OverlayState, OverlayPatch } from "../hooks/useOverlay";

interface ControlPanelProps {
  overlay: OverlayState;
  onUpdate: (patch: OverlayPatch) => void;
  onReset: () => void;
  onImageUpload: (src: string) => void;
}

interface SliderProps {
  label: string;
  icon: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

function Slider({ label, icon, value, min, max, step, display, onChange }: SliderProps) {
  return (
    <div className="flex flex-col gap-1.5 group/slider">
      <div className="flex justify-between items-center px-0.5">
        <label className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-white/40 group-hover/slider:text-white/70 transition-colors">
          <span className="text-xs opacity-80">{icon}</span>
          {label}
        </label>
        <span className="text-[10px] md:text-xs font-mono font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-md border border-secondary/10">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-primary h-4"
      />
    </div>
  );
}

export default function ControlPanel({ overlay, onUpdate, onReset, onImageUpload }: ControlPanelProps) {
  const [minimized, setMinimized] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onImageUpload(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="glass fixed right-4 bottom-4 w-12 h-12 rounded-2xl z-50 flex items-center justify-center text-xl shadow-2xl border-white/10 hover:bg-white/5 active:scale-95 transition-all"
        title="Open Controls"
      >
        🎛️
      </button>
    );
  }

  return (
    <div className="glass fixed right-4 bottom-4 w-[calc(100vw-32px)] sm:w-72 md:w-80 rounded-3xl p-4 md:p-6 z-50 flex flex-col gap-4 md:gap-6 shadow-2xl border-white/10 group overflow-y-auto max-h-[70vh] md:max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
          <h3 className="brand-font text-[10px] md:text-sm font-bold tracking-widest uppercase text-white/80">Controls</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/90 bg-white/5 hover:bg-white/10 px-2 py-1 md:px-3 md:py-1.5 rounded-full transition-all border border-white/5"
          >
            Reset
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="w-8 h-8 glass rounded-full flex items-center justify-center text-xs text-white/40 hover:text-white/80 border-white/5"
            title="Minimize"
          >
            ▼
          </button>
        </div>
      </div>

      {/* Image Upload Area */}
      <div className="relative">
        <input
          type="file"
          id="imageInput"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <label
          htmlFor="imageInput"
          className={`
            relative flex flex-col items-center justify-center p-4 md:p-8 rounded-2xl border-2 border-dashed 
            transition-all cursor-pointer overflow-hidden group/upload
            ${overlay.src 
              ? 'border-secondary/30 bg-secondary/5 hover:border-secondary/50' 
              : 'border-white/10 bg-white/[0.02] hover:border-primary/50 hover:bg-primary/[0.02]'}
          `}
        >
          {overlay.src ? (
            <>
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl glass border-secondary/20 flex items-center justify-center text-base md:text-xl mb-2 md:mb-3 shadow-lg">
                ✅
              </div>
              <span className="text-[10px] md:text-xs font-bold text-secondary uppercase tracking-widest">Update Image</span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl glass border-white/10 flex items-center justify-center text-base md:text-xl mb-2 md:mb-3 shadow-lg group-hover/upload:scale-110 transition-transform">
                📸
              </div>
              <span className="text-[10px] md:text-xs font-bold text-white/60 uppercase tracking-widest group-hover/upload:text-primary transition-colors">Select Reference</span>
            </>
          )}
        </label>
      </div>

      {/* Control Stack */}
      <div className="flex flex-col gap-4 md:gap-6">
        <Slider
          icon="🌗"
          label="Opacity"
          value={overlay.opacity}
          min={0} max={1} step={0.01}
          display={`${Math.round(overlay.opacity * 100)}%`}
          onChange={(v) => onUpdate({ opacity: v })}
        />
        <Slider
          icon="🔍"
          label="Scale"
          value={overlay.scale}
          min={0.05} max={5} step={0.01}
          display={`${Math.round(overlay.scale * 100)}%`}
          onChange={(v) => onUpdate({ scale: v })}
        />
        
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Slider
            icon="↔️"
            label="X"
            value={overlay.x}
            min={-2000} max={2000} step={1}
            display={`${Math.round(overlay.x)}`}
            onChange={(v) => onUpdate({ x: v })}
          />
          <Slider
            icon="↕️"
            label="Y"
            value={overlay.y}
            min={-2000} max={2000} step={1}
            display={`${Math.round(overlay.y)}`}
            onChange={(v) => onUpdate({ y: v })}
          />
        </div>

        <Slider
          icon="🔄"
          label="Rotation"
          value={overlay.rotation}
          min={0} max={360} step={1}
          display={`${overlay.rotation}°`}
          onChange={(v) => onUpdate({ rotation: v })}
        />

        {/* Grid Controls */}
        <div className="flex flex-col gap-3 md:gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-white/40">
                    <span className="text-xs md:text-sm opacity-80">📏</span>
                    Grid
                </label>
                <button 
                    onClick={() => onUpdate({ showGrid: !overlay.showGrid })}
                    className={`
                        w-10 h-5 md:w-12 md:h-6 rounded-full transition-all relative
                        ${overlay.showGrid ? 'bg-primary' : 'bg-white/10'}
                    `}
                >
                    <div className={`
                        absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all
                        ${overlay.showGrid ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'}
                    `} />
                </button>
            </div>
            {overlay.showGrid && (
                <Slider
                    icon="⊞"
                    label="Size"
                    value={overlay.gridSize}
                    min={20} max={200} step={1}
                    display={`${overlay.gridSize}`}
                    onChange={(v) => onUpdate({ gridSize: v })}
                />
            )}
        </div>
      </div>

      {/* State Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        <button
          onClick={() => onUpdate({ locked: !overlay.locked })}
          className={`
            w-full py-3 md:py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all 
            ${overlay.locked 
              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}
          `}
        >
          {overlay.locked ? '🔒 Unlock UI' : '🔓 Lock UI'}
        </button>
      </div>
    </div>
  );
}
