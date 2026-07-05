import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video } from "remotion";

// A Remotion composition that renders the real uploaded video + word-by-word highlighted
// subtitles based on the current frame time. Subtitles use { start, end, text } in seconds.
export function CaptionComposition({ subtitles = [], preset, background = "#09090b", videoUrl }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const active = subtitles.find((s) => t >= s.start && t < s.end);
  const words = active ? active.text.split(" ") : [];
  const activeDur = active ? active.end - active.start : 1;
  const progress = active ? (t - active.start) / activeDur : 0;
  const activeWordIdx = Math.min(
    words.length - 1,
    Math.floor(progress * words.length),
  );

  const p = preset || {
    font: "800 44px Inter, sans-serif",
    color: "#facc15",
    stroke: "#000000",
    bg: "transparent",
  };

  return (
    <AbsoluteFill
      style={{
        background,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 80,
      }}
    >
      {/* Real video background — only shown when a real video URL is provided */}
      {videoUrl ? (
        <AbsoluteFill>
          <Video
            src={videoUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      ) : (
        <>
          {/* Fallback: Ambient dot grid placeholder */}
          <AbsoluteFill
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              opacity: 0.6,
            }}
          />
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: 40,
            }}
          >
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 30%, rgba(250,204,21,0.25), transparent 70%)",
                filter: "blur(20px)",
              }}
            />
          </AbsoluteFill>
        </>
      )}

      {active && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            maxWidth: "80%",
            padding: p.bg && p.bg !== "transparent" ? "12px 22px" : 0,
            background: p.bg,
            borderRadius: 12,
          }}
        >
          {words.map((w, i) => {
            const isActive = i === activeWordIdx;
            return (
              <span
                key={i}
                style={{
                  font: p.font,
                  color: isActive ? p.color : "rgba(255,255,255,0.55)",
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                  transition: "transform 0.12s ease, color 0.12s ease",
                  WebkitTextStroke:
                    p.stroke && p.stroke !== "transparent"
                      ? `2px ${p.stroke}`
                      : undefined,
                  textShadow: isActive
                    ? "0 4px 20px rgba(250,204,21,0.35)"
                    : "none",
                  letterSpacing: "-0.01em",
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
}
