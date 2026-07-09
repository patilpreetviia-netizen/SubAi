# SUBAI — AI Caption Studio for Indian Creators

A premium browser-native AI caption generation platform engineered for content creators, editors, agencies, and social media teams. Generate frame-accurate subtitles, edit them with a professional timeline, customize modern caption styles, and export production-ready captions—all without installing desktop software.

## 🔗 Project Links

* 👉 **Live Deployment:** [View Live Storefront Deployment](https://sub-ai-iota.vercel.app/)
* 👉 **GitHub Repository:** [patilpreetviia-netizen/SubAi](https://github.com/patilpreetviia-netizen/sub-ai)

---

# 🚀 Core Features

SubAI transforms the traditional subtitle workflow into a fast, AI-powered browser experience.

### AI Transcription

* High-speed speech recognition powered by **Groq Whisper**
* Word-level timestamps
* Frame-accurate subtitle generation
* Supports videos up to **2GB**

### Multi-Language Support

Supports automatic transcription for:

* English
* Hindi
* Hinglish
* Marathi
* Tamil
* Telugu
* Bengali
* Gujarati
* Punjabi
* Kannada

### Script Conversion

Instantly convert captions between:

* Roman Hinglish
* Hindi (Devanagari)
* Native language scripts
* English Translation

### Professional Caption Editor

* Word-by-word editing
* Inline transcript editing
* Draggable timeline
* Start & End handles
* Undo / Redo
* Live Remotion Preview

### Caption Presets

Includes **30+ professionally designed subtitle styles**, including:

* Beast
* Karaoke
* Minimal
* Bold
* Neon
* Cyberpunk
* Vaporwave
* Typewriter
* Glitch

### Brand Kit

Create, save, and instantly reuse custom caption presets across multiple projects.

### AI Hook Generator

Generate engaging opening hooks for YouTube Shorts, Instagram Reels, and TikTok using **Groq LLM**.

### Export System

Export captions directly as:

* MP4 Video
* SRT Subtitle File
* SEO-Optimized YouTube Description
* Adobe Premiere Pro
* Adobe After Effects
* DaVinci Resolve

---

# 🛠 Backend & AI Integration

SubAI combines modern frontend architecture with cloud-based AI services to deliver a seamless browser experience.

### AI Services

* **Groq Whisper** for speech-to-text transcription
* **Groq LLM** for AI Hook Generation

### Backend

* **Supabase Authentication**
  * Email & Password Login
  * Secure Session Management

* **Supabase PostgreSQL**
  * Project storage
  * Transcript data
  * Caption metadata

* **Supabase Storage**
  * Secure video uploads
  * Private asset management

### Email Service

* **Resend API**
  * Authentication emails
  * Notification workflows

---

# 🛠 Frontend Architecture

The application follows a modular React architecture for scalability and maintainability.

### Core Components

* `Upload.jsx`
  * Video upload interface

* `CaptionEditor.jsx`
  * Word-level subtitle editor

* `Timeline.jsx`
  * Frame-accurate timeline controls

* `PreviewPlayer.jsx`
  * Live Remotion video preview

* `CaptionStyles.jsx`
  * Style preset selector

* `BrandKit.jsx`
  * Saved preset manager

* `HookGenerator.jsx`
  * AI-powered hook generation

* `ExportPanel.jsx`
  * Export options and rendering

* `Dashboard.jsx`
  * Project management

* `Navbar.jsx`
  * Navigation and authentication

---

# 🎨 Design Philosophy

### Visual Direction

Inspired by modern creative software including:

* Adobe Premiere Pro
* CapCut Desktop
* Descript
* Figma
* Linear

The interface prioritizes speed, minimalism, and distraction-free editing.

### Design System

* Minimal Dark UI
* Matte Black Workspace
* Glassmorphism Components
* Smooth Micro-interactions
* Rounded Interface Elements
* Responsive Layout
* Professional Motion Design

### Typography

* Inter
* Geist
* Space Grotesk

---

# ⚡ Technology Stack

| Layer | Technology |
|--------|------------|
| Framework | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Routing | TanStack Router |
| Video Rendering | Remotion 4 |
| State Management | Zustand |
| Data Fetching | TanStack React Query |
| Backend | Supabase |
| Database | PostgreSQL |
| Storage | Supabase Storage |
| Authentication | Supabase Auth |
| AI | Groq Whisper + Groq LLM |
| Email | Resend API |

---

# 📂 Project Structure

```
src/

├── components/
├── pages/
├── hooks/
├── services/
├── store/
├── lib/
├── utils/
├── remotion/
├── assets/
└── styles/
```

---

# 🌍 Supported Formats

### Video

* MP4
* MOV
* AVI
* WebM

Maximum Upload Size:

**2 GB**

---

# 🎯 Performance Highlights

* Browser-native processing
* AI-powered subtitle generation
* Frame-accurate timeline editing
* Real-time preview
* Responsive interface
* Optimized rendering pipeline

---

# 🤖 Development Methodology

SubAI was designed and developed as a modern AI SaaS platform focused on simplifying subtitle creation for Indian creators.

The complete product architecture—including UI/UX design, application flow, frontend implementation, backend integration, and AI workflow—was conceptualized and built by me.

To accelerate development and improve productivity, AI-assisted development tools were used for code generation, interface refinement, and rapid iteration, while maintaining complete control over the project's architecture, functionality, and implementation.

---

# 🖥 Live Application Preview

![SubAI Screenshot](https://api.pikwy.com/web/6a4f0020b35b33268525f0b9.jpg)

---

# 📄 License

Preet Patil — All Rights Reserved.

This project is proprietary software developed for portfolio and educational purposes. Unauthorized copying, redistribution, modification, or commercial use is prohibited.
