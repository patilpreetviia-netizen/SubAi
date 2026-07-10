import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import styles from "./Editor.module.css";
import { CaptionPlayer } from "../features/CaptionPlayer";
import { useEditorStore } from "../features/editorStore";
import { MOCK_SUBTITLES } from "../features/mockData";
import { PRESETS } from "../features/presets";
import { Timeline } from "../features/Timeline";
import { getVideoUrl, loadSubtitles } from "../lib/jobsService";
import { supabase } from "../lib/supabase";
import { generateHook } from "../lib/hooksServer";
import { convertSubtitles } from "../lib/scriptConverter";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Sparkles,
  Save,
  Download,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  BookmarkPlus,
  Flame,
  Languages,
  Wand2,
  FileText,
  Palette,
  Trash2,
  X,
  Check,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/editor/$jobId")({
  ssr: false,
  component: EditorPage,
});

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = String(Math.floor(s % 60)).padStart(2, "0");
  return `${m}:${sec}`;
};

const WAVEFORM = Array.from(
  { length: 200 },
  (_, i) => 4 + Math.abs(Math.sin(i * 0.3) * 14 + Math.sin(i * 0.7) * 8 + Math.sin(i * 1.3) * 5),
);

const IS_FREE_TIER = true;

const INDIAN_LANGUAGES = [
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्" },
  { code: "mai", name: "Maithili", native: "मैथिली" },
  { code: "sat", name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "ks", name: "Kashmiri", native: "कॉशुर" },
  { code: "ne", name: "Nepali", native: "नेपाली" },
  { code: "sd", name: "Sindhi", native: "سنڌي" },
  { code: "doi", name: "Dogri", native: "डोगरी" },
  { code: "kok", name: "Konkani", native: "कोंकणी" },
  { code: "brx", name: "Bodo", native: "बरʼ" },
  { code: "mni", name: "Manipuri", native: "মৈতৈলোন্" },
];

const overlayBase = {
  position: "fixed",
  inset: 0,
  zIndex: 300,
  background: "rgba(0,0,0,0.65)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalBase = {
  background: "#18181b",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
  padding: 24,
  maxWidth: 600,
  width: "90%",
  maxHeight: "85vh",
  overflow: "auto",
};

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#27272a",
            color: "#d4d4d8",
            padding: "5px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 500,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 500,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        padding: "32px 20px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.4 }}
      >
        <rect
          x="8"
          y="16"
          width="64"
          height="48"
          rx="8"
          stroke="#52525b"
          strokeWidth="2"
          fill="none"
        />
        <rect x="14" y="26" width="52" height="8" rx="2" fill="#27272a" />
        <rect x="14" y="38" width="36" height="6" rx="2" fill="#27272a" />
        <rect x="14" y="48" width="44" height="6" rx="2" fill="#27272a" />
        <circle cx="64" cy="56" r="8" fill="#27272a" stroke="#52525b" strokeWidth="1.5" />
        <path
          d="M61 56l2 2 4-4"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#71717a" }}>No captions yet</div>
      <p
        style={{
          fontSize: 11,
          color: "#52525b",
          lineHeight: 1.6,
          margin: 0,
          maxWidth: 200,
        }}
      >
        Transcription may have failed. Check your
        <br />
        <code
          style={{
            color: "#a1a1aa",
            background: "rgba(255,255,255,0.05)",
            padding: "1px 4px",
            borderRadius: 3,
          }}
        >
          GROQ_API_KEY
        </code>
        <br />
        in{" "}
        <code
          style={{
            color: "#a1a1aa",
            background: "rgba(255,255,255,0.05)",
            padding: "1px 4px",
            borderRadius: 3,
          }}
        >
          .env
        </code>
        <br />
        or upload a new video from dashboard.
      </p>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: "#52525b",
          marginTop: 4,
        }}
      >
        <Sparkles size={11} />
        Captions appear here after transcription
      </div>
    </div>
  );
}

function EditorPage() {
  const { jobId } = useParams({ from: "/editor/$jobId" });
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const videoRef = useRef(null);
  const [job, setJob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [resolution, setResolution] = useState("1080p");
  const [aspect, setAspect] = useState("original");
  const [panelTab, setPanelTab] = useState("templates");
  const [subTab, setSubTab] = useState("builtin");
  const [lineMode, setLineMode] = useState("1");
  const [editingId, setEditingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [hookModal, setHookModal] = useState(false);
  const [generatingHook, setGeneratingHook] = useState(false);
  const [generatedHook, setGeneratedHook] = useState(null);
  const [scriptMode, setScriptMode] = useState("roman");
  const [translateModal, setTranslateModal] = useState(false);
  const [translateLang, setTranslateLang] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [brandKits, setBrandKits] = useState(() => {
    try {
      const stored = localStorage.getItem("brandKits");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const subtitles = useEditorStore((s) => s.subtitles);
  const load = useEditorStore((s) => s.load);
  const updateText = useEditorStore((s) => s.updateText);
  const updateSegmentTime = useEditorStore((s) => s.updateSegmentTime);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const runCleanup = useEditorStore((s) => s.runCleanup);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);

  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const preset = PRESETS.find((p) => p.id === presetId);

  const push = useCallback((msg) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [playing]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onTime = () => setCurrentTime(el.currentTime);
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, []);

  useEffect(() => {
    async function loadJobData() {
      setLoading(true);
      try {
        const { data } = await supabase.from("jobs").select("*").eq("id", jobId).single();
        if (data) {
          setJob(data);
          if (data.storage_key) {
            try {
              setVideoUrl(await getVideoUrl(data.storage_key));
            } catch (e) {
              console.warn(e.message);
            }
          }
        } else if (!jobId.startsWith("job-")) {
          setNotFound(true);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn(e.message);
      }

      const isMockJob = jobId.startsWith("job-");
      const storedSubs = localStorage.getItem(`subtitles_${jobId}`);
      if (storedSubs) {
        load(JSON.parse(storedSubs));
      } else if (isMockJob) {
        load(MOCK_SUBTITLES[jobId] || MOCK_SUBTITLES["job-hinglish-reel"]);
      } else {
        try {
          const dbSubs = await loadSubtitles(jobId);
          if (dbSubs.length > 0) {
            load(dbSubs);
            localStorage.setItem(`subtitles_${jobId}`, JSON.stringify(dbSubs));
          }
        } catch (e) {
          console.warn("No subtitles found for job", jobId, e.message);
        }
      }
      setLoading(false);
    }
    loadJobData();
  }, [jobId]);

  const totalDuration = useMemo(() => {
    if (!subtitles.length) return 12;
    return subtitles[subtitles.length - 1].end + 1;
  }, [subtitles]);

  const fullTranscript = useMemo(() => {
    return subtitles.map((s) => s.text).join(" ");
  }, [subtitles]);

  const handleScriptChange = (mode) => {
    setScriptMode(mode);
    const original = localStorage.getItem(`subtitles_${jobId}_original`);
    const source = original ? JSON.parse(original) : subtitles;
    if (!original) {
      localStorage.setItem(`subtitles_${jobId}_original`, JSON.stringify(subtitles));
    }
    const converted = convertSubtitles(source, mode);
    load(converted);
    push(
      `Switched to ${mode === "roman" ? "Roman Hinglish" : mode === "native" ? "Native Script" : "English"} script`,
    );
  };

  const handleGenerateHook = async () => {
    if (!fullTranscript.trim()) {
      push("No transcript available to generate a hook");
      return;
    }
    setGeneratingHook(true);
    try {
      const result = await generateHook({ data: { transcript: fullTranscript } });
      if (result.ok && result.hook) {
        setGeneratedHook(result.hook);
      } else {
        push("Hook generation failed: " + (result.error || "Unknown error"));
      }
    } catch (e) {
      push("Hook generation error: " + e.message);
    } finally {
      setGeneratingHook(false);
    }
  };

  const applyHook = () => {
    if (!generatedHook || !subtitles.length) return;
    const hookSub = { ...subtitles[0], text: generatedHook };
    const past = useEditorStore.getState().subtitles;
    useEditorStore.setState({
      subtitles: [hookSub, ...subtitles.slice(1)],
      past: [...useEditorStore.getState().past, past],
      future: [],
    });
    setHookModal(false);
    setGeneratedHook(null);
    push("Hook applied to first caption segment");
  };

  const drawWatermark = (ctx, canvas) => {
    ctx.save();
    ctx.font = "14px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.textAlign = "right";
    ctx.fillText("SubAI", canvas.width - 16, canvas.height - 12);
    ctx.restore();
  };

  const handleExport = async () => {
    setExporting(true);
    let cancelled = false;
    push("Preparing video export...");
    try {
      let videoEl = videoRef.current || document.querySelector("video");
      if (!videoEl && videoUrl) {
        videoEl = document.createElement("video");
        videoEl.src = videoUrl;
        videoEl.crossOrigin = "anonymous";
        await Promise.race([
          new Promise((r) => {
            videoEl.onloadeddata = r;
          }),
          new Promise((_, rej) => setTimeout(() => rej(new Error("Video load timeout")), 10000)),
        ]);
        if (cancelled) return;
      }
      if (!videoEl) throw new Error("No video available.");
      videoEl.currentTime = 0;
      await Promise.race([
        new Promise((r) => {
          videoEl.onseeked = r;
        }),
        new Promise((_, rej) => setTimeout(() => rej(new Error("Seek timeout")), 3000)),
      ]);
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth || 1080;
      canvas.height = videoEl.videoHeight || 1920;
      const ctx = canvas.getContext("2d");
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${job?.title || "captioned"}-captioned.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setExporting(false);
        push("Export complete!");
      };
      videoEl.currentTime = 0;
      recorder.start();
      videoEl.play();
      const fontSize = Math.round(canvas.height * 0.04);
      const drawFrame = () => {
        if (cancelled) {
          recorder.stop();
          return;
        }
        if (videoEl.paused || videoEl.ended) {
          recorder.stop();
          return;
        }
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const currentSubs = useEditorStore.getState().subtitles;
        const activeSub = currentSubs.find(
          (s) => videoEl.currentTime >= s.start && videoEl.currentTime <= s.end,
        );
        if (activeSub) {
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.fillStyle = preset?.color || "white";
          ctx.strokeStyle = "rgba(0,0,0,0.8)";
          ctx.lineWidth = Math.round(fontSize * 0.12);
          ctx.strokeText(activeSub.text, canvas.width / 2, canvas.height * 0.8);
          ctx.fillText(activeSub.text, canvas.width / 2, canvas.height * 0.8);
        }
        if (IS_FREE_TIER) {
          drawWatermark(ctx, canvas);
        }
        requestAnimationFrame(drawFrame);
      };
      drawFrame();
    } catch (e) {
      setExporting(false);
      push("Export failed: " + e.message);
    }
  };

  const handleSRTExport = () => {
    const lines = subtitles.map((s, i) => {
      const start = new Date(s.start * 1000).toISOString().substring(11, 23).replace(".", ",");
      const end = new Date(s.end * 1000).toISOString().substring(11, 23).replace(".", ",");
      return `${i + 1}\n${start} --> ${end}\n${s.text}\n`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${job.title || "subtitles"}.srt`;
    a.click();
    URL.revokeObjectURL(url);
    push("SRT downloaded!");
  };

  const handleSEOExport = useCallback(() => {
    const title = job.title || "Untitled Video";
    const transcriptLines = subtitles.map((s) => {
      return `[${fmt(s.start)} - ${fmt(s.end)}] ${s.text}`;
    });
    const lang = job.language || "hinglish";
    const content = [
      title,
      "",
      "Full Transcript with Timestamps:",
      ...transcriptLines,
      "",
      "Tags",
      `#${lang} #subtitles #captions #video #content #SubAI`,
      "",
      "Generated with SubAI — AI-powered captioning",
    ].join("\n");
    const sanitized = title.replace(/[^a-zA-Z0-9]/g, "_");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitized}_SEO_description.txt`;
    a.click();
    URL.revokeObjectURL(url);
    push("SEO description downloaded!");
  }, [job, subtitles, push]);

  const handleSaveBrandKit = useCallback(() => {
    const kit = {
      id: crypto.randomUUID(),
      name: preset.name,
      presetId: preset.id,
      font: preset.font,
      color: preset.color,
      bg: preset.bg,
      stroke: preset.stroke,
    };
    const updated = [...brandKits, kit];
    setBrandKits(updated);
    localStorage.setItem("brandKits", JSON.stringify(updated));
    push(`"${kit.name}" saved to Brand Kit`);
  }, [preset, brandKits, push]);

  const handleApplyBrandKit = useCallback(
    (kit) => {
      const match = PRESETS.find((p) => p.id === kit.presetId);
      if (match) {
        setPresetId(match.id);
        push(`Applied "${kit.name}" brand kit`);
      } else {
        push(`Could not apply "${kit.name}" — preset not found`);
      }
    },
    [push],
  );

  const handleDeleteBrandKit = useCallback(
    (id) => {
      const updated = brandKits.filter((k) => k.id !== id);
      setBrandKits(updated);
      localStorage.setItem("brandKits", JSON.stringify(updated));
      push("Brand kit deleted");
    },
    [brandKits, push],
  );

  const handleTranslate = useCallback(() => {
    if (!translateLang) {
      push("Select a language first");
      return;
    }
    const lang = INDIAN_LANGUAGES.find((l) => l.code === translateLang);
    push(`Translate to ${lang.name} (${lang.native}) — feature coming soon`);
    setTranslateModal(false);
    setTranslateLang(null);
  }, [translateLang, push]);

  if (notFound) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 16,
          background: "#09090b",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 800, color: "#27272a" }}>404</div>
        <div style={{ fontSize: 14, color: "#71717a" }}>Project not found</div>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          style={{
            marginTop: 8,
            padding: "8px 20px",
            borderRadius: 8,
            background: "#f59e0b",
            color: "#000",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 10,
          background: "#09090b",
          color: "#fff",
        }}
      >
        <Loader2 size={18} className="animate-spin" style={{ color: "#f59e0b" }} />
        <span style={{ fontSize: 13, color: "#71717a" }}>Loading editor...</span>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* ── TOP BAR ──────────────────────────── */}
      <div className={styles.topbar}>
        <div className={styles.topLeft}>
          <Tooltip text="Back to dashboard">
            <button className={styles.backBtn} onClick={() => navigate({ to: "/dashboard" })}>
              <ArrowLeft size={15} />
            </button>
          </Tooltip>
          <Link to="/dashboard" className={styles.brand}>
            <div className={styles.brandDot} />
            SubAI
          </Link>
          <span style={{ color: "#52525b", fontSize: 13 }}>/</span>
          <span className={styles.projectName}>{job.title || "Editor"}</span>

          <div className={styles.resSwitcher}>
            {["1080p", "720p"].map((r) => (
              <button
                key={r}
                className={`${styles.resBtn} ${resolution === r ? styles.resBtnActive : ""}`}
                onClick={() => setResolution(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.topRight}>
          <Tooltip text="AI Hook Generator">
            <button className={styles.iconBtn} onClick={() => setHookModal(true)}>
              <Wand2 size={13} /> Hook
            </button>
          </Tooltip>
          <Tooltip text="Undo (Ctrl+Z)">
            <button className={styles.iconBtn} onClick={undo} disabled={!canUndo}>
              <Undo2 size={13} />
            </button>
          </Tooltip>
          <Tooltip text="Redo (Ctrl+Shift+Z)">
            <button className={styles.iconBtn} onClick={redo} disabled={!canRedo}>
              <Redo2 size={13} />
            </button>
          </Tooltip>
          <Tooltip text="Normalise Hinglish">
            <button
              className={styles.iconBtn}
              onClick={() => {
                runCleanup();
                push("AI cleanup applied — Hinglish normalised");
              }}
            >
              <Sparkles size={13} /> Cleanup
            </button>
          </Tooltip>
          <button className={styles.saveBtn}>
            <Save size={13} /> Save
          </button>
          <Tooltip text="Download SEO description for YouTube">
            <button className={styles.iconBtn} onClick={handleSEOExport}>
              <FileText size={13} /> SEO
            </button>
          </Tooltip>
          <Tooltip text="Download SRT subtitles">
            <button className={styles.srtBtn} onClick={handleSRTExport}>
              <Download size={13} /> SRT
            </button>
          </Tooltip>
          <Tooltip text="Translate captions to Indian languages">
            <button className={styles.iconBtn} onClick={() => setTranslateModal(true)}>
              <Languages size={13} /> Translate
            </button>
          </Tooltip>
          <button className={styles.exportBtn} onClick={handleExport} disabled={exporting}>
            {exporting ? (
              "Exporting…"
            ) : (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 5 5 12" />
                </svg>
                Export
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────── */}
      <div className={styles.body}>
        {/* ── LEFT: Captions ───────────────── */}
        <div className={styles.leftPanel}>
          <div className={styles.panelHeader}>
            <p className={styles.panelTitle}>Captions</p>
            <div className={styles.lineToggle}>
              {["1", "2"].map((n) => (
                <button
                  key={n}
                  className={`${styles.lineBtn} ${lineMode === n ? styles.lineBtnActive : ""}`}
                  onClick={() => setLineMode(n)}
                >
                  {n} {n === "1" ? "Line" : "Lines"}
                </button>
              ))}
            </div>
          </div>

          {/* Script Switcher */}
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: "8px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Languages size={12} style={{ color: "#71717a", marginRight: 4 }} />
            {[
              { key: "roman", label: "Roman" },
              { key: "native", label: "Native" },
              { key: "english", label: "English" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => handleScriptChange(s.key)}
                style={{
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: scriptMode === s.key ? 600 : 400,
                  background: scriptMode === s.key ? "rgba(250,204,21,0.15)" : "transparent",
                  color: scriptMode === s.key ? "#facc15" : "#71717a",
                  border:
                    scriptMode === s.key
                      ? "1px solid rgba(250,204,21,0.25)"
                      : "1px solid transparent",
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className={styles.captionList}>
            {subtitles.length === 0 ? (
              <EmptyState />
            ) : (
              subtitles.map((s, i) => (
                <div key={s.id} className={styles.captionRow}>
                  <div className={styles.captionRowHeader}>
                    <span className={styles.captionRowNum}>{i + 1}</span>
                    <span className={styles.captionTimes}>
                      {fmt(s.start)} → {fmt(s.end)}
                    </span>
                  </div>
                  {editingId === s.id ? (
                    <input
                      className={styles.captionInput}
                      value={s.text}
                      autoFocus
                      onChange={(e) => updateText(s.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingId(null);
                      }}
                    />
                  ) : (
                    <div className={styles.captionWords}>
                      {s.text.split(" ").map((word, wi) => (
                        <button
                          key={wi}
                          className={styles.captionWordChip}
                          onClick={() => setEditingId(s.id)}
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── CENTER: Preview ───────────────── */}
        <div className={styles.centerPanel}>
          <div className={styles.previewTopBar}>
            <div className={styles.aspectBtns}>
              {["Original", "9:16", "16:9", "1:1", "4:5"].map((a) => {
                const key = a === "Original" ? "original" : a.toLowerCase().replace(":", "");
                return (
                  <button
                    key={a}
                    className={`${styles.aspectBtn} ${aspect === key ? styles.aspectBtnActive : ""}`}
                    onClick={() => setAspect(key)}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
            <div className={styles.zoomControls}>
              <ZoomOut size={12} style={{ color: "#71717a" }} />
              <span>100%</span>
              <ZoomIn size={12} style={{ color: "#71717a" }} />
            </div>
          </div>

          <div className={styles.canvas}>
            <CaptionPlayer
              subtitles={subtitles}
              preset={preset}
              videoUrl={videoUrl}
              durationInFrames={Math.max(60, Math.ceil(totalDuration * 30))}
              controls
              autoPlay={false}
              loop
              resolution={resolution}
              aspect={aspect}
              lineMode={lineMode}
            />
          </div>
        </div>

        {/* ── RIGHT: Templates + Brand Kit ─── */}
        <div className={styles.rightPanel}>
          <div className={styles.panelTabs}>
            {["text", "templates", "brand"].map((tab) => (
              <button
                key={tab}
                className={`${styles.panelTab} ${panelTab === tab ? styles.panelTabActive : ""}`}
                onClick={() => setPanelTab(tab)}
              >
                {tab === "brand" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Palette size={12} /> Brand
                  </span>
                ) : (
                  tab.charAt(0).toUpperCase() + tab.slice(1)
                )}
              </button>
            ))}
          </div>

          {panelTab === "brand" ? (
            <div className={styles.templatesBody}>
              <button className={styles.savePresetBtn} onClick={handleSaveBrandKit}>
                <BookmarkPlus size={13} />
                Save Current as Kit
              </button>

              <div className={styles.dynamicLabel}>My Kits</div>

              {brandKits.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 0",
                    fontSize: 11,
                    color: "#52525b",
                    lineHeight: 1.6,
                  }}
                >
                  <Palette size={28} style={{ color: "#27272a", marginBottom: 8 }} />
                  <div>No saved brand kits yet</div>
                  <div>Save your current preset as a kit</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {brandKits.map((kit) => (
                    <div
                      key={kit.id}
                      style={{
                        background: "#17171b",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 10,
                        padding: "10px 12px",
                        transition: "border-color 0.15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                          {kit.name}
                        </span>
                        <Tooltip text="Delete kit">
                          <button
                            onClick={() => handleDeleteBrandKit(kit.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#52525b",
                              cursor: "pointer",
                              padding: 2,
                              borderRadius: 4,
                              display: "flex",
                              transition: "color 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
                          >
                            <Trash2 size={12} />
                          </button>
                        </Tooltip>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            background: kit.color,
                            border: "1px solid rgba(255,255,255,0.1)",
                            flexShrink: 0,
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            fontSize: 11,
                            color: "#71717a",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {kit.font}
                        </div>
                      </div>
                      <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
                        {kit.bg && kit.bg !== "transparent" && (
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 3,
                              background: kit.bg,
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          />
                        )}
                      </div>
                      <button
                        onClick={() => handleApplyBrandKit(kit)}
                        style={{
                          width: "100%",
                          marginTop: 8,
                          padding: "5px 0",
                          borderRadius: 6,
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.2)",
                          color: "#f59e0b",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "rgba(245,158,11,0.2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "rgba(245,158,11,0.1)")
                        }
                      >
                        Apply Kit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.templatesBody}>
              <div className={styles.subTabRow}>
                <button
                  className={`${styles.subTab} ${subTab === "builtin" ? styles.subTabActive : ""}`}
                  onClick={() => setSubTab("builtin")}
                >
                  Built-in Templates
                </button>
                <button
                  className={`${styles.subTab} ${subTab === "presets" ? styles.subTabActive : ""}`}
                  onClick={() => setSubTab("presets")}
                >
                  My Presets
                </button>
              </div>

              <div className={styles.searchRow}>
                <Search size={12} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  placeholder="Find a template"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button className={styles.savePresetBtn} onClick={handleSaveBrandKit}>
                <BookmarkPlus size={13} />
                Save Preset
              </button>

              <div className={styles.dynamicLabel}>Dynamic Captions</div>

              <div className={styles.templateCards}>
                {PRESETS.filter(
                  (p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()),
                ).map((p) => (
                  <button
                    key={p.id}
                    className={`${styles.templateCard} ${presetId === p.id ? styles.templateCardActive : ""}`}
                    onClick={() => setPresetId(p.id)}
                  >
                    <div className={styles.templateCardName}>
                      {p.name}
                      {p.id === "beast" && (
                        <span className={styles.hotBadge}>
                          <Flame size={9} /> Popular
                        </span>
                      )}
                      {p.id === "karaoke" && <span className={styles.newBadge}>New</span>}
                    </div>
                    <div
                      className={styles.templatePreview}
                      style={{ background: p.bg || "#111", color: p.color }}
                    >
                      <span
                        style={{ fontSize: 9, color: "#71717a", display: "block", marginBottom: 2 }}
                      >
                        the quick
                      </span>
                      <strong style={{ fontSize: 16, letterSpacing: "-0.02em", color: p.color }}>
                        {p.name.split(" ")[0].toUpperCase()}
                      </strong>
                      <span
                        style={{ fontSize: 9, color: "#71717a", display: "block", marginTop: 2 }}
                      >
                        fox jumps
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TIMELINE ──────────────────────────── */}
      <div className={styles.timeline}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Timeline
            subtitles={subtitles}
            currentTime={currentTime}
            totalDuration={totalDuration || 30}
            onSeek={(t) => {
              setCurrentTime(t);
            }}
            onUpdateSegment={(id, start, end) => {
              if (typeof start === "number") updateSegmentTime(id, "start", start);
              if (typeof end === "number") updateSegmentTime(id, "end", end);
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <button className={styles.transportBtn} onClick={() => setCurrentTime(0)}>
            <SkipBack size={12} />
          </button>
          <button className={styles.playBtn} onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause size={11} /> : <Play size={11} />}
          </button>
          <button className={styles.transportBtn} onClick={() => setCurrentTime(totalDuration)}>
            <SkipForward size={12} />
          </button>
          <span className={styles.timecode}>
            {fmt(currentTime)} / {fmt(totalDuration)}
          </span>
        </div>
      </div>

      {/* ── AI Hook Generator Modal ─────────── */}
      {hookModal && (
        <div
          style={overlayBase}
          onClick={() => {
            setHookModal(false);
            setGeneratedHook(null);
          }}
        >
          <div style={modalBase} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(250,204,21,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Wand2 size={16} style={{ color: "#facc15" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff" }}>
                  AI Hook Generator
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: "#71717a" }}>
                  Rewrite your opening 30 seconds
                </p>
              </div>
              <button
                onClick={() => {
                  setHookModal(false);
                  setGeneratedHook(null);
                }}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  color: "#71717a",
                  cursor: "pointer",
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} />
              </button>
            </div>

            {!generatedHook ? (
              <div>
                <p style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 12, lineHeight: 1.5 }}>
                  Your opening hook decides everything. AI analyzes your transcript and rewrites the
                  first line to maximize retention.
                </p>
                <div
                  style={{
                    background: "#09090b",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    fontSize: 12,
                    color: "#71717a",
                    maxHeight: 120,
                    overflow: "auto",
                    lineHeight: 1.6,
                  }}
                >
                  <div
                    style={{
                      color: "#a1a1aa",
                      fontSize: 10,
                      fontWeight: 600,
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Current Transcript
                  </div>
                  {fullTranscript.slice(0, 300)}
                  {fullTranscript.length > 300 ? "…" : ""}
                </div>
                <button
                  onClick={handleGenerateHook}
                  disabled={generatingHook}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    borderRadius: 10,
                    background: generatingHook ? "#27272a" : "#facc15",
                    color: generatingHook ? "#71717a" : "#000",
                    fontSize: 13,
                    fontWeight: 700,
                    border: "none",
                    cursor: generatingHook ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  {generatingHook ? "Generating..." : "Generate Hook"}
                </button>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    background: "rgba(250,204,21,0.08)",
                    border: "1px solid rgba(250,204,21,0.2)",
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      color: "#facc15",
                      fontSize: 10,
                      fontWeight: 600,
                      marginBottom: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    AI Generated Hook
                  </div>
                  <p
                    style={{
                      fontSize: 15,
                      color: "#fff",
                      fontWeight: 600,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    "{generatedHook}"
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={applyHook}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 10,
                      background: "#facc15",
                      color: "#000",
                      fontSize: 13,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    Apply Hook
                  </button>
                  <button
                    onClick={handleGenerateHook}
                    disabled={generatingHook}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.06)",
                      color: "#a1a1aa",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setHookModal(false);
                setGeneratedHook(null);
              }}
              style={{
                width: "100%",
                marginTop: 8,
                padding: "8px 0",
                borderRadius: 10,
                background: "transparent",
                color: "#71717a",
                fontSize: 12,
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Translate Modal ───────────────────── */}
      {translateModal && (
        <div
          style={overlayBase}
          onClick={() => {
            setTranslateModal(false);
            setTranslateLang(null);
          }}
        >
          <div style={modalBase} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(59,130,246,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Languages size={16} style={{ color: "#3b82f6" }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff" }}>
                  Auto-Translate
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: "#71717a" }}>
                  Select a target Indian language
                </p>
              </div>
              <button
                onClick={() => {
                  setTranslateModal(false);
                  setTranslateLang(null);
                }}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  color: "#71717a",
                  cursor: "pointer",
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {INDIAN_LANGUAGES.map((lang) => {
                const selected = translateLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setTranslateLang(lang.code)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: selected ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)",
                      border: selected
                        ? "1px solid rgba(59,130,246,0.35)"
                        : "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.target.style.background = "rgba(255,255,255,0.06)";
                        e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.target.style.background = "rgba(255,255,255,0.03)";
                        e.target.style.borderColor = "rgba(255,255,255,0.06)";
                      }
                    }}
                  >
                    {selected && (
                      <div
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: "#3b82f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={10} strokeWidth={3} style={{ color: "#fff" }} />
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>
                      {lang.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#71717a" }}>{lang.native}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setTranslateModal(false);
                  setTranslateLang(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.06)",
                  color: "#a1a1aa",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleTranslate}
                disabled={!translateLang}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  background: translateLang ? "#3b82f6" : "#27272a",
                  color: translateLang ? "#fff" : "#71717a",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: translateLang ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Languages size={14} />
                Translate to selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toasts ───────────────────────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 200,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: "rgba(24,24,27,0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "10px 16px",
              fontSize: 13,
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              pointerEvents: "auto",
              animation: "slideIn 0.25s ease-out",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Check size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
            {t.msg}
          </div>
        ))}
      </div>

      {/* Inline keyframes for toast animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .${styles.wordChip}:hover {
          background: rgba(245,158,11,0.3) !important;
        }
      `}</style>
    </div>
  );
}
