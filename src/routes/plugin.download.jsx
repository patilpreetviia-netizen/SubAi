import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/plugin/download")({
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

const PLUGIN_FILES = {
  "Premiere Pro": "/plugins/subai-premiere-pro.zip",
  "After Effects": "/plugins/subai-after-effects.zip",
  "DaVinci Resolve": "/plugins/subai-davinci-resolve.zip",
};

const handleDownload = (pluginName) => {
  const fileUrl = PLUGIN_FILES[pluginName];
  if (fileUrl) {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileUrl.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert(`The ${pluginName} plugin is not available yet.`);
  }
};

function PluginDownloadPage() {
  return (
    <Layout>
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] font-black tracking-tight leading-[1.06] mb-5">
            Edit captions inside your <span className="text-[#D97736]">NLE</span>
          </h1>
          <p className="text-[#9CA3AF] text-[16px] max-w-2xl mx-auto leading-relaxed mb-8">
            Caption your timeline without leaving your editing software. The SubAI panel transcribes
            your sequence, styles the captions, and burns them in or drops an SRT \u2014 all in one
            click.
          </p>
          <p className="text-[#4B5563] text-sm mb-10">One setup file, no manual config.</p>

          <div className="flex flex-wrap justify-center gap-3">
            {PLUGINS.map((p) => (
              <div
                key={p.name}
                className="px-4 py-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-white/[0.03] text-sm text-[#D1D5DB]"
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
              className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0A0A0A]/80 backdrop-blur-2xl p-6 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                {plugin.icon}
                <div>
                  <h3 className="font-bold text-white">{plugin.name}</h3>
                  <p className="text-xs text-[#6B7280]">
                    v{plugin.version} \u00B7 {plugin.os}
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#9CA3AF] leading-relaxed flex-1 mb-6">{plugin.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#4B5563]">{plugin.size}</span>
                <button
                  onClick={() => handleDownload(plugin.name)}
                  className="px-4 py-2 text-[12px] font-bold text-[#030303] bg-[#D97736] hover:bg-[#FF9A4D] rounded-full transition-all duration-150 cursor-pointer"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0A0A0A]/80 backdrop-blur-2xl p-8">
          <h3 className="text-lg font-bold text-white mb-4">Installation</h3>
          <div className="space-y-4 text-sm text-[#9CA3AF]">
            <div>
              <p className="text-[#D1D5DB] font-medium mb-1">1. Download the plugin</p>
              <p>Choose your NLE and download the installer package.</p>
            </div>
            <div>
              <p className="text-[#D1D5DB] font-medium mb-1">2. Run the installer</p>
              <p>
                The setup file detects your installed Adobe / DaVinci applications and installs the
                panel automatically.
              </p>
            </div>
            <div>
              <p className="text-[#D1D5DB] font-medium mb-1">3. Open SubAI panel</p>
              <p>
                In your NLE, go to Window &gt; Extensions &gt; SubAI. Log in with your account and
                start captioning.
              </p>
            </div>
            <div>
              <p className="text-[#D1D5DB] font-medium mb-1">4. Transcribe & export</p>
              <p>
                Select the sequence, choose your language, style the captions, and export with
                burn-in or SRT.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
