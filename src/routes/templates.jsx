import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { PRESETS } from "../features/presets";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
});

const animationLabels = { pop: "Pop", fade: "Fade", slide: "Slide" };
const caseLabels = { uppercase: "UPPER", lowercase: "lower", none: "Normal" };

function TemplateCard({ t }) {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-2xl border border-white/[0.07] bg-[#0c0c14] p-4 hover:border-amber-400/25 transition-all group cursor-pointer"
      onClick={() => navigate({ to: "/dashboard", search: { template: t.id } })}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate({ to: "/dashboard", search: { template: t.id } });
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Select template: ${t.name}`}
    >
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
            WebkitTextStroke:
              t.stroke && t.stroke !== "transparent" ? `1px ${t.stroke}` : undefined,
            fontStyle: t.italic ? "italic" : "normal",
            textTransform:
              t.case === "uppercase" ? "uppercase" : t.case === "lowercase" ? "lowercase" : "none",
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
    const matchSearch = search ? t.name.toLowerCase().includes(search.toLowerCase()) : true;
    const matchAnim = animFilter === "all" || t.animation === animFilter;
    return matchSearch && matchAnim;
  });

  return (
    <Layout>
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[clamp(2.2rem,5vw,3.4rem)] font-black tracking-tight leading-[1.06] mb-3">
              <span className="gradient-text">{PRESETS.length}</span> Caption Styles
            </h1>
            <p className="text-zinc-400 max-w-lg mx-auto">
              Every style reveals word-by-word, highlights the active word, and is fully tunable.
              Pick one and ship.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto mb-10">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex-1 w-full">
              <svg
                className="w-4 h-4 text-zinc-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 21l-5.2-5.2" />
                <circle cx="10" cy="10" r="8" />
              </svg>
              <input
                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-zinc-600"
                placeholder="Find a style..."
                aria-label="Search caption styles"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {["all", "pop", "fade", "slide"].map((a) => (
                <button
                  key={a}
                  onClick={() => setAnimFilter(a)}
                  className={`px-3 py-2 rounded-lg text-[11px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
                    animFilter === a
                      ? "bg-amber-400/15 text-amber-300 border border-amber-400/25"
                      : "bg-white/[0.04] text-zinc-500 border border-white/[0.06] hover:text-zinc-300"
                  }`}
                >
                  {a === "all" ? "All" : animationLabels[a] || a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((t) => (
              <TemplateCard key={t.id} t={t} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-zinc-500">
              No styles found matching &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
