import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import styles from "./Auth.module.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAuthStore } from "../lib/authStore";
import { sendWelcomeEmail } from "../lib/resendEmail";

export const Route = createFileRoute("/signup")({
  ssr: false,
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.signUp);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmMsg, setConfirmMsg] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await signUp(email, password, name);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Fire welcome email (non-blocking)
    sendWelcomeEmail({ email, name }).catch((err) =>
      console.warn("Welcome email failed:", err),
    );

    // If email confirmation is enabled, the session is null until the user clicks the link.
    if (data?.user && !data.session) {
      setConfirmMsg(
        "Check your email! We sent a confirmation link to " + email,
      );
      setLoading(false);
      return;
    }

    // Auto-confirmed — go straight to dashboard
    navigate({ to: "/dashboard" });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <Link to="/" className={styles.brand}>
          <span className={styles.dot} /> SubAI
        </Link>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.desc}>
          Free forever — free-tier infra all the way down.
        </p>

        {error && <div className={styles.error}>{error}</div>}
        {confirmMsg && <div className={styles.success}>{confirmMsg}</div>}

        <form onSubmit={onSubmit}>
          <Input
            label="Full name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aarav Sharma"
          />
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.in"
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="min 6 characters"
          />
          <Button type="submit" className={styles.submit} disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>
        <div className={styles.foot}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
