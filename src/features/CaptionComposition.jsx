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
    font: "Inter, system-ui, sans-serif",
    color: "#facc15",
    stroke: "#000000",
    bg: "transparent",
    weight: 800,
    shadow: "none",
    letterSpacing: "0.02em",
    case: "none",
    italic: false,
  };

  const textTransform =
    p.case === "uppercase" ? "uppercase" :
    p.case === "lowercase" ? "lowercase" : "none";

  return (
    <AbsoluteFill
      style={{
        background,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 80,
      }}
    >
      {videoUrl ? (
        <AbsoluteFill>
          <Video
            src={videoUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      ) : (
        <>
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
                  fontFamily: p.font,
                  fontWeight: p.weight,
                  fontStyle: p.italic ? "italic" : "normal",
                  fontSize: 36,
                  color: isActive ? p.color : "rgba(255,255,255,0.55)",
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                  transition: "transform 0.12s ease, color 0.12s ease",
                  WebkitTextStroke:
                    p.stroke && p.stroke !== "transparent"
                      ? `2px ${p.stroke}`
                      : undefined,
                  textShadow:
                    isActive
                      ? p.shadow && p.shadow !== "none"
                        ? p.shadow
                        : "0 4px 20px rgba(250,204,21,0.35)"
                      : "none",
                  letterSpacing: p.letterSpacing || "0.01em",
                  textTransform,
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
