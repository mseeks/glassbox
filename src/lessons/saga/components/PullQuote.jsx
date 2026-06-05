// A pull quote — the gold-ruled illuminated aside that lifts one line out of
// the prose. Renders a semantic <blockquote>.
export default function PullQuote({ children }) {
  return <blockquote className="sg-pq">{children}</blockquote>;
}
