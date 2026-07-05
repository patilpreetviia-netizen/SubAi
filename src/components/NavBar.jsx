import { Link, useNavigate } from "@tanstack/react-router";
import styles from "./NavBar.module.css";
import { Button } from "../ui/Button";
import { useAuthStore } from "../lib/authStore";

export function NavBar() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <span className={styles.dot} />
          SubAI
        </Link>
        <div className={styles.links}>
          <Link to="/dashboard" className={styles.link}>
            Dashboard
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className={styles.link}
          >
            GitHub
          </a>

          {user ? (
            <>
              <span className={styles.user} title={user.email}>
                {user.user_metadata?.full_name?.split(" ")[0] ||
                  user.email?.split("@")[0]}
              </span>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.link}>
                Log in
              </Link>
              <Link to="/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
