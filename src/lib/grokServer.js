import { createServerFn } from "@tanstack/react-start";
import Groq from "groq-sdk";
import { toFile } from "groq-sdk";

/**
 * Server-side Groq Vision analysis (llama-4-scout vision model).
 * Keeps the GROQ_API_KEY on the server — the client sends a base64 image.
 */
export const analyzeWithGrokServer = createServerFn({ method: "POST" })
  .validator((input) => {
    if (!input || typeof input.imageBase64 !== "string") {
      throw new Error("imageBase64 is required");
    }
    return {
      imageBase64: input.imageBase64,
      prompt: input.prompt || undefined,
    };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("GROQ_API_KEY not set — skipping vision analysis.");
      return { ok: false, description: null, reason: "GROQ_API_KEY missing" };
    }

    const groq = new Groq({ apiKey });
    const systemPrompt =
      data.prompt ??
      "You are a video content assistant. Describe the scene in this image in one short sentence. Focus on people, objects, and actions visible. Keep it under 20 words.";

    const completion = await groq.chat.completions.create({
      model: "llama-4-scout",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            { type: "image_url", image_url: { url: data.imageBase64 } },
          ],
        },
      ],
      max_tokens: 120,
      temperature: 0.4,
    });

    const description = completion.choices?.[0]?.message?.content?.trim() ?? "";
    return { ok: true, description };
  });

/**
 * Server-side Groq Whisper transcription using the official groq-sdk.
 * createServerFn serialises through JSON so we accept base64 from the client
 * and reconstruct the binary Buffer on the server before passing to the SDK.
 */
export const transcribeVideo = createServerFn({ method: "POST" })
  .validator((input) => {
    if (!input || typeof input.audioBase64 !== "string") {
      throw new Error("audioBase64 is required");
    }
    return {
      audioBase64: input.audioBase64,
      mimeType: input.mimeType || "audio/mp4",
      fileName: input.fileName || "audio.mp4",
    };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("GROQ_API_KEY not set — skipping transcription.");
      return { ok: false, subtitles: [], error: "GROQ_API_KEY missing in .env" };
    }

    const groq = new Groq({ apiKey });

    // Convert base64 back to a Buffer and wrap it in a File-like object for the SDK
    const buffer = Buffer.from(data.audioBase64, "base64");
    const audioFile = await toFile(buffer, data.fileName, { type: data.mimeType });

    console.log(`Sending to Groq Whisper: ${data.fileName} (${(buffer.length / 1024).toFixed(0)} KB)`);

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      temperature: 0,
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    console.log("Groq Whisper transcript preview:", transcription.text?.slice(0, 150));

    // Group words into caption lines of ~4 words each
    const subtitles = [];
    const words = transcription.words || [];

    if (words.length > 0) {
      let currentLine = [];
      let lineStart = 0;
      words.forEach((wordObj, i) => {
        if (currentLine.length === 0) lineStart = wordObj.start;
        currentLine.push(wordObj.word.trim());
        if (currentLine.length >= 4 || i === words.length - 1) {
          subtitles.push({
            id: crypto.randomUUID(),
            start: lineStart,
            end: wordObj.end,
            text: currentLine.join(" "),
          });
          currentLine = [];
        }
      });
    } else if (transcription.segments?.length > 0) {
      // Fallback: use segment-level timestamps
      transcription.segments.forEach((seg) => {
        subtitles.push({
          id: crypto.randomUUID(),
          start: seg.start,
          end: seg.end,
          text: seg.text.trim(),
        });
      });
    }

    return {
      ok: true,
      subtitles,
      rawText: transcription.text,
      wordCount: words.length,
    };
  });
