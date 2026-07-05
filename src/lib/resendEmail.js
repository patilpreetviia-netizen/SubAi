import { createServerFn } from "@tanstack/react-start";

/**
 * Server function that sends a welcome email via Resend.
 * Runs entirely on the server so the RESEND_API_KEY never reaches the browser.
 *
 * Usage (client-side):
 *   import { sendWelcomeEmail } from "../lib/resendEmail";
 *   await sendWelcomeEmail({ email: "user@example.com", name: "Aarav" });
 */
export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .validator((input) => {
    if (!input || typeof input.email !== "string") {
      throw new Error("email is required");
    }
    return { email: input.email, name: input.name || "there" };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn("RESEND_API_KEY not set — skipping welcome email.");
      return { ok: false, reason: "RESEND_API_KEY missing" };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "SubAI <onboarding@resend.dev>",
        to: [data.email],
        subject: "Welcome to SubAI 🎬",
        html: `
          <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #e4e4e7; background: #09090b; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 28px;">
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #facc15; box-shadow: 0 0 12px #facc15; margin-right: 8px; vertical-align: middle;"></span>
              <span style="font-weight: 800; font-size: 22px; vertical-align: middle;">SubAI</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 12px; text-align: center;">
              Hey ${data.name} 👋
            </h1>
            <p style="font-size: 15px; line-height: 1.6; color: #a1a1aa; text-align: center; margin: 0 0 28px;">
              Welcome to SubAI — the free, browser-native AI caption studio built for Indian creators.
              Upload a video, pick a style preset, and ship your reels with perfect Hinglish captions.
            </p>
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="https://subai.app/dashboard" style="display: inline-block; padding: 12px 32px; background: #facc15; color: #09090b; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none;">
                Open your studio →
              </a>
            </div>
            <p style="font-size: 12px; color: #52525b; text-align: center; margin: 0;">
              Powered by Groq, Supabase &amp; Grok Vision — 100% free-tier infra.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend API error:", res.status, body);
      return { ok: false, reason: body };
    }

    const result = await res.json();
    return { ok: true, id: result.id };
  });
