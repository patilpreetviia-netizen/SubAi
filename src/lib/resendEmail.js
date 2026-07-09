import { createServerFn } from "@tanstack/react-start";

const RESEND_FROM = 'SubAI <onboarding@resend.dev>';

const rateLimitStore = {};

function checkRateLimit(identifier, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitStore[identifier]) {
    rateLimitStore[identifier] = [];
  }

  rateLimitStore[identifier] = rateLimitStore[identifier].filter(
    (timestamp) => timestamp > windowStart
  );

  if (rateLimitStore[identifier].length >= maxRequests) {
    const oldestRequest = rateLimitStore[identifier][0];
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
    return {
      success: false,
      remaining: 0,
      retryAfter,
      message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
    };
  }

  rateLimitStore[identifier].push(now);
  return {
    success: true,
    remaining: maxRequests - rateLimitStore[identifier].length,
    retryAfter: 0,
    message: 'Request allowed',
  };
}

async function postEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend API error:", res.status, body);
    return { ok: false, error: body };
  }

  const result = await res.json();
  return { ok: true, id: result.id };
}

function emailLayout({ children, previewText }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="color-scheme" content="dark" />
      ${previewText ? `<meta name="x-apple-disable-message-reformatting" /><meta name="description" content="${previewText}" />` : ''}
      <style>
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; }
          .email-padding { padding: 24px 16px !important; }
          .email-content { padding: 32px 20px !important; }
          .email-cta { padding: 14px 24px !important; font-size: 14px !important; }
        }
        @media (prefers-color-scheme: dark) {
          .email-body { background-color: #09090b !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090b;">
        <tr>
          <td align="center" style="padding: 40px 16px;">
            <table class="email-container" role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%;">
              <tr>
                <td style="padding: 0 0 24px; text-align: center;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                    <tr>
                      <td style="vertical-align: middle;">
                        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #facc15; box-shadow: 0 0 10px rgba(250, 204, 21, 0.5); margin-right: 8px; vertical-align: middle;"></span>
                      </td>
                      <td style="vertical-align: middle;">
                        <span style="font-weight: 800; font-size: 20px; color: #fafafa; letter-spacing: -0.3px;">SubAI</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="email-content" style="background: #121216; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06); padding: 40px 32px;">
                  ${children}
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 0 0; text-align: center;">
                  <p style="margin: 0 0 6px; font-size: 12px; color: #52525b;">
                    SubAI &mdash; Browser-native AI captions for Indian creators
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #3f3f46;">
                    Built on Groq &middot; Supabase &middot; TanStack
                  </p>
                  <p style="margin: 12px 0 0; font-size: 11px; color: #3f3f46;">
                    If you didn&rsquo;t request this email, you can safely ignore it.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function button(href, text, extra = '') {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
      <tr>
        <td style="border-radius: 8px; background: #f59e0b;" ${extra}>
          <a href="${href}" style="display: inline-block; padding: 12px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; color: #09090b; text-decoration: none; letter-spacing: -0.2px;">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload || typeof payload.email !== "string") {
      throw new Error("email is required");
    }
    return { email: payload.email, name: payload.name || "there" };
  })
  .handler(async ({ data }) => {
    const rateCheck = checkRateLimit(`welcome-${data.email}`);
    if (!rateCheck.success) {
      return { ok: false, reason: rateCheck.message };
    }

    const result = await postEmail({
      from: RESEND_FROM,
      to: [data.email],
      subject: "Welcome to SubAI \uD83C\uDFAC",
      html: emailLayout({
        previewText: "Start creating AI captions for your videos in minutes.",
        children: `
          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px; color: #fafafa; text-align: center;">
            Hey ${data.name}
          </h1>
          <p style="font-size: 14px; line-height: 1.7; color: #a1a1aa; text-align: center; margin: 0 0 28px;">
            Welcome to SubAI &mdash; the free, browser-native AI caption studio built for Indian creators. Upload a video, pick a style, and ship reels with perfect Hinglish captions.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            ${button('https://subai.app/dashboard', 'Open your studio')}
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="padding: 20px 0 0; border-top: 1px solid rgba(255,255,255,0.06);">
                <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
                  <tr>
                    <td style="width: 33.33%; padding: 8px; text-align: center; vertical-align: top;">
                      <p style="margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #facc15;">100%</p>
                      <p style="margin: 0; font-size: 11px; color: #71717a;">Free to use</p>
                    </td>
                    <td style="width: 33.33%; padding: 8px; text-align: center; vertical-align: top;">
                      <p style="margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #facc15;">5 min</p>
                      <p style="margin: 0; font-size: 11px; color: #71717a;">Avg. caption time</p>
                    </td>
                    <td style="width: 33.33%; padding: 8px; text-align: center; vertical-align: top;">
                      <p style="margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #facc15;">9 langs</p>
                      <p style="margin: 0; font-size: 11px; color: #71717a;">Supported</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #52525b; text-align: center; margin: 24px 0 0;">
            Powered by Groq Whisper, Supabase &amp; Grok Vision
          </p>
        `,
      }),
    });

    return result;
  });

export const sendTestEmail = createServerFn({ method: "POST" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload || typeof payload.email !== "string") {
      throw new Error("email is required");
    }
    return { email: payload.email, name: payload.name || "there" };
  })
  .handler(async ({ data }) => {
    const rateCheck = checkRateLimit(`test-${data.email}`, 3, 60000);
    if (!rateCheck.success) {
      return { success: false, message: rateCheck.message };
    }

    const result = await postEmail({
      from: RESEND_FROM,
      to: [data.email],
      subject: "Test Email \u2014 SubAI",
      html: emailLayout({
        previewText: "Your SubAI email integration is working correctly.",
        children: `
          <div style="text-align: center; margin-bottom: 8px;">
            <span style="display: inline-block; width: 40px; height: 40px; border-radius: 50%; background: rgba(250, 204, 21, 0.12); line-height: 40px; font-size: 20px;">&#10003;</span>
          </div>
          <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 6px; color: #fafafa; text-align: center;">
            All clear!
          </h1>
          <p style="font-size: 14px; line-height: 1.7; color: #a1a1aa; text-align: center; margin: 0 0 4px;">
            Hi ${data.name}, this is a test email from SubAI. Your email integration is working perfectly.
          </p>
          <p style="font-size: 12px; color: #52525b; text-align: center; margin: 20px 0 0;">
            Sent ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' })} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', timeZoneName: 'short' })}
          </p>
        `,
      }),
    });

    if (!result.ok) {
      return { success: false, message: result.error };
    }
    return { success: true, id: result.id, message: 'Test email sent!' };
  });

export const sendBudgetAlertEmail = createServerFn({ method: "POST" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload || typeof payload.email !== "string" || !payload.budgetData) {
      throw new Error("email and budgetData are required");
    }
    return { email: payload.email, name: payload.name || "there", budgetData: payload.budgetData };
  })
  .handler(async ({ data }) => {
    const rateCheck = checkRateLimit(`budget-${data.email}`, 3, 60000);
    if (!rateCheck.success) {
      return { success: false, message: rateCheck.message };
    }

    const { category, percentage, spent, limit } = data.budgetData;
    const isOverBudget = percentage >= 100;

    const result = await postEmail({
      from: RESEND_FROM,
      to: [data.email],
      subject: isOverBudget
        ? `\u26A0\uFE0F Budget exceeded: ${category}`
        : `\u26A0\uFE0F Budget alert: ${category} at ${percentage}%`,
      html: emailLayout({
        previewText: isOverBudget
          ? `Your ${category} budget has been exceeded.`
          : `Your ${category} budget is at ${percentage}%.`,
        children: `
          <div style="text-align: center; margin-bottom: 16px;">
            <span style="display: inline-block; width: 44px; height: 44px; border-radius: 50%; background: ${isOverBudget ? 'rgba(239, 68, 68, 0.12)' : 'rgba(250, 204, 21, 0.12)'}; line-height: 44px; font-size: 22px;">${isOverBudget ? '!' : '\u26A0'}</span>
          </div>
          <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #fafafa; text-align: center;">
            ${isOverBudget ? 'Budget exceeded' : 'Budget limit approaching'}
          </h1>
          <p style="font-size: 13px; color: #71717a; text-align: center; margin: 0 0 24px;">${category}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 2px; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Spent</p>
                <p style="margin: 0; font-size: 22px; font-weight: 800; color: ${isOverBudget ? '#ef4444' : '#f59e0b'};">Rs.${spent.toLocaleString('en-IN')}</p>
              </td>
              <td style="width: 8px;"></td>
              <td style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 2px; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Limit</p>
                <p style="margin: 0; font-size: 22px; font-weight: 800; color: #fafafa;">Rs.${limit.toLocaleString('en-IN')}</p>
              </td>
              <td style="width: 8px;"></td>
              <td style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 2px; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Usage</p>
                <p style="margin: 0; font-size: 22px; font-weight: 800; color: #fafafa;">${Math.min(percentage, 100)}%</p>
              </td>
            </tr>
          </table>
          <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; margin-bottom: 24px; overflow: hidden;">
            <div style="width: ${Math.min(percentage, 100)}%; height: 100%; background: ${isOverBudget ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #22c55e, #f59e0b)'}; border-radius: 3px;"></div>
          </div>
          <div style="background: ${isOverBudget ? 'rgba(239, 68, 68, 0.08)' : 'rgba(250, 204, 21, 0.08)'}; border: 1px solid ${isOverBudget ? 'rgba(239, 68, 68, 0.2)' : 'rgba(250, 204, 21, 0.2)'}; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: ${isOverBudget ? '#fca5a5' : '#fde68a'};">
              ${isOverBudget
                ? `You've spent <strong>Rs.${spent.toLocaleString('en-IN')}</strong> — Rs.${(spent - limit).toLocaleString('en-IN')} over your <strong>${category}</strong> budget.`
                : `You've used <strong>${percentage}%</strong> of your <strong>${category}</strong> budget (Rs.${spent.toLocaleString('en-IN')} of Rs.${limit.toLocaleString('en-IN')}).`
              }
            </p>
          </div>
        `,
      }),
    });

    if (!result.ok) {
      return { success: false, message: result.error };
    }
    return { success: true, id: result.id, message: 'Budget alert sent!' };
  });
