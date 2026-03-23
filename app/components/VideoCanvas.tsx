"use client";

import { useRef, useEffect } from "react";
import type { OverlayState, OverlayPatch } from "../hooks/useOverlay";

interface VideoCanvasProps {
  stream: MediaStream | null;
  overlay: OverlayState;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  onOverlayUpdate: (patch: OverlayPatch) => void;
}

export default function VideoCanvas({ stream, overlay, onCanvasReady, onOverlayUpdate }: VideoCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayImgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const onCanvasReadyRef = useRef(onCanvasReady);
  const onOverlayUpdateRef = useRef(onOverlayUpdate);

  // Keep callback ref fresh
  useEffect(() => { onCanvasReadyRef.current = onCanvasReady; }, [onCanvasReady]);
  useEffect(() => { onOverlayUpdateRef.current = onOverlayUpdate; }, [onOverlayUpdate]);

  // Load overlay image whenever src changes
  useEffect(() => {
    if (!overlay.src) {
      overlayImgRef.current = null;
      return;
    }
    const img = new Image();
    img.src = overlay.src;
    img.onload = () => { overlayImgRef.current = img; };
  }, [overlay.src]);

  // Attach incoming stream to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  // Compositing loop
  const overlayRef = useRef(overlay);
  useEffect(() => { overlayRef.current = overlay; }, [overlay]);

  // Start an empty compositing loop immediately so that captureStream() can be used right away
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set a default size so captureStream() isn't capturing a 0x0 canvas
    if (canvas.width === 0) canvas.width = 1280;
    if (canvas.height === 0) canvas.height = 720;

    // Notify parent immediately that canvas is ready
    onCanvasReadyRef.current(canvas);

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx || !canvasRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const video = videoRef.current;
      
      // Match canvas size to video if playing
      if (video && video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
        if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw video if playing, otherwise leave transparent/black
      if (video && video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      const ov = overlayRef.current;
      const img = overlayImgRef.current;
      if (img && canvas.width > 0) {
        const imgW = img.naturalWidth * ov.scale;
        const imgH = img.naturalHeight * ov.scale;
        const cx = canvas.width / 2 + ov.x;
        const cy = canvas.height / 2 + ov.y;

        ctx.save();
        ctx.globalAlpha = ov.opacity;
        ctx.translate(cx, cy);
        ctx.rotate((ov.rotation * Math.PI) / 180);
        ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      // Draw Artist Grid if enabled
      if (ov.showGrid && canvas.width > 0) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        const size = ov.gridSize;
        for (let x = size; x < canvas.width; x += size) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = size; y < canvas.height; y += size) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    // Kick off
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Gesture Handles
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const pinchDist = useRef<number | null>(null);

  const getCanvasPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Translate screen coords to canvas internal coords
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (overlay.locked || !overlay.src) return;
    dragging.current = true;
    lastPos.current = getCanvasPos(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || overlay.locked || e.pointerType === "touch") return;
    const pos = getCanvasPos(e);
    const dx = pos.x - lastPos.current.x;
    const dy = pos.y - lastPos.current.y;
    onOverlayUpdateRef.current((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPos.current = pos;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (overlay.locked || !overlay.src) return;
    e.preventDefault();
    if (e.shiftKey) {
      // Rotate
      const dir = e.deltaY > 0 ? 1 : -1;
      onOverlayUpdateRef.current((prev) => ({ rotation: (prev.rotation + dir * 5) % 360 }));
    } else {
      // Scale
      const zoomOut = e.deltaY > 0;
      const factor = zoomOut ? 0.95 : 1.05;
      onOverlayUpdateRef.current((prev) => ({ scale: Math.max(0.05, Math.min(5, prev.scale * factor)) }));
    }
  };

  // Touch pinch-to-zoom & double drag
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1 && !overlay.locked) {
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchDist.current && !overlay.locked) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchDist.current;
      onOverlayUpdateRef.current((prev) => ({ scale: Math.max(0.05, Math.min(5, prev.scale * ratio)) }));
      pinchDist.current = dist;
    } else if (e.touches.length === 1 && dragging.current && !overlay.locked) {
       // Touch drag uses screen coords directly because it scales differently
       const canvas = canvasRef.current;
       if (!canvas) return;
       const rect = canvas.getBoundingClientRect();
       const scaleX = canvas.width / rect.width;
       const scaleY = canvas.height / rect.height;
       
       const cx = e.touches[0].clientX;
       const cy = e.touches[0].clientY;
       const dx = (cx - lastPos.current.x) * scaleX;
       const dy = (cy - lastPos.current.y) * scaleY;
       
       onOverlayUpdateRef.current((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
       lastPos.current = { x: cx, y: cy };
    }
  };

  const onTouchEnd = () => {
    dragging.current = false;
    pinchDist.current = null;
  };

  return (
    <>
      {/* Hidden video element receives the raw camera stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      />
      {/* Visible composited canvas preview for the static device operator */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain ${overlay.src && !overlay.locked ? "cursor-grab active:cursor-grabbing touch-none" : ""}`}
        style={{ background: "#000" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      />
    </>
  );
}
