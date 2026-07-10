export const MOCK_JOBS = [
  {
    id: "job-hinglish-reel",
    title: "Startup grind reel · Hinglish",
    status: "completed",
    language: "hinglish",
    duration: "0:24",
    createdAt: "2 hours ago",
    thumbColor: "#facc15",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "job-english-podcast",
    title: "Podcast highlight — english",
    status: "completed",
    language: "english",
    duration: "1:12",
    createdAt: "Yesterday",
    thumbColor: "#a1a1aa",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "job-hindi-short",
    title: "Diwali short · Hindi",
    status: "processing",
    language: "hindi",
    duration: "0:31",
    createdAt: "Just now",
    thumbColor: "#71717a",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
];

export const MOCK_SUBTITLES = {
  "job-hinglish-reel": [
    { id: "s1", start: 0.0, end: 1.4, text: "Bhai suno" },
    { id: "s2", start: 1.4, end: 3.0, text: "startup ka game" },
    { id: "s3", start: 3.0, end: 5.2, text: "sirf hustle nahi hai" },
    { id: "s4", start: 5.2, end: 7.0, text: "it's about consistency" },
    { id: "s5", start: 7.0, end: 9.0, text: "har din thoda push karo" },
    { id: "s6", start: 9.0, end: 11.0, text: "results follow karenge" },
  ],
  "job-english-podcast": [
    { id: "e1", start: 0, end: 2, text: "So here's the thing" },
    { id: "e2", start: 2, end: 4.5, text: "most founders overthink launch" },
    { id: "e3", start: 4.5, end: 7, text: "just ship the ugly version" },
    { id: "e4", start: 7, end: 9.5, text: "iterate with real users" },
  ],
  "job-hindi-short": [
    { id: "h1", start: 0, end: 2, text: "दिवाली मुबारक" },
    { id: "h2", start: 2, end: 4, text: "रोशनी सबके घर आए" },
    { id: "h3", start: 4, end: 6, text: "खुशियां हमेशा बनी रहें" },
  ],
};

export { PRESETS } from "./presets";
