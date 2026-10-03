"use client";

import { useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { cropImage, IMAGE_PRESETS, type ImageKind } from "./image-crop";

/** Mount with a new key for each file. Cancel never uploads the original file. */
export function ImageCropModal({ file, title, kind, aspect = 1, onConfirm, onCancel }: { file: File; title?: string; kind?: ImageKind; aspect?: number; onConfirm: (file: File) => Promise<void> | void; onCancel: () => void }) {
  const output = kind ? IMAGE_PRESETS[kind] : undefined;
  const [source, setSource] = useState(""); const [crop, setCrop] = useState({ x: 0, y: 0 }); const [zoom, setZoom] = useState(1);
  const [ratio, setRatio] = useState(aspect); const [area, setArea] = useState<Area>(); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const lock = useRef(false);
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setSource(String(reader.result));
    reader.onerror = () => setError("Could not read this image. Choose another file.");
    reader.readAsDataURL(file);
    return () => { reader.onload = null; reader.onerror = null; if (reader.readyState === FileReader.LOADING) reader.abort(); };
  }, [file]);
  async function confirm() {
    if (!area || lock.current) return; lock.current = true; setBusy(true); setError("");
    try { await onConfirm(await cropImage(source, area, file.name, title, output)); }
    catch (error) { setError(error instanceof Error ? error.message : "Image upload failed. Please try again."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy) onCancel(); }}><DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-2xl data-open:zoom-in-100 data-closed:zoom-out-100" showCloseButton={!busy}>
    <DialogHeader><DialogTitle>Crop image</DialogTitle><DialogDescription>Drag to reposition and adjust zoom. Only the cropped area will be uploaded.</DialogDescription></DialogHeader>
    <div className="relative h-[min(45vh,380px)] overflow-hidden rounded-lg bg-zinc-950">{source && <Cropper image={source} crop={crop} zoom={zoom} aspect={output ? output.width / output.height : ratio} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setArea(pixels)} onMediaLoaded={() => setError("")} mediaProps={{ onError: () => setError("This image could not be decoded. Choose a JPG, PNG or WebP image.") }} cropperProps={{ "aria-label": "Image crop area" }}/>}</div>
    <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm">Zoom<input aria-label="Crop zoom" className="block w-full" type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))}/></label>{output ? <p className="text-sm">Output: {output.width} ? {output.height} px (fixed)</p> : <label className="space-y-2 text-sm">Aspect ratio<select aria-label="Crop aspect ratio" className="block h-9 w-full rounded border bg-background px-2" value={ratio} onChange={e => { setArea(undefined); setRatio(Number(e.target.value)); }}><option value={1}>Square · 1:1</option><option value={4 / 3}>Landscape · 4:3</option><option value={3 / 4}>Portrait · 3:4</option><option value={16 / 9}>Wide · 16:9</option></select></label>}</fieldset>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button variant="outline" disabled={busy} onClick={onCancel}>Cancel</Button><Button disabled={!area || busy} onClick={() => void confirm()}>{busy ? "Processing…" : "Use cropped image"}</Button></DialogFooter>
  </DialogContent></Dialog>;
}
