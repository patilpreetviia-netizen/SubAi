import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  ssr: false,
  component: TermsPage,
});

function TermsPage() {
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
            Terms of Service
          </h1>
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <p>Last updated: July 8, 2026</p>

            <h2 className="text-white font-bold text-base mt-8">1. Acceptance of Terms</h2>
            <p>
              By using SubAI, you agree to these Terms of Service. If you do not agree, do not use
              the service.
            </p>

            <h2 className="text-white font-bold text-base mt-8">2. Description of Service</h2>
            <p>
              SubAI is a browser-based AI caption generation tool. It transcribes video files,
              generates captions, and allows you to export captioned videos and SRT files.
            </p>

            <h2 className="text-white font-bold text-base mt-8">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              You must be at least 13 years old to use this service.
            </p>

            <h2 className="text-white font-bold text-base mt-8">4. Acceptable Use</h2>
            <p>
              You agree not to use SubAI for any illegal purpose or to upload content that violates
              the rights of others. We reserve the right to terminate accounts that abuse the
              service.
            </p>

            <h2 className="text-white font-bold text-base mt-8">5. Payment Terms</h2>
            <p>
              Paid plans are billed in Indian Rupees (INR) via Razorpay. The ₹9 first export is a
              one-time offer per user. Week Pass (₹59) is valid for 7 days from purchase and does
              not auto-renew. Monthly plans can be paid once (30-day access, no auto-renew) or set
              to auto-renew. You may cancel at any time.
            </p>

            <h2 className="text-white font-bold text-base mt-8">6. Limitation of Liability</h2>
            <p>
              SubAI is provided "as is" without warranty of any kind. We are not liable for any
              damages arising from the use of this service.
            </p>

            <h2 className="text-white font-bold text-base mt-8">7. Changes to Terms</h2>
            <p>
              We may update these terms at any time. Continued use after changes constitutes
              acceptance of the new terms.
            </p>

            <h2 className="text-white font-bold text-base mt-8">8. Contact</h2>
            <p>
              For questions about these terms, email{" "}
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
