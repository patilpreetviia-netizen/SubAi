import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { CaptionPlayer } from "../features/CaptionPlayer";
import { MOCK_SUBTITLES } from "../features/mockData";
import { PRESETS } from "../features/presets";

export const Route = createFileRoute("/")({
  ssr: false,
  component: HomePage,
});

const HERO_SUBS = MOCK_SUBTITLES["job-hinglish-reel"];

function useScrollDirection() {
  const [direction, setDirection] = useState("up");
  const prevScroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const cur = window.scrollY;
      if (cur <= 0) {
        setDirection("up");
        prevScroll.current = 0;
        return;
      }
      if (cur > prevScroll.current && cur - prevScroll.current > 8) setDirection("down");
      else if (cur < prevScroll.current && prevScroll.current - cur > 8) setDirection("up");
      prevScroll.current = cur;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return direction;
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function StatCard({ value, label, icon, delay }) {
  const [ref, inView] = useInView(0.3);
  return (
    <div
      ref={ref}
      className={`glass rounded-2xl px-5 py-5 text-center transition-all duration-500 hover:border-[#D97736]/20 hover:shadow-lg hover:shadow-[#D97736]/5 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-[#D97736]/10 border border-[#D97736]/15 mb-3">
        {icon}
      </div>
      <p className="text-2xl md:text-3xl font-black text-white mb-0.5 tracking-tight">{value}</p>
      <p className="text-[10px] text-[#6b7280] font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

function FeatureCard({ colSpan, title, desc, icon, children }) {
  const [ref, inView] = useInView(0.2);
  return (
    <div
      ref={ref}
      className={`${colSpan} p-7 group relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,10,0.8)] backdrop-blur-[24px] shadow-[rgba(0,0,0,0.25)_0px_25px_50px_-12px] overflow-hidden transition-all duration-500 hover:border-[#D97736]/25 hover:shadow-lg hover:shadow-[#D97736]/5 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#D97736]/5 blur-3xl" />
      </div>
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-2xl bg-[#D97736]/10 border border-[#D97736]/15 flex items-center justify-center mb-5">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-md">{desc}</p>
        {children}
      </div>
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,10,0.8)] backdrop-blur-[24px] overflow-hidden transition-all duration-150 hover:border-[#D97736]/15">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
      >
        <span className="text-[15px] font-semibold text-white pr-4">{question}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4 h-4 shrink-0 text-[#6b7280] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-150 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm text-[#9CA3AF] leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [mounted, setMounted] = useState(false);
  const scrollDir = useScrollDirection();
  const [heroRef] = useInView(0.1);
  const [sandboxRef, sandboxInView] = useInView(0.1);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen font-sans selection:bg-[#D97736]/30">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-150 ${scrollDir === "down" ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4">
          <div className="flex items-center justify-between rounded-2xl glass-strong px-4 md:px-5 py-3">
            <Link className="flex items-center shrink-0 group" to="/">
              <img src="/subai-logo.png" alt="SubAI" className="h-20 w-auto object-contain" />
            </Link>

            <nav className="hidden md:flex items-center gap-0.5">
              {[
                { to: "/pricing", label: "Pricing" },
                { to: "/plugin/download", label: "Plugin" },
                { to: "/templates", label: "Templates" },
                { to: "/about", label: "About" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3.5 py-2 text-[13px] text-[#9CA3AF] hover:text-white rounded-2xl hover:bg-white/[0.05] transition-all cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-[#030303] bg-[#D97736] hover:bg-[#FF9A4D] rounded-full transition-all hover:shadow-lg hover:shadow-[#D97736]/25"
              >
                Dashboard
              </Link>
              <button className="md:hidden p-2 rounded-2xl text-[#9CA3AF] hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M4 5h16" />
                  <path d="M4 12h16" />
                  <path d="M4 19h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-36 pb-24 overflow-hidden"
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(ellipse, rgba(217,119,6,0.14) 0%, rgba(255,154,77,0.04) 45%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.018] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: "200px",
            }}
          />
        </div>

        <div
          className={`relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto w-full transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D97736]/20 bg-[#D97736]/5 mb-8 fade-in">
            <span className="w-2 h-2 rounded-full bg-[#D97736] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#FF9A4D] tracking-wide uppercase">
              Now in Public Beta
            </span>
          </div>

          <h1 className="text-[clamp(2.8rem,7vw,5.4rem)] font-black tracking-tight leading-[1.03] mb-6">
            Captions that get
            <br />
            <span className="gradient-text">Hinglish</span> right.
          </h1>

          <p className="text-[17px] md:text-[19px] text-[#9CA3AF] max-w-[560px] leading-relaxed mb-9">
            Most caption tools mangle code-mixed speech. SubAI transcribes Hindi, Hinglish and 20
            other Indian languages, then lets you edit every word before you export.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link to="/signup" className="btn-primary px-7 py-3.5 text-[15px]">
              Try it free
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <a href="#styles" className="btn-secondary px-6 py-3.5 text-[15px]">
              See the styles
            </a>
          </div>

          <p className="mt-4 text-[12px] text-[#6b7280]">Free to use · Powered by Groq & Whisper</p>
        </div>

        <div
          className={`relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl mx-auto mt-16 transition-all duration-500 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <StatCard
            value="99%"
            label="Accuracy"
            delay={0}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-[#D97736]"
              >
                <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              </svg>
            }
          />
          <StatCard
            value="30+"
            label="Caption styles"
            delay={100}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-[#D97736]"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 3v18" />
                <path d="M3 7.5h4" />
                <path d="M3 12h18" />
                <path d="M3 16.5h4" />
                <path d="M17 3v18" />
                <path d="M17 7.5h4" />
                <path d="M17 16.5h4" />
              </svg>
            }
          />
          <StatCard
            value="22"
            label="Indian languages"
            delay={200}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-[#D97736]"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            }
          />
          <StatCard
            value="0ms"
            label="Server Lag"
            delay={300}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-[#D97736]"
              >
                <path d="M12 2v4" />
                <path d="m16.2 7.8 2.9-2.9" />
                <path d="M18 12h4" />
                <path d="m16.2 16.2 2.9 2.9" />
                <path d="M12 18v4" />
                <path d="m4.9 19.1 2.9-2.9" />
                <path d="M2 12h4" />
                <path d="m4.9 4.9 2.9 2.9" />
              </svg>
            }
          />
        </div>
      </section>

      <section id="features" className="py-28 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <p className="section-label">Built different</p>
            <h2 className="text-4xl md:text-[3.5rem] font-black tracking-tight leading-[1.06] mb-5 text-white">
              Everything a creator <span className="gradient-text">actually needs</span>
            </h2>
            <p className="text-[#9CA3AF] max-w-md mx-auto text-[16px] leading-relaxed">
              From first upload to exported reel, SubAI handles every step so you can focus on
              making great content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 auto-rows-auto gap-4">
            <FeatureCard
              colSpan="md:col-span-4"
              title="Built for Hinglish"
              desc="Our transcription model understands Hindi-English code-switching out of the box. It handles slang, regional accents, and mixed-script words."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-[#D97736]"
                >
                  <path d="M12 18V5" />
                  <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
                  <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
                  <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
                  <path d="M18 18a4 4 0 0 0 2-7.464" />
                  <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" />
                  <path d="M6 18a4 4 0 0 1-2-7.464" />
                  <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
                </svg>
              }
            >
              <div className="mt-6 rounded-2xl bg-[rgba(10,10,10,0.8)] border border-[rgba(255,255,255,0.08)] p-4 space-y-2">
                <p className="text-[13px] text-zinc-300">
                  <span className="text-[#6b7280] mr-1.5">{"\u201c"}</span>Basically technically
                  speaking yaar<span className="text-[#6b7280] ml-0.5">{"\u201d"}</span>
                </p>
                <p className="text-[13px] text-zinc-300">
                  <span className="text-[#6b7280] mr-1.5">{"\u201c"}</span>Aaj ka video dekh bhai,
                  life-changing hai<span className="text-[#6b7280] ml-0.5">{"\u201d"}</span>
                </p>
              </div>
            </FeatureCard>

            <FeatureCard
              colSpan="md:col-span-2"
              title="22 Indian Languages"
              desc="Native script, Roman, or English. Switch in one click."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-[#D97736]"
                >
                  <path d="m5 8 6 6" />
                  <path d="m4 14 6-6 2-3" />
                  <path d="M2 5h12" />
                  <path d="M7 2h1" />
                  <path d="m22 22-5-10-5 10" />
                  <path d="M14 18h6" />
                </svg>
              }
            >
              <div className="mt-5 flex flex-wrap gap-2">
                {["\u0939\u093F", "\u0BA4\u0BAE\u0BBF", "EN", "\u0B2E\u0B4B", "\u0917\u0941"].map(
                  (label, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1 rounded-[6px] bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-xs text-[#9CA3AF] font-medium"
                    >
                      {label}
                    </div>
                  ),
                )}
              </div>
            </FeatureCard>

            <FeatureCard
              colSpan="md:col-span-3"
              title="30+ Caption Styles"
              desc="Hormozi, Grit, Prism, Glitch, Word Pop. Every word tunable."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-[#D97736]"
                >
                  <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
                  <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                  <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                  <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                  <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                </svg>
              }
            />

            <FeatureCard
              colSpan="md:col-span-3"
              title="16:9 & 9:16 Export"
              desc="Runs entirely in your browser using Remotion. Zero upload wait times."
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-[#D97736]"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 3v18" />
                  <path d="M3 7.5h4" />
                  <path d="M3 12h18" />
                  <path d="M3 16.5h4" />
                  <path d="M17 3v18" />
                  <path d="M17 7.5h4" />
                  <path d="M17 16.5h4" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      <section className="py-28 px-6 overflow-hidden bg-black/20 border-b border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <p className="section-label">Why SubAI</p>
            <h2 className="text-4xl md:text-[3.4rem] font-black tracking-tight leading-[1.06] mb-5 text-white">
              Raw transcription vs <span className="gradient-text">SubAI output</span>
            </h2>
            <p className="text-[#9CA3AF] max-w-xl mx-auto text-[16px] leading-relaxed">
              Most tools give you a messy auto-transcript. SubAI cleans the speech, keeps the
              code-switch, and delivers captions that actually make sense.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-[11px] font-semibold text-red-300 tracking-wide uppercase">
                  Raw transcript
                </span>
              </div>
              <div className="space-y-3">
                {[
                  "So basically what happens is that... uh... you know... the thing is...",
                  "Main kal market gaya tha *unintelligible* phir uske baad",
                  "Actually what I'm trying to say is that this product is very... umm...",
                  "Aap logon ko pata hai ki yeh... like... it's very important for us",
                ].map((line, i) => (
                  <p
                    key={i}
                    className="text-[14px] text-[#6b7280] italic leading-relaxed border-l-2 border-red-500/20 pl-3"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-300 tracking-wide uppercase">
                  SubAI — Clean captions
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    roman: "So basically, the thing is…",
                    native: "तो बात यूँ है…",
                    eng: "So basically, the thing is…",
                  },
                  {
                    roman: "Main kal market gaya tha, phir uske baad…",
                    native: "मैं कल मार्केट गया था, फिर उसके बाद…",
                    eng: "I went to the market yesterday, then…",
                  },
                  {
                    roman: "What I'm trying to say is, this product is very…",
                    native: "मैं यह कहने की कोशिश कर रहा हूँ कि यह प्रोडक्ट बहुत…",
                    eng: "What I'm trying to say is, this product is very…",
                  },
                  {
                    roman: "Yeh humare liye bahut important hai",
                    native: "यह हमारे लिए बहुत महत्वपूर्ण है",
                    eng: "This is very important for us",
                  },
                ].map((line, i) => (
                  <div
                    key={i}
                    className="text-[14px] text-zinc-300 leading-relaxed border-l-2 border-emerald-500/20 pl-3"
                  >
                    <p>
                      <span className="text-[#6b7280] text-[11px] font-mono">Roman:</span>{" "}
                      {line.roman}
                    </p>
                    <p>
                      <span className="text-[#6b7280] text-[11px] font-mono">Native:</span>{" "}
                      {line.native}
                    </p>
                    <p>
                      <span className="text-[#6b7280] text-[11px] font-mono">English:</span>{" "}
                      {line.eng}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 py-4">
            {[
              "Roman Script",
              "Devanagari",
              "Gurmukhi",
              "Bengali",
              "Tamil",
              "Telugu",
              "Kannada",
              "Malayalam",
              "Gujarati",
              "English",
            ].map((label) => (
              <span
                key={label}
                className="px-3 py-1 rounded-[6px] bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-xs text-[#6b7280] font-medium"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 px-6 overflow-hidden border-b border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <p className="section-label">The difference</p>
            <h2 className="text-4xl md:text-[3.4rem] font-black tracking-tight leading-[1.06] mb-5 text-white">
              SubAI vs <span className="gradient-text">everything else</span>
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[rgba(255,255,255,0.08)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)] bg-white/[0.02]">
                  <th className="text-left py-4 px-5 text-[#9CA3AF] font-medium">Feature</th>
                  <th className="text-left py-4 px-5 text-[#FF9A4D] font-semibold">SubAI</th>
                  <th className="text-left py-4 px-5 text-[#6b7280] font-medium">CapCut</th>
                  <th className="text-left py-4 px-5 text-[#6b7280] font-medium">Premiere Pro</th>
                  <th className="text-left py-4 px-5 text-[#6b7280] font-medium">Veed.io</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Hinglish / code-mixed speech", subai: "✓", others: "✗" },
                  { feature: "22 Indian languages", subai: "✓", others: "✗" },
                  { feature: "Three scripts per sentence", subai: "✓", others: "✗" },
                  { feature: "AI Hook Generator", subai: "✓", others: "✗" },
                  { feature: "Auto-translate", subai: "✓", others: "✗" },
                  { feature: "30+ preset styles", subai: "✓", capcut: "✓", others: "✗" },
                  { feature: "Brand Kit (saved fonts/colors)", subai: "✓", others: "✗" },
                  { feature: "Caption SEO (.txt export)", subai: "✓", others: "✗" },
                  { feature: "Free tier (watermark)", subai: "✓", veed: "✗", others: "✗" },
                  { feature: "Browser-native (no install)", subai: "✓", capcut: "✓", others: "✗" },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors"
                  >
                    <td className="py-3.5 px-5 text-zinc-300">{row.feature}</td>
                    <td className="py-3.5 px-5 text-emerald-400">{row.subai}</td>
                    <td className="py-3.5 px-5 text-[#6b7280]">{row.capcut ?? row.others}</td>
                    <td className="py-3.5 px-5 text-[#6b7280]">{row.premiere ?? row.others}</td>
                    <td className="py-3.5 px-5 text-[#6b7280]">{row.veed ?? row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-28 px-6 overflow-hidden bg-black/20 border-b border-white/[0.03]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <p className="section-label">FAQ</p>
            <h2 className="text-4xl md:text-[3.4rem] font-black tracking-tight leading-[1.06] mb-5 text-white">
              Questions? <span className="gradient-text">Answered.</span>
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Is SubAI really free?",
                a: "Yes. The free plan includes unlimited transcription, watermark-free exports at 720p, and access to all caption styles. The Pro plan removes the watermark and unlocks 4K exports.",
              },
              {
                q: "What languages does SubAI support?",
                a: "22 Indian languages including Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Kannada, Malayalam, Urdu, and more. Plus English and Hinglish code-mixed speech.",
              },
              {
                q: "How does the three-script export work?",
                a: "For every sentence, SubAI generates three lines: Roman transliteration (Hinglish), Native script (Devanagari, Tamil, etc.), and English translation. You can toggle which scripts appear in your final video.",
              },
              {
                q: "Can I use my own fonts and colors?",
                a: "Yes. The Brand Kit feature lets you save custom fonts, colors, and logo watermarks. Your brand kit is saved locally and applies to all future exports.",
              },
              {
                q: "How do I export to Premiere / CapCut / DaVinci?",
                a: "The SubAI Plugin auto-syncs your captions as edit-friendly text layers in Premiere Pro, CapCut, and DaVinci Resolve. Download it from the Plugin page after signing up.",
              },
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 px-6 overflow-hidden bg-black/40 border-b border-white/[0.03] relative">
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(217,119,6,0.10) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#D97736]/10 border border-[#D97736]/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#D97736]"
            >
              <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l6.58-6.58a1 1 0 0 0 0-1.42Z" />
              <path d="M7 7h.01" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-[3.4rem] font-black tracking-tight leading-[1.06] mb-5 text-white">
            Works where <span className="gradient-text">you work</span>
          </h2>
          <p className="text-[#9CA3AF] max-w-lg mx-auto text-[16px] leading-relaxed mb-10">
            Download the SubAI Plugin to auto-sync captions directly into Premiere Pro, CapCut, and
            DaVinci Resolve. No manual import needed.
          </p>
          <Link to="/plugin/download" className="btn-primary px-8 py-4 text-[15px]">
            Download the plugin
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 ml-1.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
          </Link>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["Premiere Pro", "CapCut", "DaVinci Resolve", "Final Cut Pro"].map((app) => (
              <span
                key={app}
                className="px-4 py-2 rounded-[6px] bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-xs text-[#9CA3AF] font-medium"
              >
                {app}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        id="styles"
        ref={sandboxRef}
        className="py-28 px-6 overflow-hidden bg-black/40 border-y border-white/[0.03]"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className={`text-center mb-12 transition-all duration-500 ${sandboxInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <p className="section-label">Live Sandbox</p>
            <h2 className="text-4xl md:text-[3.4rem] font-black tracking-tight leading-[1.06] mb-5 text-white">
              Preset styles, <span className="gradient-text">ready to ship</span>
            </h2>
            <p className="text-[#9CA3AF] max-w-xl mx-auto text-[16px] leading-relaxed">
              Tap a preset below to preview it live in the canvas.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 mb-12">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p)}
                className={`px-4 py-2 rounded-full border text-[13px] font-medium transition-all duration-150 ${
                  preset.id === p.id
                    ? "bg-[#D97736]/10 border-[#D97736]/40 text-[#FF9A4D] shadow-sm shadow-[#D97736]/10"
                    : "bg-white/[0.03] border-[rgba(255,255,255,0.08)] text-zinc-300 hover:border-[#D97736]/25 hover:text-[#FF9A4D] hover:bg-[#D97736]/5"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] shadow-2xl shadow-black transition-all duration-500 hover:border-[#D97736]/15">
            <div className="absolute inset-0 glass-strong z-0" />
            <div className="relative z-10 w-full p-4 flex justify-center">
              <div style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
                <CaptionPlayer subtitles={HERO_SUBS} preset={preset} durationInFrames={330} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[#060609] pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <img src="/logo.jpeg" alt="SubAI" className="w-7 h-7 rounded-[6px] object-cover" />
              <span className="font-bold text-[15px] text-white tracking-tight">SubAI</span>
            </Link>
            <p className="text-[#9CA3AF] text-sm max-w-xs leading-relaxed">
              The free, browser-native AI caption studio built for Indian creators.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide">Product</h4>
            <ul className="space-y-3 text-sm text-[#9CA3AF]">
              <li>
                <Link to="/pricing" className="hover:text-[#D97736] transition-colors duration-150">
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/changelog"
                  className="hover:text-[#D97736] transition-colors duration-150"
                >
                  Changelog
                </Link>
              </li>
              <li>
                <Link
                  to="/templates"
                  className="hover:text-[#D97736] transition-colors duration-150"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  to="/plugin/download"
                  className="hover:text-[#D97736] transition-colors duration-150"
                >
                  Plugin
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide">Company</h4>
            <ul className="space-y-3 text-sm text-[#9CA3AF]">
              <li>
                <Link to="/about" className="hover:text-[#D97736] transition-colors duration-150">
                  About
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#D97736] transition-colors duration-150">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-[#D97736] transition-colors duration-150">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide">Legal</h4>
            <ul className="space-y-3 text-sm text-[#9CA3AF]">
              <li>
                <Link to="/privacy" className="hover:text-[#D97736] transition-colors duration-150">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#D97736] transition-colors duration-150">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#6b7280] text-xs">© 2026 Preet Patil. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[#6b7280] text-xs">
            <span>Powered by Groq & Whisper</span>
            <span className="w-1 h-1 rounded-full bg-[#6b7280]" />
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
