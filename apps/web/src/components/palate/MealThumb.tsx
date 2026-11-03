import { usePhotoUrl } from "@/lib/palate/photos";

/** A small square of a logged meal's photo. Renders nothing for meals without one. */
export function MealThumb({ path, alt }: { path: string | undefined; alt: string }) {
  const url = usePhotoUrl(path);
  if (!path) return null;
  return url ? (
    <img src={url} alt={alt} className="size-12 shrink-0 rounded-xl object-cover" loading="lazy" />
  ) : (
    <span className="size-12 shrink-0 rounded-xl bg-foreground/5" aria-hidden />
  );
}
