// A prose paragraph that reveals on scroll, with an optional transition delay.
export default function P({ children, delay }) {
  return (
    <p className="tls-prose tls-rv" style={{ marginBottom: 18, transitionDelay: delay }}>
      {children}
    </p>
  );
}
