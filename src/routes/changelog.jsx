import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/changelog")({
  ssr: false,
  component: ChangelogPage,
});

const CHANGES = [
  {
    version: "1.2.0",
    date: "July 8, 2026",
    items: [
      "AI Hook Generator — rewrite your opening 30 seconds with one click",
      "Three scripts from one take — switch between Roman Hinglish, Native script, and English translation",
      "New pricing page with Indian pricing (₹9 first export, ₹59 Week Pass)",
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
      "Word-level timeline editing — drag and retime individual words",
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
    <div className="bg-[#060609] text-white min-h-screen font-sans">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0c0c12]/72 backdrop-blur-xl px-4 md:px-5 py-3">
            <Link className="flex items-center gap-2.5 shrink-0 group" to="/">
<img src="/logo.jpeg" alt="SubAI" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold text-[15px] text-white tracking-tight">SubAI</span>
            </Link>
            <nav className="hidden md:flex items-center gap-0.5">
              <Link
                to="/pricing"
                className="px-3.5 py-2 text-[13px] text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all"
              >
                Pricing
              </Link>
              <Link
                to="/plugin/download"
                className="px-3.5 py-2 text-[13px] text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all"
              >
                Plugin
              </Link>
              <Link
                to="/changelog"
                className="px-3.5 py-2 text-[13px] text-amber-300 rounded-xl hover:bg-white/[0.05] transition-all"
              >
                Changelog
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-all"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-36 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] font-black tracking-tight leading-[1.06] mb-3">
            Changelog
          </h1>
          <p className="text-zinc-400 mb-12">Every update to SubAI, in one place.</p>

          <div className="space-y-10">
            {CHANGES.map((release) => (
              <div key={release.version} className="border-l-2 border-amber-400/30 pl-6 relative">
                <div className="absolute left-0 top-0 -translate-x-[5px] w-2 h-2 rounded-full bg-amber-400" />
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg font-bold text-white">v{release.version}</span>
                  <span className="text-xs text-zinc-600">{release.date}</span>
                </div>
                <ul className="space-y-2">
                  {release.items.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                      <svg
                        className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0"
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

      <footer className="border-t border-white/[0.06] bg-[#060609] pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-amber-500" />
              <span className="font-bold text-white tracking-tight">SubAI</span>
            </div>
            <p className="text-zinc-400 text-sm">Browser-native AI captions for Indian creators.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Links</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/pricing" className="hover:text-amber-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/privacy" className="hover:text-amber-400">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-400">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 text-center text-zinc-600 text-xs">
          © 2026 Preet Patil. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
