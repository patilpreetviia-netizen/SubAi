import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import styles from "./Editor.module.css";
import { Button } from "../ui/Button";
import { CaptionPlayer } from "../features/CaptionPlayer";
import { useEditorStore } from "../features/editorStore";
import { MOCK_JOBS, MOCK_SUBTITLES, PRESETS } from "../features/mockData";
import { ToastProvider, useToast } from "../ui/Toast";
import { getVideoUrl, loadSubtitles } from "../lib/jobsService";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/editor/$jobId")({
  ssr: false,
  component: () => (
    <ToastProvider>
      <EditorPage />
    </ToastProvider>
  ),
});

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = (s - m * 60).toFixed(1).padStart(4, "0");
  return `${m}:${sec}`;
};

function EditorPage() {
  const { jobId } = useParams({ from: "/editor/$jobId" });

  // Try to find a real job from Supabase; fall back to mock
  const [job, setJob] = useState(MOCK_JOBS.find((j) => j.id === jobId) || MOCK_JOBS[0]);
  const [videoUrl, setVideoUrl] = useState(null);

  const subtitles = useEditorStore((s) => s.subtitles);
  const load = useEditorStore((s) => s.load);
  const updateText = useEditorStore((s) => s.updateText);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const runCleanup = useEditorStore((s) => s.runCleanup);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);

  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const preset = PRESETS.find((p) => p.id === presetId);
  const { push } = useToast();

  // Load job data from Supabase (for real uploaded videos)
  useEffect(() => {
    async function loadJobData() {
      try {
        const { data } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (data) {
          setJob(data);

          // Get signed URL for the video
          if (data.storage_key) {
            try {
              const url = await getVideoUrl(data.storage_key);
              setVideoUrl(url);
            } catch (e) {
              console.warn("Could not get video URL:", e.message);
            }
          }
        }
      } catch (e) {
        console.warn("Could not load job from Supabase, using mock:", e.message);
      }

      // Load subtitles — localStorage cache first, then Supabase, then mock fallback
      const storedSubs = localStorage.getItem(`subtitles_${jobId}`);
      if (storedSubs) {
        load(JSON.parse(storedSubs));
      } else {
        try {
          const dbSubs = await loadSubtitles(jobId);
          if (dbSubs.length > 0) {
            load(dbSubs);
            localStorage.setItem(`subtitles_${jobId}`, JSON.stringify(dbSubs));
          } else {
            const mockSubs = MOCK_SUBTITLES[jobId] || MOCK_SUBTITLES["job-hinglish-reel"];
            load(mockSubs);
          }
        } catch {
          const mockSubs = MOCK_SUBTITLES[jobId] || MOCK_SUBTITLES["job-hinglish-reel"];
          load(mockSubs);
        }
      }
    }
    loadJobData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const totalDuration = useMemo(() => {
    if (!subtitles.length) return 12;
    return subtitles[subtitles.length - 1].end + 1;
  }, [subtitles]);

  const onCleanup = () => {
    runCleanup();
    push("Groq AI cleanup applied — Hinglish normalized");
  };

  const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
    setExporting(true);
    push("Preparing video export... please wait");

    try {
      // Use Remotion player's video element if available, or create a fresh one from the signed URL
      let videoEl = document.querySelector("video");

      if (!videoEl && videoUrl) {
        videoEl = document.createElement("video");
        videoEl.src = videoUrl;
        videoEl.crossOrigin = "anonymous";
        await new Promise((r, reject) => {
          videoEl.onloadeddata = r;
          videoEl.onerror = reject;
          setTimeout(r, 5000);
        });
      }

      if (!videoEl) throw new Error("No video available. Upload a video first.");

      // Set up canvas matching video dimensions
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth || 1080;
      canvas.height = videoEl.videoHeight || 1920;
      const ctx = canvas.getContext("2d");

      // Capture canvas stream at 30fps
      const stream = canvas.captureStream(30);

      // Add audio from video
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        const sourceNode = audioCtx.createMediaElementSource(videoEl);
        sourceNode.connect(dest);
        sourceNode.connect(audioCtx.destination);
        dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
      } catch (audioErr) {
        console.warn("Audio capture failed (CORS?):", audioErr.message);
      }

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
        a.download = `${(job.title || "captioned")}-captioned.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setExporting(false);
        push("✅ Export complete! Check your downloads.");
      };

      // Seek to beginning and start recording
      videoEl.currentTime = 0;
      videoEl.muted = false;
      await new Promise((r) => {
        videoEl.onseeked = r;
        setTimeout(r, 500);
      });

      recorder.start();
      videoEl.play();

      // Font size relative to canvas height for responsive text
      const fontSize = Math.round(canvas.height * 0.04);

      const drawFrame = () => {
        if (videoEl.paused || videoEl.ended) {
          recorder.stop();
          return;
        }
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        // Overlay the active subtitle
        const currentSubs = useEditorStore.getState().subtitles;
        const activeSub = currentSubs.find(
          (s) => videoEl.currentTime >= s.start && videoEl.currentTime <= s.end,
        );
        if (activeSub) {
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          // Semi-transparent black background pill
          const textWidth = ctx.measureText(activeSub.text).width;
          ctx.fillStyle = "rgba(0,0,0,0.55)";
          ctx.beginPath();
          ctx.roundRect(
            canvas.width / 2 - textWidth / 2 - 20,
            canvas.height * 0.8 - fontSize * 0.75,
            textWidth + 40,
            fontSize * 1.5,
            12,
          );
          ctx.fill();
          // Text color matches preset
          ctx.fillStyle = presetId === "p-beast" ? "#facc15" : "white";
          ctx.strokeStyle = "rgba(0,0,0,0.8)";
          ctx.lineWidth = Math.round(fontSize * 0.12);
          ctx.strokeText(activeSub.text, canvas.width / 2, canvas.height * 0.8);
          ctx.fillText(activeSub.text, canvas.width / 2, canvas.height * 0.8);
        }

        requestAnimationFrame(drawFrame);
      };

      drawFrame();
    } catch (e) {
      console.error(e);
      setExporting(false);
      push("Export failed: " + e.message);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <div className={styles.topLeft}>
          <Link to="/" className={styles.brand}>
            <span /> SubAI
          </Link>
          <span className={styles.crumb}>
            /<b>{job.title || "Editor"}</b>
          </span>
        </div>
        <div className={styles.topRight}>
          <button
            className={styles.iconBtn}
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
            aria-label="Undo"
          >
            ↶
          </button>
          <button
            className={styles.iconBtn}
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
            aria-label="Redo"
          >
            ↷
          </button>
          <Button variant="outline" size="sm" onClick={onCleanup}>
            ✨ Run Groq AI Cleanup
          </Button>
          <Button size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export .webm"}
          </Button>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.left}>
          <div className={styles.canvas}>
            <CaptionPlayer
              subtitles={subtitles}
              preset={preset}
              videoUrl={videoUrl}
              durationInFrames={Math.max(60, Math.ceil(totalDuration * 30))}
              controls
              autoPlay
              loop
            />
          </div>
          <div className={styles.presetRow}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPresetId(p.id)}
                className={`${styles.presetPill} ${
                  presetId === p.id ? styles.presetPillActive : ""
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <aside className={styles.right}>
          <div className={styles.rightHead}>
            <h3>Timeline &amp; subtitles</h3>
            <p>Type to update — canvas rewrites live.</p>
          </div>
          <div className={styles.grid}>
            {subtitles.map((s) => (
              <div key={s.id} className={styles.row}>
                <span className={styles.time}>{fmt(s.start)}</span>
                <input
                  className={styles.textInput}
                  value={s.text}
                  onChange={(e) => updateText(s.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
