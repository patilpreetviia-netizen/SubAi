import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  ssr: false,
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="bg-[#060609] text-white min-h-screen font-sans">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0c0c12]/72 backdrop-blur-xl px-4 md:px-5 py-3">
            <Link className="flex items-center gap-2.5 shrink-0 group" to="/">
<img src="/logo.jpeg" alt="SubAI" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold text-[15px] text-white tracking-tight">SubAI</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-all"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-36 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-tight leading-[1.06] mb-8">
            Privacy Policy
          </h1>
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <p>Last updated: July 8, 2026</p>

            <h2 className="text-white font-bold text-base mt-8">1. Information We Collect</h2>
            <p>
              We collect only the information you provide when creating an account: your name, email
              address, and the video files you upload for transcription. We do not collect any
              browsing data, analytics, or cookies beyond what is strictly necessary for
              authentication.
            </p>

            <h2 className="text-white font-bold text-base mt-8">2. How We Use Your Data</h2>
            <p>
              Your video files are uploaded to Supabase Storage solely for the purpose of
              transcription and caption generation. Once processed, video files are not stored
              permanently. Transcripts and captions are stored in your account so you can revisit
              and edit past projects.
            </p>

            <h2 className="text-white font-bold text-base mt-8">3. Third-Party Services</h2>
            <p>SubAI uses the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Supabase</strong> — Authentication, database, and file storage
              </li>
              <li>
                <strong>Groq</strong> — AI transcription (Whisper) and vision analysis
              </li>
              <li>
                <strong>Resend</strong> — Welcome emails
              </li>
              <li>
                <strong>Razorpay</strong> — Payment processing (no card details stored by us)
              </li>
            </ul>

            <h2 className="text-white font-bold text-base mt-8">4. Data Retention</h2>
            <p>
              You can delete any project at any time from your dashboard. When you delete a project,
              its associated video file and transcript are permanently removed. Account deletion is
              available upon request via email.
            </p>

            <h2 className="text-white font-bold text-base mt-8">5. Contact</h2>
            <p>
              For privacy-related inquiries, email{" "}
              <a href="mailto:support@subai.in" className="text-amber-400 hover:underline">
                support@subai.in
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
