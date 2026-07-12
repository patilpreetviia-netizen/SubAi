import { useRef, useCallback, useState, useEffect } from "react";

const PX_PER_SEC = 120;
const MIN_SEGMENT_PX = 20;
const SNAP_INTERVAL = 0.5;

function fmt(t) {
  if (t == null || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Timeline({ subtitles, currentTime, totalDuration, onSeek, onUpdateSegment }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [zoom, setZoom] = useState(1);

  const totalPx = totalDuration * PX_PER_SEC * zoom;
  const playheadPx = (currentTime / totalDuration) * totalPx;

  const snap = (val) => Math.round(val / SNAP_INTERVAL) * SNAP_INTERVAL;

  const handleTrackClick = useCallback(
    (e) => {
      if (dragging) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = (x / totalPx) * totalDuration;
      onSeek(Math.max(0, Math.min(time, totalDuration)));
    },
    [totalPx, totalDuration, onSeek, dragging],
  );

  const handleMouseDown = useCallback((e, sub, edge) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging({ id: sub.id, edge, startX: e.clientX, origStart: sub.start, origEnd: sub.end });
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e) => {
      const rect = trackRef.current.getBoundingClientRect();
      const dx = e.clientX - dragging.startX;
      const dt = (dx / totalPx) * totalDuration;

      let newStart = dragging.origStart;
      let newEnd = dragging.origEnd;

      if (dragging.edge === "start") {
        newStart = snap(Math.max(0, dragging.origStart + dt));
        if (newEnd - newStart < 0.3) newStart = newEnd - 0.3;
      } else if (dragging.edge === "end") {
        newEnd = snap(Math.min(totalDuration, dragging.origEnd + dt));
        if (newEnd - newStart < 0.3) newEnd = newStart + 0.3;
      } else {
        const dur = dragging.origEnd - dragging.origStart;
        newStart = snap(Math.max(0, dragging.origStart + dt));
        newEnd = Math.min(totalDuration, newStart + dur);
        if (newEnd > totalDuration) newStart = totalDuration - dur;
        if (newStart < 0) newStart = 0;
        newEnd = newStart + dur;
      }

      onUpdateSegment(dragging.id, Math.max(0, newStart), Math.min(totalDuration, newEnd));
    };

    const handleMouseUp = () => setDragging(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, totalPx, totalDuration, onUpdateSegment, snap]);

  const getSubLeft = (sub) => (sub.start / totalDuration) * totalPx;
  const getSubWidth = (sub) => ((sub.end - sub.start) / totalDuration) * totalPx;

  const rulerTicks = [];
  const tickInterval = Math.max(1, Math.floor(60 / ((PX_PER_SEC * zoom) / 60)));
  for (let t = 0; t <= totalDuration; t += tickInterval) {
    rulerTicks.push(t);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* Transport + zoom */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, color: "#a1a1aa", fontFamily: "monospace", minWidth: 48 }}>
          {fmt(currentTime)}
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            color: "#71717a",
            borderRadius: 5,
            width: 22,
            height: 22,
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          −
        </button>
        <span style={{ fontSize: 10, color: "#52525b", minWidth: 32, textAlign: "center" }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            color: "#71717a",
            borderRadius: 5,
            width: 22,
            height: 22,
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
        <span style={{ fontSize: 10, color: "#52525b", marginLeft: 8, fontFamily: "monospace" }}>
          {fmt(totalDuration)}
        </span>
      </div>

      {/* Ruler */}
      <div
        style={{
          height: 22,
          position: "relative",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            minWidth: "100%",
            width: totalPx,
          }}
        >
          {rulerTicks.map((t) => {
            const left = (t / totalDuration) * totalPx;
            const isMajor = t % (tickInterval * 5) === 0;
            return (
              <div
                key={t}
                style={{ position: "absolute", left, top: 0, bottom: 0, pointerEvents: "none" }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: 1,
                    height: isMajor ? 14 : 6,
                    background: "rgba(255,255,255,0.1)",
                  }}
                />
                {isMajor && (
                  <span
                    style={{
                      position: "absolute",
                      left: 3,
                      top: 1,
                      fontSize: 8,
                      color: "#52525b",
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmt(t)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        style={{
          flex: 1,
          position: "relative",
          overflow: "auto",
          cursor: "pointer",
          minHeight: 60,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            minWidth: "100%",
            width: totalPx,
          }}
        >
          {/* Background grid lines */}
          {Array.from({ length: Math.ceil(totalPx / 60) + 1 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: i * 60,
                top: 0,
                bottom: 0,
                width: 1,
                background: "rgba(255,255,255,0.02)",
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Segments */}
          {subtitles.map((sub) => {
            const left = getSubLeft(sub);
            const width = Math.max(getSubWidth(sub), MIN_SEGMENT_PX);
            const isActive = currentTime >= sub.start && currentTime <= sub.end;

            return (
              <div
                key={sub.id}
                style={{
                  position: "absolute",
                  left,
                  top: 12,
                  width,
                  height: 32,
                  borderRadius: 6,
                  background: isActive
                    ? "linear-gradient(135deg, rgba(250,204,21,0.2), rgba(250,204,21,0.08))"
                    : "rgba(255,255,255,0.06)",
                  border: `1px solid ${isActive ? "rgba(250,204,21,0.4)" : "rgba(255,255,255,0.08)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: dragging?.id === sub.id ? "grabbing" : "grab",
                  transition: dragging?.id === sub.id ? "none" : "box-shadow 0.15s",
                  boxShadow: isActive ? "0 0 12px rgba(250,204,21,0.08)" : "none",
                  overflow: "hidden",
                  zIndex: isActive ? 2 : 1,
                }}
                onMouseDown={(e) => handleMouseDown(e, sub, "move")}
              >
                {/* Text preview */}
                <span
                  style={{
                    fontSize: 9,
                    color: isActive ? "#D97736" : "#6b7280",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    padding: "0 16px",
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                  }}
                >
                  {sub.text}
                </span>

                {/* Left resize handle */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 8,
                    cursor: "col-resize",
                    zIndex: 3,
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, sub, "start");
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 2,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 16,
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.2)",
                    }}
                  />
                </div>

                {/* Right resize handle */}
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 8,
                    cursor: "col-resize",
                    zIndex: 3,
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, sub, "end");
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: 2,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 16,
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.2)",
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Playhead */}
          <div
            style={{
              position: "absolute",
              left: playheadPx,
              top: 0,
              bottom: 0,
              width: 2,
              background: "#D97736",
              zIndex: 10,
              pointerEvents: "none",
              boxShadow: "0 0 8px rgba(217,119,6,0.4)",
              transition: dragging ? "none" : "left 0.08s linear",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#D97736",
                boxShadow: "0 0 8px rgba(217,119,6,0.5)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Segment labels below track */}
      <div
        style={{
          height: 22,
          position: "relative",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            minWidth: "100%",
            width: totalPx,
          }}
        >
          {subtitles.map((sub) => {
            const left = getSubLeft(sub);
            const width = Math.max(getSubWidth(sub), 40);
            return (
              <div
                key={sub.id}
                style={{
                  position: "absolute",
                  left,
                  top: 4,
                  width,
                  fontSize: 7,
                  color: "#3f3f46",
                  fontFamily: "monospace",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  paddingLeft: 4,
                }}
              >
                {fmt(sub.start)}–{fmt(sub.end)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
