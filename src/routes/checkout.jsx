import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../lib/authStore";
import { loadRazorpayScript, openRazorpay, getPlanConfig } from "../lib/razorpay";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

// TODO: Implement a server-side /api/razorpay/webhook endpoint that:
// 1. Verifies Razorpay signature using RAZORPAY_WEBHOOK_SECRET
// 2. Updates the user's subscription/credits in the database
// 3. Sends a confirmation email via Resend
// Without this, payments are only verified client-side.

const PLANS = [
  {
    id: "first-export",
    label: "\u20B99 First Export",
    price: "\u20B99",
    desc: "One-time \u00B7 First watermark-free HD export",
  },
  {
    id: "week-pass",
    label: "\u20B959 Week Pass",
    price: "\u20B959",
    desc: "7 days of Starter \u00B7 No auto-renew",
  },
  {
    id: "starter",
    label: "Starter \u00B7 \u20B9299",
    price: "\u20B9299",
    desc: "60 min transcription \u00B7 1080p \u00B7 No watermark",
  },
  {
    id: "editor",
    label: "Editor \u00B7 \u20B9499",
    price: "\u20B9499",
    desc: "3 hrs transcription \u00B7 4K export \u00B7 Most popular",
  },
  {
    id: "pro",
    label: "Pro \u00B7 \u20B9999",
    price: "\u20B9999",
    desc: "8 hrs transcription \u00B7 3 devices \u00B7 Full plugin",
  },
];

function CheckoutPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("editor");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    loadRazorpayScript().catch(() => {});
  }, [user, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    setStatus(null);
    const config = getPlanConfig(selectedPlan);
    if (!config) {
      setStatus("Invalid plan selected");
      setLoading(false);
      return;
    }

    // Validate amount matches expected plan pricing (server-side verification pending)
    const expectedAmounts = {
      "first-export": 9,
      "week-pass": 59,
      starter: 299,
      editor: 499,
      pro: 999,
    };
    if (config.amount !== expectedAmounts[selectedPlan]) {
      setStatus("Amount mismatch — payment rejected");
      setLoading(false);
      return;
    }

    try {
      await loadRazorpayScript();
    } catch (e) {
      setStatus("Failed to load payment gateway. Please try again.");
      setLoading(false);
      return;
    }

    openRazorpay({
      plan: selectedPlan,
      amount: config.amount,
      email: user?.email || "",
      name: user?.user_metadata?.full_name || "",
      onSuccess: (response) => {
        // Validate response structure
        if (!response?.razorpay_payment_id) {
          setStatus("Payment verification failed: missing payment ID");
          setLoading(false);
          return;
        }
        // TODO: Verify payment server-side via a webhook endpoint.
        // Razorpay webhook should POST to /api/razorpay/webhook with the
        // payment payload; the server validates the signature using
        // RAZORPAY_WEBHOOK_SECRET and updates the user's subscription in the DB.
        // Until the webhook is implemented, payment is only confirmed client-side.
        setStatus("Payment successful! You now have access to your plan.");
        setLoading(false);
      },
      onError: (error) => {
        setStatus(
          error?.error?.description || error?.message || "Payment failed. Please try again.",
        );
        setLoading(false);
      },
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-[#060609] text-white min-h-screen font-sans">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0c0c12]/72 backdrop-blur-xl px-4 md:px-5 py-3">
            <Link className="flex items-center gap-2.5 shrink-0 group" to="/">
              <img src="/logo.jpeg" alt="SubAI" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold text-[15px] text-white tracking-tight">SubAI</span>
            </Link>
            <Link
              to="/pricing"
              className="px-4 py-2 text-[13px] font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-all"
            >
              Plans
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-36 pb-24 px-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-black tracking-tight mb-2">Checkout</h1>
          <p className="text-zinc-400 text-sm mb-8">
            Choose a plan and pay via UPI, card, or netbanking.
          </p>

          <div className="space-y-2 mb-8">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  selectedPlan === p.id
                    ? "border-amber-400/40 bg-amber-400/[0.06]"
                    : "border-white/[0.08] bg-white/[0.02]"
                }`}
              >
                <div
                  className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedPlan === p.id ? "border-amber-400" : "border-zinc-600"
                  }`}
                >
                  {selectedPlan === p.id && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white">{p.label}</div>
                  <div className="text-xs text-zinc-500">{p.desc}</div>
                </div>
                <div className="font-bold text-base text-amber-400">{p.price}</div>
              </button>
            ))}
          </div>

          {status && (
            <div
              className={`p-2.5 rounded-xl mb-4 text-sm ${
                status.includes("successful")
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {status}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-[15px] font-bold border-none transition-all ${
              loading
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-amber-400 text-black hover:bg-amber-300 cursor-pointer"
            }`}
          >
            {loading
              ? "Opening Razorpay\u2026"
              : `Pay \u20B9${getPlanConfig(selectedPlan)?.amount || 0}`}
          </button>

          <p className="text-zinc-600 text-xs text-center mt-4">
            Secure payments via Razorpay. UPI, cards, netbanking accepted.
          </p>
        </div>
      </section>
    </div>
  );
}
