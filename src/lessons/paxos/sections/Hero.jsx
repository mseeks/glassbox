// Hero — the title plate. The meander frieze and the scroll-cue arrow animate
// only via CSS, which the shell's global reduced-motion rule already neutralizes.
export default function Hero() {
  return (
    <header className="pax-hero">
      <div className="pax-wrap">
        <div className="pax-meander" aria-hidden="true" />
        <div className="pax-eyebrow">The Part-Time Parliament</div>
        <h1 className="pax-title">PAXOS</h1>
        <p className="pax-subtitle">
          How a scattered assembly agrees on one thing — and can never take it back.
        </p>
        <div className="pax-scroll-cue">
          an interactive account
          <span className="ar" aria-hidden="true">
            ↓
          </span>
        </div>
      </div>
    </header>
  );
}
