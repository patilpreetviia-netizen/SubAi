import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import styles from "./Auth.module.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAuthStore } from "../lib/authStore";


export const Route = createFileRoute("/signup")({
  ssr: false,
  component: SignupPage,
});

const ERROR_MAP = {
  "Invalid login credentials": "Incorrect email or password.",
  "Email not confirmed": "Please confirm your email before logging in.",
  "Invalid email": "Please enter a valid email address.",
  "User already registered": "An account with this email already exists. Try logging in.",
  "Password should be at least 6 characters": "Password must be at least 6 characters.",
  "Rate limit exceeded": "Too many attempts. Please wait and try again.",
};

function friendlyError(raw) {
  return ERROR_MAP[raw] || raw;
}

function getStrength(pw) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return s;
}
function strengthLabel(s) {
  if (s === 0) return "";
  if (s <= 2) return "Weak";
  if (s <= 3) return "Fair";
  if (s === 4) return "Good";
  return "Strong";
}
function strengthColor(s) {
  if (s <= 2) return "#f87171";
  if (s <= 3) return "#facc15";
  if (s === 4) return "#4ade80";
  return "#22c55e";
}

/* ── Google icon ────────────────────────────────────── */
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

/* ── Eye toggle ─────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────── */

function SignupPage() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError] = useState(null);
  const [confirmMsg, setConfirmMsg] = useState(null);

  /* ── Email/password signup ── */
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await signUp(email, password, name);

    if (authError) {
      setError(friendlyError(authError.message));
      setLoading(false);
      return;
    }

    if (data?.user && !data.session) {
      setConfirmMsg("Check your email! We sent a confirmation link to " + email);
      setLoading(false);
      return;
    }

    navigate({ to: "/dashboard" });
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
  };

  const strengthScore = password ? getStrength(password) : -1;
  const disabled = loading || !!confirmMsg;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <Link to="/" className={styles.brand}>
          <span className={styles.dot} /> SubAI
        </Link>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.desc}>Free forever — free-tier infra all the way down.</p>

        {error && <div className={styles.error} role="alert">{error}</div>}
        {confirmMsg && <div className={styles.success} role="status">{confirmMsg}</div>}

        {!confirmMsg && (
          <>
            {/* ── OAuth buttons ── */}
            <div className={styles.oauthRow}>
              <button
                type="button"
                className={styles.oauthBtn}
                onClick={() => onOAuth("google")}
                disabled={!!oauthLoading}
              >
                <GoogleIcon />
                {oauthLoading === "google" ? "Redirecting…" : "Sign up with Google"}
              </button>
            </div>

            <div className={styles.divider}><span>or</span></div>

            {/* ── Email/password form ── */}
            <form onSubmit={onSubmit}>
              <Input
                label="Full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                disabled={disabled}
              />
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.in"
                disabled={disabled}
              />
              <div className={styles.pwWrap}>
                <Input
                  label="Password"
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min 6 characters"
                  disabled={disabled}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  disabled={disabled}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>

              {strengthScore >= 0 && (
                <div className={styles.strength}>
                  <div className={styles.strengthBar}>
                    <div
                      className={styles.strengthFill}
                      style={{
                        width: `${(strengthScore / 5) * 100}%`,
                        background: strengthColor(strengthScore),
                      }}
                    />
                  </div>
                  <span className={styles.strengthLabel}>{strengthLabel(strengthScore)}</span>
                </div>
              )}

              <Button type="submit" className={styles.submit} disabled={disabled || !!oauthLoading}>
                {loading ? "Creating…" : "Create account"}
              </Button>
            </form>
          </>
        )}

        <div className={styles.foot}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
