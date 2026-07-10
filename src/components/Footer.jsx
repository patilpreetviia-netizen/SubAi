import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.foot}>
      <div className={styles.inner}>
        <div>
          <span className={styles.badge}>● Internship Project</span>
          <span style={{ marginLeft: 12 }}>SubAI · built with Remotion + Groq + Supabase</span>
        </div>
        <div className={styles.links}>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <a href="/dashboard">Dashboard</a>
        </div>
      </div>
    </footer>
  );
}
