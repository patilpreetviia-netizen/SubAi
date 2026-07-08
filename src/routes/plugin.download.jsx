import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/plugin/download")({
  ssr: false,
  component: PluginDownloadPage,
});

const PLUGINS = [
  {
    name: "Premiere Pro",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#9999FF" fillOpacity="0.2" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fill="#9999FF"
          fontSize="12"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          Pr
        </text>
      </svg>
    ),
    color: "#9999FF",
    desc: "Caption your timeline directly inside Premiere Pro. Transcribe, style, and burn-in captions without leaving your NLE.",
    version: "1.0.0",
    size: "4.2 MB",
    os: "Win & Mac",
  },
  {
    name: "After Effects",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#D4A0FF" fillOpacity="0.2" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fill="#D4A0FF"
          fontSize="12"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          Ae
        </text>
      </svg>
    ),
    color: "#D4A0FF",
    desc: "Create dynamic caption templates in After Effects with SubAI-generated text layers and markers.",
    version: "1.0.0",
    size: "3.8 MB",
    os: "Win & Mac",
  },
  {
    name: "DaVinci Resolve",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF8C5A" fillOpacity="0.2" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fill="#FF8C5A"
          fontSize="10"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          DR
        </text>
      </svg>
    ),
    color: "#FF8C5A",
    desc: "Import SRT files straight into your Resolve timeline or burn captions in directly from the SubAI panel.",
    version: "1.0.0",
    size: "3.5 MB",
    os: "Win & Mac",
  },
];

function PluginDownloadPage() {
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
                className="px-3.5 py-2 text-[13px] text-amber-300 rounded-xl hover:bg-white/[0.05] transition-all"
              >
                Plugin
              </Link>
              <Link
                to="/changelog"
                className="px-3.5 py-2 text-[13px] text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all"
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
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] font-black tracking-tight leading-[1.06] mb-5">
            Edit captions inside your <span className="text-amber-400">NLE</span>
          </h1>
          <p className="text-zinc-400 text-[16px] max-w-2xl mx-auto leading-relaxed mb-8">
            Caption your timeline without leaving your editing software. The SubAI panel transcribes
            your sequence, styles the captions, and burns them in or drops an SRT — all in one
            click.
          </p>
          <p className="text-zinc-600 text-sm mb-10">One setup file, no manual config.</p>

          <div className="flex flex-wrap justify-center gap-3">
            {PLUGINS.map((p) => (
              <div
                key={p.name}
                className="px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-sm text-zinc-300"
              >
                {p.name}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          {PLUGINS.map((plugin) => (
            <div
              key={plugin.name}
              className="rounded-2xl border border-white/[0.07] bg-[#0c0c14] p-6 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                {plugin.icon}
                <div>
                  <h3 className="font-bold text-white">{plugin.name}</h3>
                  <p className="text-xs text-zinc-500">
                    v{plugin.version} · {plugin.os}
                  </p>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed flex-1 mb-6">{plugin.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600">{plugin.size}</span>
                <button className="px-4 py-2 text-[12px] font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-all cursor-pointer">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl border border-white/[0.07] bg-[#0c0c14] p-8">
          <h3 className="text-lg font-bold text-white mb-4">Installation</h3>
          <div className="space-y-4 text-sm text-zinc-400">
            <div>
              <p className="text-zinc-300 font-medium mb-1">1. Download the plugin</p>
              <p>Choose your NLE and download the installer package.</p>
            </div>
            <div>
              <p className="text-zinc-300 font-medium mb-1">2. Run the installer</p>
              <p>
                The setup file detects your installed Adobe / DaVinci applications and installs the
                panel automatically.
              </p>
            </div>
            <div>
              <p className="text-zinc-300 font-medium mb-1">3. Open SubAI panel</p>
              <p>
                In your NLE, go to Window &gt; Extensions &gt; SubAI. Log in with your account and
                start captioning.
              </p>
            </div>
            <div>
              <p className="text-zinc-300 font-medium mb-1">4. Transcribe & export</p>
              <p>
                Select the sequence, choose your language, style the captions, and export with
                burn-in or SRT.
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
              Upload a video, get accurate Hinglish captions, export.
            </p>
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
