import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "../components/Layout";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <Layout>
      <main>
        <section className="pt-36 pb-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tight leading-[1.06] mb-6">
              Built for how <span className="text-amber-400">India</span> actually speaks
            </h1>
            <p className="text-zinc-400 text-[17px] leading-relaxed mb-10">
              SubAI is a browser-native AI caption studio built specifically for Indian content
              creators. We generate frame-accurate Hindi, English, and Hinglish captions for videos,
              right in your browser.
            </p>

            <div className="space-y-12">
              <div>
                <h2 className="text-xl font-bold text-white mb-3">The problem</h2>
                <p className="text-zinc-400 leading-relaxed">
                  Most caption tools are trained on American English. When Indian creators upload
                  code-mixed Hinglish content, the transcripts come out wrong — and fixing them
                  takes longer than captioning from scratch.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">Our approach</h2>
                <p className="text-zinc-400 leading-relaxed">
                  We built SubAI using speech models trained on Indian languages. The transcription
                  understands Hindi-English code-switching, slang, regional accents, and
                  mixed-script words. Then we made everything editable — every word, its timing, its
                  color, its style.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">Why free?</h2>
                <p className="text-zinc-400 leading-relaxed">
                  We believe great tools should be accessible. The free tier gives you everything —
                  all styles, all formats — with a watermark on exports. When you're ready to go
                  pro, you pay in INR for what you need, nothing more.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-3">The team</h2>
                <p className="text-zinc-400 leading-relaxed">
                  Built in India, for Indian creators. We're a small team obsessed with making
                  captioning effortless for the next billion content creators.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
