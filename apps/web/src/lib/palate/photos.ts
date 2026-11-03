import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const PHOTO_BUCKET = "meal-photos";
const MAX_SIDE = 1280;

/**
 * Shrink a photo before upload: longest side 1280px, JPEG at 80%. Phone photos drop from several
 * MB to a few hundred KB. Falls back to the original if the browser can't decode it.
 */
export async function compressPhoto(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

/** A short-lived URL for one of the user's own photos (the bucket is private). */
export function usePhotoUrl(path: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!path) return;
    let live = true;
    void supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUrl(path, 60 * 60)
      .then(({ data }) => {
        if (live) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      live = false;
    };
  }, [path]);
  return url;
}
