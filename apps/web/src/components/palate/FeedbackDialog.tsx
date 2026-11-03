import { useState } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { primaryButton, authInput } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type State = "editing" | "sending" | "sent" | "failed";

/** Sends a message to the team. Lands in public.feedback; a webhook emails it on insert. */
export function FeedbackDialog({
  open,
  onOpenChange,
  email,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string | undefined;
}) {
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("editing");

  const send = async () => {
    setState("sending");
    const { error } = await supabase.from("feedback").insert({
      message: message.trim(),
      reply_email: email ?? null,
      page: window.location.pathname,
    });
    if (error) {
      console.error(error);
      setState("failed");
      return;
    }
    setMessage("");
    setState("sent");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setState("editing");
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-5">
        {state === "sent" ? (
          <div className="py-4 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-olive text-primary-foreground">
              <Check className="size-6" aria-hidden />
            </span>
            <DialogTitle className="mt-3 text-lg font-extrabold">Thanks, we got it!</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              The team reads every message.
            </DialogDescription>
            <button className={`${primaryButton} mt-5`} onClick={() => onOpenChange(false)}>
              Done
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-extrabold">Give feedback</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Ideas, bugs, or anything on your mind. Want a 15-min interview? Say so here.
              </DialogDescription>
            </DialogHeader>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={4000}
              placeholder="What would make Palate better?"
              className={`${authInput} resize-none`}
            />
            {state === "failed" && (
              <p className="rounded-xl bg-foreground/5 px-3 py-2 text-xs font-semibold">
                That didn't send. Check your connection and try again.
              </p>
            )}
            <button
              className={primaryButton}
              disabled={!message.trim() || state === "sending"}
              onClick={() => void send()}
            >
              {state === "sending" ? "Sending…" : state === "failed" ? "Try again" : "Send"}
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
