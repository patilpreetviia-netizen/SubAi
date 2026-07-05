import { create } from "zustand";

const clone = (arr) => arr.map((s) => ({ ...s }));

export const useEditorStore = create((set, get) => ({
  subtitles: [],
  past: [],
  future: [],

  load: (subtitles) =>
    set({ subtitles: clone(subtitles), past: [], future: [] }),

  updateText: (id, text) => {
    const { subtitles, past } = get();
    const next = subtitles.map((s) => (s.id === id ? { ...s, text } : s));
    set({ subtitles: next, past: [...past, subtitles], future: [] });
  },

  runCleanup: () => {
    const { subtitles, past } = get();
    const next = subtitles.map((s) => ({
      ...s,
      text: s.text
        .replace(/\s+/g, " ")
        .replace(/\bu\b/gi, "you")
        .replace(/\br\b/gi, "are")
        .replace(/^\s*[,.!?]+/, "")
        .trim()
        .replace(/^./, (c) => c.toUpperCase()),
    }));
    set({ subtitles: next, past: [...past, subtitles], future: [] });
  },

  undo: () => {
    const { past, subtitles, future } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({
      subtitles: prev,
      past: past.slice(0, -1),
      future: [subtitles, ...future],
    });
  },

  redo: () => {
    const { future, subtitles, past } = get();
    if (future.length === 0) return;
    const [next, ...rest] = future;
    set({
      subtitles: next,
      past: [...past, subtitles],
      future: rest,
    });
  },
}));
