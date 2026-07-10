import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <Layout>
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
                <strong>Supabase</strong> \u2014 Authentication, database, and file storage
              </li>
              <li>
                <strong>Groq</strong> \u2014 AI transcription (Whisper) and vision analysis
              </li>
              <li>
                <strong>Resend</strong> \u2014 Welcome emails
              </li>
              <li>
                <strong>Razorpay</strong> \u2014 Payment processing (no card details stored by us)
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
    </Layout>
  );
}
