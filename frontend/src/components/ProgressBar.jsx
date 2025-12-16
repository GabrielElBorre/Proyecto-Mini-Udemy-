export default function ProgressBar({ value = 0 }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className="h-2 w-full bg-base-200 rounded">
      <div
        className="h-2 rounded bg-primary"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}