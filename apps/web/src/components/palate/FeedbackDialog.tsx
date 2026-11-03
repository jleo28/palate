import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { authInput, primaryButton } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// TODO(email): the team inbox for the mailto fallback. Left blank until one is chosen; the
// fallback link only shows once this is set. Submissions are stored in public.feedback.
const FEEDBACK_EMAIL = "";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefills the optional reply address. */
  email?: string | undefined;
}

/** Feedback form for the My Palate tab. Saves to the feedback table. */
export function FeedbackDialog({ open, onOpenChange, email }: Props) {
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState(email ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Each time it opens: a fresh form, with the account email ready to use.
  useEffect(() => {
    if (!open) return;
    if (status === "sent") {
      setMessage("");
      setStatus("idle");
    }
    setReplyTo((r) => r || email || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    const { error } = await supabase.from("feedback").insert({
      message: message.trim(),
      reply_email: replyTo.trim() || null,
      page: "card",
    });
    if (error) {
      console.error(error);
      setStatus("error");
      return;
    }
    setStatus("sent");
  };

  const mailto = FEEDBACK_EMAIL
    ? `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent("Palate feedback")}&body=${encodeURIComponent(message)}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-5">
        {status === "sent" ? (
          <div className="py-4 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-olive text-primary-foreground">
              <Check className="size-6" aria-hidden />
            </span>
            <DialogTitle className="mt-3 font-display text-xl">Thanks for the note</DialogTitle>
            <DialogDescription className="mt-1">
              The team reads every message.
              {replyTo.trim() ? " We'll reply if we have a question." : ""}
            </DialogDescription>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={`mt-5 ${primaryButton}`}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={send}>
            <DialogHeader className="text-left">
              <DialogTitle className="font-display text-xl">Give feedback</DialogTitle>
              <DialogDescription>
                Ideas, bugs, a food we got wrong: tell us anything.
              </DialogDescription>
            </DialogHeader>
            <label className="mt-4 block text-sm font-bold">
              Your message
              <textarea
                required
                rows={5}
                maxLength={4000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${authInput} resize-none text-base`}
              />
            </label>
            <label className="mt-3 block text-sm font-bold">
              Reply email <span className="font-medium text-muted-foreground">(optional)</span>
              <input
                type="email"
                autoComplete="email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                className={`${authInput} text-base`}
              />
            </label>
            {status === "error" && (
              <p
                role="status"
                className="mt-3 rounded-xl bg-amber-soft px-3 py-2 text-sm font-semibold"
              >
                That didn't send. Check your connection and try again.
                {mailto && (
                  <>
                    {" "}
                    Or{" "}
                    <a href={mailto} className="font-bold text-olive underline">
                      email us instead
                    </a>
                    .
                  </>
                )}
              </p>
            )}
            <button
              type="submit"
              disabled={!message.trim() || status === "sending"}
              className={`mt-4 ${primaryButton}`}
            >
              {status === "sending" ? "Sending…" : "Send feedback"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
