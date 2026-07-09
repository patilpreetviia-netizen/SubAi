import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts } from
"@tanstack/react-router";

import { useEffect } from "react";

import appCss from "../styles.css?url";
import { useAuthStore } from "../lib/authStore";

export const Route = createRootRoute({
  head: () => ({
    meta: [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title: "SubAI — Browser-native AI captions for Indian creators" },
    {
      name: "description",
      content:
      "SubAI generates frame-accurate Hindi, English and Hinglish captions for your videos, right in the browser."
    },
    { property: "og:title", content: "SubAI — AI Captions for Indian Creators" },
    {
      property: "og:description",
      content:
      "Free browser-native caption studio built on Groq Whisper. Hinglish-first, timeline editor, custom style presets."
    },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" }],

    links: [
    { rel: "stylesheet", href: appCss },
    { rel: "icon", type: "image/png", href: "/logo.png" }]

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ({ error, reset }) =>
  <div style={{ padding: 40 }}>
      <h1>Something broke</h1>
      <pre style={{ color: "#a1a1aa" }}>{error.message}</pre>
      <button onClick={reset}>Retry</button>
    </div>

});

function RootComponent() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Outlet />;
}

function RootShell({ children }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>);

}

function NotFound() {
  return (
    <div style={{ padding: 40 }}>
      <h1>404</h1>
      <a href="/" style={{ color: "#facc15" }}>Back home</a>
    </div>);

}