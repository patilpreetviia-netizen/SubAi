import styles from "./Input.module.css";

export function Input({ label, id, className = "", ...rest }) {
  const inputEl = (
    <input id={id} className={`${styles.input} ${className}`} {...rest} />
  );
  if (!label) return inputEl;
  return (
    <label className={styles.wrap} htmlFor={id}>
      <span className={styles.label}>{label}</span>
      {inputEl}
    </label>
  );
}
