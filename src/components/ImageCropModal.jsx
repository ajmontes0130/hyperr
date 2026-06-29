import React, { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

/**
 * Clean, correct crop modal.
 * State: zoom (scale multiplier) + pan (offset of image center from preview center, in display px).
 * The crop box is always centered in the preview. We pan the image underneath it.
 */
const PREVIEW = 300;   // display size of the preview square
const CROP_SIZE = 260; // crop box size inside the preview
const OUTPUT = 600;    // output canvas resolution

export default function ImageCropModal({ open, onClose, imageSrc, onCrop, shape = "square" }) {
  const imgRef = useRef(null);

  // natural image dimensions
  const [nat, setNat] = useState({ w: 0, h: 0 });
  // zoom: multiplier on top of the "fit" scale
  const [zoom, setZoom] = useState(1);
  // pan: how far the image center is offset from the preview center (display px)
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const dragRef = useRef(null); // { startX, startY, panX, panY }

  // ── helpers ──────────────────────────────────────────────────────────────────

  // Scale that makes the image cover the crop box at zoom=1
  const baseScale = useCallback(() => {
    if (!nat.w || !nat.h) return 1;
    return Math.max(CROP_SIZE / nat.w, CROP_SIZE / nat.h);
  }, [nat]);

  // Displayed image size at current zoom
  const dispSize = useCallback((z = zoom) => ({
    w: nat.w * baseScale() * z,
    h: nat.h * baseScale() * z,
  }), [nat, baseScale, zoom]);

  // Clamp pan so the crop box never shows outside the image
  const clampPan = useCallback((px, py, z = zoom) => {
    const { w, h } = dispSize(z);
    const maxX = Math.max(0, (w - CROP_SIZE) / 2);
    const maxY = Math.max(0, (h - CROP_SIZE) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, px)),
      y: Math.min(maxY, Math.max(-maxY, py)),
    };
  }, [dispSize, zoom]);

  // ── reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setNat({ w: 0, h: 0 });
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [open, imageSrc]);

  const onImgLoad = (e) => {
    setNat({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  };

  // ── zoom ──────────────────────────────────────────────────────────────────
  const applyZoom = (delta) => {
    setZoom((prev) => {
      const next = Math.min(5, Math.max(1, +(prev + delta).toFixed(2)));
      setPan((p) => clampPan(p.x, p.y, next));
      return next;
    });
  };

  // ── drag (mouse) ──────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan(clampPan(dragRef.current.panX + dx, dragRef.current.panY + dy));
  };
  const onMouseUp = () => { dragRef.current = null; };

  // ── drag (touch) ──────────────────────────────────────────────────────────
  const onTouchStart = (e) => {
    const t = e.touches[0];
    dragRef.current = { startX: t.clientX, startY: t.clientY, panX: pan.x, panY: pan.y };
  };
  const onTouchMove = (e) => {
    if (!dragRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dragRef.current.startX;
    const dy = t.clientY - dragRef.current.startY;
    setPan(clampPan(dragRef.current.panX + dx, dragRef.current.panY + dy));
  };
  const onTouchEnd = () => { dragRef.current = null; };

  // ── crop & export ─────────────────────────────────────────────────────────
  const handleCrop = () => {
    if (!imgRef.current || !nat.w) return;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");

    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // The image center in display coords is: preview_center + pan
    // preview center = PREVIEW/2
    // image top-left in display = (PREVIEW/2 + pan.x) - dispW/2
    const { w: dispW, h: dispH } = dispSize();
    const imgLeft = (PREVIEW / 2 + pan.x) - dispW / 2;
    const imgTop  = (PREVIEW / 2 + pan.y) - dispH / 2;

    // Crop box top-left in display coords (always centered)
    const cropLeft = (PREVIEW - CROP_SIZE) / 2;
    const cropTop  = (PREVIEW - CROP_SIZE) / 2;

    // Convert crop box to natural image coords
    const scaleX = nat.w / dispW;
    const scaleY = nat.h / dispH;

    const srcX = (cropLeft - imgLeft) * scaleX;
    const srcY = (cropTop  - imgTop)  * scaleY;
    const srcW = CROP_SIZE * scaleX;
    const srcH = CROP_SIZE * scaleY;

    ctx.drawImage(imgRef.current, srcX, srcY, srcW, srcH, 0, 0, OUTPUT, OUTPUT);

    canvas.toBlob((blob) => { if (blob) onCrop(blob); }, "image/jpeg", 0.92);
  };

  // ── image position style ──────────────────────────────────────────────────
  const { w: dw, h: dh } = dispSize();
  const imgStyle = nat.w ? {
    position: "absolute",
    width: dw,
    height: dh,
    left: (PREVIEW / 2 + pan.x) - dw / 2,
    top:  (PREVIEW / 2 + pan.y) - dh / 2,
    userSelect: "none",
    pointerEvents: "none",
  } : {
    position: "absolute", width: "100%", height: "100%", left: 0, top: 0,
    userSelect: "none", pointerEvents: "none",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle>Crop Photo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Preview */}
          <div
            className="relative bg-black rounded-xl cursor-grab active:cursor-grabbing select-none overflow-hidden"
            style={{ width: PREVIEW, height: PREVIEW }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {imageSrc && (
              <img ref={imgRef} src={imageSrc} onLoad={onImgLoad}
                draggable={false} alt="crop preview" style={imgStyle} />
            )}

            {/* Dark overlay with crop hole via box-shadow */}
            <div
              className="absolute pointer-events-none border-2 border-primary"
              style={{
                width: CROP_SIZE,
                height: CROP_SIZE,
                left: (PREVIEW - CROP_SIZE) / 2,
                top:  (PREVIEW - CROP_SIZE) / 2,
                borderRadius: shape === "circle" ? "50%" : 10,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
              }}
            />

            {/* Rule-of-thirds grid */}
            <div
              className="absolute pointer-events-none overflow-hidden"
              style={{
                width: CROP_SIZE, height: CROP_SIZE,
                left: (PREVIEW - CROP_SIZE) / 2,
                top:  (PREVIEW - CROP_SIZE) / 2,
                borderRadius: shape === "circle" ? "50%" : 10,
              }}
            >
              <div className="w-full h-full" style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
                backgroundSize: `${CROP_SIZE / 3}px ${CROP_SIZE / 3}px`,
              }} />
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="icon" onClick={() => applyZoom(-0.2)} disabled={zoom <= 1}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-14 text-center">{Math.round(zoom * 100)}%</span>
            <Button type="button" variant="outline" size="icon" onClick={() => applyZoom(0.2)} disabled={zoom >= 5}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Drag to reposition · Zoom in/out to resize</p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCrop} disabled={!nat.w}>Apply Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}