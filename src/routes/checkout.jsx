import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../lib/authStore";
import { loadRazorpayScript, openRazorpay, getPlanConfig } from "../lib/razorpay";

export const Route = createFileRoute("/checkout")({
  ssr: false,
  component: CheckoutPage,
});

const PLANS = [
  {
    id: "first-export",
    label: "₹9 First Export",
    price: "₹9",
    desc: "One-time · First watermark-free HD export",
  },
  {
    id: "week-pass",
    label: "₹59 Week Pass",
    price: "₹59",
    desc: "7 days of Starter · No auto-renew",
  },
  {
    id: "starter",
    label: "Starter · ₹299",
    price: "₹299",
    desc: "60 min transcription · 1080p · No watermark",
  },
  {
    id: "editor",
    label: "Editor · ₹499",
    price: "₹499",
    desc: "3 hrs transcription · 4K export · Most popular",
  },
  {
    id: "pro",
    label: "Pro · ₹999",
    price: "₹999",
    desc: "8 hrs transcription · 3 devices · Full plugin",
  },
];

function CheckoutPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("editor");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    loadRazorpayScript().catch(() => {});
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setStatus(null);
    const config = getPlanConfig(selectedPlan);
    if (!config) {
      setStatus("Invalid plan selected");
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
        setStatus(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        setLoading(false);
      },
      onError: (error) => {
        setStatus(error.message || "Payment failed");
        setLoading(false);
      },
    });
  };

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
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border:
                    selectedPlan === p.id
                      ? "1px solid rgba(250,204,21,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                  background:
                    selectedPlan === p.id ? "rgba(250,204,21,0.06)" : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: "2px solid",
                    borderColor: selectedPlan === p.id ? "#facc15" : "#3f3f46",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {selectedPlan === p.id && (
                    <div
                      style={{ width: 8, height: 8, borderRadius: "50%", background: "#facc15" }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: "#71717a" }}>{p.desc}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#facc15" }}>{p.price}</div>
              </button>
            ))}
          </div>

          {status && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                marginBottom: 16,
                fontSize: 13,
                background: status.includes("successful")
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(239,68,68,0.1)",
                border: `1px solid ${status.includes("successful") ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                color: status.includes("successful") ? "#22c55e" : "#ef4444",
              }}
            >
              {status}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              background: loading ? "#27272a" : "#facc15",
              color: loading ? "#71717a" : "#000",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {loading ? "Opening Razorpay…" : `Pay ₹${getPlanConfig(selectedPlan)?.amount || 0}`}
          </button>

          <p className="text-zinc-600 text-xs text-center mt-4">
            Secure payments via Razorpay. UPI, cards, netbanking accepted.
          </p>
        </div>
      </section>
    </div>
  );
}
