import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import styles from "./Auth.module.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAuthStore } from "../lib/authStore";
import { sendWelcomeEmail } from "../lib/resendEmail";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: LoginPage,
});

const ERROR_MAP = {
  "Invalid login credentials": "Incorrect email or password. Please try again.",
  "Email not confirmed": "Please confirm your email before logging in.",
  "Invalid email": "Please enter a valid email address.",
  "User not found": "No account found with this email.",
  "Password should be at least 6 characters": "Password must be at least 6 characters.",
  "Rate limit exceeded": "Too many attempts. Please wait and try again.",
};

function friendlyError(raw) {
  return ERROR_MAP[raw] || raw;
}

/* ── Google icon ───────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2a10.3 10.3 0 0 0-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91A8.79 8.79 0 0 0 17.64 9.2Z" fill="#4285F4"/>
      <path d="M9 18a8.6 8.6 0 0 0 5.96-2.18l-2.91-2.26A5.43 5.43 0 0 1 9 14.57a5.44 5.44 0 0 1-5.12-3.76H.87v2.33A9 9 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.88 10.81A5.51 5.51 0 0 1 3.59 9c0-.63.11-1.25.29-1.81V4.86H.87A9.01 9.01 0 0 0 0 9c0 1.45.35 2.82.87 4.14l3.01-2.33Z" fill="#FBBC05"/>
      <path d="M9 3.58a4.86 4.86 0 0 1 3.44 1.35l2.58-2.58A8.65 8.65 0 0 0 9 0 9 9 0 0 0 .87 4.86L3.88 7.2A5.44 5.44 0 0 1 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

/* ── Eye icons ─────────────────────────────────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────── */

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, sendPasswordReset } = useAuthStore();

  const [mode, setMode] = useState("login"); // "login" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /* ── Email/password login ── */
  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await signIn(email, password);
      if (authError) { setError(friendlyError(authError.message)); return; }
      if (data?.user) {
        const name = data.user.user_metadata?.full_name || email.split("@")[0];
        sendWelcomeEmail({ email, name }).catch(() => {});
      }
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  };

  /* ── OAuth ── */
  const onOAuth = async (provider) => {
    setOauthLoading("google");
    setError(null);
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setError(friendlyError(authError.message));
      setOauthLoading(null);
    }
    // on success the browser redirects away, so we don't clear loading
  };

  /* ── Forgot password ── */
  const onForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: authError } = await sendPasswordReset(email);
      if (authError) { setError(friendlyError(authError.message)); return; }
      setSuccess("Password reset email sent! Check your inbox.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Render: Forgot Password mode ── */
  if (mode === "forgot") {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <Link to="/" className={styles.brand}>
            <span className={styles.dot} /> SubAI
          </Link>
          <h1 className={styles.title}>Reset your password</h1>
          <p className={styles.desc}>Enter your email and we'll send a reset link.</p>

          {error && <div className={styles.error} role="alert">{error}</div>}
          {success && <div className={styles.success} role="status">{success}</div>}

          {!success && (
            <form onSubmit={onForgot}>
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.in"
              />
              <Button type="submit" className={styles.submit} disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}

          <div className={styles.foot} style={{ marginTop: 16 }}>
            <button className={styles.textBtn} onClick={() => { setMode("login"); setError(null); setSuccess(null); }}>
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render: Login mode ── */
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <Link to="/" className={styles.brand}>
          <span className={styles.dot} /> SubAI
        </Link>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.desc}>Log in to continue captioning.</p>

        {error && <div className={styles.error} role="alert">{error}</div>}

        {/* ── OAuth buttons ── */}
        <div className={styles.oauthRow}>
          <button
            type="button"
            className={styles.oauthBtn}
            onClick={() => onOAuth("google")}
            disabled={!!oauthLoading}
          >
            <GoogleIcon />
            {oauthLoading === "google" ? "Redirecting…" : "Continue with Google"}
          </button>
        </div>

        <div className={styles.divider}><span>or</span></div>

        {/* ── Email/password form ── */}
        <form onSubmit={onLogin}>
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.in"
          />
          <div className={styles.pwWrap}>
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>

          <div className={styles.forgotRow}>
            <button
              type="button"
              className={styles.textBtn}
              onClick={() => { setMode("forgot"); setError(null); }}
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className={styles.submit} disabled={loading || !!oauthLoading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className={styles.foot}>
          New here? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
