export const authInput =
  "mt-1 w-full rounded-xl border border-foreground/20 bg-background px-3 py-2.5 font-medium outline-none focus:border-olive";

export const primaryButton =
  "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-base font-bold text-primary-foreground active:translate-y-px disabled:opacity-40";

/** Friendlier wording for the auth errors people actually hit. */
export function authMessage(error: { message: string }) {
  const m = error.message.toLowerCase();
  if (m.includes("invalid login"))
    return "That email and password don't match. Try again or reset your password.";
  if (m.includes("email not confirmed"))
    return "Confirm your email first. Check your inbox for the link.";
  if (m.includes("already registered"))
    return "There's already an account with that email. Sign in instead.";
  if (m.includes("rate limit"))
    return "Too many emails sent just now. Wait a few minutes and try again.";
  if (m.includes("password")) return "Use a password with at least 8 characters.";
  return error.message;
}
