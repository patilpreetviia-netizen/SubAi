import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import styles from "./Auth.module.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAuthStore } from "../lib/authStore";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    navigate({ to: "/dashboard" });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <Link to="/" className={styles.brand}>
          <span className={styles.dot} /> SubAI
        </Link>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.desc}>Log in to continue captioning.</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={onSubmit}>
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Button type="submit" className={styles.submit} disabled={loading}>
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
