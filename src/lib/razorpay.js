/**
 * Razorpay payment integration for SubAI.
 *
 * Usage:
 *   import { openRazorpay } from "../lib/razorpay";
 *   openRazorpay({ plan: "starter", amount: 299, onSuccess: () => ... });
 */

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

const PLAN_CONFIG = {
  "first-export": {
    amount: 9,
    name: "First Export",
    description: "First watermark-free HD export",
  },
  "week-pass": { amount: 59, name: "Week Pass", description: "7 days of Starter" },
  starter: { amount: 299, name: "Starter", description: "Starter plan - 60 min transcription" },
  editor: { amount: 499, name: "Editor", description: "Editor plan - 3 hours transcription" },
  pro: { amount: 999, name: "Pro", description: "Pro plan - 8 hours transcription" },
};

export function getPlanConfig(planId) {
  return PLAN_CONFIG[planId] || null;
}

/**
 * Open Razorpay checkout modal.
 *
 * @param {Object} options
 * @param {string} options.plan - Plan identifier
 * @param {number} options.amount - Amount in INR
 * @param {string} options.email - User email
 * @param {string} options.name - User name
 * @param {Function} options.onSuccess - Callback on successful payment
 * @param {Function} options.onError - Callback on payment error
 */
export function openRazorpay({ plan, amount, email, name, onSuccess, onError }) {
  if (typeof window === "undefined" || !window.Razorpay) {
    const errMsg = "Razorpay SDK not loaded. Please add the script to your HTML.";
    console.error(errMsg);
    if (onError) onError(new Error(errMsg));
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount * 100,
    currency: "INR",
    name: "SubAI",
    description: PLAN_CONFIG[plan]?.description || "SubAI Plan",
    prefill: {
      email: email || "",
      contact: "",
      name: name || "",
    },
    theme: {
      color: "#D97736",
    },
    handler: function (response) {
      if (onSuccess) {
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          plan,
        });
      }
    },
    modal: {
      ondismiss: function () {
        if (onError) onError(new Error("Payment cancelled"));
      },
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (e) {
    console.error("Razorpay error:", e);
    if (onError) onError(e);
  }
}

/**
 * Load Razorpay checkout script dynamically.
 * @returns {Promise<void>}
 */
export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}
