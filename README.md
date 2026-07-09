# SubAI

> **Browser-native AI Caption Studio for Indian Creators**

Generate accurate, editable, and beautifully styled captions for videos directly in your browser. No desktop software required.

🌐 **Live Demo:** https://sub-ai-iota.vercel.app/

---

## Overview

SubAI is an AI-powered caption generation platform built for creators, editors, agencies, and social media teams.

Upload a video, generate word-level captions using AI, edit them in an intuitive timeline, customize them with modern caption styles, and export them for your favorite editing software—all from your browser.

---

## Features

### 🎙 AI Transcription

- Fast AI transcription powered by **Groq Whisper**
- Word-level timestamps
- High transcription accuracy
- Supports videos up to **2GB**

### 🌍 Multi-Language Support

Supports:

- English
- Hindi
- Hinglish
- Marathi
- Tamil
- Telugu
- Bengali
- Gujarati
- Punjabi
- Kannada

---

### 🔄 Script Conversion

Instantly switch between:

- Roman Hinglish
- Hindi (Devanagari)
- Native language scripts
- English Translation

---

### ✏ Caption Editor

Professional browser-based editing tools:

- Word-by-word editing
- Inline editing
- Drag & resize timeline
- Undo / Redo
- Live preview
- Frame-accurate adjustments

---

### 🎨 Caption Presets

Choose from **30+ professionally designed presets**, including:

- Beast
- Karaoke
- Minimal
- Bold
- Neon
- Cyberpunk
- Vaporwave
- Typewriter
- Glitch

and many more.

---

### 🎯 Brand Kit

Save your own caption styles and reuse them across projects.

---

### 🤖 AI Hook Generator

Generate engaging opening hooks from your transcript using AI to improve audience retention.

---

### 📤 Export Options

Export your captions as:

- MP4 Video
- SRT
- SEO-ready YouTube Description
- Premiere Pro
- After Effects
- DaVinci Resolve

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Routing | TanStack Router |
| SSR | TanStack Start |
| Styling | Tailwind CSS v4 |
| UI | shadcn/ui |
| Video Rendering | Remotion 4 |
| State Management | Zustand |
| Data Fetching | TanStack React Query |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| AI | Groq (Whisper + LLM) |
| Email | Resend |
| Payments | Razorpay |
| Build Tool | Vite |
| Runtime | Bun / Node.js |

---

# Getting Started

## Prerequisites

- Bun (Recommended) or Node.js 18+
- Supabase Project
- Groq API Key

Optional:

- Resend API Key
- Razorpay API Keys

---

## Installation

Clone the repository.

```bash
git clone https://github.com/yourusername/subai.git

cd subai
```

Install dependencies.

```bash
bun install
```

or

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory.

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

GROQ_API_KEY=

RESEND_API_KEY=
```

---

## Development

```bash
bun run dev
```

or

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

## Production Build

```bash
bun run build
```

Preview production build:

```bash
bun run preview
```

---

## Database Setup

Execute the provided SQL file in your Supabase project.

```
supabase-setup.sql
```

It creates:

- jobs
- subtitles
- storage bucket for uploaded videos

---

## Project Structure

```
src/
│
├── components/
├── routes/
├── hooks/
├── lib/
├── store/
├── styles/
├── utils/
├── remotion/
└── assets/
```

---

## Supported Video Formats

- MP4
- MOV
- AVI
- WebM

Maximum upload size:

**2 GB**

---

## Roadmap

- [ ] Team Workspace
- [ ] Auto Translation
- [ ] AI Subtitle Correction
- [ ] Custom Fonts
- [ ] Motion Graphics Templates
- [ ] Mobile Responsive Editor
- [ ] Cloud Rendering
- [ ] Batch Processing

---

## Performance

- Browser-native processing
- Fast AI transcription
- Frame-accurate editing
- Responsive timeline
- Optimized exports

---

## Live Website

https://sub-ai-iota.vercel.app/

---

## License

This project is proprietary software.

**All Rights Reserved.**

Unauthorized copying, modification, distribution, or commercial use is prohibited.

---

## Author

Built with ❤️ by **SubAI**
