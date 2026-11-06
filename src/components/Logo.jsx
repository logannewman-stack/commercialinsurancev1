export function Mark({ className = "mark" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect className="mark-ink" x="2" y="6" width="28" height="5" rx="2.5" />
      <rect className="mark-ink" x="7" y="13.5" width="18" height="5" rx="2.5" />
      <rect className="mark-gold" x="12" y="21" width="8" height="5" rx="2.5" />
    </svg>
  );
}
export default function Logo() {
  return (
    <span className="logo">
      <Mark />
      <span className="wordmark">keel</span>
    </span>
  );
}
