import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const MONTHLY_PLANS = [
  {
    name: "Free",
    price: "Free",
    period: "no card needed",
    badge: null,
    popular: false,
    features: [
      "Unlimited watermarked exports",
      "2 min transcription / month",
      "All caption styles",
      "Google Fonts",
      "SRT download",
    ],
    cta: "Start free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Starter",
    price: 299,
    period: "/mo",
    badge: null,
    popular: false,
    features: [
      "Unlimited watermark-free exports",
      "60 min transcription / month",
      "SRT download",
      "5 custom fonts",
      "1080p HD export",
      "Premiere/AE plugin - burn-in renders",
    ],
    cta: "Get Starter",
    href: "/checkout",
    highlight: false,
  },
  {
    name: "Editor",
    price: 499,
    period: "/mo",
    badge: "Most popular",
    popular: true,
    features: [
      "Unlimited watermark-free exports",
      "3 hours transcription / month",
      "Up to 4K export",
      "SRT download - 10 custom fonts",
      "Premiere/AE plugin - burn-in renders",
    ],
    cta: "Get Editor",
    href: "/checkout",
    highlight: true,
  },
  {
    name: "Pro",
    price: 999,
    period: "/mo",
    badge: null,
    popular: false,
    features: [
      "Unlimited watermark-free exports",
      "8 hours transcription / month",
      "Up to 4K export",
      "Full Premiere/AE plugin - SRT to sequence",
      "30 custom fonts - 3 devices",
    ],
    cta: "Get Pro",
    href: "/checkout",
    highlight: false,
  },
];

function PricingPage() {
  const [yearly, setYearly] = useState(false);

  const computePrice = (price, period) => {
    if (period !== "/mo") return { display: price, suffix: period };
    if (!yearly) return { display: `\u20B9${price}`, suffix: "/mo" };
    const yearlyPrice = Math.round(price * 10 * 0.88);
    return { display: `\u20B9${yearlyPrice}`, suffix: "/yr" };
  };

  return (
    <Layout>
      <section className="pt-36 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] font-black tracking-tight leading-[1.06] mb-5">
            Pay per video. Or own the pipeline.
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-[16px] leading-relaxed">
            No storage plans. No dollar pricing. Your footage is processed, rendered and deleted —
            nothing lives on our servers.
          </p>
          <p className="text-zinc-600 text-sm mt-3">
            Just need a video or two? Pay per video below — no subscription. Posting regularly? Pick
            a monthly plan. Every paid option removes the watermark.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/5 to-transparent p-8 text-center max-w-lg mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-4">
              First export offer
            </span>
            <div className="text-5xl font-black text-white mb-2">\u20B99</div>
            <p className="text-zinc-400 text-sm mb-1">first export</p>
            <p className="text-zinc-600 text-xs mb-6">
              Your first watermark-free HD export. One per user - then \u20B959 for a week of
              unlimited clean exports - UPI - 10 seconds.
            </p>
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-all"
            >
              Claim your \u20B99 export
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-white/[0.07] bg-[#0c0c14] p-6 md:p-8 text-center max-w-lg mx-auto">
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-bold">
              Not ready for monthly?
            </span>
            <div className="text-4xl font-black text-white mt-3">\u20B959</div>
            <p className="text-zinc-400 font-medium">/ 7 days</p>
            <p className="text-zinc-500 text-xs mt-1 mb-6">
              Week Pass — 7 days of Starter. One-time UPI - no mandate - no auto-renew.
            </p>
            <ul className="text-left space-y-2 mb-6 max-w-xs mx-auto">
              {[
                "Unlimited watermark-free exports",
                "12 min transcription",
                "1080p HD export",
                "All styles & fonts",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                  <svg
                    className="w-4 h-4 text-amber-400 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-semibold text-white rounded-xl border border-white/[0.15] hover:bg-white/[0.05] transition-all"
            >
              Get the \u20B959 Week Pass
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-10">
            <span
              className={`text-sm font-medium cursor-pointer ${!yearly ? "text-white" : "text-zinc-400"}`}
              onClick={() => setYearly(false)}
            >
              Monthly
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                yearly ? "bg-amber-400" : "bg-white/[0.15]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  yearly ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium cursor-pointer ${yearly ? "text-white" : "text-zinc-400"}`}
                onClick={() => setYearly(true)}
              >
                Yearly
              </span>
              {yearly && <span className="text-[10px] text-amber-400 font-bold">12% off</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MONTHLY_PLANS.map((plan) => {
              const { display, suffix } = computePrice(plan.price, plan.period);
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-6 flex flex-col ${
                    plan.highlight
                      ? "border-amber-400/30 bg-gradient-to-b from-amber-400/5 to-[#0c0c14] shadow-lg shadow-amber-400/5"
                      : "border-white/[0.07] bg-[#0c0c14]"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                    <div className="text-3xl font-black text-white">
                      {display}
                      <span className="text-sm font-medium text-zinc-400">{suffix}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                        <svg
                          className="w-4 h-4 text-amber-400 mt-0.5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={plan.href}
                    className={`w-full text-center py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                      plan.highlight
                        ? "bg-amber-400 text-black hover:bg-amber-300"
                        : "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28 border-t border-white/[0.06] pt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] text-amber-400 uppercase tracking-[0.22em] font-bold mb-3">
              Plugin Included
            </p>
            <h2 className="text-3xl md:text-[2.8rem] font-black tracking-tight leading-[1.06] text-white">
              Premiere Pro, After Effects & DaVinci Resolve plugin
            </h2>
            <p className="text-zinc-400 mt-3 text-sm">watermark-free on Starter, Editor & Pro</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 pr-4 text-zinc-400 font-medium" />
                  <th className="text-center py-3 px-4 text-zinc-400 font-medium">Free</th>
                  <th className="text-center py-3 px-4 text-zinc-400 font-medium">Starter</th>
                  <th className="text-center py-3 px-4 text-amber-400 font-medium">Editor</th>
                  <th className="text-center py-3 px-4 text-zinc-400 font-medium">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Watermark-free burn-in renders", "Watermarked", "\u2713", "\u2713", "\u2713"],
                  ["Free renders to try (clips \u226460s)", "2", "\u2014", "\u2014", "\u2014"],
                  ["Shared transcription", "2 min", "60 min", "3 hours", "8 hours"],
                  ["Active devices", "\u2014", "1", "2", "3"],
                  ["SRT export to sequence", "\u2014", "\u2014", "\u2014", "\u2713"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`py-3 ${j === 0 ? "text-left text-zinc-300 pr-4" : "text-center px-4 " + (j === 3 ? "text-amber-400" : "text-zinc-400")}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-zinc-600 text-xs text-center mt-6">
            Client footage processed, burned, deleted — nothing stored
          </p>

          <div className="text-center mt-8">
            <Link
              to="/plugin/download"
              className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-semibold text-white rounded-xl border border-white/[0.15] hover:bg-white/[0.05] transition-all"
            >
              Download the plugin
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
