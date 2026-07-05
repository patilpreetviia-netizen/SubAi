import { Player } from "@remotion/player";
import { CaptionComposition } from "./CaptionComposition";

export function CaptionPlayer({
  subtitles,
  preset,
  durationInFrames = 300,
  fps = 30,
  width = 1080,
  height = 1350,
  loop = true,
  autoPlay = true,
  controls = false,
  style,
  videoUrl,
}) {
  return (
    <Player
      component={CaptionComposition}
      inputProps={{ subtitles, preset, videoUrl }}
      durationInFrames={durationInFrames}
      fps={fps}
      compositionWidth={width}
      compositionHeight={height}
      loop={loop}
      autoPlay={autoPlay}
      controls={controls}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 14,
        overflow: "hidden",
        background: "#09090b",
        ...style,
      }}
    />
  );
}
