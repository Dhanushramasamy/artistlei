"use client";
import { useRef, useCallback } from "react";

export interface DrawOptions {
  color: string;
  lineWidth: number;
  mode: "pen" | "eraser";
}

export function useDrawing(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: PointerEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>, opts: DrawOptions) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);
      drawing.current = true;
      lastPos.current = getPos(e.nativeEvent, canvas);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(lastPos.current.x, lastPos.current.y, opts.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = opts.mode === "eraser" ? "rgba(0,0,0,0)" : opts.color;
      if (opts.mode === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      } else {
        ctx.fill();
      }
    },
    [canvasRef]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>, opts: DrawOptions) => {
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pos = getPos(e.nativeEvent, canvas);
      ctx.beginPath();
      ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = opts.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (opts.mode === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      lastPos.current = pos;
    },
    [canvasRef]
  );

  const onPointerUp = useCallback(() => {
    drawing.current = false;
    lastPos.current = null;
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  return { onPointerDown, onPointerMove, onPointerUp, clear };
}
