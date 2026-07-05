import styles from "./Button.module.css";

export function Button({
  variant = "solid",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  const cls = [styles.btn, styles[variant], size !== "md" && styles[size], className]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
