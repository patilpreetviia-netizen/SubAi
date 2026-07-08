"use server";
import { createServerFn } from "@tanstack/react-start";
import Groq from "groq-sdk";

export const generateHook = createServerFn({ method: "POST" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload || typeof payload.transcript !== "string") {
      throw new Error("transcript is required");
    }
    return {
      transcript: payload.transcript,
      style: payload.style || "engaging",
    };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { ok: false, hook: null, error: "GROQ_API_KEY missing" };
    }

    const groq = new Groq({ apiKey });

    const prompt = `You are a social media hook expert. Given the following video transcript, rewrite the opening 30 seconds (the hook) to be more engaging, curiosity-driven, and retention-focused. Keep it under 3 short sentences. Output ONLY the hook text, no labels or quotes.

Transcript excerpt:
${data.transcript.slice(0, 1000)}

Style: ${data.style}`;

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-4-scout",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 120,
        temperature: 0.7,
      });

      const hook = completion.choices?.[0]?.message?.content?.trim() ?? "";
      return { ok: true, hook };
    } catch (e) {
      return { ok: false, hook: null, error: e.message };
    }
  });
