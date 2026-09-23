import { useState } from "react";

interface WordmarkProps {
  size?: "large" | "default";
  className?: string;
}

const LOGO_PATH = "/brand/logo.png";

const SIZE_CLASS: Record<"large" | "default", string> = {
  large: "h-28 w-28",
  default: "h-10 w-10",
};

const TEXT_SIZE_CLASS: Record<"large" | "default", string> = {
  large: "text-2xl",
  default: "text-lg",
};

/**
 * Single place the product name is rendered. Shows the logo, and falls back to
 * the name set in the display face if the file is ever missing, so swapping the
 * artwork stays a one-file change.
 */
export function Wordmark({ size = "default", className = "" }: WordmarkProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`font-display font-bold text-ink ${TEXT_SIZE_CLASS[size]} ${className}`.trim()}>8teSC</span>
    );
  }

  return (
    <img
      src={LOGO_PATH}
      alt="8teSC"
      onError={() => setFailed(true)}
      className={`${SIZE_CLASS[size]} rounded-[22%] object-contain ${className}`.trim()}
    />
  );
}
