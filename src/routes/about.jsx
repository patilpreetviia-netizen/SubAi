import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  ssr: false,
  component: AboutPage,
});

function AboutPage() {
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
                className="px-3.5 py-2 text-[13px] text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                Pricing
              </Link>
              <Link
                to="/plugin/download"
                className="px-3.5 py-2 text-[13px] text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                Plugin
              </Link>
              <Link
                to="/about"
                className="px-3.5 py-2 text-[13px] text-amber-300 rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                About
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tight leading-[1.06] mb-6">
            Built for how <span className="text-amber-400">India</span> actually speaks
          </h1>
          <p className="text-zinc-400 text-[17px] leading-relaxed mb-10">
            SubAI is a browser-native AI caption studio built specifically for Indian content
            creators. We generate frame-accurate Hindi, English, and Hinglish captions for videos,
            right in your browser.
          </p>

          <div className="space-y-12">
            <div>
              <h2 className="text-xl font-bold text-white mb-3">The problem</h2>
              <p className="text-zinc-400 leading-relaxed">
                Most caption tools are trained on American English. When Indian creators upload
                code-mixed Hinglish content, the transcripts come out wrong — and fixing them takes
                longer than captioning from scratch.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">Our approach</h2>
              <p className="text-zinc-400 leading-relaxed">
                We built SubAI using speech models trained on Indian languages. The transcription
                understands Hindi-English code-switching, slang, regional accents, and mixed-script
                words. Then we made everything editable — every word, its timing, its color, its
                style.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">Why free?</h2>
              <p className="text-zinc-400 leading-relaxed">
                We believe great tools should be accessible. The free tier gives you everything —
                all styles, all formats — with a watermark on exports. When you're ready to go pro,
                you pay in INR for what you need, nothing more.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-3">The team</h2>
              <p className="text-zinc-400 leading-relaxed">
                Built in India, for Indian creators. We're a small team obsessed with making
                captioning effortless for the next billion content creators.
              </p>
            </div>
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
            <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
              Upload a video, get accurate Hinglish captions, export. That's the whole product.
            </p>
            <p className="text-zinc-600 text-xs mt-2">Built in India, for Indian creators.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/pricing" className="hover:text-amber-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/plugin/download" className="hover:text-amber-400 transition-colors">
                  Plugin
                </Link>
              </li>
              <li>
                <Link to="/changelog" className="hover:text-amber-400 transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-400 transition-colors">
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
