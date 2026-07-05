import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import styles from "./Dashboard.module.css";
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import { Button } from "../ui/Button";
import { MOCK_JOBS } from "../features/mockData";
import { ToastProvider, useToast } from "../ui/Toast";
import { useAuthStore } from "../lib/authStore";
import {
  fetchJobs,
  createJob,
  completeJob,
  uploadVideo,
  saveSubtitles,
} from "../lib/jobsService";
import { extractVideoFrame } from "../lib/grok";
import { analyzeWithGrokServer, transcribeVideo } from "../lib/grokServer";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  component: () => (
    <ToastProvider>
      <DashboardPage />
    </ToastProvider>
  ),
});

function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();
  const { push } = useToast();

  const [jobs, setJobs] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ─── Auth guard ───────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  // ─── Load jobs from Supabase ──────────────────────────────
  const loadJobs = useCallback(async () => {
    try {
      const data = await fetchJobs();
      // If the user has real jobs, show them; else fall back to mock data for demo
      setJobs(data.length > 0 ? data : MOCK_JOBS);
    } catch {
      setJobs(MOCK_JOBS);
    }
  }, []);

  useEffect(() => {
    if (user) loadJobs();
  }, [user, loadJobs]);

  // ─── File upload handler ──────────────────────────────────
  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    const file = files[0];
    setUploading(true);
    push(`Uploading ${file.name}…`);

    try {
      // 1. Upload to Supabase Storage
      const storageKey = await uploadVideo(file);

      // 2. Try Grok Vision analysis on a frame
      let aiDescription = null;
      try {
        push("🧠 Analyzing with Grok Vision AI…");
        const videoEl = document.createElement("video");
        videoEl.src = URL.createObjectURL(file);
        videoEl.muted = true;
        videoEl.preload = "auto";
        await new Promise((r) => {
          videoEl.onloadeddata = r;
          setTimeout(r, 3000); // fallback
        });
        const frame = await extractVideoFrame(videoEl, 1);
        const result = await analyzeWithGrokServer({ imageBase64: frame });
        if (result.ok && result.description) {
          aiDescription = result.description;
          push(`✨ AI: "${aiDescription}"`);
        }
        URL.revokeObjectURL(videoEl.src);
      } catch (grokErr) {
        console.warn("Grok Vision analysis skipped:", grokErr.message);
      }

      // 3. Transcription using Groq Whisper (base64 to survive JSON serialisation)
      let extractedSubtitles = [];
      try {
        push("🎙️ Transcribing audio with Groq Whisper...");

        // Read file as ArrayBuffer then convert to base64
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryStr = "";
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          binaryStr += String.fromCharCode(...uint8Array.subarray(i, i + chunkSize));
        }
        const audioBase64 = btoa(binaryStr);

        const transRes = await transcribeVideo({
          audioBase64,
          mimeType: file.type || "audio/mp4",
          fileName: file.name,
        });

        if (transRes.ok && transRes.subtitles.length > 0) {
          extractedSubtitles = transRes.subtitles;
          push(`✅ Transcription complete: ${extractedSubtitles.length} caption segments`);
        } else {
          console.warn("Transcription result:", transRes);
          push(`⚠️ Transcription: ${transRes.error || "no speech detected"}`);
        }
      } catch (err) {
        console.warn("Transcription error:", err.message);
        push("⚠️ Transcription skipped: " + err.message);
      }


      // 4. Create job in Supabase
      const title = file.name.replace(/\.[^.]+$/, "");
      const job = await createJob({
        title,
        language: "english", // Groq typically detects/outputs english
        storageKey,
        aiDescription,
      });

      // Save extracted subtitles to localStorage for the editor to pick up
      if (extractedSubtitles.length > 0) {
        localStorage.setItem(`subtitles_${job.id}`, JSON.stringify(extractedSubtitles));
        // Also persist to Supabase for cross-device access
        saveSubtitles(job.id, extractedSubtitles).catch(console.warn);
      }

      // 4. Simulate processing completion
      setJobs((prev) => [
        {
          ...job,
          thumbColor: job.thumb_color,
          createdAt: "Just now",
          duration: "—",
        },
        ...prev,
      ]);

      setTimeout(async () => {
        await completeJob(job.id);
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id ? { ...j, status: "completed" } : j,
          ),
        );
        push("Transcription complete. Ready to edit.");
      }, 2200);
    } catch (err) {
      push(`Upload failed: ${err.message}`);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.wrap}>
        <NavBar />
        <div className={styles.container}>
          <p style={{ textAlign: "center", padding: 80, color: "var(--text-tertiary)" }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.head}>
          <div>
            <h1>Your captions studio</h1>
            <p>Drop a video, tweak the captions, ship the reel.</p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: "/editor/job-hinglish-reel" })}>
            Open sample editor →
          </Button>
        </div>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <div className={styles.label}>Total minutes processed</div>
            <div className={styles.value}>
              {jobs.length * 1.4 | 0}<span style={{ color: "var(--text-tertiary)", fontSize: 16, fontWeight: 500 }}> min</span>
            </div>
            <div className={styles.delta}>+3 this week</div>
          </div>
          <div className={styles.metric}>
            <div className={styles.label}>Active subtitles generated</div>
            <div className={styles.value}>{jobs.length * 24}</div>
            <div className={styles.delta}>Across {jobs.length} projects</div>
          </div>
          <div className={styles.metric}>
            <div className={styles.label}>Free tier budget</div>
            <div className={styles.value}>92<span style={{ color: "var(--text-tertiary)", fontSize: 16, fontWeight: 500 }}>%</span></div>
            <div className={styles.delta}>Groq + Supabase</div>
          </div>
        </div>

        <div
          className={`${styles.drop} ${dragging ? styles.hover : ""}`}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => document.getElementById("video-upload").click()}
        >
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <h3>{uploading ? "Uploading…" : "Drop a video to caption"}</h3>
          <p>MP4, MOV or WebM · uploads go to your Supabase Storage bucket</p>
          <Button variant="outline" size="sm" type="button" disabled={uploading} style={{ pointerEvents: "none" }}>
            Choose file
          </Button>
        </div>

        <div className={styles.gridHead}>
          <h2>Recent projects</h2>
          <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>
            {jobs.length} total
          </span>
        </div>

        <div className={styles.jobs}>
          {jobs.map((job) => (
            <Link
              key={job.id}
              to="/editor/$jobId"
              params={{ jobId: job.id }}
              className={styles.job}
            >
              <div
                className={styles.thumb}
                style={{ color: job.thumbColor || job.thumb_color }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>▶</span>
              </div>
              <div>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                {job.ai_description && (
                  <p style={{ color: "var(--text-tertiary)", fontSize: 12, margin: "4px 0 0" }}>
                    🧠 {job.ai_description}
                  </p>
                )}
                <div className={styles.jobMeta} style={{ marginTop: 8 }}>
                  <span>
                    {job.language} · {job.duration || "—"}
                  </span>
                  <span
                    className={`${styles.badge} ${
                      job.status === "completed"
                        ? styles.badgeCompleted
                        : styles.badgeProcessing
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
