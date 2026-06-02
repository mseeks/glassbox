// Inline callout in three tones (warn / ok / info), each with a leading icon.
export const ICONS = {
  warn: (
    <svg
      className="ic"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  ),
  ok: (
    <svg
      className="ic"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  info: (
    <svg
      className="ic"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  ),
};

export default function Callout({ kind = 'info', children }) {
  return (
    <div className={`gx-callout ${kind}`}>
      {ICONS[kind]}
      <div>{children}</div>
    </div>
  );
}
