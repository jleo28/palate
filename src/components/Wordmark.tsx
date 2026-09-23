import { useEffect, useState } from "react";

interface WordmarkProps {
  size?: "large" | "default";
  className?: string;
}

const LOGO_PATH = "/brand/logo.svg";

/**
 * The logo is not ready yet. This checks once whether public/brand/logo.svg
 * exists; when it lands, dropping the file in is the only change needed.
 */
export function Wordmark({ size = "default", className = "" }: WordmarkProps) {
  const [hasLogo, setHasLogo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(LOGO_PATH, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setHasLogo(res.ok);
      })
      .catch(() => {
        if (!cancelled) setHasLogo(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const textSize = size === "large" ? "text-2xl" : "text-lg";

  if (hasLogo) {
    return <img src={LOGO_PATH} alt="8teSC" className={className} />;
  }

  return (
    <span className={`font-display font-bold text-ink ${textSize} ${className}`.trim()}>8teSC</span>
  );
}
