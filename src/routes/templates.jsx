import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PRESETS } from "../features/presets";

export const Route = createFileRoute("/templates")({
  ssr: false,
  component: TemplatesPage,
});

const animationLabels = { pop: "Pop", fade: "Fade", slide: "Slide" };
const caseLabels = { uppercase: "UPPER", lowercase: "lower", none: "Normal" };

function TemplateCard({ t }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0c14] p-4 hover:border-amber-400/25 transition-all group">
      <div
        className="w-full h-20 rounded-xl mb-3 flex items-center justify-center border border-white/[0.04] overflow-hidden"
        style={{
          background:
            typeof t.bg === "string" && t.bg !== "transparent" && !t.bg.startsWith("rgba")
              ? t.bg
              : "#0c0c14",
        }}
      >
        <span
          className="text-xl font-black tracking-tight"
          style={{
            color: t.color,
            fontFamily: t.font,
            textShadow: t.shadow && t.shadow !== "none" ? t.shadow : "none",
            WebkitTextStroke: t.stroke && t.stroke !== "transparent" ? `1px ${t.stroke}` : undefined,
            fontStyle: t.italic ? "italic" : "normal",
            textTransform: t.case === "uppercase" ? "uppercase" : t.case === "lowercase" ? "lowercase" : "none",
          }}
        >
          {t.name}
        </span>
      </div>
      <h3 className="font-semibold text-sm text-white">{t.name}</h3>
      <div className="flex flex-wrap gap-1.5 mt-2">
        <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] text-zinc-500 font-medium">
          {t.weight}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] text-zinc-500 font-medium">
          {animationLabels[t.animation] || t.animation}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] text-zinc-500 font-medium">
          {caseLabels[t.case] || t.case}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] text-zinc-500 font-medium">
          <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
          {t.color}
        </span>
      </div>
    </div>
  );
}

function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [animFilter, setAnimFilter] = useState("all");

  const filtered = PRESETS.filter((t) => {
    const matchSearch = search
      ? t.name.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchAnim = animFilter === "all" || t.animation === animFilter;
    return matchSearch && matchAnim;
  });

  return (
    <div className="bg-[#060609] text-white min-h-screen font-sans selection:bg-amber-500/30">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-6xl px-4 md:px-6 pt-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0c0c12]/72 backdrop-blur-xl px-4 md:px-5 py-3">
            <Link className="flex items-center gap-2.5 shrink-0 group" to="/">
<img src="/logo.jpeg" alt="SubAI" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold text-[15px] text-white tracking-tight">SubAI</span>
            </Link>
            <nav className="hidden md:flex items-center gap-0.5">
              <Link to="/pricing" className="px-3.5 py-2 text-[13px] text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all">Pricing</Link>
              <Link to="/templates" className="px-3.5 py-2 text-[13px] text-amber-300 rounded-xl hover:bg-white/[0.05] transition-all">Templates</Link>
              <Link to="/plugin/download" className="px-3.5 py-2 text-[13px] text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all">Plugin</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-all">Dashboard</Link>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-36 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[clamp(2.2rem,5vw,3.4rem)] font-black tracking-tight leading-[1.06] mb-3">
              <span className="gradient-text">{PRESETS.length}</span> Caption Styles
            </h1>
            <p className="text-zinc-400 max-w-lg mx-auto">
              Every style reveals word-by-word, highlights the active word, and is fully tunable. Pick one and ship.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto mb-10">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex-1 w-full">
              <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M21 21l-5.2-5.2" /><circle cx="10" cy="10" r="8" />
              </svg>
              <input className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-zinc-600" placeholder="Find a style..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-1">
              {["all", "pop", "fade", "slide"].map((a) => (
                <button key={a} onClick={() => setAnimFilter(a)} className={`px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${animFilter === a ? "bg-amber-400/15 text-amber-300 border border-amber-400/25" : "bg-white/[0.04] text-zinc-500 border border-white/[0.06] hover:text-zinc-300"}`}>
                  {a === "all" ? "All" : (animationLabels[a] || a)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((t) => <TemplateCard key={t.id} t={t} />)}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-zinc-500">
              No styles found matching "{search}"
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-white/[0.06] bg-[#060609] pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-amber-500" />
              <span className="font-bold text-white tracking-tight">SubAI</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link to="/pricing" className="hover:text-amber-400">Pricing</Link></li>
              <li><Link to="/changelog" className="hover:text-amber-400">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link to="/privacy" className="hover:text-amber-400">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-amber-400">Terms</Link></li>
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
