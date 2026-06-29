import React, { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

/**
 * ImageCropModal
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   imageSrc: string  (object URL of the selected file)
 *   aspect: number    (e.g. 1 for square, 4/3, etc.) — default 1
 *   onCrop: (blob: Blob) => void
 *   shape: "circle" | "square" — default "square"
 */
export default function ImageCropModal({ open, onClose, imageSrc, aspect = 1, onCrop, shape = "square" }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);

  // Crop box size in display pixels
  const CROP_SIZE = 280;
  const CANVAS_SIZE = 400; // output resolution

  const resetState = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setReady(false);
  }, []);

  useEffect(() => {
    if (open) resetState();
  }, [open, imageSrc]);

  const onImgLoad = (e) => {
    setImgNatural({ w: e.target.naturalWidth, h: e.target.naturalHeight });
    setReady(true);
  };

  // Compute the display scale so the image fits the preview area (300x300 container)
  const PREVIEW = 300;
  const getBaseScale = () => {
    if (!imgNatural.w) return 1;
    const scaleW = PREVIEW / imgNatural.w;
    const scaleH = PREVIEW / imgNatural.h;
    return Math.max(scaleW, scaleH); // cover
  };

  const displayW = () => imgNatural.w * getBaseScale() * zoom;
  const displayH = () => imgNatural.h * getBaseScale() * zoom;

  const clampOffset = (ox, oy, dw, dh) => {
    const maxX = Math.max(0, (dw - CROP_SIZE) / 2);
    const maxY = Math.max(0, (dh - CROP_SIZE) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, ox)),
      y: Math.min(maxY, Math.max(-maxY, oy)),
    };
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    const rawX = e.clientX - dragStart.x;
    const rawY = e.clientY - dragStart.y;
    setOffset(clampOffset(rawX, rawY, displayW(), displayH()));
  };
  const handleMouseUp = () => setDragging(false);

  // Touch support
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };
  const handleTouchMove = (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    const rawX = t.clientX - dragStart.x;
    const rawY = t.clientY - dragStart.y;
    setOffset(clampOffset(rawX, rawY, displayW(), displayH()));
  };

  const handleZoom = (delta) => {
    setZoom((prev) => {
      const next = Math.min(4, Math.max(1, prev + delta));
      return next;
    });
    // re-clamp after zoom
    setOffset((o) => clampOffset(o.x, o.y, displayW(), displayH()));
  };

  const handleCrop = () => {
    if (!imgRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext("2d");

    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    const baseScale = getBaseScale();
    const totalScale = baseScale * zoom;
    // Top-left of image in display coords (centered + offset)
    const imgLeft = (PREVIEW - displayW()) / 2 + offset.x;
    const imgTop = (PREVIEW - displayH()) / 2 + offset.y;
    // Crop box in display coords
    const cropLeft = (PREVIEW - CROP_SIZE) / 2;
    const cropTop = (PREVIEW - CROP_SIZE) / 2;
    // In image natural coords
    const srcX = (cropLeft - imgLeft) / totalScale;
    const srcY = (cropTop - imgTop) / totalScale;
    const srcSize = CROP_SIZE / totalScale;

    ctx.drawImage(imgRef.current, srcX, srcY, srcSize, srcSize, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    canvas.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, "image/jpeg", 0.92);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle>Crop Photo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Preview container */}
          <div
            className="relative overflow-hidden bg-muted/40 rounded-xl cursor-grab active:cursor-grabbing select-none"
            style={{ width: PREVIEW, height: PREVIEW }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setDragging(false)}
          >
            {imageSrc && (
              <img
                ref={imgRef}
                src={imageSrc}
                onLoad={onImgLoad}
                draggable={false}
                alt="crop preview"
                style={{
                  position: "absolute",
                  width: ready ? displayW() : "100%",
                  height: ready ? displayH() : "100%",
                  left: ready ? `calc(50% + ${offset.x}px - ${displayW() / 2}px)` : 0,
                  top: ready ? `calc(50% + ${offset.y}px - ${displayH() / 2}px)` : 0,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Overlay mask with crop hole */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.45)" }} />
            <div
              className="absolute pointer-events-none border-2 border-primary"
              style={{
                width: CROP_SIZE,
                height: CROP_SIZE,
                left: (PREVIEW - CROP_SIZE) / 2,
                top: (PREVIEW - CROP_SIZE) / 2,
                borderRadius: shape === "circle" ? "50%" : 12,
                boxShadow: `0 0 0 1000px rgba(0,0,0,0.45)`,
              }}
            />

            {/* Grid lines inside crop box */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: CROP_SIZE,
                height: CROP_SIZE,
                left: (PREVIEW - CROP_SIZE) / 2,
                top: (PREVIEW - CROP_SIZE) / 2,
                borderRadius: shape === "circle" ? "50%" : 12,
                overflow: "hidden",
              }}
            >
              <div className="w-full h-full" style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: `${CROP_SIZE / 3}px ${CROP_SIZE / 3}px`,
              }} />
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="icon" onClick={() => handleZoom(-0.2)} disabled={zoom <= 1}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-14 text-center">{Math.round(zoom * 100)}%</span>
            <Button type="button" variant="outline" size="icon" onClick={() => handleZoom(0.2)} disabled={zoom >= 4}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Drag to reposition · Zoom in/out to resize</p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCrop} disabled={!ready}>Apply Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}