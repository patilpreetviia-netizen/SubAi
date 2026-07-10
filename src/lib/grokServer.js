"use server";
import { createServerFn } from "@tanstack/react-start";
import Groq from "groq-sdk";
import { toFile } from "groq-sdk";

const __fetch = globalThis.fetch;

/**
 * Server-side Groq Vision analysis (llama-4-scout vision model).
 * Keeps the GROQ_API_KEY on the server — the client sends a base64 image.
 */
export const analyzeWithGrokServer = createServerFn({ method: "POST" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload || typeof payload.imageBase64 !== "string") {
      throw new Error("imageBase64 is required");
    }
    return {
      imageBase64: payload.imageBase64,
      prompt: payload.prompt || undefined,
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
 * Server-side Groq Whisper transcription — downloads from a provided URL (e.g. signed URL)
 */
export const transcribeFromStorage = createServerFn({ method: "POST" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload || typeof payload.fileUrl !== "string") {
      throw new Error(`fileUrl is required. Input was: ${JSON.stringify(input)}`);
    }
    return {
      fileUrl: payload.fileUrl,
      fileName: payload.fileName || "audio.mp4",
      mimeType: payload.mimeType || "video/mp4",
    };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("GROQ_API_KEY not set — skipping transcription.");
      return { ok: false, subtitles: [], error: "GROQ_API_KEY missing in .env" };
    }

    console.log(`[transcribe] Downloading file from: ${data.fileUrl.substring(0, 50)}...`);

    const response = await __fetch(data.fileUrl);
    if (!response.ok) {
      return { ok: false, subtitles: [], error: `Failed to fetch file: ${response.status}` };
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const fileName = data.fileName || "audio.mp4";
    console.log(`[transcribe] Downloaded ${(buffer.length / 1024 / 1024).toFixed(1)} MB`);

    const groq = new Groq({ apiKey });
    const audioFile = await toFile(buffer, fileName, { type: data.mimeType || "audio/mp4" });
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      temperature: 0,
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    console.log("[transcribe] Whisper result:", transcription.text?.slice(0, 150));

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
            id: Math.random().toString(36).substring(2, 9),
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
          id: Math.random().toString(36).substring(2, 9),
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

/**
 * Legacy: Server-side Groq Whisper transcription via base64.
 * Kept as fallback but transcribeFromStorage is preferred.
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

    const buffer = Buffer.from(data.audioBase64, "base64");
    const audioFile = await toFile(buffer, data.fileName, { type: data.mimeType });

    console.log(
      `Sending to Groq Whisper: ${data.fileName} (${(buffer.length / 1024).toFixed(0)} KB)`,
    );

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      temperature: 0,
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    console.log("Groq Whisper transcript preview:", transcription.text?.slice(0, 150));

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
            id: Math.random().toString(36).substring(2, 9),
            start: lineStart,
            end: wordObj.end,
            text: currentLine.join(" "),
          });
          currentLine = [];
        }
      });
    } else if (transcription.segments?.length > 0) {
      transcription.segments.forEach((seg) => {
        subtitles.push({
          id: Math.random().toString(36).substring(2, 9),
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
