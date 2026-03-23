"use client";
import { useState, useCallback } from "react";

export interface OverlayState {
  src: string | null;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  showGrid: boolean;
  gridSize: number;
}

const DEFAULT: OverlayState = {
  src: null,
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  opacity: 0.5,
  locked: false,
  showGrid: false,
  gridSize: 50,
};

export type OverlayPatch = Partial<OverlayState> | ((prev: OverlayState) => Partial<OverlayState>);

export function useOverlay() {
  const [overlay, setOverlay] = useState<OverlayState>(DEFAULT);

  const update = useCallback((patch: OverlayPatch) => {
    setOverlay((prev) => {
      const p = typeof patch === "function" ? patch(prev) : patch;
      return { ...prev, ...p };
    });
  }, []);

  const reset = useCallback(() => setOverlay((prev) => ({ ...DEFAULT, src: prev.src })), []);

  return { overlay, update, reset };
}
