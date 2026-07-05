import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import styles from "./Home.module.css";
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import { Button } from "../ui/Button";
import { CaptionPlayer } from "../features/CaptionPlayer";
import { MOCK_SUBTITLES, PRESETS } from "../features/mockData";

export const Route = createFileRoute("/")({
  ssr: false,
  component: HomePage,
});

const HERO_SUBS = MOCK_SUBTITLES["job-hinglish-reel"];

const FEATURES = [
  {
    icon: "⚡",
    title: "Browser-native performance",
    desc: "Remotion renders your captions frame-accurately on a canvas. No servers, no waiting.",
  },
  {
    icon: "🧠",
    title: "Free Groq AI execution",
    desc: "Whisper-large-v3 transcription + Llama-3 Hinglish cleanup, all on Groq's free tier.",
  },
  {
    icon: "🎨",
    title: "Custom style templates",
    desc: "Preset caption looks tuned for Reels, Shorts and podcasts. Fully editable.",
  },
];

function HomePage() {
  const [preset, setPreset] = useState(PRESETS[0]);
  return (
    <div className={styles.page}>
      <NavBar />

      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>
            <span>●</span> Built for Indian creators · Hindi · English · Hinglish
          </div>
          <h1 className={styles.headline}>
            AI captions that speak <em>your</em> language.
          </h1>
          <p className={styles.sub}>
            SubAI is a browser-native caption studio for creators shipping Reels,
            Shorts and Podcasts. Word-by-word highlights, Hinglish-aware cleanup,
            and a timeline editor that feels like a real workbench.
          </p>
          <div className={styles.ctaRow}>
            <Link to="/signup">
              <Button size="lg">Start creating free</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg">
                Open dashboard
              </Button>
            </Link>
          </div>
          <div className={styles.stats}>
            <div>
              <b>100%</b> Free tier stack
            </div>
            <div>
              <b>3</b> Languages supported
            </div>
            <div>
              <b>0ms</b> Server round-trip
            </div>
          </div>
        </div>
        <div className={styles.heroPreview}>
          <CaptionPlayer
            subtitles={HERO_SUBS}
            preset={preset}
            durationInFrames={330}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why creators pick SubAI</h2>
        <p className={styles.sectionSub}>
          Everything that makes captions great — nothing that slows you down.
        </p>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.feature}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} id="presets">
        <h2 className={styles.sectionTitle}>Preset styles, ready to ship</h2>
        <p className={styles.sectionSub}>
          Tap a preset to preview it live in the canvas.
        </p>
        <div className={styles.presetPanel}>
          <div className={styles.presetList}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p)}
                className={`${styles.presetBtn} ${
                  preset.id === p.id ? styles.presetBtnActive : ""
                }`}
              >
                <span className={styles.presetName}>{p.name}</span>
                <span className={styles.presetHint}>
                  {preset.id === p.id ? "Playing" : "Try"}
                </span>
              </button>
            ))}
          </div>
          <div className={styles.presetPreview}>
            <CaptionPlayer
              subtitles={HERO_SUBS}
              preset={preset}
              durationInFrames={330}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
