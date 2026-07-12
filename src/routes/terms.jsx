import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <Layout>
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-tight leading-[1.06] mb-8">
            Terms of Service
          </h1>
          <div className="space-y-6 text-sm text-[#D1D5DB] leading-relaxed">
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
              Paid plans are billed in Indian Rupees (INR) via Razorpay. The \u20B99 first export is
              a one-time offer per user. Week Pass (\u20B959) is valid for 7 days from purchase and
              does not auto-renew. Monthly plans can be paid once (30-day access, no auto-renew) or
              set to auto-renew. You may cancel at any time.
            </p>

            <h2 className="text-white font-bold text-base mt-8">6. Limitation of Liability</h2>
            <p>
              SubAI is provided &ldquo;as is&rdquo; without warranty of any kind. We are not liable
              for any damages arising from the use of this service.
            </p>

            <h2 className="text-white font-bold text-base mt-8">7. Changes to Terms</h2>
            <p>
              We may update these terms at any time. Continued use after changes constitutes
              acceptance of the new terms.
            </p>

            <h2 className="text-white font-bold text-base mt-8">8. Contact</h2>
            <p>
              For questions about these terms, email{" "}
              <a href="mailto:support@subai.in" className="text-[#D97736] hover:underline">
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
