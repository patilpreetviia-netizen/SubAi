import styles from "./Slider.module.css";

export function Slider({ label, value, min = 0, max = 100, step = 1, onChange }) {
  return (
    <div className={styles.wrap}>
      {label !== undefined && (
        <div className={styles.row}>
          <span>{label}</span>
          <span>{value}</span>
        </div>
      )}
      <input
        type="range"
        className={styles.range}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange?.(Number(e.target.value))}
      />
    </div>
  );
}
