import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import styles from "./Auth.module.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAuthStore } from "../lib/authStore";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  component: ResetPasswordPage,
});

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
  if (s <= 3) return "#FF9A4D";
  if (s === 4) return "#4ade80";
  return "#22c55e";
}

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

function ResetPasswordPage() {
  const navigate = useNavigate();
  const updatePassword = useAuthStore((s) => s.updatePassword);

  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    const timeout = setTimeout(() => {
      setReady((r) => { if (!r) setInvalid(true); return r; });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await updatePassword(password);
      if (authError) { setError(authError.message); return; }
      setSuccess(true);
      setTimeout(() => navigate({ to: "/dashboard" }), 2000);
    } finally {
      setLoading(false);
    }
  };

  const strengthScore = password ? getStrength(password) : -1;

  if (!ready && !invalid) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.cardInner} style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)" }}>Verifying reset link…</p>
          </div>
        </div>
      </div>
    );
  }

  if (invalid) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.cardInner}>
            <Link to="/" className={styles.brand}><img src="/subai-logo.png" alt="SubAI" style={{ height: 64, width: "auto" }} /></Link>
            <h1 className={styles.title}>Link expired</h1>
            <p className={styles.desc} style={{ marginBottom: 24 }}>
              This reset link is invalid or has expired. Please request a new one.
            </p>
            <Button className={styles.submit} onClick={() => navigate({ to: "/login" })}>
              Back to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.cardInner}>
            <Link to="/" className={styles.brand}><img src="/subai-logo.png" alt="SubAI" style={{ height: 64, width: "auto" }} /></Link>
            <div className={styles.success} role="status" style={{ textAlign: "center", marginTop: 16 }}>
              ✅ Password updated! Redirecting to dashboard…
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.cardInner}>
          <Link to="/" className={styles.brand}><img src="/subai-logo.png" alt="SubAI" style={{ height: 64, width: "auto" }} /></Link>
          <h1 className={styles.title}>Set new password</h1>
          <p className={styles.desc}>Choose a strong password for your account.</p>

          {error && <div className={styles.error} role="alert">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className={styles.pwWrap}>
              <Input
                label="New password"
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 6 characters"
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

            <Input
              label="Confirm password"
              type={showPw ? "text" : "password"}
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="repeat password"
            />

            <Button type="submit" className={styles.submit} disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
