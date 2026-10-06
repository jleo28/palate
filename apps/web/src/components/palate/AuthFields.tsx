import { authInput } from "@/lib/auth";
import type { InputHTMLAttributes } from "react";

export function Field({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="label-caps text-muted-foreground">{label}</span>
      <input {...props} className={authInput} />
    </label>
  );
}
