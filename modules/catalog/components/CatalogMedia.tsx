"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Crop, ImagePlus, LoaderCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageCropModal } from "@/components/media/ImageCropModal";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { mediaUrl } from "../catalog.utils";

export function CatalogMedia({ url, name, kind, onUpload }: { url?: string | null; name: string; kind: "category" | "brand"; onUpload: (file: File) => Promise<unknown> }) {
  const input = useRef<HTMLInputElement>(null); const lock = useRef(false);
  const [cropFile, setCropFile] = useState<File>(); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(""); const [message, setMessage] = useState("");
  const src = mediaUrl(url);
  function choose(file: File) {
    setMessage(""); setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || !file.size || file.size > 20 * 1024 * 1024) {
      setError("Choose a JPG, PNG or WebP image up to 20 MB."); return;
    }
    setCropFile(file);
  }
  async function editCurrent() {
    if (lock.current) return; lock.current = true; setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(src, { credentials: "omit" });
      if (!response.ok) throw new Error("Could not load the current image. You can replace it with a new file.");
      const blob = await response.blob();
      choose(new File([blob], `${name}.${blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg"}`, { type: blob.type }));
    } catch (error) { setError(error instanceof Error ? error.message : "Could not load the image. Choose a replacement file."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="space-y-3 rounded-xl border bg-muted/15 p-4">
    <p className="text-sm font-medium">Image / logo</p>
    <div className="flex flex-wrap items-center gap-4"><div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-background">{src ? <Image unoptimized src={src} alt={name} fill sizes="80px" className="object-contain p-2"/> : <ImagePlus className="size-6 text-muted-foreground/40"/>}</div>
      <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={busy || Boolean(cropFile)} onClick={() => input.current?.click()}><Upload/>{src ? "Replace image" : "Upload image"}</Button>{src && <Button type="button" variant="outline" disabled={busy || Boolean(cropFile)} onClick={() => void editCurrent()}>{busy ? <LoaderCircle className="animate-spin"/> : <Crop/>}Crop current image</Button>}</div>
      <input ref={input} aria-label={`Upload image for ${name}`} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) choose(file); }}/>
    </div>
    <p className="text-xs text-muted-foreground">Choose an image, adjust the crop, then confirm to upload. Image changes save immediately.</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
    {cropFile && <ImageCropModal file={cropFile} title={name} kind={kind} onCancel={() => setCropFile(undefined)} onConfirm={async file => {
      setError("");
      try { await onUpload(file); setCropFile(undefined); setMessage("Image saved."); }
      catch (error) { const message = getApiErrorMessage(error, "Image upload failed. Please try again."); setError(message); throw new Error(message); }
    }}/ >}
  </div>;
}
