import "server-only";
import type { ReactElement } from "react";
import { Resend } from "resend";
import { render } from "@react-email/render";

let client: Resend | null = null;
function resend() {
  if (!process.env.RESEND_API_KEY) return null;
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

export const emailFrom = process.env.EMAIL_FROM ?? "Maya Lane Shop <onboarding@resend.dev>";

type SendArgs = { to: string; subject: string; react: ReactElement; replyTo?: string };

/**
 * Sends a transactional email through Resend.
 * Without RESEND_API_KEY (local dev), the email is rendered and logged instead, so every flow stays testable.
 * Never throws: email failures are logged and reported, they must not break checkout or webhooks.
 */
export async function sendEmail({ to, subject, react, replyTo }: SendArgs): Promise<{ ok: boolean; id?: string }> {
  const r = resend();
  try {
    if (!r) {
      const text = await render(react, { plainText: true });
      console.info(`\n✉️  [email:dev] To: ${to}\n   Subject: ${subject}\n${text.slice(0, 1500)}\n`);
      return { ok: true };
    }
    const { data, error } = await r.emails.send({ from: emailFrom, to, subject, react, replyTo });
    if (error) {
      console.error("[email] Resend error", error);
      return { ok: false };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false };
  }
}
