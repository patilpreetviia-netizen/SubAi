/**
 * Grok Vision AI helper — calls the xAI chat-completions endpoint
 * with an image (base64 data-URL) and returns a text description.
 *
 * ⚠️  This runs CLIENT-SIDE for simplicity during prototyping.
 *     In production you should proxy through a server route so the
 *     API key is never shipped to the browser.
 */

const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

/**
 * Analyze an image with Grok Vision and return a text description.
 *
 * @param {string} base64DataUrl  A data:image/…;base64,… string
 * @param {string} [prompt]       Custom instruction — defaults to scene description
 * @param {string} apiKey         The xAI API key
 * @returns {Promise<string>}     The model's text response
 */
export async function analyzeImageWithGrok(base64DataUrl, prompt, apiKey) {
  if (!apiKey) {
    throw new Error("GROK_API_KEY is required to use Grok Vision AI.");
  }

  const systemPrompt =
    prompt ??
    "You are a video content assistant. Describe the scene in this image in one short sentence. " +
      "Focus on people, objects, and actions visible. Keep it under 20 words.";

  const response = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-2-vision-latest",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            {
              type: "image_url",
              image_url: { url: base64DataUrl },
            },
          ],
        },
      ],
      max_tokens: 120,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Grok Vision API error (${response.status}): ${err}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

/**
 * Extract a frame from a <video> element as a base64 data URL.
 *
 * @param {HTMLVideoElement} video
 * @param {number} [timeSeconds=0]  Seek position
 * @returns {Promise<string>}       data:image/jpeg;base64,…
 */
export function extractVideoFrame(video, timeSeconds = 0) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");

    const onSeeked = () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
      video.removeEventListener("seeked", onSeeked);
    };

    video.addEventListener("seeked", onSeeked);
    video.currentTime = timeSeconds;

    // Timeout fallback
    setTimeout(() => reject(new Error("Frame extraction timed out")), 5000);
  });
}
