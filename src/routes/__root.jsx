import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { useEffect } from "react";

import appCss from "../styles.css?url";
import { useAuthStore } from "../lib/authStore";
import { WebGLBackground } from "../features/WebGLBackground";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SubAI — Browser-native AI captions for Indian creators" },
      {
        name: "description",
        content:
          "SubAI generates frame-accurate Hindi, English and Hinglish captions for your videos, right in the browser.",
      },
      { property: "og:title", content: "SubAI — AI Captions for Indian Creators" },
      {
        property: "og:description",
        content:
          "Free browser-native caption studio built on Groq Whisper. Hinglish-first, timeline editor, custom style presets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],

    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/logo.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ({ error, reset }) => (
    <div style={{ padding: 40, background: "#0A0A0A", color: "#fff", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Something broke</h1>
      <pre style={{ color: "#9CA3AF", marginTop: 8 }}>{error.message}</pre>
      <button
        onClick={reset}
        style={{
          marginTop: 16,
          padding: "8px 20px",
          borderRadius: 9999,
          background: "#D97736",
          color: "#030303",
          border: "none",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Retry
      </button>
    </div>
  ),
});

function RootComponent() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, []);

  return <Outlet />;
}

function RootShell({ children }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body style={{ background: "#0A0A0A" }}>
        <WebGLBackground />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div
      style={{
        padding: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#0A0A0A",
      }}
    >
      <h1 style={{ fontSize: 48, fontWeight: 700, color: "#FFFFFF" }}>404</h1>
      <a
        href="/"
        style={{
          color: "#D97736",
          marginTop: 8,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Back home
      </a>
    </div>
  );
}
