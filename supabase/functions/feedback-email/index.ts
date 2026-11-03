// Emails each new feedback row via Resend. Triggered by a database webhook on
// public.feedback INSERT (see README → Feedback emails).
//
// Secrets (set with `supabase secrets set`, never committed):
//   RESEND_API_KEY      Resend API key
//   FEEDBACK_TO         recipient address
//   FEEDBACK_FROM       optional sender, defaults to Resend's onboarding address
//   WEBHOOK_SECRET      shared secret sent by the webhook in the x-webhook-secret header

interface FeedbackRow {
  id: string;
  user_id: string;
  message: string;
  reply_email: string | null;
  page: string | null;
  created_at: string;
}

const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

Deno.serve(async (req) => {
  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (!secret || req.headers.get("x-webhook-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = (await req.json()) as { type: string; table: string; record: FeedbackRow };
  if (payload.type !== "INSERT" || payload.table !== "feedback") {
    return new Response("Ignored", { status: 200 });
  }
  const row = payload.record;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("FEEDBACK_FROM") ?? "Palate <onboarding@resend.dev>",
      to: [Deno.env.get("FEEDBACK_TO")],
      reply_to: row.reply_email ?? undefined,
      subject: `Palate feedback from ${row.reply_email ?? "a user"}`,
      html: `<p>${escape(row.message).replace(/\n/g, "<br>")}</p>
<hr><p>From: ${escape(row.reply_email ?? "unknown")}<br>
Page: ${escape(row.page ?? "-")}<br>
Sent: ${escape(row.created_at)}</p>`,
    }),
  });

  if (!res.ok) {
    console.error("Resend failed", res.status, await res.text());
    return new Response("Email failed", { status: 502 });
  }
  return new Response("Sent", { status: 200 });
});
