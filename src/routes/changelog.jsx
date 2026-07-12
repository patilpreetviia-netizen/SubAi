import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/changelog")({
  component: ChangelogPage,
});

const CHANGES = [
  {
    version: "1.2.0",
    date: "July 8, 2026",
    items: [
      "AI Hook Generator \u2014 rewrite your opening 30 seconds with one click",
      "Three scripts from one take \u2014 switch between Roman Hinglish, Native script, and English translation",
      "New pricing page with Indian pricing (\u20B99 first export, \u20B959 Week Pass)",
      "Razorpay payment integration for UPI, cards, and netbanking",
      "Watermark system for free tier exports",
      "NLE plugin support page for Premiere Pro, After Effects, and DaVinci Resolve",
      "Templates gallery page",
    ],
  },
  {
    version: "1.1.0",
    date: "June 15, 2026",
    items: [
      "Word-level timeline editing \u2014 drag and retime individual words",
      "Remotion-based live preview with video background",
      "SRT and WebM video export",
      "Undo/Redo history stack",
      "AI Cleanup for Hinglish normalization",
    ],
  },
  {
    version: "1.0.0",
    date: "May 20, 2026",
    items: [
      "Initial release",
      "Groq Whisper transcription with word-level timestamps",
      "Groq Vision AI scene analysis",
      "6 caption style presets (Beast, Karaoke, Minimal, Hype, Clean, Glitch)",
      "Supabase auth with email/password",
      "Dashboard with drag-and-drop video upload",
      "Hinglish, Hindi, English support",
    ],
  },
];

function ChangelogPage() {
  return (
    <Layout>
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] font-black tracking-tight leading-[1.06] mb-3">
            Changelog
          </h1>
          <p className="text-[#9CA3AF] mb-12">Every update to SubAI, in one place.</p>

          <div className="space-y-10">
            {CHANGES.map((release) => (
              <div key={release.version} className="border-l-2 border-[#D97736]/30 pl-6 relative">
                <div className="absolute left-0 top-0 -translate-x-[5px] w-2 h-2 rounded-full bg-[#D97736]" />
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg font-bold text-white">v{release.version}</span>
                  <span className="text-xs text-[#4B5563]">{release.date}</span>
                </div>
                <ul className="space-y-2">
                  {release.items.map((item, i) => (
                    <li key={i} className="text-sm text-[#D1D5DB] flex items-start gap-2">
                      <svg
                        className="w-3.5 h-3.5 text-[#D97736] mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
