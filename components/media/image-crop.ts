import type { Area } from "react-easy-crop";

export const IMAGE_PRESETS = {
  product: { width: 1200, height: 1200 },
  category: { width: 600, height: 600 },
  brand: { width: 400, height: 400 },
} as const;
export type ImageKind = keyof typeof IMAGE_PRESETS;

export function imageFilename(original: string, title?: string, extension = "webp", timestamp = Date.now()): string {
  const clean = (value: string) => value.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/, "");
  const base = clean(title?.trim() ?? "") || clean(original.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, "")) || "image";
  return `${base}-${timestamp}.${extension}`;
}

export async function cropImage(source: string, area: Area, original: string, title?: string, output?: { width: number; height: number }): Promise<File> {
  const image = new Image(); image.src = source; await image.decode();
  const scale = Math.min(1, 2000 / Math.max(area.width, area.height));
  const canvas = document.createElement("canvas");
  canvas.width = output?.width ?? Math.max(1, Math.round(area.width * scale));
  canvas.height = output?.height ?? Math.max(1, Math.round(area.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image cropping is unavailable in this browser.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Could not create the cropped image.")), "image/webp", 0.9));
  return new File([blob], imageFilename(original, title, blob.type === "image/webp" ? "webp" : "png"), { type: blob.type });
}
